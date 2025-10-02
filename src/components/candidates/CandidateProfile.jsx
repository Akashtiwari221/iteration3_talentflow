import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

export default function CandidateProfile() {
  const { id } = useParams()
  const [candidate, setCandidate] = useState(null)

  useEffect(() => {
    let mounted = true
    
    fetch(`/api/candidates?page=1&pageSize=1000`)
      .then((r) => r.json())
      .then((d) => {
        if (!mounted) return
        const found = Array.isArray(d.items) 
          ? d.items.find((it) => String(it.id) === String(id)) 
          : null
        setCandidate(found)
      })
      .catch(() => { 
        if (mounted) setCandidate(null) 
      })

    return () => { mounted = false }
  }, [id])

  if (!candidate) return <div className="card">Loading candidate…</div>

  return (
    <div className="card">
      {candidate.name} — {candidate.email}
    </div>
  )
}