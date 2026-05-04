// TASK FORM COMPONENT: Reusable input for adding new tasks
// REACT VERSION of TaskForm.vue

import React, { useState } from 'react'

function TaskForm({ onAddTask }) {
  // REACT STATE - replaces Vue's data() function
  // In Vue: data() { return { newTaskText: '' }}
  // In React: useState hook
  const [newTaskText, setNewTaskText] = useState('')

  // EVENT HANDLER - replaces Vue's methods
  const submitTask = () => {
    const text = newTaskText.trim()

    // Don't submit empty tasks
    if (!text) {
      alert('Please enter a task!')
      return
    }

    // CALL PARENT FUNCTION - replaces Vue's $emit
    // In Vue: this.$emit('add-task', text)
    // In React: call the function passed as prop
    onAddTask(text)

    // Clear input after submitting
    setNewTaskText('')
  }

  // HANDLE ENTER KEY - React way of handling keypress
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      submitTask()
    }
  }

  // REACT RETURN - replaces Vue's <template>
  return (
    <div className="input-section">
      {/* CONTROLLED COMPONENT - React's version of v-model */}
      <input
        type="text"
        value={newTaskText}                           // Current value from state
        onChange={(e) => setNewTaskText(e.target.value)}  // Update state when user types
        onKeyPress={handleKeyPress}                  // Handle Enter key
        placeholder="Enter a new task..."
      />
      <button onClick={submitTask} className="btn btn-add">
        Add Task
      </button>
    </div>
  )
}

export default TaskForm