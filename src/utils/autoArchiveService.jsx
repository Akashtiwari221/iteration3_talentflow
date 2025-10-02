import { db } from '../db/dexie.jsx'

class AutoArchiveService {
  constructor() {
    this.intervalId = null
    this.isRunning = false
  }

  start() {
    if (this.isRunning) return

    console.log('🤖 Starting auto-archive service...')
    this.isRunning = true
    
    // Check every 30 seconds
    this.intervalId = setInterval(() => {
      this.checkAndArchiveExpiredJobs()
    }, 30000)

    // Also check immediately
    this.checkAndArchiveExpiredJobs()
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.isRunning = false
    console.log('🛑 Auto-archive service stopped')
  }

  async checkAndArchiveExpiredJobs() {
    try {
      const now = new Date().getTime()
      
      // Find all active jobs with auto-archive dates
      const activeJobs = await db.jobs
        .where('status')
        .equals('active')
        .and(job => job.autoArchiveDate !== null)
        .toArray()

      const expiredJobs = activeJobs.filter(job => {
        const archiveTime = new Date(job.autoArchiveDate).getTime()
        return archiveTime <= now
      })

      if (expiredJobs.length > 0) {
        console.log(`🕒 Found ${expiredJobs.length} expired jobs, archiving...`)
        
        for (const job of expiredJobs) {
          await db.jobs.update(job.id, {
            status: 'archived',
            autoArchiveDate: null, // Clear the auto-archive date
            archivedAt: new Date().toISOString(),
            archivedReason: 'Auto-archived due to timer expiration'
          })
          
          console.log(`📦 Auto-archived job: ${job.title}`)
        }

        // Dispatch a custom event to notify components
        window.dispatchEvent(new CustomEvent('jobsAutoArchived', {
          detail: { archivedJobs: expiredJobs }
        }))
      }
    } catch (error) {
      console.error('❌ Error in auto-archive service:', error)
    }
  }

  // Get stats about upcoming auto-archives
  async getUpcomingArchives() {
    try {
      const activeJobs = await db.jobs
        .where('status')
        .equals('active')
        .and(job => job.autoArchiveDate !== null)
        .toArray()

      const now = new Date().getTime()
      
      return activeJobs
        .map(job => ({
          ...job,
          timeUntilArchive: new Date(job.autoArchiveDate).getTime() - now
        }))
        .filter(job => job.timeUntilArchive > 0)
        .sort((a, b) => a.timeUntilArchive - b.timeUntilArchive)
    } catch (error) {
      console.error('❌ Error getting upcoming archives:', error)
      return []
    }
  }
}

// Create a singleton instance
export const autoArchiveService = new AutoArchiveService()

// Auto-start the service when the module is imported
if (typeof window !== 'undefined') {
  // Start the service after a short delay to ensure everything is initialized
  setTimeout(() => {
    autoArchiveService.start()
  }, 2000)

  // Stop the service when the page is about to unload
  window.addEventListener('beforeunload', () => {
    autoArchiveService.stop()
  })
}

export default autoArchiveService