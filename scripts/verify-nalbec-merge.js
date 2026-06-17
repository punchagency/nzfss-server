/**
 * Verify Eric Altermann (RR/098) dogs merge correctly with new aggregation.
 * Run: npx ts-node --transpile-only scripts/verify-nalbec-merge.js
 */
require("dotenv").config();
const dns = require("dns");
const mongoose = require("mongoose");

function configureMongoDnsResolvers() {
  const servers = (process.env.MONGODB_DNS_SERVERS || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (servers.length) dns.setServers(servers);
}

async function main() {
  configureMongoDnsResolvers();
  const uri = process.env.MONGODB_STRING || process.env.MONGODB_URI;
  await mongoose.connect(uri);

  const { computeDogRacePointSummaries } = require("../dist/service/dog-race-points.service");
  const summaries = await computeDogRacePointSummaries();

  const nalbecRegs = ["RR/098", "rr/098"];
  const ericDogs = summaries.filter(
    (s) =>
      nalbecRegs.some((r) => s.regNumber.toLowerCase().startsWith(r.toLowerCase())) ||
      s.name.toLowerCase().includes("nalbec")
  );

  const watch = ["finn", "cooper", "cleo", "willow", "kola", "ocean", "nubi", "spice", "iris", "amos", "rita", "akela"];
  console.log("--- Eric RR/098 / Nalbec dogs (merged summaries) ---\n");
  for (const key of watch) {
    const matches = ericDogs.filter(
      (d) => d.name.toLowerCase().includes(key) || d.regNumber.toLowerCase().includes(key)
    );
    if (matches.length === 0) {
      console.log(`${key.toUpperCase()}: (no row found)`);
      continue;
    }
    if (matches.length > 1) {
      console.log(`${key.toUpperCase()}: STILL ${matches.length} DUPLICATE ROWS`);
      matches.forEach((m) => console.log(`  - ${m.name} | ${m.regNumber} | ${m.pointsWithinCutoff + m.pointsOutsideCutoff} pts | ${m.events} ev | ${m.awards}`));
    } else {
      const m = matches[0];
      const total = m.pointsWithinCutoff + m.pointsOutsideCutoff;
      console.log(`${key.toUpperCase()}: ONE ROW → "${m.name}" | ${m.regNumber} | ${total} pts | ${m.events} ev | ${m.awards}`);
    }
  }

  const dupCheck = watch.filter((key) => {
    const matches = ericDogs.filter((d) => d.name.toLowerCase().includes(key));
    return matches.length > 1;
  });

  console.log("\n--- Summary ---");
  console.log(`Duplicate pet names remaining: ${dupCheck.length ? dupCheck.join(", ") : "none"}`);

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
