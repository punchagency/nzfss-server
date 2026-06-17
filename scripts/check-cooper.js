require("dotenv").config();
const dns = require("dns");
const mongoose = require("mongoose");

function configureMongoDnsResolvers() {
  const servers = (process.env.MONGODB_DNS_SERVERS || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (servers.length) dns.setServers(servers);
}

async function main() {
  configureMongoDnsResolvers();
  await mongoose.connect(process.env.MONGODB_STRING);
  const db = mongoose.connection.db;

  const rcr = await db.collection("rcrpoints").find({ rcrPedigreeName: /cooper/i }).toArray();
  console.log("RCR Cooper:", rcr);

  const entrants = await db.collection("entrants").find({ "associatedDog.name": /cooper/i }).toArray();
  let liveTotal = 0;
  let events = 0;
  for (const e of entrants) {
    const point = await db.collection("points").findOne({
      $or: [{ entrantId: e._id }, { entrantId: e._id.toString() }],
    });
    if (!point) continue;
    for (const dog of e.associatedDog || []) {
      if (!dog.name?.toLowerCase().includes("cooper")) continue;
      events++;
      const dp = point.dogPoints?.find(
        (d) => d.dogId === dog.dogId || d.NZFSSRegistration === dog.NZFSSRegistration
      );
      const pts = dp?.points ?? point.points / (e.associatedDog?.length || 1);
      liveTotal += pts;
      console.log(`Live: ${dog.name} ${dog.NZFSSRegistration} dogId=${dog.dogId} pts=${pts}`);
    }
  }
  console.log(`Live total: ${liveTotal}, events: ${events}`);

  const mushers = await db.collection("mushers").find({ name: /altermann/i }).toArray();
  for (const m of mushers) {
    for (const d of m.dogs || []) {
      if (d.name?.toLowerCase().includes("cooper")) {
        console.log("Registry:", d);
      }
    }
  }

  await mongoose.disconnect();
}

main().catch(console.error);
