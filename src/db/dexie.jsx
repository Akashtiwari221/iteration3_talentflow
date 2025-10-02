import Dexie from 'dexie'

export const db = new Dexie('talentflow_db')

db.version(3).stores({
  jobs: '++id,slug,title,status,order',
  candidates: '++id,name,email,stage,jobId,[email+jobId]',
  assessments: '++id,jobId',
  applications: '++id,jobId,candidateId,[jobId+candidateId],status'
})

export async function ensureSeed(seedFn) {
  try {
    console.log('🔍 Ensuring seed data...');
    // For development, let's clear and re-seed every time.
    await db.delete();
    await db.open();
    console.log('🌱 Database cleared, creating new seed data...');
    await seedFn(db);
    console.log('✅ Seed data creation completed');
  } catch (error) {
    console.error('❌ Error in ensureSeed:', error);
  }
}
