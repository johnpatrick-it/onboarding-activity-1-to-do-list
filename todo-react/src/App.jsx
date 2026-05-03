// ROOT COMPONENT: The main React component (like your old App.vue)
// This will hold our router and all other components

import React, { useState } from 'react'
import TaskFilter from './components/TaskFilter.jsx'

function App() {
  // REACT STATE - Using useState hook!
  // This is like Vue's data() { return { currentFilter: 'all' }}
  const [currentFilter, setCurrentFilter] = useState('all')

  // EVENT HANDLER - This function gets called when user clicks filter buttons
  // This is like Vue's methods: { handleFilterChange() {...}}
  const handleFilterChange = (newFilter) => {
    console.log('Filter changed to:', newFilter)  // Let's see it in browser console
    setCurrentFilter(newFilter)
  }

  return (
    <div className="App">
      <h1>React TODO App</h1>
      <p>Testing our first React component:</p>

      {/* USING OUR COMPONENT - passing props and event handler */}
      <TaskFilter
        currentFilter={currentFilter}
        onFilterChange={handleFilterChange}
      />

      <p>Current filter: <strong>{currentFilter}</strong></p>
    </div>
  )
}

export default App