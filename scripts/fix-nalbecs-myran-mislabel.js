/**
 * Remove the phantom "Nalbec's Myran | RR/098" row from the Dog Race Points page.
 *
 * That row is not a real dog. It is Eric Altermann's CLEO aggregate, mislabeled:
 * three entrant sub-records carry the name "Nalbec's Myran" while carrying Eric's
 * registry CLEO dogId (a46c58aa) and registration RR/098.
 *
 * Evidence that the dog raced was Cleo, not Myran:
 *   - all three are ERIC ALTERMANN driving a 6-Dog Rig of his own Nalbec dogs
 *     (Cooper, Willow, Nubi, Cluaidh, Kola, Iris) at "Bootie Blowout 1, 2, and 3";
 *   - the records carry Cleo's registry dogId and RR/098, Eric's kennel;
 *   - the official Jul-2026 points list has exactly one Myran, RR/167/MYRAN, and
 *     lists no Myran and no Cleo under RR/098;
 *   - Myran is registered to the DoW kennel (RR/167), not to Eric.
 *
 * This renames the label only. No entrant, point or rcrpoint document is deleted,
 * and no dogId is changed, so all 10 of Cleo's events and 80.5 points survive —
 * they simply display under the correct name.
 *
 * Dry run (default):  node scripts/fix-nalbecs-myran-mislabel.js
 * Apply:              node scripts/fix-nalbecs-myran-mislabel.js --apply
 * Revert:             node scripts/fix-nalbecs-myran-mislabel.js --revert
 */
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const { getMongoUriWithFallback } = require("./mongo-uri");

const APPLY = process.argv.includes("--apply");
const REVERT = process.argv.includes("--revert");

const CLEO_REGISTRY_DOG_ID = "a46c58aa-2082-432c-adec-b0c1ac8a0d3f";
const WRONG_NAME = "Nalbec's Myran";
const RIGHT_NAME = "Nalbec's Cleo";

function rows(summaries) {
  return summaries
    .filter((s) => /myran|cleo/i.test(s.name))
    .map(
      (s) =>
        `${String(s.name).padEnd(24)} | ${String(s.regNumber).padEnd(10)} | ` +
        `${s.pointsWithinCutoff + s.pointsOutsideCutoff} pts | ${s.events} ev | ${s.awards}`
    );
}

(async () => {
  await mongoose.connect(getMongoUriWithFallback(), { serverSelectionTimeoutMS: 20000 });
  const db = mongoose.connection.db;
  const entrants = db.collection("entrants");

  const from = REVERT ? RIGHT_NAME : WRONG_NAME;
  const to = REVERT ? WRONG_NAME : RIGHT_NAME;

  const targets = await entrants
    .find({ associatedDog: { $elemMatch: { dogId: CLEO_REGISTRY_DOG_ID, name: from } } })
    .toArray();

  console.log(`Mode: ${REVERT ? "REVERT" : APPLY ? "APPLY (writes to production)" : "DRY RUN (no writes)"}\n`);
  console.log(`Entrant records to relabel "${from}" -> "${to}" (dogId ${CLEO_REGISTRY_DOG_ID}): ${targets.length}`);
  targets.forEach((e) => console.log(`  ${e._id} | driver="${e.name}" | ${e.class}/${e.customClass} | created=${new Date(e.createdAt).toISOString().slice(0, 10)}`));

  if (targets.length === 0) {
    console.log("\nNothing to do.");
    await mongoose.disconnect();
    return;
  }

  const { computeDogRacePointSummaries, invalidateDogRacePointSummaries } = require("../dist/service/dog-race-points.service");
  console.log("\n--- Points rows BEFORE ---");
  rows(await computeDogRacePointSummaries()).forEach((r) => console.log("  " + r));

  if (!APPLY && !REVERT) {
    console.log("\nDry run complete. Re-run with --apply to write.");
    await mongoose.disconnect();
    return;
  }

  if (!REVERT) {
    const backupFile = path.resolve(__dirname, `../backups/pre-myran-mislabel-fix-${Date.now()}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(targets, null, 2));
    console.log(`\nPre-write backup of the ${targets.length} entrant documents: ${backupFile}`);
  }

  const res = await entrants.updateMany(
    { associatedDog: { $elemMatch: { dogId: CLEO_REGISTRY_DOG_ID, name: from } } },
    { $set: { "associatedDog.$[d].name": to } },
    { arrayFilters: [{ "d.dogId": CLEO_REGISTRY_DOG_ID, "d.name": from }] }
  );
  console.log(`\nWrite result: matched=${res.matchedCount} modified=${res.modifiedCount}`);

  invalidateDogRacePointSummaries();
  console.log("\n--- Points rows AFTER ---");
  rows(await computeDogRacePointSummaries()).forEach((r) => console.log("  " + r));

  await mongoose.disconnect();
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
