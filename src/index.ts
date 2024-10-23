import dotenv from 'dotenv';
import inquirer from 'inquirer';
import pg from 'pg';
import 'console.table';

dotenv.config();

const { Pool } = pg;

// Type definitions
type Department = { id: number, name: string };
type Role = { id: number, title: string, salary: number, department_id: number };
type Employee = { id: number | null , first_name: string, last_name: string, role_id: number, manager_id: number };

// Create a connection to the PostgreSQL database
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: 'localhost',
  database: process.env.DB_NAME,
  port: 5432,
});

// Function to start the application
async function startApp() {
  const answer = await inquirer.prompt({
    type: 'list',
    name: 'action',
    message: 'What would you like to do?',
    choices: [
      'View All Departments',
      'View All Roles',
      'View All Employees',
      'Add a Department',
      'Add a Role',
      'Add an Employee',
      'Update Employee Role',
      'Exit',
    ],
  });

  switch (answer.action) {
    case 'View All Departments':
      await viewAllDepartments();
      break;
    case 'View All Roles':
      await viewAllRoles();
      break;
    case 'View All Employees':
      await viewAllEmployees();
      break;
    case 'Add a Department':
      await addDepartment();
      break;
    case 'Add a Role':
      await addRole();
      break;
    case 'Add an Employee':
      await addEmployee();
      break;
    case 'Update Employee Role':
      await updateEmployeeRole();
      break;
    default:
      await pool.end();
      process.exit();
  }
  startApp();
}

// View all departments
async function viewAllDepartments() {
  const query = 'SELECT id AS department_id, name AS department_name FROM department';
  const result = await pool.query(query);
  console.table(result.rows);
}

// View all roles
async function viewAllRoles() {
  const query = `
    SELECT role.id AS role_id, role.title, department.name AS department, role.salary 
    FROM role
    LEFT JOIN department ON role.department_id = department.id
  `;
  const result = await pool.query(query);
  console.table(result.rows);
}

// View all employees
async function viewAllEmployees() {
  const query = `
    SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employee
    LEFT JOIN role ON employee.role_id = role.id
    LEFT JOIN department ON role.department_id = department.id
    LEFT JOIN employee manager ON manager.id = employee.manager_id
  `;
  const result = await pool.query(query);
  console.table(result.rows);
}

// Add a department
async function addDepartment() {
  const answer = await inquirer.prompt({
    type: 'input',
    name: 'department_name',
    message: 'Enter the name of the department:',
  });

  const query = 'INSERT INTO department (name) VALUES ($1) RETURNING *';
  await pool.query(query, [answer.department_name]);
  console.log('Department added successfully!');
}

// Add a role
async function addRole() {
  const departmentsResult = await pool.query('SELECT * FROM department');
  const departmentChoices = departmentsResult.rows.map(({ id, name }: Department) => ({
    name: name,
    value: id,
  }));

  const answer = await inquirer.prompt([
    {
      type: 'input',
      name: 'role_title',
      message: 'Enter the title of the role:',
    },
    {
      type: 'input',
      name: 'role_salary',
      message: 'Enter the salary of the role:',
    },
    {
      type: 'list',
      name: 'department_id',
      message: 'Select the department for the role:',
      choices: departmentChoices,
    },
  ]);

  const query = 'INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3) RETURNING *';
  await pool.query(query, [answer.role_title, answer.role_salary, answer.department_id]);
  console.log('Role added successfully!');
}

// Add an employee
async function addEmployee() {
  const rolesResult = await pool.query('SELECT * FROM role');
  const roleChoices = rolesResult.rows.map(({ id, title }: Role) => ({
    name: title,
    value: id,
  }));

  const employeesResult = await pool.query('SELECT * FROM employee');
  const managerChoices = employeesResult.rows.map(({ id, first_name, last_name }: Employee) => ({
    name: `${first_name} ${last_name}`,
    value: id,
  }));
  managerChoices.unshift({ name: 'None', value: null });

  const answer = await inquirer.prompt([
    {
      type: 'input',
      name: 'first_name',
      message: 'Enter the employee\'s first name:',
    },
    {
      type: 'input',
      name: 'last_name',
      message: 'Enter the employee\'s last name:',
    },
    {
      type: 'list',
      name: 'role_id',
      message: 'Select the employee\'s role:',
      choices: roleChoices,
    },
    {
      type: 'list',
      name: 'manager_id',
      message: 'Select the employee\'s manager:',
      choices: managerChoices,
    },
  ]);

  const query = 'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4) RETURNING *';
  await pool.query(query, [answer.first_name, answer.last_name, answer.role_id, answer.manager_id]);
  console.log('Employee added successfully!');
}

// Update employee role
async function updateEmployeeRole() {
  const employeesResult = await pool.query('SELECT * FROM employee');
  const employeeChoices = employeesResult.rows.map(({ id, first_name, last_name }: Employee) => ({
    name: `${first_name} ${last_name}`,
    value: id,
  }));

  const rolesResult = await pool.query('SELECT * FROM role');
  const roleChoices = rolesResult.rows.map(({ id, title }: Role) => ({
    name: title,
    value: id,
  }));

  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'employee_id',
      message: 'Select the employee to update:',
      choices: employeeChoices,
    },
    {
      type: 'list',
      name: 'role_id',
      message: 'Select the new role for the employee:',
      choices: roleChoices,
    },
  ]);

  const query = 'UPDATE employee SET role_id = $1 WHERE id = $2 RETURNING *';
  await pool.query(query, [answer.role_id, answer.employee_id]);
  console.log('Employee role updated successfully!');
}

// Start the app
startApp().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});