/**
 * One-time migration: mark all previously earned sled-dog titles as recognised.
 *
 * For every registry dog (musher.dogs[]), compute the highest earned title from
 * race points (live points + RCR history) and set the recognised flags for that
 * title and all lower titles. This baselines existing data so the "title change"
 * workflow only surfaces NEW, future upgrades.
 *
 * Usage:
 *   node scripts/migrate-title-recognition.js           # dry-run (default)
 *   node scripts/migrate-title-recognition.js --apply    # write changes
 *
 * The points aggregation + title thresholds mirror:
 *   src/utils/dog-points-aggregation.ts
 *   src/utils/dog-titles.ts
 *   the client Dog Race Points page
 */
const mongoose = require('mongoose');
const path = require('path');
const { config } = require('dotenv');

config({ path: path.resolve(__dirname, '../.env') });

const { getMongoUriWithFallback } = require('./mongo-uri');
const MONGODB_URI = getMongoUriWithFallback();
const APPLY = process.argv.includes('--apply');

const DOG_ID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isValidDogId = (id) => typeof id === 'string' && DOG_ID_REGEX.test(id);

// ----- Title thresholds (mirror src/utils/dog-titles.ts) -----
const SDCH_POINTS = 180;
const SDCH_POSITION_CREDITS = 16;
const SDX_POINTS = 90;
const SD_POINTS = 45;
const TITLE_ORDER = ['SD', 'SDX', 'SDCh'];

function titleRank(title) {
  return title ? TITLE_ORDER.indexOf(title) : -1;
}

function determineTitle({ pointsWithinCutoff, totalPoints, positionCredits }) {
  if (pointsWithinCutoff >= SDCH_POINTS && positionCredits >= SDCH_POSITION_CREDITS) return 'SDCh';
  if (pointsWithinCutoff >= SDX_POINTS) return 'SDX';
  if (totalPoints >= SD_POINTS) return 'SD';
  return null;
}

function parseTitleFromAwards(awards) {
  const value = (awards || '').toLowerCase();
  if (!value) return null;
  if (value.includes('sdch')) return 'SDCh';
  if (value.includes('sdx')) return 'SDX';
  if (/\bsd\b/.test(value) || value.includes('sled dog')) return 'SD';
  return null;
}

function achievedFlags(title) {
  const rank = titleRank(title);
  return {
    sd: rank >= titleRank('SD'),
    sdx: rank >= titleRank('SDX'),
    sdCh: rank >= titleRank('SDCh'),
  };
}

// ----- Reg / name parsing (mirror dog-points-aggregation.ts) -----
function parseRegistration(reg) {
  if (!reg || !reg.includes('/')) return { kennelReg: (reg || '').trim() };
  const parts = reg.split('/');
  if (parts.length >= 3) {
    return {
      kennelReg: parts.slice(0, -1).join('/').trim(),
      petNameFromReg: parts[parts.length - 1].trim(),
    };
  }
  return { kennelReg: reg.trim() };
}

function normalizeKennelReg(reg) {
  return parseRegistration(reg).kennelReg.toLowerCase();
}

function extractPetName(name, registration) {
  const { petNameFromReg } = parseRegistration(registration);
  if (petNameFromReg) return petNameFromReg.toLowerCase();
  const trimmed = (name || '').trim();
  if (!trimmed) return 'unknown';
  const possessive = trimmed.match(/'s\s+(.+)$/i);
  if (possessive) {
    const petPart = possessive[1].trim();
    const ofMatch = petPart.match(/^(\S+)\s+of\s+/i);
    if (ofMatch) return ofMatch[1].toLowerCase();
    return petPart.split(/\s+/)[0].toLowerCase();
  }
  if (/\s+at\s+/i.test(trimmed)) {
    const beforeAt = trimmed.split(/\s+at\s+/i)[0].trim();
    const words = beforeAt.split(/\s+/);
    return words[words.length - 1].toLowerCase();
  }
  return trimmed.toLowerCase();
}

function getDogMergeKey({ dogId, name, registration }) {
  if (dogId && String(dogId).trim()) return `id:${String(dogId).trim().toLowerCase()}`;
  return `reg:${normalizeKennelReg(registration)}|${extractPetName(name, registration)}`;
}

function timeToSeconds(timeStr) {
  if (!timeStr || !/^\d{1,2}:\d{2}:\d{2}(\.\d+)?$/.test(timeStr)) return Number.MAX_VALUE;
  const [h, m, s] = timeStr.split(':');
  return (parseInt(h || '0', 10) * 3600) + (parseInt(m || '0', 10) * 60) + parseFloat(s || '0');
}

function hasValidFinish(raceType) {
  const status = (raceType || '').toLowerCase();
  return !['did not start', 'did not finish', 'disqualified', 'did not qualify'].includes(status);
}

// ----- Aggregation (mirror aggregateDogPoints) -----
function aggregateDogPoints(points, rcrPoints, resolveKey) {
  const map = new Map();
  const keyOf = (k) => (resolveKey && resolveKey(k)) || k;

  const ensure = (key, seed) => {
    let agg = map.get(key);
    if (!agg) {
      agg = {
        pointsWithinCutoff: 0,
        pointsOutsideCutoff: 0,
        events: 0,
        positions: { first: 0, second: 0, third: 0 },
        historicalAwards: '',
        ...seed,
      };
      map.set(key, agg);
    }
    return agg;
  };

  // finishing positions
  const rankGroups = new Map();
  for (const point of points) {
    const entrant = point.entrant;
    if (!entrant || !Array.isArray(entrant.associatedDog) || entrant.associatedDog.length === 0) continue;
    if (!hasValidFinish(entrant.raceType)) continue;
    const secs = timeToSeconds(entrant.raceTime);
    if (secs >= Number.MAX_VALUE) continue;
    const classKey = `${(entrant.class || '').trim().toLowerCase()}::${(entrant.customClass || '').trim().toLowerCase()}`;
    const groupKey = `${entrant.eventId || 'unknown-event'}::${classKey}`;
    const dogKeys = entrant.associatedDog.map((d) =>
      keyOf(getDogMergeKey({ dogId: d.dogId, name: d.name, registration: d.NZFSSRegistration }))
    );
    if (!rankGroups.has(groupKey)) rankGroups.set(groupKey, []);
    rankGroups.get(groupKey).push({ totalSeconds: secs, dogKeys });
  }

  // live points + events
  for (const point of points) {
    const entrant = point.entrant;
    if (!entrant || !Array.isArray(entrant.associatedDog) || entrant.associatedDog.length === 0) continue;
    const storedCutoff = timeToSeconds(point.cutoffTime);
    const raceTime = timeToSeconds(entrant.raceTime);
    const isWithinCutoff =
      storedCutoff < Number.MAX_VALUE && raceTime < Number.MAX_VALUE ? raceTime <= storedCutoff : false;

    for (const dog of entrant.associatedDog) {
      const { kennelReg } = parseRegistration(dog.NZFSSRegistration);
      const key = keyOf(getDogMergeKey({ dogId: dog.dogId, name: dog.name, registration: dog.NZFSSRegistration }));
      const agg = ensure(key, {});
      const parsedReg = kennelReg || dog.NZFSSRegistration || '';

      let dogPointsValue = 0;
      if (Array.isArray(point.dogPoints) && point.dogPoints.length > 0) {
        const entry = point.dogPoints.find(
          (dp) =>
            (dog.dogId && dp.dogId === dog.dogId) ||
            dp.NZFSSRegistration === dog.NZFSSRegistration ||
            dp.NZFSSRegistration === parsedReg
        );
        dogPointsValue = entry ? entry.points : point.points / entrant.associatedDog.length;
      } else {
        dogPointsValue = point.points / entrant.associatedDog.length;
      }

      if (isWithinCutoff) agg.pointsWithinCutoff += dogPointsValue;
      else agg.pointsOutsideCutoff += dogPointsValue;
      agg.events += 1;
    }
  }

  for (const rows of rankGroups.values()) {
    rows
      .slice()
      .sort((a, b) => a.totalSeconds - b.totalSeconds)
      .forEach((row, index) => {
        const place = index + 1;
        if (place > 3) return;
        for (const dogKey of row.dogKeys) {
          const agg = map.get(dogKey);
          if (!agg) continue;
          if (place === 1) agg.positions.first += 1;
          else if (place === 2) agg.positions.second += 1;
          else if (place === 3) agg.positions.third += 1;
        }
      });
  }

  // RCR history
  for (const rcr of rcrPoints) {
    const name = rcr.rcrPedigreeName;
    if (!name || name.trim() === '' || name.toLowerCase() === 'n/a') continue;
    const regValue = rcr.rcrReg || rcr.rcrFlag;
    const key = keyOf(getDogMergeKey({ dogId: rcr.dogId, name, registration: regValue }));
    const agg = ensure(key, {});
    agg.pointsWithinCutoff += rcr.rcrPoints || 0;
    agg.events += rcr.rcrEvents || 0;
    if (rcr.rcrAwards && !agg.historicalAwards) agg.historicalAwards = rcr.rcrAwards;
  }

  return map;
}

function earnedTitleFor(agg) {
  if (!agg) return null;
  const positionCredits = agg.positions.first * 4 + agg.positions.second * 2 + agg.positions.third;
  const calculated = determineTitle({
    pointsWithinCutoff: agg.pointsWithinCutoff,
    totalPoints: agg.pointsWithinCutoff + agg.pointsOutsideCutoff,
    positionCredits,
  });
  const historical = parseTitleFromAwards(agg.historicalAwards);
  return titleRank(historical) > titleRank(calculated) ? historical : calculated;
}

const musherSchema = new mongoose.Schema({}, { strict: false, collection: 'mushers' });
const entrantSchema = new mongoose.Schema({}, { strict: false, collection: 'entrants' });
const pointSchema = new mongoose.Schema({}, { strict: false, collection: 'points' });
const rcrSchema = new mongoose.Schema({}, { strict: false, collection: 'rcrpoints' });

const Musher = mongoose.model('MusherTitleMigration', musherSchema);
const Entrant = mongoose.model('EntrantTitleMigration', entrantSchema);
const Point = mongoose.model('PointTitleMigration', pointSchema);
const RcrPoints = mongoose.model('RcrTitleMigration', rcrSchema);

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log(`Connected to MongoDB (${APPLY ? 'APPLY' : 'DRY-RUN'})`);

  const mushers = await Musher.find().lean();

  // Build registry + key resolver
  const byCanonical = new Map();
  const keyMap = new Map();
  const regKeyCounts = new Map();

  for (const musher of mushers) {
    for (const dog of musher.dogs || []) {
      if (!isValidDogId(dog.dogId)) continue;
      const canonical = `id:${dog.dogId.toLowerCase()}`;
      byCanonical.set(canonical, { musherId: musher._id, dog });
      keyMap.set(canonical, canonical);
      const regKey = getDogMergeKey({ name: dog.name, registration: dog.nzfssNo });
      regKeyCounts.set(regKey, (regKeyCounts.get(regKey) || 0) + 1);
    }
  }
  for (const musher of mushers) {
    for (const dog of musher.dogs || []) {
      if (!isValidDogId(dog.dogId)) continue;
      const regKey = getDogMergeKey({ name: dog.name, registration: dog.nzfssNo });
      if ((regKeyCounts.get(regKey) || 0) === 1) keyMap.set(regKey, `id:${dog.dogId.toLowerCase()}`);
    }
  }
  const resolveKey = (k) => keyMap.get(k);

  // Load aggregation inputs
  const points = await Point.find({}).lean();
  const entrantIds = points.map((p) => p.entrantId);
  const entrants = await Entrant.find({ _id: { $in: entrantIds } }).lean();
  const entrantMap = new Map(entrants.map((e) => [e._id.toString(), e]));

  const aggPoints = points.map((p) => {
    const entrant = entrantMap.get(p.entrantId.toString());
    return {
      points: p.points,
      cutoffTime: p.cutoffTime || null,
      dogPoints: p.dogPoints || [],
      entrant: entrant
        ? {
            raceTime: entrant.raceTime || null,
            class: entrant.class,
            customClass: entrant.customClass,
            eventId: entrant.eventId ? entrant.eventId.toString() : undefined,
            raceType: entrant.raceType,
            associatedDog: entrant.associatedDog || [],
          }
        : null,
    };
  });

  const rcrRows = await RcrPoints.find({}).lean();

  const aggregates = aggregateDogPoints(aggPoints, rcrRows, resolveKey);

  // Apply: baseline recognised flags = currently earned title
  let dogsBaselined = 0;
  let mushersUpdated = 0;
  const titleCounts = { SD: 0, SDX: 0, SDCh: 0, none: 0 };

  for (const musher of mushers) {
    let changed = false;
    const updatedDogs = (musher.dogs || []).map((dog) => {
      if (!isValidDogId(dog.dogId)) return dog;
      const agg = aggregates.get(`id:${dog.dogId.toLowerCase()}`);
      const earned = earnedTitleFor(agg);
      titleCounts[earned || 'none']++;

      const flags = achievedFlags(earned);
      const existing = dog.titleRecognition || {};
      const alreadySet =
        Boolean(existing.sd) === flags.sd &&
        Boolean(existing.sdx) === flags.sdx &&
        Boolean(existing.sdCh) === flags.sdCh;

      if (!alreadySet) {
        changed = true;
        dogsBaselined++;
        return { ...dog, titleRecognition: flags };
      }
      return dog;
    });

    if (changed) {
      mushersUpdated++;
      if (APPLY) {
        await Musher.updateOne({ _id: musher._id }, { $set: { dogs: updatedDogs } });
      }
    }
  }

  console.log('\n--- Title Recognition Migration Summary ---');
  console.log(`Registry dogs with title SD:   ${titleCounts.SD}`);
  console.log(`Registry dogs with title SDX:  ${titleCounts.SDX}`);
  console.log(`Registry dogs with title SDCh: ${titleCounts.SDCh}`);
  console.log(`Registry dogs with no title:   ${titleCounts.none}`);
  console.log(`Dogs baselined (flags set):    ${dogsBaselined}`);
  console.log(`Mushers updated:               ${mushersUpdated}`);

  if (!APPLY) {
    console.log('\nDry-run complete. Re-run with --apply to persist changes.');
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
