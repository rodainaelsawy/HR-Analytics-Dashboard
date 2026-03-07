-- Temporarily disable RLS for seeding (run this first)
ALTER TABLE departments DISABLE ROW LEVEL SECURITY;
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE training_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE recruitment_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE exit_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE employee_locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE cohort_tracking DISABLE ROW LEVEL SECURITY;

-- Insert departments
INSERT INTO departments (id, name, parent_id) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Engineering', NULL),
  ('22222222-2222-2222-2222-222222222222', 'Sales', NULL),
  ('33333333-3333-3333-3333-333333333333', 'Marketing', NULL),
  ('44444444-4444-4444-4444-444444444444', 'Operations', NULL),
  ('55555555-5555-5555-5555-555555555555', 'Finance', NULL),
  ('66666666-6666-6666-6666-666666666666', 'HR', NULL)
ON CONFLICT (id) DO NOTHING;

-- Insert sample active employees (300 employees)
DO $$
DECLARE
  dept_ids uuid[] := ARRAY[
    '11111111-1111-1111-1111-111111111111'::uuid,
    '22222222-2222-2222-2222-222222222222'::uuid,
    '33333333-3333-3333-3333-333333333333'::uuid,
    '44444444-4444-4444-4444-444444444444'::uuid,
    '55555555-5555-5555-5555-555555555555'::uuid,
    '66666666-6666-6666-6666-666666666666'::uuid
  ];
  dept_names text[] := ARRAY['Engineering', 'Sales', 'Marketing', 'Operations', 'Finance', 'HR'];
  genders text[] := ARRAY['Male', 'Female', 'Non-binary'];
  ethnicities text[] := ARRAY['Asian', 'Black', 'Hispanic', 'White', 'Other'];
  emp_types text[] := ARRAY['Full-time', 'Full-time', 'Full-time', 'Full-time', 'Part-time', 'Contract'];
  locations text[] := ARRAY['San Francisco', 'New York', 'London', 'Singapore'];
  job_titles_eng text[] := ARRAY['Software Engineer', 'Senior Engineer', 'Lead Engineer', 'Engineering Manager'];
  job_titles_sales text[] := ARRAY['Sales Rep', 'Account Executive', 'Sales Manager', 'VP of Sales'];
  job_titles_marketing text[] := ARRAY['Marketing Specialist', 'Marketing Manager', 'Content Manager', 'CMO'];
  job_titles_ops text[] := ARRAY['Operations Analyst', 'Operations Manager', 'Process Manager', 'COO'];
  job_titles_finance text[] := ARRAY['Financial Analyst', 'Accountant', 'Finance Manager', 'CFO'];
  job_titles_hr text[] := ARRAY['HR Coordinator', 'Recruiter', 'HR Manager', 'CHRO'];

  emp_id uuid;
  i integer;
  dept_idx integer;
  hire_year integer;
  hire_month integer;
  hire_day integer;
  job_title text;
BEGIN
  FOR i IN 1..300 LOOP
    dept_idx := (i % 6) + 1;
    hire_year := 2020 + (i % 5);
    hire_month := (i % 12) + 1;
    hire_day := (i % 28) + 1;

    job_title := CASE dept_idx
      WHEN 1 THEN job_titles_eng[(i % 4) + 1]
      WHEN 2 THEN job_titles_sales[(i % 4) + 1]
      WHEN 3 THEN job_titles_marketing[(i % 4) + 1]
      WHEN 4 THEN job_titles_ops[(i % 4) + 1]
      WHEN 5 THEN job_titles_finance[(i % 4) + 1]
      ELSE job_titles_hr[(i % 4) + 1]
    END;

    INSERT INTO employees (
      employee_id,
      first_name,
      last_name,
      email,
      department_id,
      job_title,
      employment_type,
      hire_date,
      salary,
      gender,
      ethnicity,
      status
    ) VALUES (
      'EMP' || LPAD(i::text, 5, '0'),
      'First' || i,
      'Last' || i,
      'employee' || i || '@company.com',
      dept_ids[dept_idx],
      job_title,
      emp_types[(i % 6) + 1],
      make_date(hire_year, hire_month, hire_day),
      (CASE dept_idx
        WHEN 1 THEN 80000 + floor(random() * 100000)
        WHEN 2 THEN 70000 + floor(random() * 90000)
        WHEN 3 THEN 65000 + floor(random() * 85000)
        WHEN 4 THEN 65000 + floor(random() * 80000)
        WHEN 5 THEN 75000 + floor(random() * 95000)
        ELSE 60000 + floor(random() * 75000)
      END)::numeric,
      genders[(i % 3) + 1],
      ethnicities[(i % 5) + 1],
      'Active'
    ) RETURNING id INTO emp_id;

    -- Add location
    INSERT INTO employee_locations (employee_id, location)
    VALUES (emp_id, locations[(i % 4) + 1]);

    -- Add cohort tracking for recent hires
    IF hire_year >= 2024 THEN
      INSERT INTO cohort_tracking (employee_id, cohort_name, hire_quarter, hire_year)
      VALUES (
        emp_id,
        'Q' || CEIL(hire_month::numeric / 3) || ' ' || hire_year,
        'Q' || CEIL(hire_month::numeric / 3),
        hire_year
      );
    END IF;
  END LOOP;
END $$;

-- Insert terminated employees (80 employees)
DO $$
DECLARE
  dept_ids uuid[] := ARRAY[
    '11111111-1111-1111-1111-111111111111'::uuid,
    '22222222-2222-2222-2222-222222222222'::uuid,
    '33333333-3333-3333-3333-333333333333'::uuid,
    '44444444-4444-4444-4444-444444444444'::uuid,
    '55555555-5555-5555-5555-555555555555'::uuid,
    '66666666-6666-6666-6666-666666666666'::uuid
  ];
  exit_reasons text[] := ARRAY['Better Opportunity', 'Career Change', 'Relocation', 'Retirement', 'Personal Reasons'];

  emp_id uuid;
  i integer;
  dept_idx integer;
  hire_date date;
  exit_date date;
BEGIN
  FOR i IN 301..380 LOOP
    dept_idx := (i % 6) + 1;
    hire_date := make_date(2020 + (i % 4), (i % 12) + 1, (i % 28) + 1);
    exit_date := hire_date + interval '1 day' * (30 + floor(random() * 1095)::integer);

    INSERT INTO employees (
      employee_id,
      first_name,
      last_name,
      email,
      department_id,
      job_title,
      employment_type,
      hire_date,
      termination_date,
      salary,
      gender,
      ethnicity,
      status
    ) VALUES (
      'EMP' || LPAD(i::text, 5, '0'),
      'Former' || i,
      'Employee' || i,
      'former' || i || '@company.com',
      dept_ids[dept_idx],
      'Analyst',
      'Full-time',
      hire_date,
      exit_date,
      50000 + floor(random() * 80000)::numeric,
      CASE (i % 2) WHEN 0 THEN 'Male' ELSE 'Female' END,
      'White',
      'Terminated'
    ) RETURNING id INTO emp_id;

    -- Add exit record
    INSERT INTO exit_records (employee_id, exit_date, exit_reason, voluntary, exit_interview_completed)
    VALUES (
      emp_id,
      exit_date,
      exit_reasons[(i % 5) + 1],
      (i % 4) != 0,
      (i % 3) = 0
    );
  END LOOP;
END $$;

-- Insert performance reviews
INSERT INTO performance_reviews (employee_id, review_date, review_cycle, rating)
SELECT
  e.id,
  CURRENT_DATE - interval '6 months',
  '2024-H2',
  2.5 + (random() * 2.5)::numeric
FROM employees e
WHERE e.status = 'Active'
LIMIT 250;

-- Insert training records
DO $$
DECLARE
  emp_record RECORD;
  training_names text[] := ARRAY[
    'Leadership Development',
    'Technical Skills Workshop',
    'Communication Skills',
    'Project Management',
    'Diversity & Inclusion',
    'Cybersecurity Awareness',
    'Sales Excellence',
    'Customer Service Training'
  ];
  i integer;
BEGIN
  FOR emp_record IN SELECT id FROM employees WHERE status = 'Active' LIMIT 250 LOOP
    FOR i IN 1..(1 + floor(random() * 4)::integer) LOOP
      INSERT INTO training_records (employee_id, training_name, completion_date, cost, duration_hours)
      VALUES (
        emp_record.id,
        training_names[(floor(random() * 8)::integer % 8) + 1],
        CURRENT_DATE - interval '1 day' * floor(random() * 365)::integer,
        (500 + random() * 3000)::numeric,
        (4 + random() * 36)::numeric
      );
    END LOOP;
  END LOOP;
END $$;

-- Insert recruitment records
DO $$
DECLARE
  emp_record RECORD;
  sources text[] := ARRAY['Referral', 'Job Board', 'LinkedIn', 'Agency', 'Direct'];
  i integer := 1;
BEGIN
  FOR emp_record IN SELECT id, hire_date, department_id FROM employees WHERE hire_date >= '2024-01-01' LOOP
    INSERT INTO recruitment_records (
      employee_id,
      requisition_id,
      position_title,
      department_id,
      posted_date,
      hire_date,
      source,
      cost_per_hire,
      time_to_hire_days
    ) VALUES (
      emp_record.id,
      'REQ-2024-' || LPAD(i::text, 4, '0'),
      'New Position',
      emp_record.department_id,
      emp_record.hire_date - interval '1 day' * (20 + floor(random() * 40)::integer),
      emp_record.hire_date,
      sources[(floor(random() * 5)::integer % 5) + 1],
      (3000 + random() * 8000)::numeric,
      20 + floor(random() * 50)::integer
    );
    i := i + 1;
  END LOOP;
END $$;

-- Insert attendance records for the last 3 months
DO $$
DECLARE
  emp_record RECORD;
  day_offset integer;
  work_date date;
BEGIN
  FOR emp_record IN SELECT id FROM employees WHERE status = 'Active' LIMIT 100 LOOP
    FOR day_offset IN 0..89 LOOP
      work_date := CURRENT_DATE - day_offset;

      IF EXTRACT(DOW FROM work_date) NOT IN (0, 6) THEN
        INSERT INTO attendance_records (employee_id, date, hours_worked, overtime_hours, status)
        VALUES (
          emp_record.id,
          work_date,
          (7 + random() * 3)::numeric,
          CASE WHEN random() < 0.3 THEN (random() * 3)::numeric ELSE 0 END,
          CASE
            WHEN random() < 0.95 THEN 'Present'
            WHEN random() < 0.98 THEN 'Sick'
            ELSE 'PTO'
          END
        );
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruitment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE exit_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohort_tracking ENABLE ROW LEVEL SECURITY;
