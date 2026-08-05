/**
 * Audits historical RCR point rows for merge-key collisions.
 *
 * Two distinct dogs collide when `getDogMergeKey` derives the same pet name for
 * both. This happens because `rcrReg` holds only the kennel-level registration
 * (e.g. "TB/014"), so `extractPetName` falls back to the last word of the
 * pedigree name — which is the kennel, not the dog, for names like
 * "Black Magic of Carob" / "German Son of Carob".
 *
 * Colliding rows have their points, events and cutoff points summed into one
 * row on the public Dog Race Points page.
 *
 * Usage: node scripts/audit-rcr-merge-collisions.js
 */
require("dotenv").config();
const dns = require("dns");
const mongoose = require("mongoose");
const {
  getRcrMergeKey,
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

function parseCutoff(value) {
  if (value === null || value === undefined || value === "") return 0;
  const n = Number(String(value).trim());
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

async function main() {
  configureMongoDnsResolvers();
  await mongoose.connect(process.env.MONGODB_STRING);
  const db = mongoose.connection.db;

  const rows = await db.collection("rcrpoints").find({}).toArray();
  const ambiguous = findAmbiguousRcrDogIds(
    rows.map((r) => ({ dogId: r.dogId, rcrPedigreeName: r.rcrPedigreeName }))
  );

  const ambiguousPetNames = findAmbiguousPetNames(rows);

  const byKey = new Map();
  for (const r of rows) {
    const name = (r.rcrPedigreeName || "").trim();
    if (!name || name.toLowerCase() === "n/a") continue;

    const rcr = {
      dogId: r.dogId,
      rcrReg: r.rcrReg,
      rcrFlag: r.rcrFlag,
      rcrPedigreeName: r.rcrPedigreeName,
    };
    // Naive key = what the shortened pet name alone would produce.
    const key = getRcrMergeKey(rcr, ambiguous);
    const resolvedKey = getRcrMergeKey(rcr, ambiguous, ambiguousPetNames);

    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push({ row: r, resolvedKey });
  }

  const collisions = [];
  for (const [key, entries] of byKey) {
    const distinctNames = new Set(
      entries.map((e) => e.row.rcrPedigreeName.trim().toLowerCase())
    );
    if (distinctNames.size <= 1) continue;

    const resolvedKeys = new Set(entries.map((e) => e.resolvedKey));
    collisions.push({
      key,
      group: entries.map((e) => e.row),
      resolved: resolvedKeys.size === distinctNames.size,
    });
  }

  collisions.sort((a, b) => {
    const sum = (g) => g.reduce((t, r) => t + (r.rcrPoints || 0), 0);
    return sum(b.group) - sum(a.group);
  });

  const unresolved = collisions.filter((c) => !c.resolved);

  console.log(`RCR rows scanned:        ${rows.length}`);
  console.log(`Names sharing a short form: ${collisions.length}`);
  console.log(
    `Dogs involved:           ${collisions.reduce((t, c) => t + c.group.length, 0)}`
  );
  console.log(`STILL MERGED (bad):      ${unresolved.length}`);
  console.log("");

  for (const { key, group, resolved } of collisions) {
    const totalPoints = group.reduce((t, r) => t + (r.rcrPoints || 0), 0);
    const totalCutoff = group.reduce((t, r) => t + parseCutoff(r.rcrCutoff), 0);
    console.log(`${key}  ${resolved ? "[split OK]" : "[STILL MERGED]"}`);
    console.log(`  would have shown as ONE dog: ${totalPoints} pts, ${totalCutoff} cutoff`);
    for (const r of group) {
      console.log(
        `     ${String(r.rcrPoints ?? 0).padStart(7)} pts  ${String(
          parseCutoff(r.rcrCutoff)
        ).padStart(3)} cutoff  ${r.rcrReg || r.rcrFlag || "?"}  ${r.rcrPedigreeName}`
      );
    }
    console.log("");
  }

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
