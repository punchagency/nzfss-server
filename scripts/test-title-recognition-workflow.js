/**
 * End-to-end verification for sled-dog title recognition workflow.
 *
 * Usage:
 *   node scripts/test-title-recognition-workflow.js
 *
 * Safe by default: read-only checks + optional recognise test with automatic rollback.
 * Set APPLY_MIGRATION=1 to run pending migration during the test.
 * Set TEST_RECOGNISE=1 to exercise recogniseTitleChanges on one live dog (rolled back).
 */
const mongoose = require('mongoose');
const path = require('path');
const { config } = require('dotenv');

config({ path: path.resolve(__dirname, '../.env') });

const { getMongoUriWithFallback } = require('./mongo-uri');
const {
  getUnrecognisedTitleChanges,
  recogniseTitleChanges,
  computeDogTitleStatuses,
} = require('../dist/service/dog-title.service');
const { buildTabDelimited } = require('./test-export-format');

const MONGODB_URI = getMongoUriWithFallback();
const APPLY_MIGRATION = process.env.APPLY_MIGRATION === '1';
const TEST_RECOGNISE = process.env.TEST_RECOGNISE === '1';

const EXPORT_HEADERS = [
  'Dog Name',
  'Pedigree Name',
  'NZFSS Number',
  'Owner Name',
  'Previous Title',
  'New Title',
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function buildExportSample(changes) {
  const rows = changes.map((change) => [
    change.dogName,
    change.pedigreeName,
    change.nzfssNo,
    change.ownerName,
    change.previousTitle,
    change.newTitle,
  ]);
  return buildTabDelimited(EXPORT_HEADERS, rows);
}

async function loadDogRecognition(musherId, dogId) {
  const Musher = mongoose.connection.collection('mushers');
  const musher = await Musher.findOne({ _id: new mongoose.Types.ObjectId(musherId) });
  if (!musher) return null;
  const dog = (musher.dogs || []).find((d) => d.dogId === dogId);
  return dog?.titleRecognition ? { ...dog.titleRecognition } : null;
}

async function restoreDogRecognition(musherId, dogId, titleRecognition) {
  const Musher = mongoose.connection.collection('mushers');
  const musher = await Musher.findOne({ _id: new mongoose.Types.ObjectId(musherId) });
  if (!musher) throw new Error('Musher not found for rollback');

  const updatedDogs = (musher.dogs || []).map((dog) => {
    if (dog.dogId !== dogId) return dog;
    if (!titleRecognition) {
      const { titleRecognition: _removed, ...rest } = dog;
      return rest;
    }
    return { ...dog, titleRecognition };
  });

  await Musher.updateOne(
    { _id: musher._id },
    { $set: { dogs: updatedDogs } }
  );
}

async function runMigrationApply() {
  const { execSync } = require('child_process');
  const output = execSync('node scripts/migrate-title-recognition.js --apply', {
    cwd: path.resolve(__dirname, '..'),
    encoding: 'utf8',
  });
  return output;
}

async function main() {
  console.log('=== Title Recognition Workflow Test ===\n');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB\n');

  // 1) Unit-style rule check via computeDogTitleStatuses sample
  const statuses = await computeDogTitleStatuses();
  const earned = statuses.filter((s) => s.earnedTitle);
  const unrecognised = statuses.filter((s) => s.isUnrecognised && s.earnedTitle);
  console.log(`Registry dogs with earned title:     ${earned.length}`);
  console.log(`Unrecognised title upgrades:         ${unrecognised.length}`);

  // 2) Query API shape
  const beforeChanges = await getUnrecognisedTitleChanges();
  assert(Array.isArray(beforeChanges), 'getUnrecognisedTitleChanges must return an array');
  console.log(`getUnrecognisedTitleChanges count:   ${beforeChanges.length}`);

  if (beforeChanges.length > 0) {
    const sample = beforeChanges[0];
    const required = [
      'dogId',
      'dogName',
      'pedigreeName',
      'nzfssNo',
      'ownerName',
      'previousTitle',
      'newTitle',
    ];
    for (const key of required) {
      assert(key in sample, `Missing field on result: ${key}`);
    }
    console.log('\nSample unrecognised dog:');
    console.log(
      `  ${sample.dogName} (${sample.nzfssNo}) — ${sample.previousTitle} → ${sample.newTitle}`
    );
  } else {
    console.log('\nNo unrecognised title changes in live data.');
  }

  // 3) Export format
  const exportContent = buildExportSample(beforeChanges.slice(0, 3));
  const exportLines = exportContent.split('\r\n');
  assert(exportLines.length >= 1, 'Export must have at least a header row');
  assert(exportLines[0].includes('\t'), 'Export header must be tab-delimited');
  assert(exportLines[0].startsWith('Dog Name\t'), 'Export must include column headers');
  console.log('\nExport format: OK (tab-delimited, headers present)');
  if (beforeChanges.length > 0) {
    console.log('Export preview (first 2 lines):');
    console.log(exportLines.slice(0, 2).join('\n'));
  }

  // 4) Optional migration apply
  if (APPLY_MIGRATION) {
    console.log('\nApplying pending title-recognition migration...');
    const migrationOutput = await runMigrationApply();
    console.log(migrationOutput.trim());
    const afterMigration = await getUnrecognisedTitleChanges();
    console.log(`Unrecognised after migration:        ${afterMigration.length}`);
  } else {
    console.log('\nSkipping migration apply (set APPLY_MIGRATION=1 to run).');
  }

  // 5) Optional recognise test with rollback
  const currentChanges = await getUnrecognisedTitleChanges();
  if (TEST_RECOGNISE && currentChanges.length > 0) {
    const target = currentChanges[0];
    console.log(`\nRecognise test on: ${target.dogName} (${target.dogId})`);
    const snapshot = await loadDogRecognition(target.musherId, target.dogId);

    const count = await recogniseTitleChanges([target.dogId]);
    assert(count === 1, `Expected recogniseTitleChanges to update 1 dog, got ${count}`);

    const afterRecognise = await getUnrecognisedTitleChanges();
    const stillListed = afterRecognise.some((c) => c.dogId === target.dogId);
    assert(!stillListed, 'Dog should disappear from unrecognised list after recognition');

    const duplicateCount = await recogniseTitleChanges([target.dogId]);
    assert(duplicateCount === 0, 'Second recognition must be idempotent (0 updates)');

    await restoreDogRecognition(target.musherId, target.dogId, snapshot);
    const afterRollback = await getUnrecognisedTitleChanges();
    const backInList = afterRollback.some((c) => c.dogId === target.dogId);
    assert(backInList, 'Dog should reappear after rollback');
    console.log('Recognise + idempotency + rollback: OK');
  } else if (TEST_RECOGNISE) {
    console.log('\nRecognise test skipped: no unrecognised dogs available.');
  } else {
    console.log('\nSkipping recognise test (set TEST_RECOGNISE=1 when unrecognised dogs exist).');
  }

  console.log('\n=== All workflow checks passed ===');
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error('\nWorkflow test FAILED:', err.message);
  try {
    await mongoose.disconnect();
  } catch (_) {
    /* ignore */
  }
  process.exit(1);
});
