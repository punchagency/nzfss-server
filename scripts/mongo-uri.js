/**
 * Resolves a working MongoDB URI from env (SRV with custom DNS, or standard fallback).
 */
const dns = require('dns');
const { config } = require('dotenv');
const path = require('path');

config({ path: path.resolve(__dirname, '../.env') });

const SRV_URI = process.env.MONGODB_URI || process.env.MONGODB_STRING;
const STANDARD_URI = process.env.MONGODB_STANDARD_URI;

/** Shard hosts for cluster0.galsiwf.mongodb.net (Atlas) */
const ATLAS_STANDARD_URI =
  process.env.MONGODB_STANDARD_URI ||
  (SRV_URI && SRV_URI.includes('cluster0.galsiwf.mongodb.net')
    ? SRV_URI.replace(
        'mongodb+srv://',
        'mongodb://'
      ).replace(
        '@cluster0.galsiwf.mongodb.net/',
        '@ac-hbwlejs-shard-00-00.galsiwf.mongodb.net:27017,ac-hbwlejs-shard-00-01.galsiwf.mongodb.net:27017,ac-hbwlejs-shard-00-02.galsiwf.mongodb.net:27017/'
      ).replace('mongodb://', 'mongodb://') +
      (SRV_URI.includes('?') ? '' : '')
    : null);

function applyDnsServers() {
  const servers = process.env.MONGODB_DNS_SERVERS;
  if (servers) {
    dns.setServers(servers.split(',').map((s) => s.trim()));
  }
}

function getMongoUri() {
  if (STANDARD_URI) return STANDARD_URI;
  if (!SRV_URI) {
    throw new Error('Set MONGODB_STRING or MONGODB_URI in .env');
  }
  if (!SRV_URI.startsWith('mongodb+srv://')) {
    return SRV_URI;
  }
  applyDnsServers();
  return SRV_URI;
}

/** Prefer standard URI when SRV DNS fails on this machine */
function getMongoUriWithFallback() {
  if (STANDARD_URI) return STANDARD_URI;
  if (SRV_URI && !SRV_URI.startsWith('mongodb+srv://')) return SRV_URI;

  if (SRV_URI && SRV_URI.includes('cluster0.galsiwf.mongodb.net')) {
    const credsMatch = SRV_URI.match(/mongodb\+srv:\/\/([^@]+)@/);
    const dbMatch = SRV_URI.match(/\.net\/([^?]+)/);
    if (credsMatch && dbMatch) {
      const creds = credsMatch[1];
      const db = dbMatch[1];
      const qs = SRV_URI.includes('?') ? SRV_URI.split('?')[1] : 'retryWrites=true&w=majority';
      return `mongodb://${creds}@ac-hbwlejs-shard-00-00.galsiwf.mongodb.net:27017,ac-hbwlejs-shard-00-01.galsiwf.mongodb.net:27017,ac-hbwlejs-shard-00-02.galsiwf.mongodb.net:27017/${db}?ssl=true&authSource=admin&${qs}`;
    }
  }

  applyDnsServers();
  return SRV_URI;
}

module.exports = { getMongoUri, getMongoUriWithFallback, applyDnsServers };
