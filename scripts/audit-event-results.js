/**
 * Audit race results for an event: classes, duplicates, missing dog points.
 *
 * Usage:
 *   node scripts/audit-event-results.js "Trifecta"
 *   node scripts/audit-event-results.js "FENDER BENDER"
 */
const mongoose = require('mongoose');
const { config } = require('dotenv');
const path = require('path');

config({ path: path.resolve(__dirname, '../.env') });

const { getMongoUriWithFallback } = require('./mongo-uri');
const MONGODB_URI = getMongoUriWithFallback();

const eventNameFilter = process.argv[2] || 'Trifecta';

const calendarSchema = new mongoose.Schema({}, { strict: false, collection: 'eventcalendars' });
const entrantSchema = new mongoose.Schema({}, { strict: false, collection: 'entrants' });
const pointSchema = new mongoose.Schema({}, { strict: false, collection: 'points' });

const EventCalendar = mongoose.model('AuditEvent', calendarSchema);
const Entrant = mongoose.model('AuditEntrant', entrantSchema);
const Point = mongoose.model('AuditPoint', pointSchema);

function parseTimeToSeconds(timeStr) {
  if (!timeStr || !/^\d{2}:\d{2}:\d{2}/.test(timeStr)) return Number.MAX_VALUE;
  const [h, m, sPart] = timeStr.split(':');
  const s = parseFloat(sPart) || 0;
  return (parseInt(h, 10) || 0) * 3600 + (parseInt(m, 10) || 0) * 60 + s;
}

async function auditEvent(event) {
  const eventId = event._id.toString();
  console.log('\n' + '='.repeat(72));
  console.log(`Event: ${event.eventName}`);
  console.log(`ID: ${eventId}  |  Date: ${event.eventDate || 'n/a'}  |  Club: ${event.club || 'n/a'}`);

  const entrants = await Entrant.find({
    $or: [{ eventId }, { eventId: new mongoose.Types.ObjectId(eventId) }],
  }).lean();

  const points = await Point.find({
    entrantId: { $in: entrants.map((e) => e._id) },
  }).lean();

  const pointByEntrant = new Map(points.map((p) => [p.entrantId.toString(), p]));

  console.log(`\nEntrants (all): ${entrants.length}`);
  console.log(`Submitted points records: ${points.length}`);

  const classes = new Map();
  for (const e of entrants) {
    const key = `${e.class || ''} :: ${e.customClass || ''}`;
    if (!classes.has(key)) classes.set(key, []);
    classes.get(key).push(e);
  }

  console.log('\n--- Classes recorded in database ---');
  const rigClasses = [];
  for (const [key, list] of [...classes.entries()].sort()) {
    const label = key.replace(' :: ', ' - ').trim();
    console.log(`  ${label}: ${list.length} entrant(s)`);
    if (/rig/i.test(key)) rigClasses.push({ key, count: list.length, mushers: list.map((x) => x.name) });
  }

  if (rigClasses.length === 0) {
    console.log('\n⚠ No rig classes found for this event in entrants collection.');
  } else {
    console.log('\n--- Rig classes detail ---');
    for (const r of rigClasses) {
      console.log(`  ${r.key}: ${r.mushers.join(', ')}`);
    }
  }

  console.log('\n--- Duplicate mushers (same class, multiple entrant rows) ---');
  let dupCount = 0;
  for (const [, list] of classes) {
    const byName = new Map();
    for (const e of list) {
      const n = (e.name || '').trim().toLowerCase();
      if (!byName.has(n)) byName.set(n, []);
      byName.get(n).push(e);
    }
    for (const [name, rows] of byName) {
      if (rows.length > 1) {
        dupCount++;
        console.log(`  ${rows[0].class} / ${rows[0].customClass}: "${name}" x${rows.length}`);
        rows.forEach((r) => {
          const p = pointByEntrant.get(r._id.toString());
          console.log(
            `    - entrant ${r._id}  time=${r.raceTime || 'n/a'}  musherPts=${p?.points ?? 'no point row'}  dogPts=${p?.dogPoints?.length ?? 0}`
          );
        });
      }
    }
  }
  if (dupCount === 0) console.log('  (none)');

  console.log('\n--- Submitted results with empty dog points ---');
  let emptyDogPts = 0;
  for (const p of points) {
    if (!p.dogPoints || p.dogPoints.length === 0) {
      emptyDogPts++;
      const ent = entrants.find((e) => e._id.toString() === p.entrantId.toString());
      console.log(`  ${ent?.name || '?'} (${ent?.class} ${ent?.customClass}) entrantId=${p.entrantId}`);
    }
  }
  if (emptyDogPts === 0) console.log('  (none — all point rows have dogPoints)');

  console.log('\n--- Speed classes: time vs stored musher points (sanity) ---');
  for (const [key, list] of classes) {
    if (!/^speed/i.test(key)) continue;
    const withPoints = list
      .filter((e) => e.raceTime && pointByEntrant.has(e._id.toString()))
      .map((e) => ({
        name: e.name,
        time: e.raceTime,
        secs: parseTimeToSeconds(e.raceTime),
        pts: pointByEntrant.get(e._id.toString()).points,
      }))
      .sort((a, b) => a.secs - b.secs);

    if (withPoints.length < 2) continue;
    console.log(`\n  ${key.replace(' :: ', ' - ')}`);
    withPoints.forEach((row, i) => {
      console.log(`    rank-by-time ${i + 1}: ${row.name}  ${row.time}  (stored pts: ${row.pts})`);
    });
  }
}

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log(`Connected. Searching events matching: "${eventNameFilter}"`);

  const events = await EventCalendar.find({
    eventName: { $regex: eventNameFilter, $options: 'i' },
  }).lean();

  if (events.length === 0) {
    console.log('No events found.');
    await mongoose.disconnect();
    return;
  }

  for (const event of events) {
    await auditEvent(event);
  }

  await mongoose.disconnect();
  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
