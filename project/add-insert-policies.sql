-- Add insert policies for data population
CREATE POLICY "Allow public insert to departments"
  ON departments FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public insert to employees"
  ON employees FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public insert to performance_reviews"
  ON performance_reviews FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public insert to training_records"
  ON training_records FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public insert to attendance_records"
  ON attendance_records FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public insert to recruitment_records"
  ON recruitment_records FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public insert to exit_records"
  ON exit_records FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public insert to employee_locations"
  ON employee_locations FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public insert to cohort_tracking"
  ON cohort_tracking FOR INSERT
  TO public
  WITH CHECK (true);

-- Insert departments
INSERT INTO departments (id, name, parent_id) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Engineering', NULL),
  ('22222222-2222-2222-2222-222222222222', 'Sales', NULL),
  ('33333333-3333-3333-3333-333333333333', 'Marketing', NULL),
  ('44444444-4444-4444-4444-444444444444', 'Operations', NULL),
  ('55555555-5555-5555-5555-555555555555', 'Finance', NULL),
  ('66666666-6666-6666-6666-666666666666', 'HR', NULL)
ON CONFLICT (id) DO NOTHING;
