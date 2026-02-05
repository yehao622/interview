const crypto = require('crypto');
const database = require('../config/database');

class CacheHelper {
    // Generate hash for cache key
    static generateHash(data) {
        return crypto
            .createHash('sha256')
            .update(JSON.stringify(data))
            .digest('hex');
    }

    // Get cached LLM response
    static async getCachedResponse(requestType, payload) {
        const hash = this.generateHash({ requestType, payload });

        const sql = `
      SELECT response_data, model_name, tokens_used 
      FROM llm_cache 
      WHERE request_hash = ? 
        AND request_type = ?
        AND expires_at > datetime('now')
    `;

        try {
            const row = await database.get(sql, [hash, requestType]);

            if (row) {
                console.log(`Cache HIT for ${requestType}`);
                return JSON.parse(row.response_data);
            }

            console.log(`Cache MISS for ${requestType}`);
            return null;
        } catch (err) {
            console.error('Error getting cached response:', err.message);
            return null;
        }
    }

    // Save LLM response to cache
    static async saveCachedResponse(requestType, payload, response, metadata = {}) {
        const hash = this.generateHash({ requestType, payload });

        // Cache expires in 24 hours
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        const sql = `
      INSERT OR REPLACE INTO llm_cache 
      (request_hash, request_type, request_payload, response_data, model_name, tokens_used, response_time_ms, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

        try {
            await database.run(sql, [
                hash,
                requestType,
                JSON.stringify(payload),
                JSON.stringify(response),
                metadata.modelName || 'gemini-2.5-flash',
                metadata.tokensUsed || null,
                metadata.responseTimeMs || null,
                expiresAt.toISOString()
            ]);

            console.log(`Cached ${requestType} response`);
        } catch (err) {
            console.error('Error saving cached response:', err.message);
            // Don't throw - caching failure shouldn't break the API
        }
    }

    // Clear all cache
    static async clearCache() {
        const sql = `DELETE FROM llm_cache`;
        try {
            const result = await database.run(sql);
            console.log(`Cleared ${result.changes} cache entries`);
            return result.changes;
        } catch (err) {
            console.error('Error clearing cache:', err.message);
            throw err;
        }
    }
}

module.exports = CacheHelper;
