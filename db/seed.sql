-- Use the company_db database
\c company_db;

-- Insert departments
INSERT INTO department (name) VALUES
('Engineering'),
('Finance'),
('Human Resources'),
('Marketing'),
('Sales');

-- Insert roles
INSERT INTO role (title, salary, department_id) VALUES
('Software Engineer', 90000, 1),
('DevOps Engineer', 85000, 1),
('Accountant', 70000, 2),
('HR Specialist', 60000, 3),
('Marketing Manager', 75000, 4),
('Sales Executive', 65000, 5),
('Senior Software Engineer', 120000, 1);

-- Insert employees
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
('John', 'Doe', 1, NULL),     -- No manager
('Jane', 'Smith', 2, 1),      -- Reports to John Doe
('Michael', 'Brown', 3, NULL),-- No manager
('Susan', 'Davis', 4, NULL),  -- No manager
('Emily', 'White', 5, NULL),  -- No manager
('David', 'Green', 6, NULL),  -- No manager
('Sarah', 'Johnson', 7, 1);   -- Reports to John Doe
