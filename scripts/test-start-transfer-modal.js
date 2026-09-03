/**
 * Simulates the Musher Transfers page "Start transfer" modal flow.
 *   node scripts/test-start-transfer-modal.js
 */
require("dotenv").config();
const dns = require("dns");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { randomUUID } = require("crypto");

const GRAPHQL = "http://localhost:4000/graphql";
const DUMMY_NAME = "DUMMY START TRANSFER TEST";
const DUMMY_REG = "DUMMY/START01";

function configureMongoDnsResolvers() {
  const servers = (process.env.MONGODB_DNS_SERVERS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (servers.length) dns.setServers(servers);
}

function signClubToken(club) {
  return jwt.sign(
    { _id: club._id.toString(), email: club.email, name: club.name, role: "CLUB" },
    process.env.PUBLIC_KEY,
    { expiresIn: "30m" }
  );
}

async function gql(token, query, variables) {
  const res = await fetch(GRAPHQL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join("; "));
  }
  return json.data;
}

async function main() {
  configureMongoDnsResolvers();
  await mongoose.connect(process.env.MONGODB_STRING, { serverSelectionTimeoutMS: 20000 });
  const db = mongoose.connection.db;

  const clubs = await db
    .collection("users")
    .find({ role: "CLUB" })
    .project({ name: 1, email: 1 })
    .limit(2)
    .toArray();
  if (clubs.length < 2) throw new Error("Need two clubs");

  const fromClub = clubs[0];
  const toClub = clubs[1];
  const token = signClubToken(fromClub);

  await db.collection("mushers").deleteMany({ registrationNo: DUMMY_REG });
  await db.collection("forms").deleteMany({ nzfssRegistrationNumber: DUMMY_REG });

  const inserted = await db.collection("mushers").insertOne({
    name: DUMMY_NAME,
    registrationNo: DUMMY_REG,
    kennelRegistrationNo: "",
    club: fromClub._id.toString(),
    address: "",
    phone: "",
    email: "dummy-start-transfer@example.invalid",
    dateOfBirth: "",
    guardianDetails: "",
    showProfileConsent: false,
    dogs: [
      {
        dogId: randomUUID(),
        name: "Start Test Dog",
        pedigreeName: "",
        nzkcNo: "",
        nzfssNo: "DUMMY/START01/DOG",
        dateOfBirth: "",
        breed: "Siberian Husky",
        deceased: false,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const musherId = inserted.insertedId.toString();

  const GET_MUSHERS = `
    query GetClubMushersForTransfer($clubId: String) {
      getClubMushers(clubId: $clubId) {
        id name registrationNo dogs { name }
      }
    }
  `;
  const GET_TRANSFERS = `
    query GetMusherTransfers($clubId: String!) {
      forms(status: "pending", formType: "change", clubId: $clubId) {
        _id musherId affiliationFrom affiliationTo fromClubApproval toClubApproval status
      }
    }
  `;
  const REQUEST = `
    mutation RequestMusherTransfer($input: RequestMusherTransferInput!) {
      requestMusherTransfer(input: $input) {
        _id status musherId fromClubApproval toClubApproval
      }
    }
  `;

  try {
    const mushersData = await gql(token, GET_MUSHERS, { clubId: fromClub._id.toString() });
    const found = mushersData.getClubMushers.find((m) => m.id === musherId);
    if (!found) throw new Error("getClubMushers did not return dummy musher");
    console.log("  PASS getClubMushers lists dummy musher");

    const transfersBefore = await gql(token, GET_TRANSFERS, { clubId: fromClub._id.toString() });
    const pendingIds = new Set(
      (transfersBefore.forms || []).map((f) => f.musherId).filter(Boolean)
    );
    const transferable = mushersData.getClubMushers.filter((m) => !pendingIds.has(m.id));
    if (!transferable.some((m) => m.id === musherId)) {
      throw new Error("dummy musher should be transferable");
    }
    console.log("  PASS dummy musher available in transferable list");

    const created = await gql(token, REQUEST, {
      input: { musherId, destinationClubId: toClub._id.toString() },
    });
    const form = created.requestMusherTransfer;
    if (form.status !== "pending" || form.fromClubApproval !== "approved") {
      throw new Error("unexpected form state after start transfer");
    }
    console.log("  PASS requestMusherTransfer from modal flow", form._id);

    const transfersAfter = await gql(token, GET_TRANSFERS, { clubId: fromClub._id.toString() });
    const outgoing = transfersAfter.forms.filter(
      (f) =>
        f.affiliationFrom === fromClub._id.toString() &&
        f.fromClubApproval === "approved" &&
        f.toClubApproval === "pending"
    );
    if (!outgoing.some((f) => f._id === form._id)) {
      throw new Error("new transfer not in outgoing list");
    }
    console.log("  PASS transfer appears under Outgoing");

    const musher = await db.collection("mushers").findOne({ _id: inserted.insertedId });
    if (musher.club.toString() !== fromClub._id.toString()) {
      throw new Error("musher moved before destination accept");
    }
    console.log("  PASS musher still on source club until accept");

    console.log("\nStart transfer modal flow: all checks passed.");
  } finally {
    await db.collection("mushers").deleteMany({ registrationNo: DUMMY_REG });
    await db.collection("forms").deleteMany({ nzfssRegistrationNumber: DUMMY_REG });
    await mongoose.disconnect();
    console.log("Cleaned up dummy data.");
  }
}

main().catch((err) => {
  console.error("FAILED:", err.message);
  process.exit(1);
});
