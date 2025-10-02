import { rest } from 'msw'
import { db, ensureSeed } from '../db/dexie.jsx'
import { fakeSeed } from '../utils/fakeSeed.jsx'

// Initialize seed data when handlers are loaded
console.log('🔧 Loading MSW handlers...')
ensureSeed(fakeSeed).catch((error) => {
  console.error('❌ Error initializing seed data:', error)
})

// Simulate network latency and errors for write operations
async function unreliableWrite(fn) {
  // Artificial latency: 200-1200ms for write operations
  const latency = 200 + Math.floor(Math.random() * 1000)
  await new Promise((r) => setTimeout(r, latency))
  
  // 5-10% error rate for write endpoints
  const shouldFail = Math.random() < 0.075 // 7.5% error rate
  if (shouldFail) {
    const errors = [
      'Network timeout - please try again',
      'Server temporarily unavailable',
      'Database connection failed',
      'Validation error occurred',
      'Internal server error'
    ]
    throw new Error(errors[Math.floor(Math.random() * errors.length)])
  }
  
  return await fn()
}

// Simulate lighter latency for read operations
async function simulateRead(fn) {
  // Lighter latency for reads: 50-300ms
  const latency = 50 + Math.floor(Math.random() * 250)
  await new Promise((r) => setTimeout(r, latency))
  
  return await fn()
}

export const handlers = [
  rest.get('/api/jobs', async (req, res, ctx) => {
    console.log('📡 API call to /api/jobs')
    try {
      const result = await simulateRead(async () => {
        const search = (req.url.searchParams.get('search') || '').toLowerCase()
        const status = req.url.searchParams.get('status') || ''
        const candidateId = req.url.searchParams.get('candidateId')
        const sortBy = req.url.searchParams.get('sortBy') || 'createdAt'
        const sortOrder = req.url.searchParams.get('sortOrder') || 'desc'
        const page = parseInt(req.url.searchParams.get('page') || '1', 10)
        const pageSize = parseInt(req.url.searchParams.get('pageSize') || '10', 10)

        let all = await db.jobs.toArray()
        
        // If filtering by candidate applications, get only applied jobs
        if (candidateId) {
          const applications = await db.applications
            .where('candidateId')
            .equals(parseInt(candidateId))
            .toArray()
          const appliedJobIds = new Set(applications.map(app => app.jobId))
          all = all.filter(job => appliedJobIds.has(job.id))
        }

        const filtered = all.filter((j) => {
          const matchesStatus = status ? j.status === status : true
          const matchesSearch = search
            ? (j.title || '').toLowerCase().includes(search) || 
              ((j.tags || []).join(' ').toLowerCase().includes(search)) ||
              (j.department || '').toLowerCase().includes(search) ||
              (j.location || '').toLowerCase().includes(search) ||
              (j.experienceLevel || '').toLowerCase().includes(search)
            : true
          return matchesStatus && matchesSearch
        })

        // Sort the filtered results
        const sorted = filtered.sort((a, b) => {
          let aVal = a[sortBy]
          let bVal = b[sortBy]
          
          // Handle different data types
          if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
            aVal = new Date(aVal || 0).getTime()
            bVal = new Date(bVal || 0).getTime()
          } else if (sortBy === 'salaryMin' || sortBy === 'salaryMax') {
            aVal = parseInt(aVal || 0)
            bVal = parseInt(bVal || 0)
          } else if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase()
            bVal = (bVal || '').toLowerCase()
          }
          
          if (sortOrder === 'asc') {
            return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
          } else {
            return aVal < bVal ? 1 : aVal > bVal ? -1 : 0
          }
        })

        const start = (page - 1) * pageSize
        const pageItems = sorted.slice(start, start + pageSize)

        return { items: pageItems, total: filtered.length }
      })
      
      return res(ctx.json(result))
    } catch (e) {
      return res(ctx.status(500), ctx.json({ error: e.message }))
    }
  }),

  rest.get('/api/jobs/:id', async (req, res, ctx) => {
    try {
      const result = await simulateRead(async () => {
        const id = parseInt(req.params.id)
        const job = await db.jobs.get(id)
        if (!job) {
          throw new Error('Job not found')
        }
        return job
      })
      
      return res(ctx.json(result))
    } catch (e) {
      return res(ctx.status(404), ctx.json({ error: e.message }))
    }
  }),

  rest.post('/api/jobs', async (req, res, ctx) => {
    try {
      const payload = await req.json()
      if (!payload || !payload.title) {
        return res(ctx.status(400), ctx.json({ error: 'Title is required' }))
      }

      const result = await unreliableWrite(async () => {
        const slug = payload.slug || (payload.title || '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')

        const existing = await db.jobs.where('slug').equals(slug).first()
        if (existing) {
          throw new Error('Job with this slug already exists')
        }

        const job = {
          ...payload,
          slug,
          status: payload.status || 'active',
          department: payload.department || 'Engineering',
          location: payload.location || 'Remote',
          tags: payload.tags || [],
          description: payload.description || '',
          autoArchiveDate: payload.autoArchiveDate || null,
          autoArchiveHours: payload.autoArchiveHours || null,
          order: typeof payload.order === 'number' ? payload.order : (await db.jobs.count()),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        const id = await db.jobs.add(job)
        return { id, ...job }
      })

      return res(ctx.json(result))
    } catch (e) {
      return res(ctx.status(500), ctx.json({ error: e.message }))
    }
  }),

  rest.patch('/api/jobs/:id', async (req, res, ctx) => {
    try {
      const id = Number(req.params.id)
      const payload = await req.json()
      
      const result = await unreliableWrite(async () => {
        const updateData = {
          ...payload,
          updatedAt: new Date().toISOString()
        }
        
        await db.jobs.update(id, updateData)
        return await db.jobs.get(id)
      })
      
      return res(ctx.json(result))
    } catch (e) {
      return res(ctx.status(500), ctx.json({ error: e.message }))
    }
  }),

  rest.delete('/api/jobs/:id', async (req, res, ctx) => {
    try {
      const id = Number(req.params.id)
      
      await unreliableWrite(async () => {
        await db.jobs.delete(id)
      })
      
      return res(ctx.json({ success: true }))
    } catch (e) {
      return res(ctx.status(500), ctx.json({ error: e.message }))
    }
  }),

  rest.patch('/api/jobs/:id/reorder', async (req, res, ctx) => {
    try {
      const body = await req.json()
      const fromOrder = Number(body.fromOrder)
      const toOrder = Number(body.toOrder)
      
      if (Number.isNaN(fromOrder) || Number.isNaN(toOrder)) {
        return res(ctx.status(400), ctx.json({ error: 'Invalid order values' }))
      }

      await unreliableWrite(async () => {
        const all = await db.jobs.toArray()
        const affected = all.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        const item = affected.find((it) => it.order === fromOrder)
        
        if (!item) {
          throw new Error('Item not found for fromOrder')
        }

        // Remove item and insert at new position, then reassign orders
        const filtered = affected.filter((it) => it.id !== item.id)
        filtered.splice(toOrder, 0, item)
        
        await Promise.all(filtered.map((it, idx) => db.jobs.update(it.id, { order: idx })))
      })

      return res(ctx.json({ fromOrder, toOrder }))
    } catch (e) {
      return res(ctx.status(500), ctx.json({ error: e.message }))
    }
  }),

  rest.get('/api/candidates', async (req, res, ctx) => {
    try {
      const result = await simulateRead(async () => {
        const search = (req.url.searchParams.get('search') || '').toLowerCase()
        const stage = req.url.searchParams.get('stage') || ''
        const jobId = req.url.searchParams.get('jobId') || ''
        const page = parseInt(req.url.searchParams.get('page') || '1', 10)
        const pageSize = parseInt(req.url.searchParams.get('pageSize') || '50', 10)

        const all = await db.candidates.toArray()
        const filtered = all.filter((c) => {
          const matchesStage = stage ? c.stage === stage : true
          const matchesJob = jobId ? c.jobId === parseInt(jobId) : true
          const matchesSearch = search 
            ? (c.name || '').toLowerCase().includes(search) || 
              (c.email || '').toLowerCase().includes(search) ||
              (c.skills || []).join(' ').toLowerCase().includes(search)
            : true
          return matchesStage && matchesJob && matchesSearch
        })

        const start = (page - 1) * pageSize
        return { 
          items: filtered.slice(start, start + pageSize), 
          total: filtered.length 
        }
      })
      
      return res(ctx.json(result))
    } catch (e) {
      return res(ctx.status(500), ctx.json({ error: e.message }))
    }
  }),

  rest.post('/api/candidates', async (req, res, ctx) => {
    try {
      const payload = await req.json()
      if (!payload || !payload.name || !payload.email) {
        return res(ctx.status(400), ctx.json({ error: 'Name and email are required' }))
      }

      const result = await unreliableWrite(async () => {
        // Check if candidate already exists for this job
        const existing = await db.candidates
          .where(['email', 'jobId'])
          .equals([payload.email, payload.jobId])
          .first()
        
        if (existing) {
          // Update existing candidate instead of creating duplicate
          const updateData = {
            ...payload,
            updatedAt: new Date().toISOString()
          }
          await db.candidates.update(existing.id, updateData)
          return { id: existing.id, ...existing, ...updateData }
        }

        const candidate = {
          ...payload,
          stage: payload.stage || 'applied',
          appliedAt: payload.appliedAt || new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          assessmentScore: Math.floor(Math.random() * 101), // Random score for now
          assessmentAnalysis: 'Awaiting analysis.', // Default analysis
        }

        const id = await db.candidates.add(candidate)
        return { id, ...candidate }
      })

      return res(ctx.json(result))
    } catch (e) {
      return res(ctx.status(500), ctx.json({ error: e.message }))
    }
  }),

  rest.get('/api/candidates/:id', async (req, res, ctx) => {
    try {
      const result = await simulateRead(async () => {
        const id = parseInt(req.params.id);
        const candidate = await db.candidates.get(id);
        if (!candidate) {
          throw new Error('Candidate not found');
        }
        return candidate;
      });
      return res(ctx.json(result));
    } catch (e) {
      return res(ctx.status(404), ctx.json({ error: e.message }));
    }
  }),

  rest.patch('/api/candidates/:id', async (req, res, ctx) => {
    try {
      const id = Number(req.params.id)
      const payload = await req.json()
      
      const result = await unreliableWrite(async () => {
        const updateData = {
          ...payload,
          updatedAt: new Date().toISOString()
        }
        
        await db.candidates.update(id, updateData)
        return await db.candidates.get(id)
      })
      
      return res(ctx.json(result))
    } catch (e) {
      return res(ctx.status(500), ctx.json({ error: e.message }))
    }
  }),

  rest.get('/api/assessments/:jobId', async (req, res, ctx) => {
    try {
      const result = await simulateRead(async () => {
        const jobId = Number(req.params.jobId)
        const asst = await db.assessments.where('jobId').equals(jobId).first()
        return asst || { 
          jobId, 
          title: `Assessment for Job ${jobId}`,
          sections: [],
          timeLimit: 60,
          isActive: false
        }
      })
      
      return res(ctx.json(result))
    } catch (e) {
      return res(ctx.status(500), ctx.json({ error: e.message }))
    }
  }),

  rest.get('/api/assessments', async (req, res, ctx) => {
    try {
      const result = await simulateRead(async () => {
        const all = await db.assessments.toArray()
        return { items: all, total: all.length }
      })
      
      return res(ctx.json(result))
    } catch (e) {
      return res(ctx.status(500), ctx.json({ error: e.message }))
    }
  }),

  rest.put('/api/assessments/:jobId', async (req, res, ctx) => {
    try {
      const jobId = Number(req.params.jobId)
      const payload = await req.json()
      
      const result = await unreliableWrite(async () => {
        const toStore = { 
          jobId, 
          ...payload,
          updatedAt: new Date().toISOString()
        }
        
        await db.assessments.put(toStore)
        return toStore
      })
      
      return res(ctx.json(result))
    } catch (e) {
      return res(ctx.status(500), ctx.json({ error: e.message }))
    }
  }),

  rest.post('/api/assessments/:jobId/submit', async (req, res, ctx) => {
    try {
      const result = await unreliableWrite(async () => {
        const jobId = Number(req.params.jobId)
        const payload = await req.json()
        
        // Store assessment submission
        const submission = {
          jobId,
          candidateId: payload.candidateId,
          answers: payload.answers,
          submittedAt: new Date().toISOString(),
          score: Math.floor(Math.random() * 40) + 60 // Random score 60-100
        }
        
        // You could store submissions in a separate table if needed
        return { success: true, score: submission.score }
      })
      
      return res(ctx.json(result))
    } catch (e) {
      return res(ctx.status(500), ctx.json({ error: e.message }))
    }
  }),

  // Job Applications API
  rest.get('/api/applications', async (req, res, ctx) => {
    try {
      const result = await simulateRead(async () => {
        const candidateId = req.url.searchParams.get('candidateId')
        const jobId = req.url.searchParams.get('jobId')
        const page = parseInt(req.url.searchParams.get('page') || '1', 10)
        const pageSize = parseInt(req.url.searchParams.get('pageSize') || '50', 10)

        const all = await db.applications.toArray()
        const filtered = all.filter((app) => {
          const matchesCandidate = candidateId ? app.candidateId === parseInt(candidateId) : true
          const matchesJob = jobId ? app.jobId === parseInt(jobId) : true
          return matchesCandidate && matchesJob
        })

        const start = (page - 1) * pageSize
        return { 
          items: filtered.slice(start, start + pageSize), 
          total: filtered.length 
        }
      })
      
      return res(ctx.json(result))
    } catch (e) {
      return res(ctx.status(500), ctx.json({ error: e.message }))
    }
  }),

  rest.post('/api/applications', async (req, res, ctx) => {
    try {
      const payload = await req.json()
      if (!payload || !payload.jobId || !payload.candidateId) {
        return res(ctx.status(400), ctx.json({ error: 'Job ID and Candidate ID are required' }))
      }

      const result = await unreliableWrite(async () => {
        // Check if application already exists
        const existing = await db.applications
          .where(['jobId', 'candidateId'])
          .equals([payload.jobId, payload.candidateId])
          .first()
        
        if (existing) {
          throw new Error('You have already applied for this job')
        }

        const application = {
          ...payload,
          status: payload.status || 'applied',
          appliedAt: payload.appliedAt || new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        const id = await db.applications.add(application)
        return { id, ...application }
      })

      return res(ctx.json(result))
    } catch (e) {
      return res(ctx.status(500), ctx.json({ error: e.message }))
    }
  }),

  rest.patch('/api/applications/:id', async (req, res, ctx) => {
    try {
      const id = Number(req.params.id)
      const payload = await req.json()
      
      const result = await unreliableWrite(async () => {
        const updateData = {
          ...payload,
          updatedAt: new Date().toISOString()
        }
        
        await db.applications.update(id, updateData)
        return await db.applications.get(id)
      })
      
      return res(ctx.json(result))
    } catch (e) {
      return res(ctx.status(500), ctx.json({ error: e.message }))
    }
  }),

  rest.get('/api/candidates/:id/timeline', async (req, res, ctx) => {
    try {
      const result = await simulateRead(async () => {
        const id = parseInt(req.params.id);
        // Mock timeline data for a candidate
        const timeline = [
          { id: 1, type: 'applied', date: '2025-01-10', description: `Applied for Job #${id}` },
          { id: 2, type: 'screening', date: '2025-01-15', description: 'Screening call scheduled' },
          { id: 3, type: 'interview', date: '2025-01-20', description: 'First interview with Hiring Manager' },
          { id: 4, type: 'assessment', date: '2025-01-22', description: 'Technical assessment completed' },
          { id: 5, type: 'feedback', date: '2025-01-25', description: 'Feedback received from interviewers' },
        ];
        return timeline;
      });
      return res(ctx.json(result));
    } catch (e) {
      return res(ctx.status(404), ctx.json({ error: e.message }));
    }
  })
]
