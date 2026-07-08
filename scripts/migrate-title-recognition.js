/**
 * One-time migration: mark all previously earned sled-dog titles as recognised.
 *
 * Uses the same title computation as the admin Title Changes page
 * (computeDogTitleStatuses from dog-title.service).
 *
 * Usage:
 *   node scripts/migrate-title-recognition.js           # dry-run (default)
 *   node scripts/migrate-title-recognition.js --apply   # write changes
 */
const mongoose = require('mongoose');
const path = require('path');
const { config } = require('dotenv');

config({ path: path.resolve(__dirname, '../.env') });

const { getMongoUriWithFallback } = require('./mongo-uri');
const { computeDogTitleStatuses } = require('../dist/service/dog-title.service');
const { achievedTitlesUpTo } = require('../dist/utils/dog-titles');

const MONGODB_URI = getMongoUriWithFallback();
const APPLY = process.argv.includes('--apply');

function flagsFromEarnedTitle(earnedTitle) {
  const achieved = achievedTitlesUpTo(earnedTitle);
  return {
    sd: achieved.SD,
    sdx: achieved.SDX,
    sdCh: achieved.SDCh,
  };
}

function flagsMatch(existing, target) {
  return (
    Boolean(existing?.sd) === target.sd &&
    Boolean(existing?.sdx) === target.sdx &&
    Boolean(existing?.sdCh) === target.sdCh
  );
}

async function countUnrecognised() {
  const statuses = await computeDogTitleStatuses();
  return statuses.filter((s) => s.isUnrecognised && s.earnedTitle).length;
}

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log(`Connected to MongoDB (${APPLY ? 'APPLY' : 'DRY-RUN'})`);

  const statuses = await computeDogTitleStatuses();
  const unrecognisedBefore = statuses.filter((s) => s.isUnrecognised && s.earnedTitle).length;

  const titleCounts = { SD: 0, SDX: 0, SDCh: 0, none: 0 };
  /** musherId -> Map<dogId, titleRecognition flags> */
  const pendingByMusher = new Map();

  for (const status of statuses) {
    const earned = status.earnedTitle;
    titleCounts[earned || 'none']++;

    if (!earned) continue;

    const targetFlags = flagsFromEarnedTitle(earned);
    if (flagsMatch(status.registryDog.flags, targetFlags)) continue;

    const { musherId, dogId } = status.registryDog;
    if (!pendingByMusher.has(musherId)) pendingByMusher.set(musherId, new Map());
    pendingByMusher.get(musherId).set(dogId, targetFlags);
  }

  let dogsBaselined = 0;
  let mushersUpdated = 0;
  const Musher = mongoose.connection.collection('mushers');

  for (const [musherId, dogUpdates] of pendingByMusher) {
    const musher = await Musher.findOne({ _id: new mongoose.Types.ObjectId(musherId) });
    if (!musher) {
      console.warn(`  Skipping missing musher ${musherId}`);
      continue;
    }

    let changed = false;
    const updatedDogs = (musher.dogs || []).map((dog) => {
      const targetFlags = dogUpdates.get(dog.dogId);
      if (!targetFlags) return dog;
      if (flagsMatch(dog.titleRecognition, targetFlags)) return dog;

      changed = true;
      dogsBaselined++;
      return { ...dog, titleRecognition: targetFlags };
    });

    if (!changed) continue;

    mushersUpdated++;
    if (APPLY) {
      await Musher.updateOne({ _id: musher._id }, { $set: { dogs: updatedDogs } });
    }
  }

  let unrecognisedAfter = unrecognisedBefore;
  if (APPLY) {
    unrecognisedAfter = await countUnrecognised();
  } else {
    unrecognisedAfter = 0;
  }

  console.log('\n--- Title Recognition Migration Summary ---');
  console.log(`Registry dogs with title SD:    ${titleCounts.SD}`);
  console.log(`Registry dogs with title SDX:   ${titleCounts.SDX}`);
  console.log(`Registry dogs with title SDCh:  ${titleCounts.SDCh}`);
  console.log(`Registry dogs with no title:    ${titleCounts.none}`);
  console.log(`Dogs baselined (flags set):     ${dogsBaselined}`);
  console.log(`Mushers updated:                ${mushersUpdated}`);
  console.log(`Unrecognised before migration:  ${unrecognisedBefore}`);
  if (APPLY) {
    console.log(`Unrecognised after migration:   ${unrecognisedAfter}`);
  }

  if (!APPLY) {
    console.log('\nDry-run complete. Re-run with --apply to persist changes.');
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
