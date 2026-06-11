const { query } = require('../../infrastructure/database/connection');

function logAction(adminId, adminEmail, action, entity, entityId = null, details = null, ipAddress = null) {
    query(
        `INSERT INTO AuditLog (admin_id, admin_email, action, entity, entity_id, details, ip_address)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [adminId, adminEmail, action, entity, entityId, details ? JSON.stringify(details) : null, ipAddress]
    ).catch(err => console.error('[AuditLog] Write failed:', err.message));
}

module.exports = { logAction };
