/**
 * Diagnose Cutoff column: compare Mongo raw values vs server output vs expected display.
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

function timeToSeconds(timeStr) {
  if (!timeStr || !/^\d{1,2}:\d{2}:\d{2}(\.\d+)?$/.test(timeStr)) return Number.MAX_VALUE;
  const [h, m, s] = timeStr.split(":");
  return parseInt(h || "0", 10) * 3600 + parseInt(m || "0", 10) * 60 + parseFloat(s || "0");
}

async function main() {
  configureMongoDnsResolvers();
  await mongoose.connect(process.env.MONGODB_STRING);
  const db = mongoose.connection.db;

  const { computeDogRacePointSummaries } = require("../dist/service/dog-race-points.service");
  const summaries = await computeDogRacePointSummaries();

  const watch = [
    "akela",
    "nanuk",
    "rita",
    "finn",
    "willow",
    "cleo",
    "cooper",
    "amos",
    "kola",
  ];

  const rcrRows = await db
    .collection("rcrpoints")
    .find({ rcrReg: "RR/098" })
    .toArray();
  const rcrByName = new Map(rcrRows.map((r) => [r.rcrPedigreeName.toLowerCase(), r]));

  // Live cutoff samples per dog name
  const points = await db.collection("points").find({}).toArray();
  const entrants = await db.collection("entrants").find({}).toArray();
  const entrantMap = new Map(entrants.map((e) => [e._id.toString(), e]));

  const liveCutoffsByName = new Map();
  for (const point of points) {
    const entrant = entrantMap.get(point.entrantId?.toString());
    if (!entrant?.associatedDog?.length || !point.cutoffTime) continue;
    const secs = timeToSeconds(point.cutoffTime);
    if (secs >= Number.MAX_VALUE) continue;
    for (const dog of entrant.associatedDog) {
      const reg = (dog.NZFSSRegistration || "").toLowerCase();
      if (!reg.includes("rr/098") && !reg.includes("098")) continue;
      const key = (dog.name || "").toLowerCase();
      if (!liveCutoffsByName.has(key)) liveCutoffsByName.set(key, []);
      liveCutoffsByName.get(key).push({
        cutoffTime: point.cutoffTime,
        secs,
        display: formatSecondsToTime(secs),
      });
    }
  }

  console.log("=== Cutoff diagnosis (RR/098) ===\n");
  console.log(
    "name | rcrCutoff(raw) | rcrEvents | liveCutoffSamples | serverDisplay | serverSecs"
  );
  console.log("-".repeat(100));

  for (const key of watch) {
    const summary = summaries.find(
      (s) =>
        s.regNumber.toLowerCase().includes("rr/098") &&
        s.name.toLowerCase().includes(key)
    );
    if (!summary) {
      console.log(`${key}: (no summary row)`);
      continue;
    }

    const rcr = [...rcrByName.entries()].find(([n]) => n.includes(key))?.[1];
    const liveKeys = [...liveCutoffsByName.keys()].filter((k) => k.includes(key));
    const liveSamples = liveKeys.flatMap((k) => liveCutoffsByName.get(k) || []);
    const liveDisplay =
      liveSamples.length === 0
        ? "(none)"
        : liveSamples
            .slice(0, 3)
            .map((s) => `${s.cutoffTime}->${s.display}`)
            .join("; ");

    console.log(
      `${summary.name} | rcr=${rcr?.rcrCutoff ?? "n/a"} | ev=${rcr?.rcrEvents ?? "n/a"} | live: ${liveDisplay} | UI=${formatSecondsToTime(summary.avgCutoffSeconds)} | secs=${summary.avgCutoffSeconds ?? "null"} | events=${summary.events}`
    );
  }

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
