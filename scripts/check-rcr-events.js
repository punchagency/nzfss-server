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

  console.log("=== Check RCR Document Structure ===");
  const sample = await db.collection("rcrpoints").findOne({ rcrReg: "RR/098" });
  if (sample) {
    console.log("RCR fields:", Object.keys(sample).sort().join(", "));
  }

  console.log("\n=== Check if any RCR has rcrEvents ===");
  const withEvents = await db.collection("rcrpoints").countDocuments({ rcrEvents: { $exists: true } });
  console.log(`Documents with rcrEvents field: ${withEvents}`);

  const allRcr = await db.collection("rcrpoints").countDocuments({});
  console.log(`Total RCR documents: ${allRcr}`);

  console.log("\n=== Check what rcrEvents values exist ===");
  const distinct = await db.collection("rcrpoints").distinct("rcrEvents");
  console.log(`Distinct rcrEvents values: ${JSON.stringify(distinct)}`);

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
