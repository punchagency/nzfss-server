/**
 * Snapshots computed Dog Race Points summaries to a JSON file so before/after
 * runs can be diffed when changing aggregation logic.
 *
 * Usage: node scripts/snapshot-dog-race-points.js <outputFile>
 */
require("dotenv").config();
const dns = require("dns");
const fs = require("fs");
const mongoose = require("mongoose");

function configureMongoDnsResolvers() {
  const servers = (process.env.MONGODB_DNS_SERVERS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (servers.length) dns.setServers(servers);
}

async function main() {
  const outFile = process.argv[2];
  if (!outFile) {
    console.error("usage: node scripts/snapshot-dog-race-points.js <outputFile>");
    process.exit(1);
  }

  configureMongoDnsResolvers();
  await mongoose.connect(process.env.MONGODB_STRING);

  const { computeDogRacePointSummaries } = require("../dist/service/dog-race-points.service");
  const summaries = await computeDogRacePointSummaries();

  fs.writeFileSync(outFile, JSON.stringify(summaries, null, 2));
  console.log(`wrote ${summaries.length} summaries -> ${outFile}`);

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
