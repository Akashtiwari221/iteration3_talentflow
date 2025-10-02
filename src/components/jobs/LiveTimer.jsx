import React, { useState, useEffect } from 'react'

export default function LiveTimer({ targetDate, onExpired, compact = false }) {
  const [timeLeft, setTimeLeft] = useState(null)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    if (!targetDate) return

    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const target = new Date(targetDate).getTime()
      const difference = target - now

      if (difference <= 0) {
        setIsExpired(true)
        setTimeLeft(null)
        if (onExpired) onExpired()
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeLeft({ days, hours, minutes, seconds })
      setIsExpired(false)
    }

    // Calculate immediately
    calculateTimeLeft()

    // Update every second
    const interval = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(interval)
  }, [targetDate, onExpired])

  if (!targetDate) return null

  if (isExpired) {
    return (
      <div style={{
        color: '#dc3545',
        fontWeight: 'bold',
        fontSize: compact ? '0.8rem' : '0.9rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem'
      }}>
        ⏰ EXPIRED
      </div>
    )
  }

  if (!timeLeft) return null

  const formatTime = () => {
    if (compact) {
      if (timeLeft.days > 0) {
        return `${timeLeft.days}d ${timeLeft.hours}h`
      } else if (timeLeft.hours > 0) {
        return `${timeLeft.hours}h ${timeLeft.minutes}m`
      } else {
        return `${timeLeft.minutes}m ${timeLeft.seconds}s`
      }
    } else {
      const parts = []
      if (timeLeft.days > 0) parts.push(`${timeLeft.days} day${timeLeft.days !== 1 ? 's' : ''}`)
      if (timeLeft.hours > 0) parts.push(`${timeLeft.hours} hour${timeLeft.hours !== 1 ? 's' : ''}`)
      if (timeLeft.minutes > 0) parts.push(`${timeLeft.minutes} minute${timeLeft.minutes !== 1 ? 's' : ''}`)
      if (parts.length === 0) parts.push(`${timeLeft.seconds} second${timeLeft.seconds !== 1 ? 's' : ''}`)
      
      return parts.slice(0, 2).join(', ')
    }
  }

  const getUrgencyColor = () => {
    const totalMinutes = timeLeft.days * 24 * 60 + timeLeft.hours * 60 + timeLeft.minutes
    
    if (totalMinutes < 60) return '#dc3545' // Red - less than 1 hour
    if (totalMinutes < 24 * 60) return '#fd7e14' // Orange - less than 1 day
    if (totalMinutes < 7 * 24 * 60) return '#ffc107' // Yellow - less than 1 week
    return '#28a745' // Green - more than 1 week
  }

  return (
    <div style={{
      color: getUrgencyColor(),
      fontWeight: 'bold',
      fontSize: compact ? '0.8rem' : '0.9rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem'
    }}>
      ⏱️ {formatTime()}
    </div>
  )
}