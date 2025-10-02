const random = (arr) => arr[Math.floor(Math.random() * arr.length)]
const stages = ['applied', 'screening', 'interview', 'technical', 'final', 'offer', 'hired', 'rejected']
const tagsPool = ['frontend', 'backend', 'devops', 'design', 'ml', 'infra', 'mobile', 'data', 'security', 'qa']
const jobTitles = [
  'Senior Frontend Engineer', 'Backend Developer', 'Full Stack Engineer', 'DevOps Engineer',
  'UI/UX Designer', 'Product Manager', 'Data Scientist', 'Machine Learning Engineer',
  'Site Reliability Engineer', 'QA Engineer', 'Security Engineer', 'Mobile Developer',
  'Technical Lead', 'Engineering Manager', 'Solutions Architect', 'Cloud Engineer',
  'Database Administrator', 'Business Analyst', 'Scrum Master', 'Technical Writer',
  'Platform Engineer', 'Infrastructure Engineer', 'AI Engineer', 'Blockchain Developer',
  'Game Developer'
]

const questionTypes = ['single', 'multi', 'short', 'long', 'numeric']
const questionTemplates = {
  single: [
    'What is your preferred programming language?',
    'Which development methodology do you prefer?',
    'What is your experience level with cloud platforms?',
    'Which database system are you most comfortable with?',
    'What is your preferred IDE/editor?'
  ],
  multi: [
    'Which of the following technologies have you worked with?',
    'Select all programming languages you are proficient in',
    'Which project management tools have you used?',
    'What types of testing have you performed?',
    'Which cloud services have you utilized?'
  ],
  short: [
    'Describe your ideal work environment',
    'What motivates you in your career?',
    'How do you handle tight deadlines?',
    'What is your greatest professional strength?',
    'How do you stay updated with technology trends?'
  ],
  long: [
    'Describe a challenging project you worked on and how you overcame obstacles',
    'Explain your approach to debugging complex issues',
    'How would you design a scalable system for high traffic?',
    'Describe your experience with team collaboration and leadership',
    'What would you do in your first 90 days in this role?'
  ],
  numeric: [
    'How many years of professional experience do you have?',
    'How many team members have you managed?',
    'What is your expected salary range (in thousands)?',
    'How many projects have you led from start to finish?',
    'Rate your proficiency in your primary technology (1-10)'
  ]
}

export async function fakeSeed(db) {
  console.log('🌱 Checking if seed data exists...')
  const jobsCount = await db.jobs.count()
  console.log(`📊 Current jobs count: ${jobsCount}`)
  
  if (jobsCount > 0) {
    console.log('✅ Seed data already exists, skipping...')
    return
  }
  
  console.log('🚀 Creating seed data...')

  // Create exactly 25 jobs with mixed active/archived status
  const jobs = Array.from({ length: 25 }).map((_, i) => {
    const isActive = Math.random() < 0.6 // 60% active, 40% archived
    const hasAutoArchive = isActive && Math.random() < 0.3 // 30% of active jobs have auto-archive
    const autoArchiveHours = hasAutoArchive ? random([2, 6, 12, 24, 48, 168]) : null // 2h to 1 week
    
    const experienceLevel = random(['Junior', 'Mid-level', 'Senior', 'Lead', 'Principal'])
    const salaryRange = {
      'Junior': [60000, 90000],
      'Mid-level': [90000, 130000],
      'Senior': [130000, 180000],
      'Lead': [180000, 250000],
      'Principal': [250000, 350000]
    }
    const [minSalary, maxSalary] = salaryRange[experienceLevel]
    const actualMinSalary = minSalary + Math.floor(Math.random() * 20000)
    const actualMaxSalary = maxSalary + Math.floor(Math.random() * 30000)

    return {
      title: jobTitles[i] || `${random(['Senior', 'Junior', 'Lead'])} ${random(['Engineer', 'Developer', 'Specialist'])}`,
      slug: `job-${i + 1}-${jobTitles[i]?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'position'}`,
      status: isActive ? 'active' : 'archived',
      tags: Array.from(new Set([random(tagsPool), random(tagsPool), random(tagsPool)])).slice(0, 2),
      description: `We are seeking a talented ${experienceLevel} professional to join our ${random(['dynamic', 'innovative', 'growing', 'collaborative'])} team. This role involves working with modern technologies and collaborating with cross-functional teams. You'll be responsible for ${random(['developing scalable solutions', 'leading technical initiatives', 'mentoring team members', 'driving product innovation'])} and contributing to our mission of ${random(['transforming digital experiences', 'building the future of technology', 'creating impactful solutions', 'revolutionizing the industry'])}.`,
      location: random(['Remote', 'New York', 'San Francisco', 'Austin', 'Seattle', 'Boston', 'Chicago']),
      department: random(['Engineering', 'Product', 'Design', 'Data', 'Security', 'Infrastructure']),
      experienceLevel: experienceLevel,
      experienceYears: {
        'Junior': '1-3 years',
        'Mid-level': '3-5 years', 
        'Senior': '5-8 years',
        'Lead': '8-12 years',
        'Principal': '12+ years'
      }[experienceLevel],
      salaryMin: actualMinSalary,
      salaryMax: actualMaxSalary,
      salaryType: random(['yearly', 'yearly', 'yearly', 'hourly']), // 75% yearly, 25% hourly
      benefits: random([
        ['Health Insurance', 'Dental', '401k', 'PTO'],
        ['Health Insurance', 'Vision', 'Stock Options', 'Flexible Hours'],
        ['Medical', 'Dental', 'Vision', '401k Match', 'Remote Work'],
        ['Health Coverage', 'Life Insurance', 'Stock Options', 'Learning Budget'],
        ['Full Benefits', 'Equity', 'Unlimited PTO', 'Home Office Stipend']
      ]),
      requirements: [
        `${random(['Bachelor\'s', 'Master\'s'])} degree in ${random(['Computer Science', 'Engineering', 'related field'])} or equivalent experience`,
        `${random(['Strong', 'Excellent', 'Proven'])} experience with ${random(['JavaScript', 'Python', 'Java', 'React', 'Node.js', 'AWS'])}`,
        `${random(['Experience', 'Proficiency'])} in ${random(['agile methodologies', 'CI/CD', 'microservices', 'cloud platforms'])}`,
        `${random(['Strong', 'Excellent'])} ${random(['communication', 'problem-solving', 'analytical'])} skills`,
        `Ability to work ${random(['independently', 'in a team environment', 'in a fast-paced environment'])}`
      ],
      responsibilities: [
        `${random(['Design', 'Develop', 'Build'])} and ${random(['maintain', 'optimize', 'enhance'])} ${random(['scalable applications', 'robust systems', 'user interfaces'])}`,
        `${random(['Collaborate', 'Work closely'])} with ${random(['cross-functional teams', 'product managers', 'designers', 'stakeholders'])}`,
        `${random(['Participate in', 'Lead', 'Contribute to'])} ${random(['code reviews', 'technical discussions', 'architecture decisions'])}`,
        `${random(['Mentor', 'Guide', 'Support'])} ${random(['junior developers', 'team members', 'new hires'])}`,
        `${random(['Stay current', 'Keep up-to-date'])} with ${random(['industry trends', 'best practices', 'emerging technologies'])}`
      ],
      workType: random(['Full-time', 'Full-time', 'Full-time', 'Contract', 'Part-time']), // 60% full-time
      autoArchiveDate: hasAutoArchive ? new Date(Date.now() + autoArchiveHours * 60 * 60 * 1000).toISOString() : null,
      autoArchiveHours: autoArchiveHours,
      order: i,
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  })

  await db.jobs.bulkAdd(jobs)

  // Create exactly 1000 candidates randomly assigned to jobs and stages
  const candidates = Array.from({ length: 1000 }).map((_, i) => ({
    name: `${random(['John', 'Jane', 'Alex', 'Sarah', 'Michael', 'Emily', 'David', 'Lisa', 'Chris', 'Anna'])} ${random(['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'])}`,
    email: `candidate${i + 1}@${random(['gmail.com', 'yahoo.com', 'outlook.com', 'company.com', 'tech.io'])}`,
    phone: `+1-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
    stage: random(stages),
    jobId: Math.floor(Math.random() * 25) + 1, // Randomly assign to one of 25 jobs
    experience: Math.floor(Math.random() * 15) + 1, // 1-15 years experience
    skills: Array.from(new Set([random(tagsPool), random(tagsPool), random(tagsPool)])),
    appliedAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(), // Applied within last 60 days
    notes: Math.random() < 0.3 ? `${random(['Strong', 'Good', 'Excellent', 'Outstanding'])} candidate with ${random(['great', 'solid', 'impressive'])} background.` : ''
  }))

  await db.candidates.bulkAdd(candidates)

  // Create sample applications linking candidates to jobs
  const applications = []
  for (let i = 0; i < 200; i++) {
    const candidateId = Math.floor(Math.random() * 1000) + 1
    const jobId = Math.floor(Math.random() * 25) + 1
    
    // Avoid duplicate applications
    const existingApp = applications.find(app => app.candidateId === candidateId && app.jobId === jobId)
    if (!existingApp) {
      applications.push({
        candidateId,
        jobId,
        status: random(['applied', 'reviewing', 'interview', 'rejected', 'hired']),
        appliedAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      })
    }
  }

  await db.applications.bulkAdd(applications)

  // Create exactly 3 assessments with 10+ questions each
  for (let j = 1; j <= 3; j++) {
    const assessment = {
      jobId: j,
      title: `Assessment for ${jobs[j-1].title}`,
      description: `Comprehensive assessment to evaluate candidates for the ${jobs[j-1].title} position.`,
      timeLimit: random([30, 45, 60, 90]), // minutes
      sections: [{
        id: 1,
        title: 'Technical Skills & Experience',
        description: 'Questions about your technical background and experience',
        questions: Array.from({ length: 12 }).map((__, q) => {
          const type = random(questionTypes)
          return {
            id: q + 1,
            type: type,
            label: random(questionTemplates[type]),
            required: Math.random() < 0.8, // 80% of questions are required
            options: type === 'single' || type === 'multi' ? [
              'Option A', 'Option B', 'Option C', 'Option D'
            ] : undefined,
            placeholder: type === 'short' ? 'Your answer here...' : 
                        type === 'long' ? 'Please provide a detailed response...' :
                        type === 'numeric' ? 'Enter a number' : undefined,
            validation: type === 'numeric' ? { min: 0, max: 100 } : undefined
          }
        })
      }],
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Created within last 30 days
      isActive: true
    }
    await db.assessments.add(assessment)
  }

  console.log('✅ Seed data created:', {
    jobs: jobs.length,
    candidates: candidates.length,
    applications: applications.length,
    assessments: 3,
    activeJobs: jobs.filter(j => j.status === 'active').length,
    archivedJobs: jobs.filter(j => j.status === 'archived').length
  })
}