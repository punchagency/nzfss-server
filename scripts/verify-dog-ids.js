/**
 * Post-migration validation for dogId rollout.
 */
const mongoose = require('mongoose');
const { getMongoUriWithFallback } = require('./mongo-uri');

const DOG_ID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidDogId(id) {
  return typeof id === 'string' && DOG_ID_REGEX.test(id);
}

const musherSchema = new mongoose.Schema({}, { strict: false, collection: 'mushers' });
const Musher = mongoose.model('VerifyMusher', musherSchema);

async function main() {
  await mongoose.connect(getMongoUriWithFallback());
  const mushers = await Musher.find().lean();

  let totalDogs = 0;
  let missingDogId = 0;
  const allIds = new Set();
  let withinMusherDuplicates = 0;

  for (const musher of mushers) {
    const perMusher = new Set();
    for (const dog of musher.dogs || []) {
      totalDogs++;
      if (!isValidDogId(dog.dogId)) missingDogId++;
      if (dog.dogId) {
        allIds.add(dog.dogId);
        if (perMusher.has(dog.dogId)) withinMusherDuplicates++;
        perMusher.add(dog.dogId);
      }
    }
  }

  console.log('--- dogId verification ---');
  console.log(`Mushers: ${mushers.length}`);
  console.log(`Total embedded dogs: ${totalDogs}`);
  console.log(`Missing dogId: ${missingDogId}`);
  console.log(`Unique dogIds (global): ${allIds.size}`);
  console.log(`Duplicates within same musher: ${withinMusherDuplicates}`);
  const pass = missingDogId === 0 && withinMusherDuplicates === 0;
  console.log(pass ? 'PASS' : 'FAIL');

  await mongoose.disconnect();
  process.exit(pass ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
