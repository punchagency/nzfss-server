require("dotenv").config();
const dns = require("dns");
const mongoose = require("mongoose");

function configureMongoDnsResolvers() {
  const servers = (process.env.MONGODB_DNS_SERVERS || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (servers.length) dns.setServers(servers);
}

async function main() {
  configureMongoDnsResolvers();
  const uri = process.env.MONGODB_STRING || process.env.MONGODB_URI;
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  console.log("=== RCR Cutoff Data for Eric's Dogs (RR/098) ===\n");
  const rcr = await db.collection("rcrpoints")
    .find({ rcrReg: "RR/098" })
    .project({ rcrPedigreeName: 1, rcrCutoff: 1, rcrEvents: 1, rcrPoints: 1 })
    .toArray();

  rcr.forEach((r) => {
    console.log(`${r.rcrPedigreeName}`);
    console.log(`  cutoff: ${r.rcrCutoff} | events: ${r.rcrEvents} | points: ${r.rcrPoints}`);
  });

  console.log("\n=== Live Points Cutoff Times for Eric's Dogs ===\n");
  const points = await db.collection("points")
    .find({})
    .project({ cutoffTime: 1, entrantId: 1 })
    .toArray();

  const entrantIds = points.map((p) => p.entrantId);
  const entrants = await db.collection("entrants")
    .find({ _id: { $in: entrantIds } })
    .project({ _id: 1, name: 1, class: 1, customClass: 1, associatedDog: 1 })
    .toArray();

  const entrantMap = new Map();
  entrants.forEach((e) => entrantMap.set(e._id.toString(), e));

  const ericLiveData = [];
  for (const point of points) {
    const entrant = entrantMap.get(point.entrantId?.toString());
    if (!entrant || !entrant.associatedDog) continue;

    for (const dog of entrant.associatedDog) {
      if (!dog.NZFSSRegistration || !dog.NZFSSRegistration.includes("RR/098")) continue;
      ericLiveData.push({
        dogName: dog.name,
        registration: dog.NZFSSRegistration,
        cutoffTime: point.cutoffTime,
        class: entrant.class,
      });
    }
  }

  if (ericLiveData.length === 0) {
    console.log("(No live race data for RR/098 dogs)");
  } else {
    console.log(`Found ${ericLiveData.length} live race entries for RR/098 dogs:`);
    const byDog = {};
    ericLiveData.forEach((d) => {
      if (!byDog[d.dogName]) byDog[d.dogName] = [];
      byDog[d.dogName].push(d.cutoffTime);
    });

    Object.entries(byDog).forEach(([dog, cutoffs]) => {
      console.log(`\n${dog}:`);
      console.log(`  ${cutoffs.length} races with cutoff times:`);
      cutoffs.slice(0, 3).forEach((c) => console.log(`    ${c}`));
      if (cutoffs.length > 3) console.log(`    ... and ${cutoffs.length - 3} more`);
    });
  }

  console.log("\n=== Sample Calculation (Akela) ===");
  const akelaRcr = rcr.find((r) => /akela/i.test(r.rcrPedigreeName));
  const akelaDogCount = ericLiveData.filter((d) => /akela/i.test(d.dogName)).length;

  if (akelaRcr) {
    console.log(`RCR: cutoff=${akelaRcr.rcrCutoff}, events=${akelaRcr.rcrEvents}`);
    console.log(`Live: ${akelaDogCount} race entries`);
    console.log(`Expected: weighted average of RCR and live cutoff times`);
  }

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
