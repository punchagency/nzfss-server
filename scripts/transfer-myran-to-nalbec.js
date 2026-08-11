/**
 * Transfer the dog "Myran" from the DoW kennel (Marc Winterburn, RR/167)
 * to the Nalbec kennel (Eric Altermann, RR/098).
 *
 * This is a genuine ownership transfer, not a restore: no backup has ever had
 * Myran under RR/098. The dogId is carried across unchanged so the dog keeps a
 * stable identity. pedigreeName is left as "Nalbec Myran at DoW" because
 * pedigree names are permanent; nzfssNo is re-issued under the receiving
 * kennel's convention (RR/098/<PETNAME>, matching Eric's other dogs).
 *
 * Race records are NOT modified. Myran's 149 pts / 8 ev are attached to RR/167
 * race history; the script prints the points table before and after so any
 * change in how those fold is visible immediately.
 *
 * Dry run (default):  node scripts/transfer-myran-to-nalbec.js
 * Apply:              node scripts/transfer-myran-to-nalbec.js --apply
 * Revert:             node scripts/transfer-myran-to-nalbec.js --revert
 */
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const { getMongoUriWithFallback } = require("./mongo-uri");

const APPLY = process.argv.includes("--apply");
const REVERT = process.argv.includes("--revert");

const FROM_ID = "6835c7cda21b6d34fedcb37a"; // Marc Winterburn — DoW, RR/167
const TO_ID = "6835c7cca21b6d34fedcb321"; // Eric Altermann — Nalbec, RR/098
const DOG_ID = "200a0acf-fb46-4c0e-99a5-d647e047247d"; // Myran, as restored
const NEW_NZFSS_NO = "RR/098/MYRAN";

function pointRows(summaries) {
  return summaries
    .filter((s) => /myran/i.test(s.name) || /RR\/167|RR\/098/i.test(s.regNumber))
    .map(
      (s) =>
        `${String(s.name).padEnd(30)} | ${String(s.regNumber).padEnd(15)} | ` +
        `${s.pointsWithinCutoff + s.pointsOutsideCutoff} pts | ${s.events} ev | ${s.awards}`
    );
}

function dogLines(m) {
  return (m.dogs || []).map(
    (d, i) => `  [${String(i).padStart(2)}] ${String(d.name || "(blank)").padEnd(12)} | ${String(d.pedigreeName || "-").padEnd(30)} | ${String(d.nzfssNo || "-").padEnd(14)} | ${d.dogId}`
  );
}

async function main() {
  await mongoose.connect(getMongoUriWithFallback(), { serverSelectionTimeoutMS: 20000 });
  const db = mongoose.connection.db;
  const mushers = db.collection("mushers");
  const fromId = new mongoose.Types.ObjectId(FROM_ID);
  const toId = new mongoose.Types.ObjectId(TO_ID);

  const from = await mushers.findOne({ _id: fromId });
  const to = await mushers.findOne({ _id: toId });
  if (!from || !to) throw new Error("One of the kennel documents was not found.");

  if (REVERT) {
    const dog = (to.dogs || []).find((d) => d.dogId === DOG_ID);
    if (!dog) throw new Error("Myran is not in Eric's kennel — nothing to revert.");
    await mushers.updateOne({ _id: toId }, { $pull: { dogs: { dogId: DOG_ID } }, $set: { updatedAt: new Date() } });
    const restored = { ...dog, nzfssNo: "RR/167", updatedAt: new Date() };
    const sitkaIdx = (from.dogs || []).findIndex((d) => d.dogId === "f7ac42fc-4ac1-4d8c-afff-5d34010b4c46");
    await mushers.updateOne(
      { _id: fromId },
      { $push: { dogs: { $each: [restored], $position: sitkaIdx + 1 } }, $set: { updatedAt: new Date() } }
    );
    console.log("Reverted: Myran moved back to Marc Winterburn (RR/167).");
    await mongoose.disconnect();
    return;
  }

  // --- Guards -------------------------------------------------------------
  const dog = (from.dogs || []).find((d) => d.dogId === DOG_ID);
  if (!dog) throw new Error(`Myran (dogId ${DOG_ID}) is not in the DoW kennel — state changed. Aborting.`);
  if (!/myran/i.test(dog.name || "")) throw new Error(`dogId ${DOG_ID} is not Myran, it is "${dog.name}". Aborting.`);
  if ((to.dogs || []).some((d) => /myran/i.test(d.name || "") || d.dogId === DOG_ID)) {
    throw new Error("Eric's kennel already contains a Myran. Aborting.");
  }

  const moved = { ...dog, nzfssNo: NEW_NZFSS_NO, updatedAt: new Date() };
  // Land it before the trailing placeholder rows ("dummy" / blank) if present.
  const firstJunk = (to.dogs || []).findIndex((d) => !d.name || !d.name.trim() || /^dummy$/i.test(d.name));
  const insertAt = firstJunk === -1 ? (to.dogs || []).length : firstJunk;

  console.log(`Mode: ${APPLY ? "APPLY (writes to production)" : "DRY RUN (no writes)"}\n`);
  console.log(`FROM: ${from.name} (regNo="${from.registrationNo}") — ${from.dogs.length} dogs`);
  console.log(`TO:   ${to.name} (regNo="${to.registrationNo}") — ${to.dogs.length} dogs\n`);
  console.log("Dog being moved:");
  console.log("  " + JSON.stringify(dog, null, 2).split("\n").join("\n  "));
  console.log(`\nnzfssNo ${dog.nzfssNo} -> ${NEW_NZFSS_NO}; dogId unchanged; will land at index ${insertAt} in Eric's list.\n`);

  const { computeDogRacePointSummaries, invalidateDogRacePointSummaries } = require("../dist/service/dog-race-points.service");
  console.log("--- Points: BEFORE ---");
  pointRows(await computeDogRacePointSummaries()).forEach((r) => console.log("  " + r));

  if (!APPLY) {
    console.log("\nDry run complete. Re-run with --apply to write.");
    await mongoose.disconnect();
    return;
  }

  const backupFile = path.resolve(__dirname, `../backups/pre-myran-transfer-${Date.now()}.json`);
  fs.writeFileSync(backupFile, JSON.stringify({ from, to }, null, 2));
  console.log(`\nPre-write backup of BOTH kennel documents: ${backupFile}`);

  const pull = await mushers.updateOne({ _id: fromId }, { $pull: { dogs: { dogId: DOG_ID } }, $set: { updatedAt: new Date() } });
  const push = await mushers.updateOne(
    { _id: toId },
    { $push: { dogs: { $each: [moved], $position: insertAt } }, $set: { updatedAt: new Date() } }
  );
  console.log(`pull: matched=${pull.matchedCount} modified=${pull.modifiedCount} | push: matched=${push.matchedCount} modified=${push.modifiedCount}`);

  const fromAfter = await mushers.findOne({ _id: fromId });
  const toAfter = await mushers.findOne({ _id: toId });
  console.log(`\n${fromAfter.name} now has ${fromAfter.dogs.length} dogs:`);
  dogLines(fromAfter).forEach((l) => console.log(l));
  console.log(`\n${toAfter.name} now has ${toAfter.dogs.length} dogs (Myran highlighted below):`);
  dogLines(toAfter).filter((l) => /myran/i.test(l)).forEach((l) => console.log(l));

  invalidateDogRacePointSummaries();
  console.log("\n--- Points: AFTER ---");
  pointRows(await computeDogRacePointSummaries()).forEach((r) => console.log("  " + r));

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
