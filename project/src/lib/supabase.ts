import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Department = {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
};

export type Employee = {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  department_id: string;
  job_title: string;
  employment_type: string;
  hire_date: string;
  termination_date: string | null;
  salary: number;
  gender: string;
  ethnicity: string;
  status: string;
  created_at: string;
};

export type PerformanceReview = {
  id: string;
  employee_id: string;
  review_date: string;
  review_cycle: string;
  rating: number;
  reviewer_id: string;
  comments: string | null;
  created_at: string;
};

export type TrainingRecord = {
  id: string;
  employee_id: string;
  training_name: string;
  completion_date: string;
  cost: number;
  duration_hours: number;
  created_at: string;
};

export type AttendanceRecord = {
  id: string;
  employee_id: string;
  date: string;
  hours_worked: number;
  overtime_hours: number;
  status: string;
  created_at: string;
};

export type RecruitmentRecord = {
  id: string;
  employee_id: string | null;
  requisition_id: string;
  position_title: string;
  department_id: string;
  posted_date: string;
  hire_date: string | null;
  source: string;
  cost_per_hire: number;
  time_to_hire_days: number;
  created_at: string;
};

export type ExitRecord = {
  id: string;
  employee_id: string;
  exit_date: string;
  exit_reason: string;
  voluntary: boolean;
  exit_interview_completed: boolean;
  created_at: string;
};
