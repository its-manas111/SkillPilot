import { Question } from './types';

// Sample Database Schemas used across questions
export const SCHEMAS = {
  hr: {
    dbName: 'HR & Employees',
    tables: [
      {
        tableName: 'employees',
        columns: [
          { name: 'id', type: 'INTEGER', isPrimary: true },
          { name: 'name', type: 'TEXT' },
          { name: 'department_id', type: 'INTEGER', isForeign: true, references: 'departments.id' },
          { name: 'salary', type: 'INTEGER' },
          { name: 'hire_date', type: 'TEXT' }
        ],
        sampleRows: [
          { id: 101, name: 'Alice Chen', department_id: 1, salary: 110000, hire_date: '2021-03-15' },
          { id: 102, name: 'Bob Smith', department_id: 1, salary: 95000, hire_date: '2022-06-01' },
          { id: 103, name: 'Charlie Kim', department_id: 2, salary: 125000, hire_date: '2019-11-10' },
          { id: 104, name: 'Diana Prince', department_id: 3, salary: 85000, hire_date: '2023-01-20' },
          { id: 105, name: 'Evan Wright', department_id: 2, salary: 105000, hire_date: '2020-08-14' },
          { id: 106, name: 'Fiona Gallagher', department_id: null, salary: 70000, hire_date: '2024-02-01' }
        ]
      },
      {
        tableName: 'departments',
        columns: [
          { name: 'id', type: 'INTEGER', isPrimary: true },
          { name: 'name', type: 'TEXT' },
          { name: 'location', type: 'TEXT' }
        ],
        sampleRows: [
          { id: 1, name: 'Engineering', location: 'San Francisco' },
          { id: 2, name: 'Data Science', location: 'New York' },
          { id: 3, name: 'Marketing', location: 'Chicago' },
          { id: 4, name: 'Sales', location: 'Austin' }
        ]
      }
    ]
  },
  sales: {
    dbName: 'E-Commerce Sales',
    tables: [
      {
        tableName: 'orders',
        columns: [
          { name: 'order_id', type: 'INTEGER', isPrimary: true },
          { name: 'customer_id', type: 'INTEGER' },
          { name: 'order_date', type: 'TEXT' },
          { name: 'total_amount', type: 'REAL' }
        ],
        sampleRows: [
          { order_id: 5001, customer_id: 201, order_date: '2024-01-10', total_amount: 250.00 },
          { order_id: 5002, customer_id: 202, order_date: '2024-01-12', total_amount: 1200.00 },
          { order_id: 5003, customer_id: 201, order_date: '2024-01-15', total_amount: 450.00 },
          { order_id: 5004, customer_id: 203, order_date: '2024-01-18', total_amount: 80.00 },
          { order_id: 5005, customer_id: 202, order_date: '2024-01-20', total_amount: 310.00 }
        ]
      },
      {
        tableName: 'customers',
        columns: [
          { name: 'customer_id', type: 'INTEGER', isPrimary: true },
          { name: 'customer_name', type: 'TEXT' },
          { name: 'country', type: 'TEXT' }
        ],
        sampleRows: [
          { customer_id: 201, customer_name: 'TechCorp', country: 'USA' },
          { customer_id: 202, customer_name: 'Alpha Ltd', country: 'Canada' },
          { customer_id: 203, customer_name: 'Beta Inc', country: 'USA' },
          { customer_id: 204, customer_name: 'Gamma LLC', country: 'UK' }
        ]
      }
    ]
  }
};

export const QUESTION_BANK: Question[] = [
  // --- SELECT & WHERE ---
  {
    questionId: 'q_sel_rec_1',
    conceptId: 'select_where',
    skillType: 'recognition',
    questionType: 'mcq',
    difficulty: 1,
    prompt: 'Which SQL keyword is used to specify conditional filtering rules on individual rows?',
    schemaContext: SCHEMAS.hr,
    expectedAnswer: 'opt_where',
    options: [
      { id: 'opt_select', text: 'SELECT', isCorrect: false },
      { id: 'opt_where', text: 'WHERE', isCorrect: true },
      { id: 'opt_group', text: 'GROUP BY', isCorrect: false },
      { id: 'opt_having', text: 'HAVING', isCorrect: false }
    ],
    hints: ['Think of the clause that acts as a filter right after FROM.'],
    explanation: 'The WHERE clause filters individual records before any grouping or aggregation takes place.',
    tags: ['basics', 'where'],
    expectedTimeSeconds: 30
  },
  {
    questionId: 'q_sel_diag_1',
    conceptId: 'select_where',
    skillType: 'diagnosis',
    questionType: 'spot_error',
    difficulty: 1,
    prompt: 'Identify the flaw in this query attempting to find employees earning more than $100,000:\n\nSELECT name, salary FROM employees WHERE salary = > 100000;',
    schemaContext: SCHEMAS.hr,
    starterCode: 'SELECT name, salary FROM employees WHERE salary = > 100000;',
    expectedAnswer: 'opt_op_order',
    options: [
      { id: 'opt_op_order', text: 'Invalid comparison operator "= >" (should be ">")', isCorrect: true, explanation: 'In SQL, relational operators cannot space out syntax or put equals before greater than.' },
      { id: 'opt_where_missing', text: 'The WHERE clause cannot be used with SELECT', isCorrect: false },
      { id: 'opt_quotes', text: '100000 needs single quotes', isCorrect: false }
    ],
    errorPatterns: ['wrong_comparison_operator', 'syntax_error'],
    hints: ['Check the order of symbols in the comparison operator.'],
    explanation: 'In SQL, ">=" is the correct operator for greater than or equal to, and ">" is for strictly greater than. "= >" is a syntax error.',
    tags: ['syntax', 'where'],
    expectedTimeSeconds: 45
  },
  {
    questionId: 'q_sel_imp_1',
    conceptId: 'select_where',
    skillType: 'implementation',
    questionType: 'write_query',
    difficulty: 1,
    prompt: 'Write a query to retrieve all columns for employees in department_id 1 with a salary strictly greater than 100000.',
    schemaContext: SCHEMAS.hr,
    starterCode: '-- Write your SQL query below\nSELECT * FROM employees WHERE ',
    expectedQueryResult: {
      columns: ['id', 'name', 'department_id', 'salary', 'hire_date'],
      values: [[101, 'Alice Chen', 1, 110000, '2021-03-15']]
    },
    acceptedPatterns: ['department_id\\s*=\\s*1', 'salary\\s*>\\s*100000'],
    hints: ['Combine conditions using AND.'],
    explanation: 'SELECT * FROM employees WHERE department_id = 1 AND salary > 100000;',
    tags: ['where', 'implementation'],
    expectedTimeSeconds: 90
  },

  // --- AGGREGATION & GROUP BY ---
  {
    questionId: 'q_agg_reas_1',
    conceptId: 'aggregation',
    skillType: 'reasoning',
    questionType: 'predict_output',
    difficulty: 1,
    prompt: 'Given the employees table (with 6 total rows, 1 having NULL department_id), what will COUNT(department_id) vs COUNT(*) return?',
    schemaContext: SCHEMAS.hr,
    expectedAnswer: 'opt_count_diff',
    options: [
      { id: 'opt_count_same', text: 'Both return 6', isCorrect: false },
      { id: 'opt_count_diff', text: 'COUNT(*) returns 6, COUNT(department_id) returns 5', isCorrect: true },
      { id: 'opt_count_zero', text: 'COUNT(department_id) returns 0', isCorrect: false }
    ],
    hints: ['Remember how COUNT(column_name) handles NULL values.'],
    explanation: 'COUNT(*) counts all rows including NULLs, while COUNT(column) ignores NULL entries.',
    tags: ['aggregation', 'nulls'],
    expectedTimeSeconds: 60
  },
  {
    questionId: 'q_grp_diag_1',
    conceptId: 'group_by',
    skillType: 'diagnosis',
    questionType: 'spot_error',
    difficulty: 2,
    prompt: 'Diagnose the issue in the following SQL query:\n\nSELECT department_id, name, AVG(salary)\nFROM employees\nGROUP BY department_id;',
    schemaContext: SCHEMAS.hr,
    starterCode: 'SELECT department_id, name, AVG(salary) FROM employees GROUP BY department_id;',
    expectedAnswer: 'opt_missing_col',
    options: [
      { id: 'opt_missing_col', text: '"name" is selected but not included in GROUP BY or aggregated', isCorrect: true },
      { id: 'opt_avg_invalid', text: 'AVG(salary) cannot be used with GROUP BY', isCorrect: false },
      { id: 'opt_dept_invalid', text: 'department_id must be in quotes', isCorrect: false }
    ],
    errorPatterns: ['missing_group_by', 'aggregation_misuse'],
    hints: ['Check every non-aggregated column in the SELECT list.'],
    explanation: 'Any column in SELECT that is not wrapped in an aggregate function MUST be present in the GROUP BY clause.',
    tags: ['group_by', 'diagnosis'],
    expectedTimeSeconds: 60
  },
  {
    questionId: 'q_grp_corr_1',
    conceptId: 'group_by',
    skillType: 'correction',
    questionType: 'query_correction',
    difficulty: 2,
    prompt: 'Fix the broken query below so it calculates the average salary for each department_id.',
    schemaContext: SCHEMAS.hr,
    starterCode: 'SELECT department_id, AVG(salary) FROM employees;', // Missing GROUP BY
    expectedQueryResult: {
      columns: ['department_id', 'AVG(salary)'],
      values: [
        [1, 102500],
        [2, 115000],
        [3, 85000]
      ]
    },
    acceptedPatterns: ['GROUP\\s+BY\\s+department_id'],
    errorPatterns: ['missing_group_by'],
    hints: ['Add a GROUP BY clause for department_id at the end.'],
    explanation: 'Add GROUP BY department_id so the AVG(salary) aggregate is computed per department.',
    tags: ['group_by', 'correction'],
    expectedTimeSeconds: 90
  },

  // --- HAVING ---
  {
    questionId: 'q_hav_rec_1',
    conceptId: 'having',
    skillType: 'recognition',
    questionType: 'mcq',
    difficulty: 2,
    prompt: 'Why would you use HAVING instead of WHERE in a SQL query?',
    schemaContext: SCHEMAS.hr,
    expectedAnswer: 'opt_hav_agg',
    options: [
      { id: 'opt_hav_speed', text: 'HAVING is faster than WHERE', isCorrect: false },
      { id: 'opt_hav_agg', text: 'HAVING allows filtering based on aggregated values (e.g. AVG, COUNT)', isCorrect: true },
      { id: 'opt_hav_join', text: 'HAVING is required for INNER JOINs', isCorrect: false }
    ],
    hints: ['WHERE filters individual rows before grouping; HAVING filters aggregated groups.'],
    explanation: 'HAVING is evaluated after GROUP BY, enabling conditions on aggregate function outputs.',
    tags: ['having', 'recognition'],
    expectedTimeSeconds: 45
  },
  {
    questionId: 'q_hav_diag_1',
    conceptId: 'having',
    skillType: 'diagnosis',
    questionType: 'spot_error',
    difficulty: 2,
    prompt: 'Identify the error in this query attempting to find departments with an average salary over $100,000:\n\nSELECT department_id, AVG(salary)\nFROM employees\nWHERE AVG(salary) > 100000\nGROUP BY department_id;',
    schemaContext: SCHEMAS.hr,
    starterCode: 'SELECT department_id, AVG(salary) FROM employees WHERE AVG(salary) > 100000 GROUP BY department_id;',
    expectedAnswer: 'opt_where_agg',
    options: [
      { id: 'opt_where_agg', text: 'Aggregate function AVG(salary) cannot be placed in the WHERE clause', isCorrect: true },
      { id: 'opt_group_first', text: 'FROM should come after WHERE', isCorrect: false },
      { id: 'opt_salary_type', text: 'AVG requires integer cast', isCorrect: false }
    ],
    errorPatterns: ['where_vs_having', 'aggregation_misuse'],
    hints: ['WHERE cannot filter aggregated metrics.'],
    explanation: 'Aggregate functions cannot appear in WHERE clauses. Use HAVING AVG(salary) > 100000 after GROUP BY.',
    tags: ['having', 'where_vs_having'],
    expectedTimeSeconds: 60
  },

  // --- INNER JOIN ---
  {
    questionId: 'q_ij_rec_1',
    conceptId: 'inner_join',
    skillType: 'recognition',
    questionType: 'mcq',
    difficulty: 1,
    prompt: 'Which records are returned by an INNER JOIN between Table A and Table B?',
    schemaContext: SCHEMAS.hr,
    expectedAnswer: 'opt_ij_match',
    options: [
      { id: 'opt_ij_all', text: 'All records from both tables', isCorrect: false },
      { id: 'opt_ij_match', text: 'Only records that have matching join key values in both tables', isCorrect: true },
      { id: 'opt_ij_left', text: 'All records from Table A regardless of Table B matches', isCorrect: false }
    ],
    hints: ['Think of the intersection in a Venn diagram.'],
    explanation: 'INNER JOIN returns only the overlapping set of rows matching the join predicate in both datasets.',
    tags: ['join', 'inner_join'],
    expectedTimeSeconds: 30
  },

  // --- LEFT JOIN ---
  {
    questionId: 'q_lj_reas_1',
    conceptId: 'left_join',
    skillType: 'reasoning',
    questionType: 'predict_output',
    difficulty: 2,
    prompt: 'In our HR dataset, Fiona Gallagher has department_id = NULL. What values will appear for Fiona when performing a LEFT JOIN from employees to departments?',
    schemaContext: SCHEMAS.hr,
    expectedAnswer: 'opt_lj_null',
    options: [
      { id: 'opt_lj_excluded', text: 'Fiona will be omitted from the results', isCorrect: false },
      { id: 'opt_lj_null', text: 'Fiona will be included, and department details will be NULL', isCorrect: true },
      { id: 'opt_lj_error', text: 'The query will throw a runtime error', isCorrect: false }
    ],
    hints: ['LEFT JOIN preserves all rows from the left table.'],
    explanation: 'A LEFT JOIN preserves every row from the left table (employees). Unmatched right-side columns populate as NULL.',
    tags: ['left_join', 'nulls'],
    expectedTimeSeconds: 45
  },

  // --- JOIN CONDITIONS & CORRECTION ---
  {
    questionId: 'q_jc_corr_1',
    conceptId: 'join_conditions',
    skillType: 'correction',
    questionType: 'query_correction',
    difficulty: 2,
    prompt: 'Fix the broken JOIN condition in the following query to correctly link employees to their department name:',
    schemaContext: SCHEMAS.hr,
    starterCode: 'SELECT e.name AS employee_name, d.name AS department_name\nFROM employees e\nINNER JOIN departments d\nON e.id = d.id;', // WRONG join condition (e.id = d.id instead of e.department_id = d.id)
    expectedQueryResult: {
      columns: ['employee_name', 'department_name'],
      values: [
        ['Alice Chen', 'Engineering'],
        ['Bob Smith', 'Engineering'],
        ['Charlie Kim', 'Data Science'],
        ['Diana Prince', 'Marketing'],
        ['Evan Wright', 'Data Science']
      ]
    },
    acceptedPatterns: ['e\\.department_id\\s*=\\s*d\\.id', 'd\\.id\\s*=\\s*e\\.department_id'],
    errorPatterns: ['incorrect_join_condition', 'wrong_join_type'],
    hints: ['Match the employee foreign key (department_id) with the department primary key (id).'],
    explanation: 'The join predicate was matching e.id (employee ID) to d.id (department ID). Change to e.department_id = d.id.',
    tags: ['join_conditions', 'correction'],
    expectedTimeSeconds: 90
  },

  // --- SUBQUERIES ---
  {
    questionId: 'q_sub_imp_1',
    conceptId: 'subqueries',
    skillType: 'implementation',
    questionType: 'write_query',
    difficulty: 2,
    prompt: 'Write a query to find all employees whose salary is above the company-wide average salary.',
    schemaContext: SCHEMAS.hr,
    starterCode: '-- Write your subquery below\nSELECT name, salary FROM employees WHERE salary > (',
    expectedQueryResult: {
      columns: ['name', 'salary'],
      values: [
        ['Alice Chen', 110000],
        ['Charlie Kim', 125000],
        ['Evan Wright', 105000]
      ]
    },
    acceptedPatterns: ['SELECT\\s+AVG\\(salary\\)\\s+FROM\\s+employees'],
    hints: ['Use a scalar subquery (SELECT AVG(salary) FROM employees) inside the WHERE clause.'],
    explanation: 'SELECT name, salary FROM employees WHERE salary > (SELECT AVG(salary) FROM employees);',
    tags: ['subqueries', 'implementation'],
    expectedTimeSeconds: 120
  },

  // --- CTEs ---
  {
    questionId: 'q_cte_diag_1',
    conceptId: 'ctes',
    skillType: 'diagnosis',
    questionType: 'spot_error',
    difficulty: 2,
    prompt: 'Identify the structural error in this CTE definition:\n\nWITH dept_avg AS\n  SELECT department_id, AVG(salary) as avg_sal FROM employees GROUP BY department_id\nSELECT * FROM dept_avg;',
    schemaContext: SCHEMAS.hr,
    starterCode: 'WITH dept_avg AS\n  SELECT department_id, AVG(salary) as avg_sal FROM employees GROUP BY department_id\nSELECT * FROM dept_avg;',
    expectedAnswer: 'opt_cte_parens',
    options: [
      { id: 'opt_cte_parens', text: 'The CTE subquery must be enclosed in parentheses after AS', isCorrect: true },
      { id: 'opt_cte_with', text: 'WITH clause cannot be used with SELECT', isCorrect: false },
      { id: 'opt_cte_avg', text: 'Cannot alias AVG(salary) inside a CTE', isCorrect: false }
    ],
    errorPatterns: ['cte_structure_error', 'syntax_error'],
    hints: ['Look at the syntax following AS in WITH cte_name AS ...'],
    explanation: 'A CTE query expression following "AS" must always be wrapped in parentheses: WITH dept_avg AS (...)',
    tags: ['cte', 'syntax'],
    expectedTimeSeconds: 60
  },

  // --- WINDOW FUNCTIONS ---
  {
    questionId: 'q_wf_rec_1',
    conceptId: 'window_functions',
    skillType: 'recognition',
    questionType: 'mcq',
    difficulty: 3,
    prompt: 'What sets a Window Function apart from a standard GROUP BY aggregate function?',
    schemaContext: SCHEMAS.hr,
    expectedAnswer: 'opt_wf_rows',
    options: [
      { id: 'opt_wf_speed', text: 'Window functions only work on numeric strings', isCorrect: false },
      { id: 'opt_wf_rows', text: 'Window functions calculate values across a set of rows while retaining individual row identities', isCorrect: true },
      { id: 'opt_wf_where', text: 'Window functions replace the WHERE clause', isCorrect: false }
    ],
    hints: ['Unlike GROUP BY, window functions do not collapse rows into a single summary output row.'],
    explanation: 'Window functions perform calculations across related table rows without collapsing the underlying query result set.',
    tags: ['window_functions', 'recognition'],
    expectedTimeSeconds: 45
  },
  {
    questionId: 'q_wf_imp_1',
    conceptId: 'window_functions',
    skillType: 'implementation',
    questionType: 'write_query',
    difficulty: 3,
    prompt: 'Assign a row number to each employee ordered by salary from highest to lowest using ROW_NUMBER() OVER (...). Select name, salary, and row_num.',
    schemaContext: SCHEMAS.hr,
    starterCode: 'SELECT name, salary,\n  ROW_NUMBER() OVER (ORDER BY salary DESC) as row_num\nFROM employees;',
    expectedQueryResult: {
      columns: ['name', 'salary', 'row_num'],
      values: [
        ['Charlie Kim', 125000, 1],
        ['Alice Chen', 110000, 2],
        ['Evan Wright', 105000, 3],
        ['Bob Smith', 95000, 4],
        ['Diana Prince', 85000, 5],
        ['Fiona Gallagher', 70000, 6]
      ]
    },
    acceptedPatterns: ['ROW_NUMBER\\(\\)\\s+OVER\\s*\\(\\s*ORDER\\s+BY\\s+salary\\s+DESC\\s*\\)'],
    hints: ['Use ROW_NUMBER() OVER (ORDER BY salary DESC).'],
    explanation: 'ROW_NUMBER() OVER (ORDER BY salary DESC) generates consecutive numbers 1 to N based on descending salary ranking.',
    tags: ['window_functions', 'row_number', 'implementation'],
    expectedTimeSeconds: 120
  },

  // --- PARTITION BY & RANK ---
  {
    questionId: 'q_part_imp_1',
    conceptId: 'partition_by',
    skillType: 'implementation',
    questionType: 'write_query',
    difficulty: 3,
    prompt: 'Write a query using ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC) to rank employees within each department.',
    schemaContext: SCHEMAS.hr,
    starterCode: 'SELECT name, department_id, salary,\n  ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC) as dept_rank\nFROM employees\nWHERE department_id IS NOT NULL;',
    expectedQueryResult: {
      columns: ['name', 'department_id', 'salary', 'dept_rank'],
      values: [
        ['Alice Chen', 1, 110000, 1],
        ['Bob Smith', 1, 95000, 2],
        ['Charlie Kim', 2, 125000, 1],
        ['Evan Wright', 2, 105000, 2],
        ['Diana Prince', 3, 85000, 1]
      ]
    },
    acceptedPatterns: ['PARTITION\\s+BY\\s+department_id', 'ORDER\\s+BY\\s+salary\\s+DESC'],
    hints: ['Include PARTITION BY department_id inside the OVER clause.'],
    explanation: 'PARTITION BY resets the row count sequence for every distinct department_id partition.',
    tags: ['partition_by', 'window_functions', 'implementation'],
    expectedTimeSeconds: 150
  }
];

export class QuestionBankManager {
  private questions: Question[];

  constructor(questions: Question[] = QUESTION_BANK) {
    this.questions = questions;
  }

  public getQuestion(questionId: string): Question | undefined {
    return this.questions.find(q => q.questionId === questionId);
  }

  public getQuestionsByConcept(conceptId: string): Question[] {
    return this.questions.filter(q => q.conceptId === conceptId);
  }

  public getQuestionsBySkill(skillType: string): Question[] {
    return this.questions.filter(q => q.skillType === skillType);
  }

  public getFilteredQuestions(filter: {
    conceptId?: string;
    skillType?: string;
    difficulty?: number;
    excludeIds?: string[];
  }): Question[] {
    return this.questions.filter(q => {
      if (filter.conceptId && q.conceptId !== filter.conceptId) return false;
      if (filter.skillType && q.skillType !== filter.skillType) return false;
      if (filter.difficulty && q.difficulty !== filter.difficulty) return false;
      if (filter.excludeIds && filter.excludeIds.includes(q.questionId)) return false;
      return true;
    });
  }

  public getAllQuestions(): Question[] {
    return this.questions;
  }
}

export const questionBank = new QuestionBankManager();
