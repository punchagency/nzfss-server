/**
 * Assign dogId to any musher embedded dog missing a valid UUID.
 *   node scripts/backfill-missing-dog-ids.js --apply
 */
const mongoose = require('mongoose');
const { randomUUID } = require('crypto');
const { getMongoUriWithFallback } = require('./mongo-uri');

const APPLY = process.argv.includes('--apply');
const DOG_ID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidDogId(id) {
  return typeof id === 'string' && DOG_ID_REGEX.test(id);
}

const Musher = mongoose.model(
  'BackfillMusher',
  new mongoose.Schema({}, { strict: false }),
  'mushers'
);

async function main() {
  await mongoose.connect(getMongoUriWithFallback());
  const mushers = await Musher.find().lean();
  let fixed = 0;
  let dogsAssigned = 0;

  for (const musher of mushers) {
    const dogs = musher.dogs || [];
    if (!dogs.length) continue;

    const used = new Set();
    let changed = false;
    const updated = dogs.map((dog) => {
      const next = { ...dog };
      if (isValidDogId(next.dogId) && !used.has(next.dogId)) {
        used.add(next.dogId);
        return next;
      }
      let dogId = randomUUID();
      while (used.has(dogId)) dogId = randomUUID();
      next.dogId = dogId;
      used.add(dogId);
      changed = true;
      dogsAssigned++;
      return next;
    });

    if (changed) {
      fixed++;
      if (APPLY) {
        await Musher.updateOne({ _id: musher._id }, { $set: { dogs: updated } });
      }
    }
  }

  console.log(`Mushers ${APPLY ? 'updated' : 'to update'}: ${fixed}`);
  console.log(`Dogs assigned dogId: ${dogsAssigned}`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
