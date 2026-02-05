const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Database file path
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/reconciliation.db');

// Ensure data directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

class Database {
    constructor() {
        this.db = null;
    }

    // Initialize database connection
    connect() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
                if (err) {
                    console.error('Error opening database:', err.message);
                    reject(err);
                } else {
                    console.log('Connected to SQLite database at:', DB_PATH);
                    // Enable foreign keys
                    this.db.run('PRAGMA foreign_keys = ON', (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                    resolve();
                }
            });
        });
    }

    // Initialize database schema
    async initialize() {
        await this.connect();
        await this.createTables();
        console.log('Database initialized successfully');
    }

    // Create all tables
    createTables() {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                // Table 1: Reconciliation History
                this.db.run(`
          CREATE TABLE IF NOT EXISTS reconciliation_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_age INTEGER,
            patient_conditions TEXT,
            patient_labs TEXT,
            sources_data TEXT NOT NULL,
            reconciled_medication TEXT NOT NULL,
            confidence_score REAL NOT NULL,
            reasoning TEXT NOT NULL,
            recommended_actions TEXT,
            clinical_safety_check TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
                    if (err) console.error('Error creating reconciliation_history:', err.message);
                });

                // Table 2: LLM Response Cache
                this.db.run(`
          CREATE TABLE IF NOT EXISTS llm_cache (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            request_hash TEXT UNIQUE NOT NULL,
            request_type TEXT NOT NULL,
            request_payload TEXT NOT NULL,
            response_data TEXT NOT NULL,
            model_name TEXT,
            tokens_used INTEGER,
            response_time_ms INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            expires_at DATETIME NOT NULL
          )
        `, (err) => {
                    if (err) console.error('Error creating llm_cache:', err.message);
                });

                // Table 3: API Request Logs
                this.db.run(`
          CREATE TABLE IF NOT EXISTS api_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            endpoint TEXT NOT NULL,
            method TEXT NOT NULL,
            request_body TEXT,
            response_status INTEGER,
            response_body TEXT,
            ip_address TEXT,
            user_agent TEXT,
            processing_time_ms INTEGER,
            error_message TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
                    if (err) console.error('Error creating api_logs:', err.message);
                });

                // Table 4: Data Quality Assessments
                this.db.run(`
          CREATE TABLE IF NOT EXISTS data_quality_assessments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_data TEXT NOT NULL,
            overall_score INTEGER NOT NULL,
            completeness_score INTEGER,
            accuracy_score INTEGER,
            timeliness_score INTEGER,
            plausibility_score INTEGER,
            issues_detected TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
                    if (err) console.error('Error creating data_quality_assessments:', err.message);
                });

                // Create indexes for better query performance
                this.db.run(`
          CREATE INDEX IF NOT EXISTS idx_llm_cache_hash 
          ON llm_cache(request_hash)
        `);

                this.db.run(`
          CREATE INDEX IF NOT EXISTS idx_llm_cache_expires 
          ON llm_cache(expires_at)
        `);

                this.db.run(`
          CREATE INDEX IF NOT EXISTS idx_api_logs_endpoint 
          ON api_logs(endpoint, created_at)
        `);

                this.db.run(`
          CREATE INDEX IF NOT EXISTS idx_reconciliation_created 
          ON reconciliation_history(created_at)
        `);

                resolve();
            });
        });
    }

    // Helper method to run queries with promises
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        });
    }

    // Helper method to get a single row
    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // Helper method to get all rows
    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Clean up expired cache entries
    async cleanExpiredCache() {
        const sql = `DELETE FROM llm_cache WHERE expires_at < datetime('now')`;
        try {
            const result = await this.run(sql);
            console.log(`Cleaned ${result.changes} expired cache entries`);
            return result.changes;
        } catch (err) {
            console.error('Error cleaning expired cache:', err.message);
            throw err;
        }
    }

    // Close database connection
    close() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        console.log('Database connection closed');
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }
}

// Singleton instance
const database = new Database();

module.exports = database;
