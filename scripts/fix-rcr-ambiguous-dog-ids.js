/**
 * Clears RCR dogIds that were incorrectly assigned from kennel-level registration
 * (e.g. every RR/098 row got the same dogId). Run with --apply to persist.
 *
 *   node scripts/fix-rcr-ambiguous-dog-ids.js
 *   node scripts/fix-rcr-ambiguous-dog-ids.js --apply
 */
require("dotenv").config();
const mongoose = require("mongoose");

const DOG_ID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const APPLY = process.argv.includes("--apply");

function isValidDogId(id) {
  return typeof id === "string" && DOG_ID_REGEX.test(id);
}

async function main() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.error("Set MONGODB_URI or MONGO_URI in .env");
    process.exit(1);
  }

  await mongoose.connect(uri);
  const collection = mongoose.connection.db.collection("rcrpoints");
  const rows = await collection.find({}).toArray();

  const namesByDogId = new Map();
  for (const row of rows) {
    const dogId = row.dogId;
    const name = (row.rcrPedigreeName || "").trim().toLowerCase();
    if (!isValidDogId(dogId) || !name || name === "n/a") continue;
    if (!namesByDogId.has(dogId)) namesByDogId.set(dogId, new Set());
    namesByDogId.get(dogId).add(name);
  }

  const ambiguousIds = new Set();
  for (const [dogId, names] of namesByDogId) {
    if (names.size > 1) ambiguousIds.add(dogId);
  }

  const toFix = rows.filter((row) => ambiguousIds.has(row.dogId));
  console.log(`RCR rows total: ${rows.length}`);
  console.log(`Ambiguous shared dogIds: ${ambiguousIds.size}`);
  console.log(`RCR rows to clear dogId from: ${toFix.length}`);

  if (!APPLY) {
    console.log("\nDry run only. Re-run with --apply to unset bad dogIds.");
    await mongoose.disconnect();
    return;
  }

  let cleared = 0;
  for (const row of toFix) {
    await collection.updateOne({ _id: row._id }, { $unset: { dogId: "" } });
    cleared++;
  }

  console.log(`Cleared dogId on ${cleared} RCR row(s).`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
