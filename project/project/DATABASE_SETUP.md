# Database Setup Instructions

To populate your HR Analytics dashboard with sample data, follow these steps:

## Option 1: Using Supabase SQL Editor (Recommended)

1. Go to your Supabase project dashboard: https://mozjktrnjlydamwrhwmq.supabase.co
2. Navigate to the **SQL Editor** tab
3. Click "New Query"
4. Copy the entire contents of `seed-data.sql`
5. Paste into the SQL Editor
6. Click "Run" to execute the script

This will populate your database with:
- 300 active employees across 6 departments
- 80 terminated employees with exit records
- 250+ performance reviews
- 1000+ training records
- 6000+ attendance records
- 100+ recruitment records
- Location and cohort tracking data

## Option 2: Using Node.js Script (Alternative)

If you prefer to use the Node.js script:

1. First, you need to temporarily add INSERT policies to your tables
2. Run the `add-insert-policies.sql` script in Supabase SQL Editor
3. Then run: `node populate-database.js`

## What Data Will Be Created

### Employees (300 Active + 80 Terminated)
- Distributed across Engineering, Sales, Marketing, Operations, Finance, and HR
- Realistic salaries based on department and role
- Diverse gender and ethnicity representation
- Hire dates from 2020-2025

### Performance Reviews
- 250+ reviews with ratings from 2.5 to 5.0
- Linked to active employees

### Training Records
- 1000+ training completions
- Various programs including Leadership, Technical Skills, Project Management
- Costs ranging from $500-$3500 per training
- Duration from 4-40 hours

### Attendance Records
- 90 days of attendance data for 100 employees
- Includes overtime hours, sick days, and PTO
- Weekends excluded

### Recruitment Records
- Data for all employees hired in 2024
- Various sources: Referral, Job Board, LinkedIn, Agency, Direct
- Time to hire: 20-70 days
- Cost per hire: $3,000-$11,000

### Exit Records
- 80 exit records with various reasons
- Mix of voluntary and involuntary separations
- Exit interview completion tracking

## After Running the Script

All charts and analytics in your dashboard will display real calculated data:
- Workforce Stability trends
- First Year Attrition cohort analysis
- Diversity & Pay Equity metrics
- Training ROI correlations
- Burnout Detection risk factors
- Performance Intelligence distributions
- And all other analytics

No hardcoded values - everything is calculated from the database!
