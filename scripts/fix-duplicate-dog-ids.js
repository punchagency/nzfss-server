/**
 * Ensures each dog within a musher has a unique dogId.
 * Fixes kennel-level NZFSS numbers (e.g. RR/167) that were incorrectly merged.
 *
 *   node scripts/fix-duplicate-dog-ids.js           # dry-run
 *   node scripts/fix-duplicate-dog-ids.js --apply
 */
const mongoose = require('mongoose');
const { randomUUID } = require('crypto');
const { getMongoUriWithFallback } = require('./mongo-uri');

const APPLY = process.argv.includes('--apply');
const DOG_ID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function generateDogId() {
  return randomUUID();
}

function isValidDogId(id) {
  return typeof id === 'string' && DOG_ID_REGEX.test(id);
}

const musherSchema = new mongoose.Schema({}, { strict: false, collection: 'mushers' });
const Musher = mongoose.model('FixDupMusher', musherSchema);

async function main() {
  await mongoose.connect(getMongoUriWithFallback());
  console.log(`Connected (${APPLY ? 'APPLY' : 'DRY-RUN'})`);

  const mushers = await Musher.find().lean();
  let mushersFixed = 0;
  let dogsReassigned = 0;

  for (const musher of mushers) {
    const dogs = musher.dogs || [];
    if (!dogs.length) continue;

    const usedInMusher = new Set();
    let changed = false;

    const fixedDogs = dogs.map((dog) => {
      const next = { ...dog };
      const needsNew =
        !isValidDogId(next.dogId) ||
        usedInMusher.has(next.dogId);

      if (needsNew) {
        let dogId = generateDogId();
        while (usedInMusher.has(dogId)) dogId = generateDogId();
        next.dogId = dogId;
        changed = true;
        dogsReassigned++;
      }

      usedInMusher.add(next.dogId);
      return next;
    });

    if (changed) {
      mushersFixed++;
      if (APPLY) {
        await Musher.updateOne({ _id: musher._id }, { $set: { dogs: fixedDogs } });
      }
    }
  }

  console.log('\n--- Fix duplicate dogIds ---');
  console.log(`Mushers fixed: ${mushersFixed}`);
  console.log(`Dogs reassigned new IDs: ${dogsReassigned}`);

  if (!APPLY) {
    console.log('\nDry-run. Re-run with --apply to persist.');
  }

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
