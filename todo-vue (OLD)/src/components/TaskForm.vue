<!--
  TASK FORM COMPONENT: Reusable input for adding new tasks

  COMPONENT COMMUNICATION PATTERN:
  - This component is a CHILD of TodoView
  - Child doesn't directly modify parent's data
  - Instead, it EMITS events, and parent decides what to do
  - This is the "props down, events up" pattern - a core Vue principle
-->

<template>
  <div class="input-section">
    <!--
      v-model creates two-way binding with local data 'newTaskText'
      @keypress.enter is Vue's shorthand for "when Enter key is pressed"
    -->
    <input
      type="text"
      v-model="newTaskText"
      @keypress.enter="submitTask"
      placeholder="Enter a new task..."
    />
    <button @click="submitTask" class="btn btn-add">Add Task</button>
  </div>
</template>

<script>
export default {
  name: 'TaskForm',

  // EMITS: Explicitly declares what events this component can emit
  // This is optional but good practice - makes the component's API clear
  emits: ['add-task'],

  data() {
    return {
      newTaskText: ''  // Local state for the input field
    }
  },

  methods: {
    submitTask() {
      const text = this.newTaskText.trim()

      // Don't emit empty tasks
      if (!text) {
        alert('Please enter a task!')
        return
      }

      // EMIT: Send data to parent component
      // Parent (TodoView) listens with @add-task="handleAddTask"
      this.$emit('add-task', text)

      // Clear input after submitting
      this.newTaskText = ''
    }
  }
}
</script>

<style scoped>
/* Styles scoped to only this component */
.input-section {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

input:focus {
  outline: none;
  border-color: #4CAF50;
}

.btn-add {
  background: #4CAF50;
  color: white;
}

.btn-add:hover {
  background: #45a049;
}
</style>
