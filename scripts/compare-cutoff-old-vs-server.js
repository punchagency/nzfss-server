/**
 * Compare old client cutoff merge logic vs current server output.
 */
require("dotenv").config();
const dns = require("dns");
const mongoose = require("mongoose");

function configureMongoDnsResolvers() {
  const servers = (process.env.MONGODB_DNS_SERVERS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (servers.length) dns.setServers(servers);
}

function parseTimeToSeconds(timeStr) {
  if (!timeStr || !/^\d{1,2}:\d{2}:\d{2}(\.\d+)?$/.test(timeStr)) return Number.MAX_VALUE;
  const [h, m, s] = timeStr.split(":");
  return parseInt(h || "0", 10) * 3600 + parseInt(m || "0", 10) * 60 + parseFloat(s || "0");
}

function parseRcrCutoffSeconds(rcrCutoff) {
  if (rcrCutoff === null || rcrCutoff === undefined || rcrCutoff === "") return 0;
  if (typeof rcrCutoff === "number") return rcrCutoff > 0 ? rcrCutoff * 60 : 0;
  const numericValue = parseFloat(rcrCutoff);
  if (!isNaN(numericValue) && !rcrCutoff.includes(":")) return numericValue > 0 ? numericValue * 60 : 0;
  const secs = parseTimeToSeconds(rcrCutoff);
  return secs < Number.MAX_VALUE ? secs : 0;
}

function formatSecondsToTime(totalSeconds) {
  if (!totalSeconds || totalSeconds <= 0) return "0";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  if (hours > 0) {
    if (seconds === 0 && minutes === 0) return `${hours}`;
    if (seconds === 0) return `${hours}.${minutes.toString().padStart(2, "0")}`;
    return `${hours}.${minutes.toString().padStart(2, "0")}.${seconds.toString().padStart(2, "0")}`;
  }
  if (seconds === 0) return `${minutes}`;
  return `${minutes}.${seconds.toString().padStart(2, "0")}`;
}

// Simplified old client: live loop + mergeRcrData cutoff (RCR adds 1 sample, not rcrEvents weight)
async function main() {
  configureMongoDnsResolvers();
  await mongoose.connect(process.env.MONGODB_STRING);
  const db = mongoose.connection.db;

  const { computeDogRacePointSummaries } = require("../dist/service/dog-race-points.service");
  const serverSummaries = await computeDogRacePointSummaries();

  const points = await db.collection("points").find({}).toArray();
  const entrants = await db.collection("entrants").find({}).toArray();
  const rcrPoints = await db.collection("rcrpoints").find({ rcrReg: "RR/098" }).toArray();
  const entrantMap = new Map(entrants.map((e) => [e._id.toString(), e]));

  const dogs = {};

  for (const point of points) {
    const entrant = entrantMap.get(point.entrantId?.toString());
    if (!entrant?.associatedDog?.length) continue;
    const storedCutoff = point.cutoffTime ? parseTimeToSeconds(point.cutoffTime) : null;

    for (const dog of entrant.associatedDog) {
      const reg = (dog.NZFSSRegistration || "").toLowerCase();
      if (!reg.includes("098")) continue;
      const key = `${(dog.name || "").toLowerCase()}|${reg}`;

      if (!dogs[key]) {
        dogs[key] = { name: dog.name, cutoffSum: 0, cutoffCount: 0, events: 0 };
      }
      dogs[key].events += 1;
      if (storedCutoff && storedCutoff < Number.MAX_VALUE && storedCutoff > 0) {
        dogs[key].cutoffSum += storedCutoff;
        dogs[key].cutoffCount += 1;
      }
    }
  }

  // Old mergeRcrData cutoff: add RCR as one sample per row when merging by name/reg
  for (const rcr of rcrPoints) {
    const name = (rcr.rcrPedigreeName || "").toLowerCase();
    const secs = parseRcrCutoffSeconds(rcr.rcrCutoff);
    // find matching live key by pet name in key
    const matchKey = Object.keys(dogs).find((k) => k.includes(name.split(" ")[0]) || name.includes(k.split("|")[0]));
    const key = matchKey || `${name}|rr/098`;
    if (!dogs[key]) dogs[key] = { name: rcr.rcrPedigreeName, cutoffSum: 0, cutoffCount: 0, events: 0 };
    if (secs > 0) {
      dogs[key].cutoffSum += secs;
      dogs[key].cutoffCount += 1;
    }
  }

  const watch = ["finn", "willow", "akela", "rita", "nanuk", "amos", "cleo", "cooper"];

  console.log("=== Old-style vs Server cutoff (RR/098) ===\n");
  console.log("dog | oldClientCutoff | serverCutoff | rcrCutoff(raw) | serverEvents");
  console.log("-".repeat(90));

  for (const w of watch) {
    const server = serverSummaries.find(
      (s) => s.regNumber.toLowerCase().includes("rr/098") && s.name.toLowerCase().includes(w)
    );
    const rcr = rcrPoints.find((r) => r.rcrPedigreeName.toLowerCase().includes(w));
    const oldKey = Object.keys(dogs).find((k) => k.includes(w));
    const old = oldKey ? dogs[oldKey] : null;
    const oldAvg = old && old.cutoffCount > 0 ? old.cutoffSum / old.cutoffCount : null;

    console.log(
      `${server?.name || w} | old=${formatSecondsToTime(oldAvg)} | server=${formatSecondsToTime(server?.avgCutoffSeconds)} | rcr=${rcr?.rcrCutoff ?? "n/a"} | events=${server?.events ?? "?"}`
    );
  }

  await mongoose.disconnect();
}

main().catch(console.error);
