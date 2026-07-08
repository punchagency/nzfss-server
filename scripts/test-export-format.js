/** Mirror of client buildTabDelimited for server-side export verification. */
function buildTabDelimited(headers, rows) {
  const sanitize = (value) => String(value ?? '').replace(/[\t\r\n]+/g, ' ').trim();
  const lines = [headers.map(sanitize).join('\t')];
  for (const row of rows) {
    lines.push(row.map(sanitize).join('\t'));
  }
  return lines.join('\r\n');
}

module.exports = { buildTabDelimited };
