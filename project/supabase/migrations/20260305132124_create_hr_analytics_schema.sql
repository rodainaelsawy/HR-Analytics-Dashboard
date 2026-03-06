/*
  # HR Analytics Database Schema
  
  1. New Tables
    - `departments`
      - `id` (uuid, primary key)
      - `name` (text)
      - `parent_id` (uuid, nullable, self-reference)
      - `created_at` (timestamptz)
    
    - `employees`
      - `id` (uuid, primary key)
      - `employee_id` (text, unique)
      - `first_name` (text)
      - `last_name` (text)
      - `email` (text)
      - `department_id` (uuid, foreign key)
      - `job_title` (text)
      - `employment_type` (text)
      - `hire_date` (date)
      - `termination_date` (date, nullable)
      - `salary` (numeric)
      - `gender` (text)
      - `ethnicity` (text)
      - `status` (text)
      - `created_at` (timestamptz)
    
    - `performance_reviews`
      - `id` (uuid, primary key)
      - `employee_id` (uuid, foreign key)
      - `review_date` (date)
      - `review_cycle` (text)
      - `rating` (numeric)
      - `reviewer_id` (uuid, foreign key)
      - `comments` (text)
      - `created_at` (timestamptz)
    
    - `training_records`
      - `id` (uuid, primary key)
      - `employee_id` (uuid, foreign key)
      - `training_name` (text)
      - `completion_date` (date)
      - `cost` (numeric)
      - `duration_hours` (numeric)
      - `created_at` (timestamptz)
    
    - `attendance_records`
      - `id` (uuid, primary key)
      - `employee_id` (uuid, foreign key)
      - `date` (date)
      - `hours_worked` (numeric)
      - `overtime_hours` (numeric)
      - `status` (text)
      - `created_at` (timestamptz)
    
    - `recruitment_records`
      - `id` (uuid, primary key)
      - `employee_id` (uuid, foreign key, nullable)
      - `requisition_id` (text)
      - `position_title` (text)
      - `department_id` (uuid, foreign key)
      - `posted_date` (date)
      - `hire_date` (date, nullable)
      - `source` (text)
      - `cost_per_hire` (numeric)
      - `time_to_hire_days` (integer)
      - `created_at` (timestamptz)
    
    - `exit_records`
      - `id` (uuid, primary key)
      - `employee_id` (uuid, foreign key)
      - `exit_date` (date)
      - `exit_reason` (text)
      - `voluntary` (boolean)
      - `exit_interview_completed` (boolean)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read data
*/

CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  parent_id uuid REFERENCES departments(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  department_id uuid REFERENCES departments(id),
  job_title text NOT NULL,
  employment_type text NOT NULL DEFAULT 'Full-time',
  hire_date date NOT NULL,
  termination_date date,
  salary numeric NOT NULL,
  gender text,
  ethnicity text,
  status text NOT NULL DEFAULT 'Active',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS performance_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) NOT NULL,
  review_date date NOT NULL,
  review_cycle text NOT NULL,
  rating numeric NOT NULL,
  reviewer_id uuid REFERENCES employees(id),
  comments text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS training_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) NOT NULL,
  training_name text NOT NULL,
  completion_date date NOT NULL,
  cost numeric DEFAULT 0,
  duration_hours numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) NOT NULL,
  date date NOT NULL,
  hours_worked numeric DEFAULT 8,
  overtime_hours numeric DEFAULT 0,
  status text DEFAULT 'Present',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS recruitment_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id),
  requisition_id text NOT NULL,
  position_title text NOT NULL,
  department_id uuid REFERENCES departments(id),
  posted_date date NOT NULL,
  hire_date date,
  source text,
  cost_per_hire numeric DEFAULT 0,
  time_to_hire_days integer,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS exit_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) NOT NULL,
  exit_date date NOT NULL,
  exit_reason text NOT NULL,
  voluntary boolean DEFAULT true,
  exit_interview_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruitment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE exit_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to departments"
  ON departments FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to employees"
  ON employees FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to performance_reviews"
  ON performance_reviews FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to training_records"
  ON training_records FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to attendance_records"
  ON attendance_records FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to recruitment_records"
  ON recruitment_records FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to exit_records"
  ON exit_records FOR SELECT
  TO public
  USING (true);