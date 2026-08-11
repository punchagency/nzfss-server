/**
 * Restore the dog "Myran" (Nalbec Myran at DoW) to the DoW kennel (Marc Winterburn).
 *
 * Background: on 2026-07-15 an in-place edit overwrote Myran's row in the kennel's
 * dogs[] with Cleo's details. Because `dogId` is immutable in the schema, the row
 * kept Myran's original dogId (12e29d8d-...) while every other field became Cleo's.
 * Cleo has since raced twice under that dogId, so those 2 results are legitimately
 * Cleo's and the ID is NOT reclaimed here. Myran is restored with a fresh dogId;
 * its own race history never referenced 12e29d8d (it carries Reuben's dogId or none)
 * and aggregates by name+registration, so no race data is modified.
 *
 * Field values below are taken verbatim from backups/kennel-2026-07-07T13-23-38-116Z.
 *
 * Dry run (default):  node scripts/restore-myran.js
 * Apply:              node scripts/restore-myran.js --apply
 */
const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");
const mongoose = require("mongoose");
const { getMongoUriWithFallback } = require("./mongo-uri");

const APPLY = process.argv.includes("--apply");
const MUSHER_ID = "6835c7cda21b6d34fedcb37a";
const INSERT_AFTER_DOG_ID = "f7ac42fc-4ac1-4d8c-afff-5d34010b4c46"; // Sitka — Myran's original slot
const CLEO_DOG_ID = "12e29d8d-c79b-450d-b560-0a3439c862db"; // stays with Cleo

/** Verbatim from the 2026-07-07 backup, minus dogId (a fresh one is minted). */
const MYRAN = {
  name: "Myran",
  pedigreeName: "Nalbec Myran at DoW",
  nzkcNo: "",
  nzfssNo: "RR/167",
  dateOfBirth: "2021-12-17",
  breed: "Siberian Husky",
  deceased: false,
  createdAt: new Date("2025-08-04T04:31:44.908Z"),
  updatedAt: new Date(),
};

function racePointRows(summaries) {
  return summaries
    .filter((s) => /myran|cleo/i.test(s.name) || /RR\/167/i.test(s.regNumber))
    .map(
      (s) =>
        `${String(s.name).padEnd(28)} | ${String(s.regNumber).padEnd(9)} | ` +
        `${s.pointsWithinCutoff + s.pointsOutsideCutoff} pts | ${s.events} ev | ${s.awards}`
    );
}

async function main() {
  await mongoose.connect(getMongoUriWithFallback(), { serverSelectionTimeoutMS: 20000 });
  const db = mongoose.connection.db;
  const mushers = db.collection("mushers");
  const _id = new mongoose.Types.ObjectId(MUSHER_ID);

  const musher = await mushers.findOne({ _id });
  if (!musher) throw new Error(`Musher ${MUSHER_ID} not found`);

  // --- Guards -------------------------------------------------------------
  if ((musher.dogs || []).some((d) => /myran/i.test(d.name || "") || /myran/i.test(d.pedigreeName || ""))) {
    throw new Error("A dog named Myran already exists in this kennel — already restored? Aborting.");
  }
  const cleoRow = (musher.dogs || []).find((d) => d.dogId === CLEO_DOG_ID);
  if (!cleoRow) {
    throw new Error(`Expected Cleo's row (dogId ${CLEO_DOG_ID}) but it is missing — state changed. Aborting.`);
  }
  const anchorIdx = (musher.dogs || []).findIndex((d) => d.dogId === INSERT_AFTER_DOG_ID);
  if (anchorIdx === -1) throw new Error("Anchor dog (Sitka) not found — state changed. Aborting.");

  const dogId = randomUUID();
  const collision = await mushers.countDocuments({ "dogs.dogId": dogId });
  if (collision > 0) throw new Error("Generated dogId collided; re-run.");

  const newDog = { dogId, ...MYRAN };
  const insertAt = anchorIdx + 1;

  console.log(`Mode: ${APPLY ? "APPLY (writes to production)" : "DRY RUN (no writes)"}\n`);
  console.log(`Kennel: ${musher.name} (regNo="${musher.registrationNo}") _id=${musher._id}`);
  console.log(`Current dogs (${musher.dogs.length}):`);
  musher.dogs.forEach((d, i) => console.log(`  [${i}] ${String(d.name).padEnd(12)} | ${d.pedigreeName} | ${d.dogId}`));
  console.log(`\nWill insert at index ${insertAt}:`);
  console.log("  " + JSON.stringify(newDog, null, 2).split("\n").join("\n  "));
  console.log(`\nCleo keeps dogId ${CLEO_DOG_ID} and its 2 race results. No race data is modified.\n`);

  const { computeDogRacePointSummaries, invalidateDogRacePointSummaries } = require("../dist/service/dog-race-points.service");

  console.log("--- Dog Race Points: BEFORE ---");
  racePointRows(await computeDogRacePointSummaries()).forEach((r) => console.log("  " + r));

  if (!APPLY) {
    console.log("\nDry run complete. Re-run with --apply to write.");
    await mongoose.disconnect();
    return;
  }

  // --- Backup the document before touching it -----------------------------
  const backupDir = path.resolve(__dirname, "../backups");
  const backupFile = path.join(backupDir, `musher-${MUSHER_ID}-pre-myran-restore-${Date.now()}.json`);
  fs.writeFileSync(backupFile, JSON.stringify(musher, null, 2));
  console.log(`\nPre-write backup of the musher document: ${backupFile}`);

  const res = await mushers.updateOne(
    { _id, "dogs.dogId": INSERT_AFTER_DOG_ID },
    { $push: { dogs: { $each: [newDog], $position: insertAt } }, $set: { updatedAt: new Date() } }
  );
  console.log(`Write result: matched=${res.matchedCount} modified=${res.modifiedCount}`);

  const after = await mushers.findOne({ _id });
  console.log(`\nDogs after restore (${after.dogs.length}):`);
  after.dogs.forEach((d, i) => console.log(`  [${i}] ${String(d.name).padEnd(12)} | ${d.pedigreeName} | ${d.dogId}`));

  invalidateDogRacePointSummaries();
  console.log("\n--- Dog Race Points: AFTER ---");
  racePointRows(await computeDogRacePointSummaries()).forEach((r) => console.log("  " + r));

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
