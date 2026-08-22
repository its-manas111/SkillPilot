const initSqlJs = require('sql.js');

(async () => {
  try {
    const SQL = await initSqlJs({ locateFile: file => `https://sql.js.org/dist/${file}` });
    const db = new SQL.Database();
    db.run(`CREATE TABLE test (id INTEGER, name TEXT);`);
    db.run(`INSERT INTO test VALUES (1, 'Alice'), (2, 'Bob');`);

    const res = db.exec('SELECT * FROM test;');
    console.log('Exec result:', JSON.stringify(res, null, 2));

    const empty = db.exec('SELECT * FROM non_existent_table;');
    console.log('Query non-existent table result:', JSON.stringify(empty, null, 2));
  } catch (err) {
    console.error('Error running sql.js test:', err);
  }
})();
