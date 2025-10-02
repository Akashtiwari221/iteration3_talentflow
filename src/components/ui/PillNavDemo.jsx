import React, { useState } from 'react'
import PillNav from './PillNav'

const PillNavDemo = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [activeFilter, setActiveFilter] = useState('all')

  const tabItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'reports', label: 'Reports', icon: '📋' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ]

  const filterItems = [
    { id: 'all', label: 'All', badge: '24' },
    { id: 'active', label: 'Active', badge: '18' },
    { id: 'pending', label: 'Pending', badge: '6' },
    { id: 'archived', label: 'Archived' }
  ]

  return (
    <div style={{ padding: '2rem', background: '#f8f9fa' }}>
      <h2>PillNav Component Demo</h2>
      
      <div style={{ marginBottom: '2rem' }}>
        <h3>Basic Navigation</h3>
        <PillNav 
          items={tabItems}
          activeItem={activeTab}
          onItemClick={(item) => setActiveTab(item.id)}
        />
        <p>Active tab: {activeTab}</p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3>With Badges</h3>
        <PillNav 
          items={filterItems}
          activeItem={activeFilter}
          onItemClick={(item) => setActiveFilter(item.id)}
        />
        <p>Active filter: {activeFilter}</p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3>Compact Version</h3>
        <PillNav 
          items={[
            { id: 'edit', label: 'Edit', icon: '✏️' },
            { id: 'delete', label: 'Delete', icon: '🗑️' },
            { id: 'share', label: 'Share', icon: '📤' }
          ]}
          activeItem="edit"
          onItemClick={(item) => console.log('Clicked:', item.id)}
          className="compact"
        />
      </div>
    </div>
  )
}

export default PillNavDemo