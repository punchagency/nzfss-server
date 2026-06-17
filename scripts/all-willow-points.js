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

  console.log("--- ALL RCR points for any Willow ---");
  for (const rcr of rcrPoints) {
    if (rcr.rcrPedigreeName?.toLowerCase().includes("willow") || rcr.rcrReg?.toLowerCase().includes("willow")) {
      console.log(`RCR: ID=${rcr.rcrID}, Name=${rcr.rcrPedigreeName}, Reg=${rcr.rcrReg}, Points=${rcr.rcrPoints}, Events=${rcr.rcrEvents}, Awards=${rcr.rcrAwards}, dogId=${rcr.dogId}`);
    }
  }

  console.log("\n--- ALL Live points for any Willow ---");
  for (const point of points) {
    const entrant = entrants.find(e => e._id.toString() === point.entrantId.toString());
    if (entrant) {
      const dogs = entrant.associatedDog || [];
      for (const dog of dogs) {
        if (dog.name?.toLowerCase().includes("willow") || dog.NZFSSRegistration?.toLowerCase().includes("willow")) {
          let dogPointsValue = 0;
          if (point.dogPoints && Array.isArray(point.dogPoints)) {
            const entry = point.dogPoints.find(dp => 
              (dog.dogId && dp.dogId === dog.dogId) || 
              dp.NZFSSRegistration === dog.NZFSSRegistration
            );
            dogPointsValue = entry ? entry.points : point.points / dogs.length;
          } else {
            dogPointsValue = point.points / dogs.length;
          }
          console.log(`Live: Entrant=${entrant.name}, Dog=${dog.name}, Reg=${dog.NZFSSRegistration}, Points=${dogPointsValue}, dogId=${dog.dogId}`);
        }
      }
    }
  }

  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
