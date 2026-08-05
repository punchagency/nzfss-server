/**
 * Shows every raw record (historical RCR row, live race entry, registry entry)
 * behind a dog, plus the merge key each one produces. Use when a dog's total on
 * the Dog Race Points page looks wrong.
 *
 * Usage: node scripts/explain-dog-points.js <name-or-reg-substring>
 */
require("dotenv").config();
const dns = require("dns");
const mongoose = require("mongoose");
const {
  getRcrMergeKey,
  getLiveDogMergeKey,
  findAmbiguousRcrDogIds,
  findAmbiguousPetNames,
} = require("../dist/utils/dog-points-aggregation");

function configureMongoDnsResolvers() {
  const servers = (process.env.MONGODB_DNS_SERVERS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (servers.length) dns.setServers(servers);
}

async function main() {
  const needle = (process.argv[2] || "").toLowerCase();
  if (!needle) {
    console.error("usage: node scripts/explain-dog-points.js <name-or-reg-substring>");
    process.exit(1);
  }

  configureMongoDnsResolvers();
  await mongoose.connect(process.env.MONGODB_STRING);
  const db = mongoose.connection.db;

  const matches = (...vals) =>
    vals.some((v) => (v || "").toString().toLowerCase().includes(needle));

  const rcrAll = await db.collection("rcrpoints").find({}).toArray();
  const ambiguousDogIds = findAmbiguousRcrDogIds(rcrAll);
  const ambiguousPetNames = findAmbiguousPetNames(rcrAll);

  console.log("=== historical RCR rows ===");
  for (const r of rcrAll) {
    if (!matches(r.rcrPedigreeName, r.rcrReg, r.rcrFlag)) continue;
    const key = getRcrMergeKey(r, ambiguousDogIds, ambiguousPetNames);
    console.log(
      `  ${r.rcrReg || r.rcrFlag || "?"}  ${r.rcrPedigreeName}  pts=${r.rcrPoints} cutoff=${r.rcrCutoff} events=${r.rcrEvents}`
    );
    console.log(`      key: ${key}`);
  }

  console.log("");
  console.log("=== live race entries ===");
  const entrants = await db.collection("entrants").find({}).toArray();
  for (const e of entrants) {
    for (const dog of e.associatedDog || []) {
      if (!matches(dog.name, dog.NZFSSRegistration)) continue;
      const key = getLiveDogMergeKey(dog, ambiguousDogIds, ambiguousPetNames);
      console.log(
        `  ${dog.NZFSSRegistration || "?"}  ${dog.name}  entrant=${e._id} raceType=${e.raceType} time=${e.raceTime}`
      );
      console.log(`      key: ${key}`);
    }
  }

  console.log("");
  console.log("=== registry dogs (musher kennels) ===");
  const mushers = await db.collection("mushers").find({}).toArray();
  for (const m of mushers) {
    for (const dog of m.dogs || []) {
      if (!matches(dog.name, dog.pedigreeName, dog.nzfssNo)) continue;
      console.log(
        `  ${dog.nzfssNo || "?"}  name=${dog.name}  pedigree=${dog.pedigreeName}  owner=${m.name}  dogId=${dog.dogId}`
      );
    }
  }

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
