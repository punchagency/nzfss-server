require("dotenv").config();
const mongoose = require("mongoose");
const dns = require("dns");

function configureMongoDnsResolvers() {
  const dnsServers = (process.env.MONGODB_DNS_SERVERS || "")
    .split(",")
    .map(server => server.trim())
    .filter(Boolean);

  if (!dnsServers.length) {
    return;
  }

  dns.setServers(dnsServers);
}

// Old client-side functions
function parseRegistration(reg) {
  if (!reg || !reg.includes('/')) {
    return { kennelReg: reg || 'N/A' };
  }

  const parts = reg.split('/');
  if (parts.length >= 3) {
    return {
      kennelReg: parts.slice(0, -1).join('/'),
      petNameFromReg: parts[parts.length - 1].trim(),
    };
  }

  return { kennelReg: reg };
}

function normalizeKennelReg(reg) {
  const { kennelReg } = parseRegistration(reg);
  return (kennelReg || '').trim().toLowerCase();
}

function extractPetName(name, registration) {
  const { petNameFromReg } = parseRegistration(registration);
  if (petNameFromReg) {
    return petNameFromReg.toLowerCase();
  }

  const trimmed = (name || '').trim();
  if (!trimmed) return 'unknown';

  const possessiveMatch = trimmed.match(/'s\s+(.+)$/i);
  if (possessiveMatch) {
    const petPart = possessiveMatch[1].trim();
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

function getDogMergeKey(params) {
  if (params.dogId?.trim()) {
    return `id:${params.dogId.trim().toLowerCase()}`;
  }

  const kennelReg = normalizeKennelReg(params.registration);
  const petName = extractPetName(params.name, params.registration);
  return `reg:${kennelReg}|${petName}`;
}

function pickDisplayName(current, candidate) {
  if (!current || current === 'Unknown') return candidate;
  if (!candidate) return current;

  const currentIsShortCaps = current === current.toUpperCase() && !current.includes(' ');
  const candidateIsPedigree =
    candidate.includes("'") ||
    (candidate !== candidate.toUpperCase() && candidate.includes(' '));

  if (currentIsShortCaps && candidateIsPedigree) return candidate;
  if (candidate.length > current.length) return candidate;
  return current;
}

async function main() {
  const uri = process.env.MONGODB_STRING || process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.error("Set MONGODB_URI or MONGO_URI in .env");
    process.exit(1);
  }

  configureMongoDnsResolvers();
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const rcrPoints = await db.collection("rcrpoints").find({}).toArray();
  const points = await db.collection("points").find({}).toArray();
  const entrants = await db.collection("entrants").find({}).toArray();

  const dogGrouped = {};

  // Process live points
  points.forEach(point => {
    const entrant = entrants.find(e => e._id.toString() === point.entrantId.toString());
    if (!entrant || !entrant.associatedDog || entrant.associatedDog.length === 0) return;

    entrant.associatedDog.forEach(dog => {
      const { kennelReg, petNameFromReg } = parseRegistration(dog.NZFSSRegistration);
      const parsedRegNumber = kennelReg || dog.NZFSSRegistration || 'N/A';
      const displayName = dog.name || petNameFromReg || 'Unknown';
      const dogKey = getDogMergeKey({
        dogId: dog.dogId,
        name: dog.name,
        registration: dog.NZFSSRegistration,
      });

      if (!dogGrouped[dogKey]) {
        dogGrouped[dogKey] = {
          dogId: dog.dogId,
          name: displayName,
          regNumber: parsedRegNumber,
          points: 0,
          pointsOutsideCutoff: 0,
          events: 0,
          isFromCollection: false
        };
      }

      let dogPoints = 0;
      if (point.dogPoints && Array.isArray(point.dogPoints)) {
        const dogPointEntry = point.dogPoints.find(dp =>
          (dog.dogId && dp.dogId === dog.dogId) ||
          dp.NZFSSRegistration === dog.NZFSSRegistration ||
          dp.NZFSSRegistration === parsedRegNumber
        );
        if (dogPointEntry) {
          dogPoints = dogPointEntry.points;
        } else {
          dogPoints = point.points / entrant.associatedDog.length;
        }
      } else {
        dogPoints = point.points / entrant.associatedDog.length;
      }

      dogGrouped[dogKey].points += dogPoints;
      dogGrouped[dogKey].events += 1;
    });
  });

  // Merge RCR points
  rcrPoints.forEach(rcrPoint => {
    const dogName = rcrPoint.rcrPedigreeName;
    if (!dogName || dogName.trim() === '' || dogName.toLowerCase() === 'n/a') return;

    const rcrRegValue = rcrPoint.rcrReg || rcrPoint.rcrFlag;
    const mergeKey = getDogMergeKey({
      dogId: rcrPoint.dogId,
      name: dogName,
      registration: rcrRegValue,
    });

    if (dogGrouped[mergeKey]) {
      const existingDog = dogGrouped[mergeKey];
      existingDog.points += rcrPoint.rcrPoints || 0;
      existingDog.events += rcrPoint.rcrEvents || 0;
      existingDog.name = pickDisplayName(existingDog.name, dogName);
    } else {
      const { kennelReg, petNameFromReg } = parseRegistration(rcrRegValue);
      const displayName = dogName || petNameFromReg || 'Unknown';

      dogGrouped[mergeKey] = {
        dogId: rcrPoint.dogId,
        name: displayName,
        regNumber: kennelReg || rcrRegValue || 'N/A',
        points: rcrPoint.rcrPoints || 0,
        pointsOutsideCutoff: 0,
        events: rcrPoint.rcrEvents || 0,
        isFromCollection: true
      };
    }
  });

  console.log("--- Old Client Grouped Dogs containing 'willow' ---");
  for (const [key, dog] of Object.entries(dogGrouped)) {
    if (dog.name.toLowerCase().includes("willow") || key.toLowerCase().includes("willow")) {
      console.log(`Key: ${key}`);
      console.log(`  Name: ${dog.name}`);
      console.log(`  Reg: ${dog.regNumber}`);
      console.log(`  Points: ${dog.points}`);
      console.log(`  Events: ${dog.events}`);
      console.log(`  dogId: ${dog.dogId}`);
    }
  }

  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
