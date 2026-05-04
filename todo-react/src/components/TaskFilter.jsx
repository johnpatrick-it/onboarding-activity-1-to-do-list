// TASK FILTER COMPONENT: Reusable filter buttons (All / Active / Completed)
// REACT VERSION of TaskFilter.vue

import React from 'react'

// REACT FUNCTION COMPONENT - replaces Vue's export default { }
// Props come as a parameter (instead of Vue's props: { } section)
function TaskFilter({ currentFilter, onFilterChange }) {
  // REACT STATE - replaces Vue's data() function
  // In Vue: data() { return { filters: [...] }}
  // In React: useState() hook (but since this doesn't change, just a regular variable)
  const filters = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' }
  ]

  // REACT RETURN - replaces Vue's <template>
  // JSX looks like HTML but it's JavaScript!
  return (
    <div className="filter-section">
      {/* REACT MAP - replaces Vue's v-for */}
      {filters.map((filter) => (
        <button
          key={filter.value}
          className={`filter-btn ${currentFilter === filter.value ? 'active' : ''}`}
          onClick={() => onFilterChange(filter.value)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}

export default TaskFilter