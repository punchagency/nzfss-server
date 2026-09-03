/**
 * Local end-to-end check of dual-club musher transfer against localhost GraphQL.
 * Creates a dummy musher, exercises request/approve/decline guards, then cleans up.
 *
 *   node scripts/test-musher-transfer.js
 */
require("dotenv").config();
const dns = require("dns");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { randomUUID } = require("crypto");

function configureMongoDnsResolvers() {
  const servers = (process.env.MONGODB_DNS_SERVERS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (servers.length) dns.setServers(servers);
}

const GRAPHQL = "http://localhost:4000/graphql";
const DUMMY_NAME = "DUMMY TRANSFER MUSHER";
const DUMMY_REG = "DUMMY/001";
const DUMMY_DOG = "Dummy Pup";
const DUMMY_DOG_NO = "DUMMY/001/PUP";

function signClubToken(club) {
  return jwt.sign(
    {
      _id: club._id.toString(),
      email: club.email,
      name: club.name,
      role: "CLUB",
    },
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
    const err = new Error(json.errors.map((e) => e.message).join("; "));
    err.graphql = json.errors;
    throw err;
  }
  return json.data;
}

function expectFail(label, err, snippet) {
  const msg = err instanceof Error ? err.message : String(err);
  if (snippet && !msg.toLowerCase().includes(snippet.toLowerCase())) {
    throw new Error(`${label}: expected error containing "${snippet}", got "${msg}"`);
  }
  console.log(`  PASS ${label}: ${msg}`);
}

async function main() {
  configureMongoDnsResolvers();
  await mongoose.connect(process.env.MONGODB_STRING, {
    serverSelectionTimeoutMS: 20000,
  });
  const db = mongoose.connection.db;

  const clubs = await db
    .collection("users")
    .find({ role: "CLUB" })
    .project({ name: 1, email: 1 })
    .limit(3)
    .toArray();

  if (clubs.length < 2) {
    throw new Error("Need at least two CLUB users in the database to test transfers.");
  }

  const fromClub = clubs[0];
  const toClub = clubs[1];
  const otherClub = clubs[2] || null;

  console.log(`From club: ${fromClub.name} (${fromClub._id})`);
  console.log(`To club:   ${toClub.name} (${toClub._id})`);
  if (otherClub) console.log(`Other:     ${otherClub.name} (${otherClub._id})`);

  await db.collection("mushers").deleteMany({
    $or: [{ name: DUMMY_NAME }, { registrationNo: DUMMY_REG }],
  });
  await db.collection("forms").deleteMany({
    $or: [{ applicantName: DUMMY_NAME }, { nzfssRegistrationNumber: DUMMY_REG }],
  });

  const dummy = await db.collection("mushers").insertOne({
    name: DUMMY_NAME,
    registrationNo: DUMMY_REG,
    kennelRegistrationNo: "",
    club: fromClub._id.toString(),
    address: "1 Dummy Lane",
    phone: "0000000000",
    email: "dummy-transfer@example.invalid",
    dateOfBirth: "",
    guardianDetails: "",
    showProfileConsent: false,
    dogs: [
      {
        dogId: randomUUID(),
        name: DUMMY_DOG,
        pedigreeName: "Dummy Pedigree Pup",
        nzkcNo: "",
        nzfssNo: DUMMY_DOG_NO,
        dateOfBirth: "2020-01-01",
        breed: "Siberian Husky",
        deceased: false,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const musherId = dummy.insertedId.toString();
  console.log(`Created dummy musher ${musherId}`);

  const fromToken = signClubToken(fromClub);
  const toToken = signClubToken(toClub);
  const otherToken = otherClub ? signClubToken(otherClub) : null;

  const REQUEST = `
    mutation RequestMusherTransfer($input: RequestMusherTransferInput!) {
      requestMusherTransfer(input: $input) {
        _id status musherId affiliationFrom affiliationTo
        fromClubApproval toClubApproval nzfssRegistrationNumber
        dogs { petName nzfssNumber }
      }
    }
  `;
  const APPROVE = `
    mutation ApproveForm($id: String!) {
      approveForm(id: $id) {
        _id status fromClubApproval toClubApproval
      }
    }
  `;
  const LIST = `
    query GetMusherTransfers($clubId: String!) {
      forms(status: "pending", formType: "change", clubId: $clubId) {
        _id musherId applicantName affiliationFrom affiliationTo
        fromClubApproval toClubApproval
      }
    }
  `;

  try {
    try {
      await gql(fromToken, REQUEST, {
        input: { musherId, destinationClubId: fromClub._id.toString() },
      });
      throw new Error("same-club transfer should have been rejected");
    } catch (err) {
      if (err.message.includes("should have been rejected")) throw err;
      expectFail("same-club rejected", err, "same club");
    }

    const created = await gql(fromToken, REQUEST, {
      input: { musherId, destinationClubId: toClub._id.toString() },
    });
    const form = created.requestMusherTransfer;
    console.log("  PASS requestMusherTransfer created", {
      id: form._id,
      from: form.fromClubApproval,
      to: form.toClubApproval,
      status: form.status,
      dogs: form.dogs,
    });

    if (form.fromClubApproval !== "approved") {
      throw new Error("club-initiated transfer should auto-release (fromClubApproval=approved)");
    }
    if (form.toClubApproval !== "pending" || form.status !== "pending") {
      throw new Error("destination should still be pending");
    }
    if (form.nzfssRegistrationNumber !== DUMMY_REG) {
      throw new Error("form snapshot lost registration number");
    }

    try {
      await gql(fromToken, REQUEST, {
        input: { musherId, destinationClubId: toClub._id.toString() },
      });
      throw new Error("duplicate pending transfer should have been rejected");
    } catch (err) {
      if (err.message.includes("should have been rejected")) throw err;
      expectFail("duplicate pending rejected", err, "already pending");
    }

    const fromList = await gql(fromToken, LIST, { clubId: fromClub._id.toString() });
    const toList = await gql(toToken, LIST, { clubId: toClub._id.toString() });
    const onFrom = fromList.forms.some((f) => f._id === form._id);
    const onTo = toList.forms.some((f) => f._id === form._id);
    if (!onFrom || !onTo) {
      throw new Error(
        `list query missed transfer (from=${onFrom}, to=${onTo}). fromCount=${fromList.forms.length} toCount=${toList.forms.length}`
      );
    }
    console.log("  PASS both clubs see the pending transfer");

    if (otherToken) {
      try {
        await gql(otherToken, APPROVE, { id: form._id });
        throw new Error("unrelated club should not be able to approve");
      } catch (err) {
        if (err.message.includes("should not")) throw err;
        expectFail("unrelated club cannot approve", err, "not involved");
      }
    }

    const mid = await db.collection("mushers").findOne({ _id: dummy.insertedId });
    if (mid.club.toString() !== fromClub._id.toString()) {
      throw new Error("musher moved before destination accepted");
    }
    console.log("  PASS musher still on source club before destination accept");

    const accepted = await gql(toToken, APPROVE, { id: form._id });
    const after = accepted.approveForm;
    console.log("  PASS destination accept", after);
    if (after.status !== "approved" || after.toClubApproval !== "approved") {
      throw new Error("transfer should complete after destination accept");
    }

    const moved = await db.collection("mushers").findOne({ _id: dummy.insertedId });
    if (moved.club.toString() !== toClub._id.toString()) {
      throw new Error(`musher club is ${moved.club}, expected ${toClub._id}`);
    }
    if (moved.registrationNo !== DUMMY_REG) {
      throw new Error(`registration number changed to ${moved.registrationNo}`);
    }
    if (!moved.dogs?.[0] || moved.dogs[0].nzfssNo !== DUMMY_DOG_NO) {
      throw new Error("dog NZFSS number changed or dog missing");
    }
    if (moved.dogs[0].name !== DUMMY_DOG) {
      throw new Error("dog name changed");
    }
    console.log("  PASS musher + dog moved, numbers unchanged");

    // Public change form: both clubs start pending; first approval must not move.
    const dummy2 = await db.collection("mushers").insertOne({
      name: DUMMY_NAME + " TWO",
      registrationNo: "DUMMY/002",
      kennelRegistrationNo: "",
      club: fromClub._id.toString(),
      address: "",
      phone: "",
      email: "dummy-transfer-2@example.invalid",
      dateOfBirth: "",
      guardianDetails: "",
      showProfileConsent: false,
      dogs: [
        {
          dogId: randomUUID(),
          name: "Dummy Two",
          pedigreeName: "",
          nzkcNo: "",
          nzfssNo: "DUMMY/002/TWO",
          dateOfBirth: "",
          breed: "Siberian Husky",
          deceased: false,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const CREATE_FORM = `
      mutation CreateForm($input: CreateFormInput!) {
        createForm(input: $input) {
          _id status fromClubApproval toClubApproval affiliationFrom affiliationTo
        }
      }
    `;
    const publicForm = await gql(fromToken, CREATE_FORM, {
      input: {
        formName: "Musher Registration Change Form",
        formType: "change",
        applicantName: DUMMY_NAME + " TWO",
        firstName: "DUMMY",
        surname: "TRANSFER MUSHER TWO",
        nzfssRegistrationNumber: "DUMMY/002",
        club: toClub._id.toString(),
        affiliationFrom: fromClub._id.toString(),
        affiliationTo: toClub._id.toString(),
        musherId: dummy2.insertedId.toString(),
        status: "pending",
        dogs: [{ petName: "Dummy Two", nzfssNumber: "DUMMY/002/TWO" }],
      },
    });
    const pf = publicForm.createForm;
    if (pf.fromClubApproval !== "pending" || pf.toClubApproval !== "pending") {
      throw new Error(
        `public change form should start both pending, got from=${pf.fromClubApproval} to=${pf.toClubApproval}`
      );
    }
    console.log("  PASS public change form starts both pending");

    const firstApprove = await gql(fromToken, APPROVE, { id: pf._id });
    if (firstApprove.approveForm.status !== "pending") {
      throw new Error(
        `first public approval should leave status pending, got ${firstApprove.approveForm.status}`
      );
    }
    const stillHere = await db.collection("mushers").findOne({ _id: dummy2.insertedId });
    if (stillHere.club.toString() !== fromClub._id.toString()) {
      throw new Error("public change form moved musher after only one club approved");
    }
    console.log("  PASS one-club approve does not move musher");

    const second = await gql(toToken, APPROVE, { id: pf._id });
    if (second.approveForm.status !== "approved") {
      throw new Error("second public approval should complete transfer");
    }
    const moved2 = await db.collection("mushers").findOne({ _id: dummy2.insertedId });
    if (moved2.club.toString() !== toClub._id.toString()) {
      throw new Error("public change form did not move musher after both approvals");
    }
    if (moved2.registrationNo !== "DUMMY/002") {
      throw new Error("public change form changed registration number");
    }
    console.log("  PASS public change form moves only after both clubs approve");

    await db.collection("mushers").deleteOne({ _id: dummy2.insertedId });
    await db.collection("forms").deleteOne({
      _id: new mongoose.Types.ObjectId(pf._id),
    });

    console.log("\nAll dummy transfer checks passed.");
  } finally {
    await db.collection("mushers").deleteMany({
      $or: [
        { name: DUMMY_NAME },
        { name: DUMMY_NAME + " TWO" },
        { registrationNo: DUMMY_REG },
        { registrationNo: "DUMMY/002" },
      ],
    });
    const forms = await db.collection("forms").find({
      $or: [
        { applicantName: DUMMY_NAME },
        { applicantName: DUMMY_NAME + " TWO" },
        { nzfssRegistrationNumber: DUMMY_REG },
        { nzfssRegistrationNumber: "DUMMY/002" },
      ],
    }).toArray();
    const formIds = forms.map((f) => f._id.toString());
    await db.collection("forms").deleteMany({
      _id: { $in: forms.map((f) => f._id) },
    });
    if (formIds.length) {
      await db.collection("notifications").deleteMany({
        eventId: { $in: formIds },
      });
    }
    console.log("Cleaned up dummy musher(s), forms, and notifications.");
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error("FAILED:", err.message);
  if (err.graphql) console.error(JSON.stringify(err.graphql, null, 2));
  process.exit(1);
});
