require("dotenv").config();
const dns = require("dns");
const mongoose = require("mongoose");

function configureMongoDnsResolvers() {
  const servers = (process.env.MONGODB_DNS_SERVERS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (servers.length) dns.setServers(servers);
}

async function main() {
  configureMongoDnsResolvers();
  await mongoose.connect(process.env.MONGODB_STRING);

  const {
    getDogMergeKey,
    getLiveDogMergeKey,
    getRcrMergeKey,
    findAmbiguousRcrDogIds,
  } = require("../dist/utils/dog-points-aggregation");
  const { buildKeyResolver, loadRegistryDogs, loadAggregationInputs } = require(
    "../dist/service/dog-title.service"
  );

  const registry = await loadRegistryDogs();
  const { points, rcrPoints } = await loadAggregationInputs();
  const { resolveKey } = buildKeyResolver(registry, points, rcrPoints);
  const ambiguous = findAmbiguousRcrDogIds(rcrPoints);

  const akelaRegistry = registry.filter(
    (d) =>
      /akela/i.test(d.name) ||
      /akela/i.test(d.pedigreeName) ||
      /akela/i.test(d.nzfssNo)
  );
  console.log("=== Registry Akela ===");
  akelaRegistry.forEach((d) => {
    console.log({
      dogId: d.dogId,
      name: d.name,
      pedigreeName: d.pedigreeName,
      nzfssNo: d.nzfssNo,
    });
  });

  const akelaRcr = rcrPoints.filter((r) => /akela/i.test(r.rcrPedigreeName || ""));
  console.log("\n=== RCR Akela ===");
  for (const r of akelaRcr) {
    const natural = getRcrMergeKey(r, ambiguous);
    const resolved = resolveKey(natural) || natural;
    console.log({
      dogId: r.dogId,
      rcrReg: r.rcrReg,
      rcrFlag: r.rcrFlag,
      name: r.rcrPedigreeName,
      pts: r.rcrPoints,
      naturalKey: natural,
      resolvedKey: resolved,
    });
  }

  console.log("\n=== Live Akela entries (sample) ===");
  let count = 0;
  for (const point of points) {
    const entrant = point.entrant;
    if (!entrant?.associatedDog) continue;
    for (const dog of entrant.associatedDog) {
      if (!/akela/i.test(dog.name || "")) continue;
      const natural = getLiveDogMergeKey(dog, ambiguous);
      const resolved = resolveKey(natural) || natural;
      if (count < 3) {
        console.log({
          dogId: dog.dogId,
          name: dog.name,
          reg: dog.NZFSSRegistration,
          naturalKey: natural,
          resolvedKey: resolved,
        });
      }
      count++;
    }
  }
  console.log(`Total live Akela associatedDog rows: ${count}`);

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
