export type FilterState = {
  timePeriod: 'month' | 'quarter' | 'year' | 'custom';
  department: string;
  location: string;
  employeeLevel: string;
  employmentType: string;
  customStartDate?: string;
  customEndDate?: string;
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
  termination_date?: string;
  salary: number;
  gender: string;
  ethnicity: string;
  status: string;
};

export type Department = {
  id: string;
  name: string;
  parent_id?: string;
};

export type PerformanceReview = {
  id: string;
  employee_id: string;
  review_date: string;
  review_cycle: string;
  rating: number;
  reviewer_id?: string;
  comments?: string;
};

export type TrainingRecord = {
  id: string;
  employee_id: string;
  training_name: string;
  completion_date: string;
  cost: number;
  duration_hours: number;
};

export type AttendanceRecord = {
  id: string;
  employee_id: string;
  date: string;
  hours_worked: number;
  overtime_hours: number;
  status: string;
};

export type RecruitmentRecord = {
  id: string;
  employee_id?: string;
  requisition_id: string;
  position_title: string;
  department_id: string;
  posted_date: string;
  hire_date?: string;
  source: string;
  cost_per_hire: number;
  time_to_hire_days?: number;
};

export type ExitRecord = {
  id: string;
  employee_id: string;
  exit_date: string;
  exit_reason: string;
  voluntary: boolean;
  exit_interview_completed: boolean;
};
