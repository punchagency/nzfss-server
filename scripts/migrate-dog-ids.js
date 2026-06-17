/**
 * Migration: assign stable UUID dogIds to all dogs and backfill associations.
 *
 * Usage:
 *   node scripts/migrate-dog-ids.js           # dry-run (default)
 *   node scripts/migrate-dog-ids.js --apply   # write changes to MongoDB
 */
const mongoose = require('mongoose');
const { randomUUID } = require('crypto');
const { config } = require('dotenv');
const path = require('path');

config({ path: path.resolve(__dirname, '../.env') });

const { getMongoUriWithFallback } = require('./mongo-uri');
const MONGODB_URI = getMongoUriWithFallback();
const APPLY = process.argv.includes('--apply');

const DOG_ID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function generateDogId() {
  return randomUUID();
}

function isValidDogId(id) {
  return typeof id === 'string' && DOG_ID_REGEX.test(id);
}

const musherSchema = new mongoose.Schema({}, { strict: false, collection: 'mushers' });
const entrantSchema = new mongoose.Schema({}, { strict: false, collection: 'entrants' });
const pointSchema = new mongoose.Schema({}, { strict: false, collection: 'points' });
const dogsSchema = new mongoose.Schema({}, { strict: false, collection: 'dogs' });
const wprSchema = new mongoose.Schema({}, { strict: false, collection: 'wprpoints' });
const rcrSchema = new mongoose.Schema({}, { strict: false, collection: 'rcrpoints' });

const Musher = mongoose.model('MusherMigration', musherSchema);
const Entrant = mongoose.model('EntrantMigration', entrantSchema);
const Point = mongoose.model('PointMigration', pointSchema);
const Dogs = mongoose.model('DogsMigration', dogsSchema);
const WprPoints = mongoose.model('WprMigration', wprSchema);
const RcrPoints = mongoose.model('RcrMigration', rcrSchema);

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log(`Connected to MongoDB (${APPLY ? 'APPLY' : 'DRY-RUN'})`);

  /** Full registration only: e.g. RR/125/BELLA — not kennel-level RR/167 */
  const globalDogIdByFullNzfss = new Map();
  const allDogIds = new Set();

  function isFullNzfssRegistration(nzfss) {
    const parts = (nzfss || '').split('/').filter(Boolean);
    return parts.length >= 3;
  }

  let mushersUpdated = 0;
  let mushersDogsAssigned = 0;

  const mushers = await Musher.find().lean();
  console.log(`Processing ${mushers.length} mushers...`);

  for (const musher of mushers) {
    const dogs = musher.dogs || [];
    if (!dogs.length) continue;

    let changed = false;
    const musherUsedIds = new Set();
    const musherByNzfssName = new Map();

    const updatedDogs = dogs.map((dog) => {
      const updated = { ...dog };
      let dogId = dog.dogId;
      const nzfss = (dog.nzfssNo || '').trim().toLowerCase();
      const name = (dog.name || '').trim().toLowerCase();
      const musherKey = `${nzfss}|${name}`;

      if (!isValidDogId(dogId)) {
        if (nzfss && name && musherByNzfssName.has(musherKey)) {
          dogId = musherByNzfssName.get(musherKey);
        } else if (
          nzfss &&
          isFullNzfssRegistration(nzfss) &&
          globalDogIdByFullNzfss.has(nzfss)
        ) {
          dogId = globalDogIdByFullNzfss.get(nzfss);
        } else {
          dogId = generateDogId();
          while (allDogIds.has(dogId) || musherUsedIds.has(dogId)) {
            dogId = generateDogId();
          }
        }

        updated.dogId = dogId;
        changed = true;
        mushersDogsAssigned++;
      }

      musherUsedIds.add(dogId);
      allDogIds.add(dogId);

      if (nzfss && name) musherByNzfssName.set(musherKey, dogId);
      if (nzfss && isFullNzfssRegistration(nzfss) && !globalDogIdByFullNzfss.has(nzfss)) {
        globalDogIdByFullNzfss.set(nzfss, dogId);
      }

      return updated;
    });

    if (changed) {
      mushersUpdated++;
      if (APPLY) {
        await Musher.updateOne({ _id: musher._id }, { $set: { dogs: updatedDogs } });
      }
    }
  }

  let entrantsUpdated = 0;
  let entrantDogsBackfilled = 0;
  const entrants = await Entrant.find().lean();

  for (const entrant of entrants) {
    const dogs = entrant.associatedDog || [];
    if (!dogs.length) continue;

    let changed = false;
    const updatedDogs = dogs.map((dog) => {
      if (dog.dogId && isValidDogId(dog.dogId)) return dog;

      const nzfss = (dog.NZFSSRegistration || '').trim().toLowerCase();
      const dogId =
        nzfss && isFullNzfssRegistration(nzfss) && globalDogIdByFullNzfss.has(nzfss)
          ? globalDogIdByFullNzfss.get(nzfss)
          : null;

      if (!dogId) return dog;

      changed = true;
      entrantDogsBackfilled++;
      return { ...dog, dogId };
    });

    if (changed) {
      entrantsUpdated++;
      if (APPLY) {
        await Entrant.updateOne({ _id: entrant._id }, { $set: { associatedDog: updatedDogs } });
      }
    }
  }

  let pointsUpdated = 0;
  let pointDogsBackfilled = 0;
  const points = await Point.find().lean();

  for (const point of points) {
    const dogPoints = point.dogPoints || [];
    if (!dogPoints.length) continue;

    let changed = false;
    const updatedDogPoints = dogPoints.map((dp) => {
      if (dp.dogId && isValidDogId(dp.dogId)) return dp;

      const nzfss = (dp.NZFSSRegistration || '').trim().toLowerCase();
      const dogId =
        nzfss && isFullNzfssRegistration(nzfss) && globalDogIdByFullNzfss.has(nzfss)
          ? globalDogIdByFullNzfss.get(nzfss)
          : null;

      if (!dogId) return dp;

      changed = true;
      pointDogsBackfilled++;
      return { ...dp, dogId };
    });

    if (changed) {
      pointsUpdated++;
      if (APPLY) {
        await Point.updateOne({ _id: point._id }, { $set: { dogPoints: updatedDogPoints } });
      }
    }
  }

  let standaloneDogsUpdated = 0;
  const standaloneDogs = await Dogs.find().lean();
  for (const dog of standaloneDogs) {
    if (isValidDogId(dog.dogId)) continue;
    const dogId = generateDogId();
    allDogIds.add(dogId);
    standaloneDogsUpdated++;
    if (APPLY) {
      await Dogs.updateOne({ _id: dog._id }, { $set: { dogId } });
    }
  }

  let wprUpdated = 0;
  const wprRows = await WprPoints.find().lean();
  for (const row of wprRows) {
    if (row.dogId && isValidDogId(row.dogId)) continue;
    const nzfss = (row.wprReg || row.wprFlag || '').trim().toLowerCase();
    const dogId = nzfss && globalDogIdByFullNzfss.has(nzfss)
      ? globalDogIdByFullNzfss.get(nzfss)
      : null;
    if (!dogId) continue;
    wprUpdated++;
    if (APPLY) {
      await WprPoints.updateOne({ _id: row._id }, { $set: { dogId } });
    }
  }

  let rcrUpdated = 0;
  const rcrRows = await RcrPoints.find().lean();
  for (const row of rcrRows) {
    if (row.dogId && isValidDogId(row.dogId)) continue;
    const nzfss = (row.rcrReg || row.rcrFlag || '').trim().toLowerCase();
    const dogId = nzfss && globalDogIdByFullNzfss.has(nzfss)
      ? globalDogIdByFullNzfss.get(nzfss)
      : null;
    if (!dogId) continue;
    rcrUpdated++;
    if (APPLY) {
      await RcrPoints.updateOne({ _id: row._id }, { $set: { dogId } });
    }
  }

  // Validation
  const duplicateCheck = new Set();
  let duplicateCount = 0;
  for (const id of allDogIds) {
    if (duplicateCheck.has(id)) duplicateCount++;
    duplicateCheck.add(id);
  }

  const mushersAfter = await Musher.find().lean();
  let dogsWithoutId = 0;
  for (const musher of mushersAfter) {
    for (const dog of musher.dogs || []) {
      if (!isValidDogId(dog.dogId)) dogsWithoutId++;
    }
  }

  console.log('\n--- Migration Summary ---');
  console.log(`Mushers updated: ${mushersUpdated} (${mushersDogsAssigned} dogs assigned IDs)`);
  console.log(`Entrants updated: ${entrantsUpdated} (${entrantDogsBackfilled} dog snapshots backfilled)`);
  console.log(`Points updated: ${pointsUpdated} (${pointDogsBackfilled} dogPoints backfilled)`);
  console.log(`Standalone dogs collection updated: ${standaloneDogsUpdated}`);
  console.log(`WPR rows linked: ${wprUpdated}`);
  console.log(`RCR rows linked: ${rcrUpdated}`);
  console.log(`Total unique dogIds: ${allDogIds.size}`);
  console.log(`Dogs still missing dogId (post-run): ${dogsWithoutId}`);
  console.log(`Duplicate dogId collisions in registry: ${duplicateCount}`);

  if (!APPLY) {
    console.log('\nDry-run complete. Re-run with --apply to persist changes.');
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
