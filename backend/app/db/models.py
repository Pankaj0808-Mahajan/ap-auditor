"""
Database schema models and table definitions for AP Auditor.
Defines 'invoices' and 'audit_log' tables using raw SQLite DDL.
"""

import sqlite3


CREATE_INVOICES_TABLE = """
CREATE TABLE IF NOT EXISTS invoices (
    invoice_id TEXT PRIMARY KEY,
    vendor_name TEXT,
    amount REAL,
    category TEXT,
    status TEXT NOT NULL,
    confidence_score REAL,
    triggered_checks TEXT,
    reason_text TEXT,
    matched_reference TEXT,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"""

CREATE_AUDIT_LOG_TABLE = """
CREATE TABLE IF NOT EXISTS audit_log (
    log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id TEXT NOT NULL,
    action TEXT NOT NULL,
    performed_by TEXT NOT NULL,
    reason TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"""

CREATE_INDEXES = """
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_vendor ON invoices(vendor_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_invoice_id ON audit_log(invoice_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp);
"""


def create_tables(conn: sqlite3.Connection) -> None:
    """
    Executes table creation DDL on the provided SQLite connection.
    """
    with conn:
        conn.execute(CREATE_INVOICES_TABLE)
        conn.execute(CREATE_AUDIT_LOG_TABLE)
        conn.executescript(CREATE_INDEXES)
