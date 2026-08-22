import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import { SqlQueryResult } from '../evaluator/types';

const FORBIDDEN_OPERATIONS = [
  /\bDROP\b/i,
  /\bDELETE\b/i,
  /\bUPDATE\b/i,
  /\bINSERT\b/i,
  /\bALTER\b/i,
  /\bTRUNCATE\b/i,
  /\bCREATE\b/i,
  /\bREPLACE\b/i,
  /\bGRANT\b/i,
  /\bREVOKE\b/i,
];

export class SqlEngine {
  private db: Database | null = null;
  private isInitializing = false;
  private initPromise: Promise<Database> | null = null;

  public async getDatabase(): Promise<Database> {
    if (this.db) return this.db;

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      try {
        const SQL: SqlJsStatic = await initSqlJs({
          // Fetch WASM from unpkg CDN for zero build setup issues in browser
          locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
        });

        const db = new SQL.Database();
        this.populateSampleDatabase(db);
        this.db = db;
        return db;
      } catch (err) {
        console.error('Failed to initialize sql.js in WASM mode, falling back to mock evaluator engine', err);
        throw err;
      }
    })();

    return this.initPromise;
  }

  private populateSampleDatabase(db: Database): void {
    // 1. HR & Employees tables
    db.run(`
      CREATE TABLE departments (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        location TEXT NOT NULL
      );
    `);

    db.run(`
      INSERT INTO departments VALUES
      (1, 'Engineering', 'San Francisco'),
      (2, 'Data Science', 'New York'),
      (3, 'Marketing', 'Chicago'),
      (4, 'Sales', 'Austin');
    `);

    db.run(`
      CREATE TABLE employees (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        department_id INTEGER,
        salary INTEGER NOT NULL,
        hire_date TEXT NOT NULL,
        FOREIGN KEY (department_id) REFERENCES departments(id)
      );
    `);

    db.run(`
      INSERT INTO employees VALUES
      (101, 'Alice Chen', 1, 110000, '2021-03-15'),
      (102, 'Bob Smith', 1, 95000, '2022-06-01'),
      (103, 'Charlie Kim', 2, 125000, '2019-11-10'),
      (104, 'Diana Prince', 3, 85000, '2023-01-20'),
      (105, 'Evan Wright', 2, 105000, '2020-08-14'),
      (106, 'Fiona Gallagher', NULL, 70000, '2024-02-01');
    `);

    // 2. Sales & Customers tables
    db.run(`
      CREATE TABLE customers (
        customer_id INTEGER PRIMARY KEY,
        customer_name TEXT NOT NULL,
        country TEXT NOT NULL
      );
    `);

    db.run(`
      INSERT INTO customers VALUES
      (201, 'TechCorp', 'USA'),
      (202, 'Alpha Ltd', 'Canada'),
      (203, 'Beta Inc', 'USA'),
      (204, 'Gamma LLC', 'UK');
    `);

    db.run(`
      CREATE TABLE orders (
        order_id INTEGER PRIMARY KEY,
        customer_id INTEGER NOT NULL,
        order_date TEXT NOT NULL,
        total_amount REAL NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
      );
    `);

    db.run(`
      INSERT INTO orders VALUES
      (5001, 201, '2024-01-10', 250.00),
      (5002, 202, '2024-01-12', 1200.00),
      (5003, 201, '2024-01-15', 450.00),
      (5004, 203, '2024-01-18', 80.00),
      (5005, 202, '2024-01-20', 310.00);
    `);
  }

  /**
   * Safely execute read-only learner SQL query.
   */
  public async executeQuery(sql: string): Promise<SqlQueryResult> {
    const trimmed = sql.trim();

    if (!trimmed) {
      return { columns: [], values: [], error: 'Query is empty' };
    }

    // Safety Check: Block DDL/DML statements
    for (const pattern of FORBIDDEN_OPERATIONS) {
      if (pattern.test(trimmed)) {
        return {
          columns: [],
          values: [],
          error: 'Security Error: Destructive DDL/DML statements (DROP, DELETE, UPDATE, INSERT, ALTER) are prohibited.',
        };
      }
    }

    // Ensure query starts with SELECT or WITH
    if (!/^(SELECT|WITH)\b/i.test(trimmed)) {
      return {
        columns: [],
        values: [],
        error: 'Security Error: Only SELECT and WITH read queries are allowed.',
      };
    }

    const start = performance.now();

    try {
      const db = await this.getDatabase();
      const res = db.exec(trimmed);

      const end = performance.now();
      const executionTimeMs = parseFloat((end - start).toFixed(2));

      if (res.length === 0) {
        return {
          columns: [],
          values: [],
          executionTimeMs,
        };
      }

      const firstResult = res[0];
      // Row limit safety: cap at 100 rows max
      const cappedValues = firstResult.values.slice(0, 100);

      return {
        columns: firstResult.columns,
        values: cappedValues,
        executionTimeMs,
      };
    } catch (err: any) {
      return {
        columns: [],
        values: [],
        error: err.message || String(err),
      };
    }
  }
}

export const sqlEngine = new SqlEngine();
