/**
 * Full MongoDB backup to JSON files (one file per collection).
 *
 * Usage:
 *   set MONGODB_URI=mongodb+srv://user:pass@cluster/kennel?...
 *   node scripts/backup-mongodb.js
 *
 * If mongodb+srv fails with querySrv ECONNREFUSED (common on some Windows DNS setups),
 * use a standard URI with shard hostnames from Atlas → Connect → Drivers.
 *
 * Optional:
 *   BACKUP_DIR=./backups/custom-folder
 */
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const { getMongoUriWithFallback } = require('./mongo-uri');

const URI = getMongoUriWithFallback();

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const defaultDir = path.resolve(__dirname, '..', 'backups', `kennel-${timestamp}`);
const BACKUP_DIR = process.env.BACKUP_DIR
  ? path.resolve(process.env.BACKUP_DIR)
  : defaultDir;

function sanitize(value) {
  return JSON.parse(
    JSON.stringify(value, (_key, v) => (typeof v === 'bigint' ? v.toString() : v))
  );
}

async function backup() {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });

  const client = new MongoClient(URI);
  await client.connect();
  console.log('Connected to MongoDB');

  const db = client.db();
  const dbName = db.databaseName;
  const collections = await db.listCollections().toArray();

  const manifest = {
    database: dbName,
    createdAt: new Date().toISOString(),
    collections: [],
  };

  console.log(`Backing up database "${dbName}" (${collections.length} collections)...`);

  for (const { name } of collections) {
    const coll = db.collection(name);
    const documents = await coll.find({}).toArray();
    const filePath = path.join(BACKUP_DIR, `${name}.json`);

    fs.writeFileSync(
      filePath,
      JSON.stringify(sanitize(documents), null, 2),
      'utf8'
    );

    manifest.collections.push({
      name,
      documentCount: documents.length,
      file: `${name}.json`,
    });

    console.log(`  ${name}: ${documents.length} documents`);
  }

  fs.writeFileSync(
    path.join(BACKUP_DIR, '_manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf8'
  );

  await client.close();
  console.log(`\nBackup complete: ${BACKUP_DIR}`);
}

backup().catch((err) => {
  console.error('Backup failed:', err.message);
  process.exit(1);
});
