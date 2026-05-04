// ROOT COMPONENT: The main React component (like your old App.vue)
// Testing all our components together before building the full app

import React, { useState } from 'react'
import TaskFilter from './components/TaskFilter.jsx'
import TaskForm from './components/TaskForm.jsx'
import TaskItem from './components/TaskItem.jsx'

function App() {
  // STATE - tasks array and filter
  // In Vue: data() { return { tasks: [...], currentFilter: 'all' }}
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Learn React basics', completed: false },
    { id: 2, text: 'Build TaskFilter component', completed: true },
    { id: 3, text: 'Build TaskForm component', completed: true }
  ])
  const [currentFilter, setCurrentFilter] = useState('all')

  // EVENT HANDLER - filter change
  const handleFilterChange = (newFilter) => {
    setCurrentFilter(newFilter)
  }

  // EVENT HANDLER - add new task
  const handleAddTask = (taskText) => {
    const newTask = {
      id: Date.now(),  // Simple unique ID for now
      text: taskText,
      completed: false
    }
    // IMPORTANT: React needs NEW array, not mutation!
    // Vue: this.tasks.push(newTask)
    // React: setTasks([...tasks, newTask])
    setTasks([...tasks, newTask])
  }

  // EVENT HANDLER - toggle task completion
  const handleToggle = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }

  // EVENT HANDLER - update task text
  const handleUpdate = (id, newText) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, text: newText } : task
    ))
  }

  // EVENT HANDLER - delete task
  const handleDelete = (id) => {
    setTasks(tasks.filter(task => task.id !== id))
  }

  // COMPUTED - filter tasks based on currentFilter
  // In Vue: computed: { filteredTasks() {...}}
  // In React: just a regular variable (recalculated every render)
  const filteredTasks = tasks.filter(task => {
    if (currentFilter === 'active') return !task.completed
    if (currentFilter === 'completed') return task.completed
    return true
  })

  return (
    <div className="App">
      <h1>React TODO App</h1>

      <TaskForm onAddTask={handleAddTask} />

      <TaskFilter
        currentFilter={currentFilter}
        onFilterChange={handleFilterChange}
      />

      {/* CONDITIONAL RENDERING - show empty state or task list */}
      {filteredTasks.length === 0 ? (
        <div className="empty-state">No tasks to display</div>
      ) : (
        <ul className="task-list">
          {/* LIST RENDERING - map through tasks */}
          {filteredTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

export default App