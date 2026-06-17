const { getDogMergeKey, extractPetName } = require("../dist/utils/dog-points-aggregation");

const cases = [
  { label: "RCR Akela (historical)", name: "Akela of Kumiak", reg: "RR/098" },
  { label: "Registry short name", name: "AKELA", reg: "RR/098" },
  { label: "Live race entry", name: "AKELA", reg: "RR/098/AKELA", dogId: "870aef1d-c278-4719-bc29-0e5ca3536fce" },
  { label: "RCR Amos (historical)", name: "Natomah Skoahls Amos", reg: "RR/098" },
  { label: "Registry AMOS", name: "AMOS", reg: "RR/098/AMOS" },
  { label: "Live AMOS", name: "AMOS", reg: "RR/098/AMOS", dogId: "c40e2e6a-5731-4fda-9bbb-d7c4205a1d34" },
  { label: "FINN (works today)", name: "Nalbec's Finn", reg: "RR/098" },
  { label: "FINN live", name: "FINN", reg: "RR/098/FINN", dogId: "abc" },
];

for (const c of cases) {
  console.log(c.label);
  console.log(`  petName extracted: "${extractPetName(c.name, c.reg)}"`);
  console.log(`  merge key:         ${getDogMergeKey(c)}`);
  console.log("");
}
