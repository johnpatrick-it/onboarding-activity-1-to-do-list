// TASK ITEM COMPONENT: Displays and manages a single task
// REACT VERSION of TaskItem.vue - demonstrates useState, useRef, useEffect

import React, { useState, useRef, useEffect } from 'react'

function TaskItem({ task, onToggle, onDelete, onUpdate }) {
  // MULTIPLE useState HOOKS - replaces Vue's data() with multiple properties
  // In Vue: data() { return { isEditing: false, editText: '' }}
  // In React: separate useState for each piece of state
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState('')

  // useRef - replaces Vue's ref="editInput" for DOM access
  // This gives us direct access to the input element
  const editInputRef = useRef(null)

  // useEffect - replaces Vue's $nextTick
  // Runs AFTER the component re-renders
  // The [isEditing] dependency means "run this when isEditing changes"
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [isEditing])

  // Enter edit mode - replaces Vue's startEdit method
  const startEdit = () => {
    setEditText(task.text)
    setIsEditing(true)
    // Notice: no more $nextTick - useEffect handles the focus automatically!
  }

  // Save changes - emit update to parent
  const saveEdit = () => {
    const newText = editText.trim()

    if (!newText) {
      alert('Task cannot be empty!')
      return
    }

    // Call parent function - replaces Vue's $emit('update', ...)
    onUpdate(task.id, newText)
    setIsEditing(false)
  }

  // Cancel edit - revert to display mode
  const cancelEdit = () => {
    setIsEditing(false)
    setEditText('')
  }

  // Confirm before deleting
  const confirmDelete = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      onDelete(task.id)
    }
  }

  // Handle keyboard shortcuts in edit mode
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') saveEdit()
    if (e.key === 'Escape') cancelEdit()
  }

  return (
    <li className={`task-item ${task.completed ? 'completed' : ''}`}>
      {/* CHECKBOX: Toggle task completion */}
      <input
        type="checkbox"
        className="task-checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
      />

      {/* CONDITIONAL RENDERING - replaces Vue's v-if */}
      {/* In Vue: v-if="!isEditing" */}
      {/* In React: {!isEditing && (<element>)} OR ternary operator */}
      {!isEditing ? (
        <span className="task-text">{task.text}</span>
      ) : (
        <input
          ref={editInputRef}
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onKeyDown={handleKeyDown}
          className="task-input"
          type="text"
        />
      )}

      <div className="task-actions">
        {/* CONDITIONAL RENDERING WITH TERNARY - show different buttons based on mode */}
        {!isEditing ? (
          <>
            <button onClick={startEdit} className="btn-edit">Edit</button>
            <button onClick={confirmDelete} className="btn-delete">Delete</button>
          </>
        ) : (
          <>
            <button onClick={saveEdit} className="btn-save">Save</button>
            <button onClick={cancelEdit} className="btn-cancel">Cancel</button>
          </>
        )}
      </div>
    </li>
  )
}

export default TaskItem