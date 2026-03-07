import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const departments = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Engineering' },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Sales' },
  { id: '33333333-3333-3333-3333-333333333333', name: 'Marketing' },
  { id: '44444444-4444-4444-4444-444444444444', name: 'Operations' },
  { id: '55555555-5555-5555-5555-555555555555', name: 'Finance' },
  { id: '66666666-6666-6666-6666-666666666666', name: 'HR' }
];

const locations = ['San Francisco', 'New York', 'London', 'Singapore', 'Austin', 'Seattle'];
const genders = ['Male', 'Female', 'Non-binary'];
const ethnicities = ['Asian', 'Black', 'Hispanic', 'White', 'Other'];
const employmentTypes = ['Full-time', 'Full-time', 'Full-time', 'Full-time', 'Part-time', 'Contract'];
const exitReasons = ['Better Opportunity', 'Career Change', 'Relocation', 'Retirement', 'Personal Reasons', 'Performance', 'Reorganization'];
const sources = ['Referral', 'Job Board', 'LinkedIn', 'Agency', 'Direct', 'University'];
const trainingPrograms = [
  'Leadership Development',
  'Technical Skills Workshop',
  'Communication Skills',
  'Project Management',
  'Diversity & Inclusion',
  'Cybersecurity Awareness',
  'Sales Excellence',
  'Customer Service Training',
  'Agile Methodology',
  'Data Analytics'
];

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function populateDatabase() {
  console.log('Starting database population...');

  console.log('Inserting departments...');
  const { error: deptError } = await supabase
    .from('departments')
    .upsert(departments, { onConflict: 'id' });

  if (deptError) {
    console.error('Error inserting departments:', deptError);
  } else {
    console.log(`Inserted ${departments.length} departments`);
  }

  console.log('Generating and inserting employees...');
  const employees = [];
  const employeeLocations = [];
  const cohortTracking = [];

  for (let i = 1; i <= 300; i++) {
    const dept = randomItem(departments);
    const hireYear = 2020 + Math.floor(Math.random() * 5);
    const hireMonth = Math.floor(Math.random() * 12);
    const hireDay = Math.floor(Math.random() * 28) + 1;
    const hireDate = new Date(hireYear, hireMonth, hireDay);

    const jobTitles = {
      'Engineering': ['Software Engineer', 'Senior Engineer', 'Lead Engineer', 'Engineering Manager', 'Director of Engineering'],
      'Sales': ['Sales Representative', 'Account Executive', 'Sales Manager', 'VP of Sales', 'Sales Director'],
      'Marketing': ['Marketing Specialist', 'Marketing Manager', 'Content Manager', 'CMO', 'Brand Manager'],
      'Operations': ['Operations Analyst', 'Operations Manager', 'Process Manager', 'COO', 'Operations Director'],
      'Finance': ['Financial Analyst', 'Accountant', 'Finance Manager', 'CFO', 'Controller'],
      'HR': ['HR Coordinator', 'Recruiter', 'HR Manager', 'CHRO', 'Talent Manager']
    };

    const empType = randomItem(employmentTypes);
    const gender = randomItem(genders);
    const ethnicity = randomItem(ethnicities);

    const baseSalary = dept.name === 'Engineering' ? 80000 :
                       dept.name === 'Sales' ? 70000 :
                       dept.name === 'Finance' ? 75000 : 65000;
    const salary = baseSalary + Math.floor(Math.random() * 100000);

    const employee = {
      employee_id: `EMP${String(i).padStart(5, '0')}`,
      first_name: `First${i}`,
      last_name: `Last${i}`,
      email: `employee${i}@company.com`,
      department_id: dept.id,
      job_title: randomItem(jobTitles[dept.name]),
      employment_type: empType,
      hire_date: hireDate.toISOString().split('T')[0],
      salary,
      gender,
      ethnicity,
      status: 'Active'
    };

    employees.push(employee);

    employeeLocations.push({
      employee_id: employee.employee_id,
      location: randomItem(locations)
    });

    if (hireYear >= 2024) {
      const quarter = Math.ceil((hireMonth + 1) / 3);
      cohortTracking.push({
        employee_id: employee.employee_id,
        cohort_name: `Q${quarter} ${hireYear}`,
        hire_quarter: `Q${quarter}`,
        hire_year: hireYear
      });
    }
  }

  const { data: insertedEmployees, error: empError } = await supabase
    .from('employees')
    .insert(employees)
    .select('id, employee_id');

  if (empError) {
    console.error('Error inserting employees:', empError);
    return;
  }
  console.log(`Inserted ${insertedEmployees.length} employees`);

  const empIdMap = new Map(insertedEmployees.map(e => [e.employee_id, e.id]));

  console.log('Inserting employee locations...');
  const locationsWithIds = employeeLocations.map(loc => ({
    employee_id: empIdMap.get(loc.employee_id),
    location: loc.location
  }));

  const { error: locError } = await supabase
    .from('employee_locations')
    .insert(locationsWithIds);

  if (locError) console.error('Error inserting locations:', locError);

  console.log('Inserting cohort tracking...');
  const cohortsWithIds = cohortTracking.map(c => ({
    employee_id: empIdMap.get(c.employee_id),
    cohort_name: c.cohort_name,
    hire_quarter: c.hire_quarter,
    hire_year: c.hire_year
  }));

  const { error: cohortError } = await supabase
    .from('cohort_tracking')
    .insert(cohortsWithIds);

  if (cohortError) console.error('Error inserting cohorts:', cohortError);

  console.log('Generating exit records...');
  const exitRecords = [];
  const terminatedEmployees = [];

  for (let i = 301; i <= 380; i++) {
    const dept = randomItem(departments);
    const hireYear = 2020 + Math.floor(Math.random() * 4);
    const hireMonth = Math.floor(Math.random() * 12);
    const hireDate = new Date(hireYear, hireMonth, 1);

    const daysEmployed = Math.floor(Math.random() * 1095) + 30;
    const exitDate = new Date(hireDate.getTime() + daysEmployed * 24 * 60 * 60 * 1000);

    const jobTitles = ['Analyst', 'Specialist', 'Coordinator', 'Associate', 'Representative'];
    const empType = Math.random() < 0.8 ? 'Full-time' : randomItem(['Part-time', 'Contract']);

    const baseSalary = 50000 + Math.floor(Math.random() * 80000);

    terminatedEmployees.push({
      employee_id: `EMP${String(i).padStart(5, '0')}`,
      first_name: `Former${i}`,
      last_name: `Employee${i}`,
      email: `former${i}@company.com`,
      department_id: dept.id,
      job_title: `${dept.name} ${randomItem(jobTitles)}`,
      employment_type: empType,
      hire_date: hireDate.toISOString().split('T')[0],
      termination_date: exitDate.toISOString().split('T')[0],
      salary: baseSalary,
      gender: randomItem(genders),
      ethnicity: randomItem(ethnicities),
      status: 'Terminated'
    });
  }

  const { data: exitedEmployees, error: termError } = await supabase
    .from('employees')
    .insert(terminatedEmployees)
    .select('id, employee_id, hire_date, termination_date, department_id');

  if (termError) {
    console.error('Error inserting terminated employees:', termError);
  } else {
    console.log(`Inserted ${exitedEmployees.length} terminated employees`);

    const exits = exitedEmployees.map(emp => ({
      employee_id: emp.id,
      exit_date: emp.termination_date,
      exit_reason: randomItem(exitReasons),
      voluntary: Math.random() < 0.7,
      exit_interview_completed: Math.random() < 0.6
    }));

    const { error: exitError } = await supabase
      .from('exit_records')
      .insert(exits);

    if (exitError) console.error('Error inserting exit records:', exitError);
    else console.log(`Inserted ${exits.length} exit records`);
  }

  console.log('Inserting performance reviews...');
  const reviews = [];
  const activeEmpSample = insertedEmployees.slice(0, 200);

  for (const emp of activeEmpSample) {
    const numReviews = Math.floor(Math.random() * 3) + 1;
    for (let j = 0; j < numReviews; j++) {
      const reviewDate = randomDate(new Date(2023, 0, 1), new Date());
      reviews.push({
        employee_id: emp.id,
        review_date: reviewDate.toISOString().split('T')[0],
        review_cycle: reviewDate.getFullYear() + '-H' + (reviewDate.getMonth() < 6 ? '1' : '2'),
        rating: 2.5 + Math.random() * 2.5,
        comments: 'Performance review comments'
      });
    }
  }

  const { error: reviewError } = await supabase
    .from('performance_reviews')
    .insert(reviews);

  if (reviewError) console.error('Error inserting reviews:', reviewError);
  else console.log(`Inserted ${reviews.length} performance reviews`);

  console.log('Inserting training records...');
  const trainings = [];

  for (const emp of insertedEmployees.slice(0, 250)) {
    const numTrainings = Math.floor(Math.random() * 5) + 1;
    for (let j = 0; j < numTrainings; j++) {
      trainings.push({
        employee_id: emp.id,
        training_name: randomItem(trainingPrograms),
        completion_date: randomDate(new Date(2023, 0, 1), new Date()).toISOString().split('T')[0],
        cost: 500 + Math.random() * 3000,
        duration_hours: 4 + Math.random() * 36
      });
    }
  }

  const { error: trainingError } = await supabase
    .from('training_records')
    .insert(trainings);

  if (trainingError) console.error('Error inserting trainings:', trainingError);
  else console.log(`Inserted ${trainings.length} training records`);

  console.log('Inserting recruitment records...');
  const recruitments = [];
  const recentHires = employees.filter(e => new Date(e.hire_date) >= new Date(2024, 0, 1));

  let reqNum = 1;
  for (const emp of recentHires) {
    const empId = empIdMap.get(emp.employee_id);
    const hireDate = new Date(emp.hire_date);
    const timeToHire = 20 + Math.floor(Math.random() * 50);
    const postedDate = new Date(hireDate.getTime() - timeToHire * 24 * 60 * 60 * 1000);

    recruitments.push({
      employee_id: empId,
      requisition_id: `REQ-2024-${String(reqNum++).padStart(4, '0')}`,
      position_title: emp.job_title,
      department_id: emp.department_id,
      posted_date: postedDate.toISOString().split('T')[0],
      hire_date: emp.hire_date,
      source: randomItem(sources),
      cost_per_hire: 3000 + Math.random() * 8000,
      time_to_hire_days: timeToHire
    });
  }

  const { error: recruitError } = await supabase
    .from('recruitment_records')
    .insert(recruitments);

  if (recruitError) console.error('Error inserting recruitments:', recruitError);
  else console.log(`Inserted ${recruitments.length} recruitment records`);

  console.log('Inserting attendance records...');
  const attendances = [];
  const empSample = insertedEmployees.slice(0, 100);

  for (const emp of empSample) {
    for (let daysAgo = 0; daysAgo < 90; daysAgo++) {
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);

      if (date.getDay() !== 0 && date.getDay() !== 6) {
        const hoursWorked = 7 + Math.random() * 3;
        const hasOvertime = Math.random() < 0.3;
        const isPresent = Math.random() < 0.95;

        attendances.push({
          employee_id: emp.id,
          date: date.toISOString().split('T')[0],
          hours_worked: isPresent ? hoursWorked : 0,
          overtime_hours: hasOvertime && isPresent ? Math.random() * 3 : 0,
          status: isPresent ? 'Present' : (Math.random() < 0.5 ? 'Sick' : 'PTO')
        });
      }
    }
  }

  const { error: attendanceError } = await supabase
    .from('attendance_records')
    .insert(attendances);

  if (attendanceError) console.error('Error inserting attendances:', attendanceError);
  else console.log(`Inserted ${attendances.length} attendance records`);

  console.log('Database population completed successfully!');
}

populateDatabase().catch(console.error);
