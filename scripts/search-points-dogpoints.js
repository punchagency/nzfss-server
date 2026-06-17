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

  const points = await db.collection("points").find({
    $or: [
      { "dogPoints.NZFSSRegistration": { $regex: /willow/i } },
      { "dogPoints.dogId": { $regex: /willow/i } }
    ]
  }).toArray();

  console.log(`Found ${points.length} points directly matching 'willow' in dogPoints`);
  let totalPoints = 0;
  for (const p of points) {
    console.log(`Point ID: ${p._id}, entrantId: ${p.entrantId}, points: ${p.points}`);
    console.log("dogPoints:", p.dogPoints);
    const dp = p.dogPoints.find(d => d.NZFSSRegistration?.toLowerCase().includes("willow"));
    if (dp) {
      totalPoints += dp.points;
    }
  }
  console.log(`Total points from dogPoints matching 'willow': ${totalPoints}`);

  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
