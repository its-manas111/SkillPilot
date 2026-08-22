import { describe, it, expect } from 'vitest';
import { sqlEngine } from '../sql/sqlEngine';

describe('SqlEngine edge cases', () => {
  it('allows SELECT with leading line comment', async () => {
    const query = `-- this is a comment\nSELECT name FROM employees WHERE id = 101;`;
    const res = await sqlEngine.executeQuery(query);
    expect(res.error).toBeUndefined();
    expect(res.columns).toContain('name');
    expect(res.values.length).toBeGreaterThan(0);
  });

  it('allows SELECT with leading semicolons and whitespace', async () => {
    const query = `   ; ;\n\nSELECT id FROM departments;`;
    const res = await sqlEngine.executeQuery(query);
    expect(res.error).toBeUndefined();
    expect(res.columns).toContain('id');
  });

  it('rejects destructive statements like DELETE', async () => {
    const query = `DELETE FROM employees WHERE id = 101;`;
    const res = await sqlEngine.executeQuery(query);
    expect(res.error).toBeTruthy();
    expect(res.error).toMatch(/Destructive DDL|prohibited/i);
  });

  it('rejects non-SELECT/ WITH statements such as PRAGMA', async () => {
    const query = `PRAGMA user_version;`;
    const res = await sqlEngine.executeQuery(query);
    expect(res.error).toBeTruthy();
    expect(res.error).toMatch(/Only SELECT and WITH/i);
  });

  it('reports error for queries referencing non-existent tables', async () => {
    const query = `SELECT * FROM non_existent_table;`;
    const res = await sqlEngine.executeQuery(query);
    expect(res.error).toBeTruthy();
    expect(String(res.error).toLowerCase()).toMatch(/no such table|no such/i);
  });
});
