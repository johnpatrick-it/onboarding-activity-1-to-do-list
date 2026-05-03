<!--
  TASK ITEM COMPONENT: Displays and manages a single task

  This component demonstrates the most Vue concepts:
  - Props with validation
  - Multiple emits for different events
  - Conditional rendering (v-if) for display/edit modes
  - Local state (isEditing, editText) for UI-only concerns
  - Class binding with objects
-->

<template>
  <li :class="['task-item', { completed: task.completed }]">
    <!-- CHECKBOX: Toggle task completion -->
    <input
      type="checkbox"
      class="task-checkbox"
      :checked="task.completed"
      @change="$emit('toggle', task.id)"
    />

    <!-- DISPLAY MODE: Show task text when not editing -->
    <span v-if="!isEditing" class="task-text">{{ task.text }}</span>

    <!-- EDIT MODE: Show input field when editing -->
    <input
      v-if="isEditing"
      v-model="editText"
      @keypress.enter="saveEdit"
      @keyup.esc="cancelEdit"
      class="task-input"
      type="text"
      ref="editInput"
    />

    <div class="task-actions">
      <!-- DISPLAY MODE BUTTONS: Edit and Delete -->
      <template v-if="!isEditing">
        <button @click="startEdit" class="btn-edit">Edit</button>
        <button @click="confirmDelete" class="btn-delete">Delete</button>
      </template>

      <!-- EDIT MODE BUTTONS: Save and Cancel -->
      <template v-if="isEditing">
        <button @click="saveEdit" class="btn-save">Save</button>
        <button @click="cancelEdit" class="btn-cancel">Cancel</button>
      </template>
    </div>
  </li>
</template>

<script>
export default {
  name: 'TaskItem',

  // PROPS: Task object passed from parent
  props: {
    task: {
      type: Object,
      required: true
    }
  },

  // EMITS: Events this component can fire
  // Parent decides what to do - this component just signals "something happened"
  emits: ['toggle', 'delete', 'update'],

  data() {
    return {
      // Local state for UI-only concerns (not shared with parent)
      isEditing: false,
      editText: ''
    }
  },

  methods: {
    // Enter edit mode - store current text for potential cancel
    startEdit() {
      this.editText = this.task.text
      this.isEditing = true

      // $nextTick waits for Vue to re-render before running code
      // We need this because the input doesn't exist in DOM until v-if shows it
      this.$nextTick(() => {
        if (this.$refs.editInput) {
          this.$refs.editInput.focus()
          this.$refs.editInput.select()
        }
      })
    },

    // Save changes - emit 'update' event to parent
    saveEdit() {
      const newText = this.editText.trim()

      if (!newText) {
        alert('Task cannot be empty!')
        return
      }

      // Emit event with task id and new text - parent handles the API call
      this.$emit('update', this.task.id, newText)
      this.isEditing = false
    },

    // Cancel edit - revert to display mode without saving
    cancelEdit() {
      this.isEditing = false
      this.editText = ''
    },

    // Confirm before deleting
    confirmDelete() {
      if (confirm('Are you sure you want to delete this task?')) {
        this.$emit('delete', this.task.id)
      }
    }
  }
}
</script>

<style scoped>
.task-item {
  background: #f9f9f9;
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.task-item:hover {
  background: #f0f0f0;
}

.task-item.completed {
  opacity: 0.6;
}

.task-item.completed .task-text {
  text-decoration: line-through;
  color: #999;
}

.task-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.task-text {
  flex: 1;
  font-size: 16px;
  color: #333;
  word-break: break-word;
}

.task-input {
  flex: 1;
  padding: 8px;
  border: 2px solid #667eea;
  border-radius: 5px;
  font-size: 16px;
}

.task-actions {
  display: flex;
  gap: 5px;
}

.btn-edit,
.btn-delete,
.btn-save,
.btn-cancel {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: white;
}

.btn-edit {
  background: #2196F3;
}
.btn-edit:hover {
  background: #0b7dda;
}

.btn-delete {
  background: #f44336;
}
.btn-delete:hover {
  background: #da190b;
}

.btn-save {
  background: #4CAF50;
}
.btn-save:hover {
  background: #45a049;
}

.btn-cancel {
  background: #999;
}
.btn-cancel:hover {
  background: #777;
}
</style>
