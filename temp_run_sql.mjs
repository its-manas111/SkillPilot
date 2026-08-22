import initSqlJs from 'sql.js';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

(async () => {
  try {
    const wasmPath = resolve(__dirname, 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');
    const SQL = await initSqlJs({ locateFile: () => wasmPath });
    const db = new SQL.Database();
    db.run(`CREATE TABLE test (id INTEGER, name TEXT);`);
    db.run(`INSERT INTO test VALUES (1, 'Alice'), (2, 'Bob');`);

    const res = db.exec('SELECT * FROM test;');
    console.log('Exec result:', JSON.stringify(res, null, 2));

    try {
      const empty = db.exec('SELECT * FROM non_existent_table;');
      console.log('Query non-existent table result:', JSON.stringify(empty, null, 2));
    } catch (e) {
      console.error('Expected error for non-existent table:', e.message);
    }
  } catch (err) {
    console.error('Error running sql.js test:', err);
  }
})();
