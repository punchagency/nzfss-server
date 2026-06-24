/**
 * Backfill rcrEvents for all RCR points.
 * Since event counts were not stored in the original import, set a default value.
 * Run: node scripts/backfill-rcr-events.js [--apply]
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
  const db = mongoose.connection.db;
  const isApply = process.argv.includes("--apply");

  console.log("Checking RCR documents without rcrEvents...\n");

  const missing = await db.collection("rcrpoints").countDocuments({ rcrEvents: { $exists: false } });
  console.log(`RCR documents missing rcrEvents: ${missing}`);

  if (missing === 0) {
    console.log("All RCR documents already have rcrEvents. No backfill needed.");
    await mongoose.disconnect();
    return;
  }

  if (!isApply) {
    console.log("\nDRY RUN: To apply, run with --apply flag");
    console.log("\nThis will set rcrEvents to 1 for all missing records.");
    await mongoose.disconnect();
    return;
  }

  console.log("\nApplying backfill: setting rcrEvents = 1 for all RCR rows without it...");

  const result = await db.collection("rcrpoints").updateMany(
    { rcrEvents: { $exists: false } },
    { $set: { rcrEvents: 1 } }
  );

  console.log(`Updated: ${result.modifiedCount} documents`);
  console.log(`Matched: ${result.matchedCount} documents`);

  const verify = await db.collection("rcrpoints").countDocuments({ rcrEvents: { $exists: false } });
  console.log(`Remaining without rcrEvents: ${verify}`);

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
