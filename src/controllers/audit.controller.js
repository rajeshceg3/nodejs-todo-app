const { getDb } = require('../config/db');
const { verifyIntegrity } = require('../models/audit.model');

const getAuditLogs = async (req, res) => {
    try {
        const db = getDb();
        const logs = await db.collection('audit_log').find({}).sort({ timestamp: -1 }).toArray();
        res.status(200).send({ logs });
    } catch (err) {
        console.error('Error fetching audit logs:', err);
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
        console.error('Error verifying audit logs:', err);
        res.status(500).send({ error: 'Failed to verify logs' });
    }
};

module.exports = { getAuditLogs, verifyAuditLogs };
