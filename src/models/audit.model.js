const { getDb } = require('../config/db');
const crypto = require('node:crypto');

const GENESIS_HASH = 'GENESIS_HASH_0000000000000000000000000000';

// Helper for async hashing using Web Crypto API
async function calculateHash(data) {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  // Access webcrypto from the crypto module safely
  const subtle = crypto.webcrypto ? crypto.webcrypto.subtle : crypto.subtle;
  if (!subtle) {
      throw new Error('WebCrypto Subtle API not available in this environment');
  }
  const hashBuffer = await subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function createAuditLog(action, entityId, payload) {
  const db = getDb();
  const auditCollection = db.collection('audit_log');

  // Concurrency Warning: In production, use a queue or optimistic locking
  const lastLog = await auditCollection.find().sort({ timestamp: -1 }).limit(1).toArray();
  const previousHash = lastLog.length > 0 ? lastLog[0].hash : GENESIS_HASH;
  const timestamp = new Date();

  const payloadStr = JSON.stringify(payload);
  const dataToHash = timestamp.toISOString() + action + entityId + payloadStr + previousHash;

  const hash = await calculateHash(dataToHash);

  const newLog = {
    action,
    entityId,
    payload,
    timestamp,
    previousHash,
    hash
  };

  await auditCollection.insertOne(newLog);
}

async function verifyIntegrity() {
  const db = getDb();
  const logs = await db.collection('audit_log').find({}).sort({ timestamp: 1 }).toArray();

  let isValid = true;
  let previousHash = GENESIS_HASH;
  const brokenIndices = [];

  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];

    if (log.previousHash !== previousHash) {
      isValid = false;
      brokenIndices.push({ index: i, reason: 'Previous hash mismatch' });
    }

    const payloadStr = JSON.stringify(log.payload);
    const dataToHash = new Date(log.timestamp).toISOString() + log.action + log.entityId + payloadStr + previousHash;
    const calculatedHash = await calculateHash(dataToHash);

    if (calculatedHash !== log.hash) {
      isValid = false;
      brokenIndices.push({ index: i, reason: 'Hash mismatch' });
    }

    previousHash = log.hash;
  }

  return { isValid, brokenIndices, count: logs.length };
}

module.exports = { createAuditLog, verifyIntegrity };
