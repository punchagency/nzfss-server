require("dotenv").config();
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const mongoose = require("mongoose");

async function main() {
  await mongoose.connect(process.env.MONGODB_STRING);
  const db = mongoose.connection.db;

  const gt0 = await db.collection("points").countDocuments({
    dogPoints: { $elemMatch: { cutoffPoints: { $gt: 0 } } },
  });
  console.log("Points with any dog cutoffPoints > 0:", gt0);

  const points = await db.collection("points").find({}).toArray();
  const entrants = await db.collection("entrants").find({}).toArray();
  const em = new Map(entrants.map((e) => [e._id.toString(), e]));

  let n = 0;
  for (const p of points) {
    const e = em.get(p.entrantId?.toString());
    if (!e?.associatedDog) continue;
    for (const d of e.associatedDog) {
      if (!(d.NZFSSRegistration || "").toLowerCase().includes("098")) continue;
      const dp = (p.dogPoints || []).find(
        (x) => x.NZFSSRegistration === d.NZFSSRegistration
      );
      if (n < 5) {
        console.log({
          dog: d.name,
          totalPts: dp?.points,
          cutoffPoints: dp?.cutoffPoints,
          raceCutoffTime: p.cutoffTime,
        });
      }
      n++;
    }
  }
  console.log("Total RR/098 live dog point rows:", n);

  await mongoose.disconnect();
}

main().catch(console.error);
