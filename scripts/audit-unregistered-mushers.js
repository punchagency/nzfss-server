/**
 * Audit driver names on results against the musher registry.
 *
 * Only drivers holding an NZFSS registration number earn musher points, and
 * registration is read from the musher registry rather than guessed from the
 * name. This lists the drivers who currently hold stored points but would score
 * nothing the next time their class is submitted, split by what needs fixing:
 *
 *   A. a registry record exists but its registration number is blank
 *   B. no registry record matches the name typed on the result
 *
 * Read-only: it reports, it never writes.
 *
 * Usage:
 *   node scripts/audit-unregistered-mushers.js
 */
const mongoose = require('mongoose');

const { getMongoUriWithFallback } = require('./mongo-uri');
const MONGODB_URI = getMongoUriWithFallback();

const musherSchema = new mongoose.Schema({}, { strict: false, collection: 'mushers' });
const entrantSchema = new mongoose.Schema({}, { strict: false, collection: 'entrants' });
const pointSchema = new mongoose.Schema({}, { strict: false, collection: 'points' });

const Musher = mongoose.model('AuditRegMusher', musherSchema);
const Entrant = mongoose.model('AuditRegEntrant', entrantSchema);
const Point = mongoose.model('AuditRegPoint', pointSchema);

/** Kept in step with nzfss-client-main/lib/nzfss-registration.ts. */
const BLANK_REGISTRATION_VALUES = new Set([
  '-', '--', 'n/a', 'n.a.', 'na', 'nil', 'none', 'not registered',
  'null', 'tba', 'tbc', 'undefined', 'unknown', 'unregistered',
]);

function hasNzfssRegistration(registration) {
  const value = (registration || '').trim().toLowerCase();
  return value !== '' && !BLANK_REGISTRATION_VALUES.has(value);
}

function musherNameKey(name) {
  return (name || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

async function main() {
  await mongoose.connect(MONGODB_URI);

  const mushers = await Musher.find({}, { name: 1, registrationNo: 1 }).lean();
  const registered = new Set();
  const known = new Set();
  for (const musher of mushers) {
    const key = musherNameKey(musher.name);
    if (!key) continue;
    known.add(key);
    if (hasNzfssRegistration(musher.registrationNo)) registered.add(key);
  }

  const points = await Point.find({ points: { $gt: 0 } }, { entrantId: 1, points: 1 }).lean();
  const entrants = await Entrant.find(
    { _id: { $in: points.map((p) => p.entrantId) } },
    { name: 1 }
  ).lean();
  const entrantNameById = new Map(entrants.map((e) => [e._id.toString(), e.name]));

  const noRegistrationNumber = new Map();
  const notInRegistry = new Map();
  let affectedRows = 0;
  let checkedRows = 0;

  for (const point of points) {
    // Points rows whose entrant has since been deleted cannot be re-scored.
    const name = entrantNameById.get(point.entrantId.toString());
    if (name === undefined) continue;
    checkedRows++;

    const key = musherNameKey(name);
    if (key !== '' && registered.has(key)) continue;

    affectedRows++;
    const bucket = key !== '' && known.has(key) ? noRegistrationNumber : notInRegistry;
    const label = (name || '(blank name)').trim();
    bucket.set(label, (bucket.get(label) || 0) + 1);
  }

  const report = (title, bucket) => {
    console.log(`\n${title} — ${bucket.size} driver(s)`);
    if (bucket.size === 0) return;
    for (const [name, count] of [...bucket].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))) {
      console.log(`  ${String(count).padStart(4)} result(s)   ${name}`);
    }
  };

  console.log('='.repeat(72));
  console.log('Drivers holding points who are not NZFSS-registered');
  console.log('='.repeat(72));
  console.log(`registry:              ${mushers.length} mushers, ${registered.size} with a registration number`);
  console.log(`points rows scoring:   ${points.length} (${checkedRows} with a live entrant to re-score)`);
  console.log(`of those, unregistered: ${affectedRows}`);

  report('A. Registry record exists but no registration number — add the number in Manage Mushers', noRegistrationNumber);
  report('B. No registry record matches this name — correct the driver name or add the musher', notInRegistry);

  console.log(
    '\nStored points are not changed by this rule until a class is submitted again,' +
    '\nso fixing the registry before the next submission keeps these results intact.'
  );

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error('Audit failed:', error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
