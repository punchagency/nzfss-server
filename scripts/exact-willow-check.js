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

  // Let's find exactly what RCR points are there for Nalbec's Willow
  const willowRcr = rcrPoints.find(r => r.rcrPedigreeName === "Nalbec's Willow");
  console.log("Nalbec's Willow RCR record in DB:", willowRcr);

  // Let's find exactly what live points are there for Nalbec's Willow
  const willowLiveEntrants = entrants.filter(e => e.associatedDog && e.associatedDog.some(d => d.name === "Nalbec's Willow"));
  console.log(`Found ${willowLiveEntrants.length} live entrants for Nalbec's Willow`);
  for (const entrant of willowLiveEntrants) {
    const point = await db.collection("points").findOne({
      $or: [
        { entrantId: entrant._id },
        { entrantId: entrant._id.toString() }
      ]
    });
    console.log(`Entrant: ${entrant.name}, EventId: ${entrant.eventId}, HasPoint: ${!!point}`);
    if (point) {
      console.log("Point:", point);
    }
  }

  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
