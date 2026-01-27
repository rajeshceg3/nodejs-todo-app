const { getDb } = require('../config/db');
const { verifyIntegrity } = require('../models/audit.model');
const logger = require('../config/logger');

const getAuditLogs = async (req, res) => {
  try {
    const db = getDb();
    const logs = await db.collection('audit_log').find({}).sort({ timestamp: -1 }).toArray();
    res.status(200).send({ logs });
  } catch (err) {
    logger.error(`Error fetching audit logs: ${err.message}`);
    res.status(500).send({ error: 'Failed to fetch audit logs' });
  }
};

const verifyAuditLogs = async (req, res) => {
  try {
    const result = await verifyIntegrity();
    res.status(200).send({
      status: result.isValid ? 'INTEGRITY_VERIFIED' : 'INTEGRITY_COMPROMISED',
      count: result.count,
      brokenIndices: result.brokenIndices
    });
  } catch (err) {
    logger.error(`Error verifying audit logs: ${err.message}`);
    res.status(500).send({ error: 'Failed to verify logs' });
  }
};

module.exports = { getAuditLogs, verifyAuditLogs };
