import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'smart_choose.db');

let dbInstance = null;

function getDbInstance() {
  if (!dbInstance) {
    dbInstance = new sqlite3.Database(dbPath);
    // Ensure table definitions and columns exist
    dbInstance.serialize(() => {
      dbInstance.run(`
        CREATE TABLE IF NOT EXISTS historis_snbp (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          kode_prodi TEXT NOT NULL,
          tahun INTEGER NOT NULL,
          peminat INTEGER NOT NULL,
          daya_tampung INTEGER NOT NULL,
          terima INTEGER,
          keketatan_persen REAL NOT NULL,
          FOREIGN KEY (kode_prodi) REFERENCES prodi(kode_prodi)
        )
      `);
    });
  }
  return dbInstance;
}

export function query(sql, params = []) {
  const db = getDbInstance();
  return new Promise((resolve, reject) => {
    const isSelect = sql.trim().toLowerCase().startsWith('select');
    if (isSelect) {
      db.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    } else {
      db.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve({ lastInsertRowid: this.lastID, changes: this.changes });
      });
    }
  });
}
