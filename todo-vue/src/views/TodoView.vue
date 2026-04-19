<!--
  TODO VIEW: Main page component that shows the TODO list

  This is the PARENT component. It:
  - Holds the tasks array (single source of truth)
  - Makes all API calls
  - Coordinates child components (TaskForm, TaskFilter, TaskItem)
  - Listens to events from children and responds

  "PROPS DOWN, EVENTS UP" PATTERN:
  - TodoView passes task data DOWN to children via props
  - Children emit events UP to TodoView, which handles them
-->

<template>
  <div class="container">
    <!-- HEADER with user info and logout -->
    <div class="app-header">
      <h1>My To-Do List</h1>
      <div class="user-section">
        <span>{{ userDisplayText }}</span>
        <button @click="handleLogout" class="btn btn-logout">Logout</button>
      </div>
    </div>

    <!--
      TaskForm component - listens for 'add-task' event
      When emitted, handleAddTask runs with the task text as argument
    -->
    <TaskForm @add-task="handleAddTask" />

    <!--
      TaskFilter component - we pass currentFilter DOWN via props
      When user clicks a filter, child emits 'filter-change' event
    -->
    <TaskFilter
      :current-filter="currentFilter"
      @filter-change="setFilter"
    />

    <!-- Empty state - shown when no tasks match filter -->
    <div v-if="filteredTasks.length === 0" class="empty-state">
      No tasks to display
    </div>

    <!--
      Task list - v-for renders a TaskItem for each filtered task
      We pass the task object as a prop, and listen for all three events
    -->
    <ul v-else class="task-list">
      <TaskItem
        v-for="task in filteredTasks"
        :key="task.id"
        :task="task"
        @toggle="handleToggle"
        @delete="handleDelete"
        @update="handleUpdate"
      />
    </ul>

    <!-- Task summary with count and clear completed button -->
    <div class="task-summary">
      <span>{{ taskCountText }}</span>
      <button @click="handleClearCompleted" class="btn btn-clear">
        Clear Completed
      </button>
    </div>
  </div>
</template>

<script>
import { apiService } from '../services/api.js'
import { getUserInfo, logout } from '../services/auth.js'

// Import child components
import TaskForm from '../components/TaskForm.vue'
import TaskFilter from '../components/TaskFilter.vue'
import TaskItem from '../components/TaskItem.vue'

export default {
  name: 'TodoView',

  // Register child components so they can be used in the template
  components: {
    TaskForm,
    TaskFilter,
    TaskItem
  },

  data() {
    return {
      tasks: [],                // Array of task objects from API
      currentFilter: 'all',     // 'all' | 'active' | 'completed'
      userInfo: null            // Current user info from localStorage
    }
  },

  // COMPUTED PROPERTIES: Derived values that auto-update when dependencies change
  computed: {
    // Tasks filtered by current filter setting
    filteredTasks() {
      switch (this.currentFilter) {
        case 'active':
          return this.tasks.filter((t) => !t.completed)
        case 'completed':
          return this.tasks.filter((t) => t.completed)
        default:
          return this.tasks
      }
    },

    // Display string for task count
    taskCountText() {
      const active = this.tasks.filter((t) => !t.completed).length
      const total = this.tasks.length
      return `${active} active / ${total} total`
    },

    // Display string for user info in header
    userDisplayText() {
      return this.userInfo
        ? `Logged in as: ${this.userInfo.username}`
        : 'Loading...'
    }
  },

  // LIFECYCLE: Called after component is mounted to the DOM
  async mounted() {
    this.userInfo = getUserInfo()
    await this.loadTasks()
  },

  methods: {
    // Load all tasks from the API
    async loadTasks() {
      try {
        const apiTodos = await apiService.fetchTodos()
        // Transform API format (title) to our format (text)
        this.tasks = apiTodos.map((todo) => ({
          id: todo.id,
          text: todo.title,
          completed: todo.isCompleted,
          createdAt: todo.createdDate
        }))
      } catch (error) {
        alert('Failed to load todos from server')
        console.error(error)
      }
    },

    // EVENT HANDLER: Called when TaskForm emits 'add-task'
    async handleAddTask(text) {
      try {
        const apiTodo = await apiService.createTodo({
          title: text,
          description: '',
          isCompleted: false
        })

        if (!apiTodo) {
          // 401 Unauthorized - send back to login
          this.$router.push('/login')
          return
        }

        // Add to local array - Vue reactivity updates the UI automatically
        this.tasks.push({
          id: apiTodo.id,
          text: apiTodo.title,
          completed: apiTodo.isCompleted,
          createdAt: apiTodo.createdDate
        })
      } catch (error) {
        alert('Failed to create todo')
        console.error(error)
      }
    },

    // EVENT HANDLER: Called when TaskItem emits 'toggle'
    async handleToggle(id) {
      const task = this.tasks.find((t) => t.id === id)
      if (!task) return

      try {
        const newCompleted = !task.completed
        const apiTodo = await apiService.updateTodo(id, {
          title: task.text,
          description: '',
          isCompleted: newCompleted,
          completedDate: newCompleted ? new Date().toISOString() : null
        })

        if (!apiTodo) {
          this.$router.push('/login')
          return
        }

        task.completed = newCompleted
      } catch (error) {
        alert('Failed to update todo')
        console.error(error)
      }
    },

    // EVENT HANDLER: Called when TaskItem emits 'update' (text edit)
    async handleUpdate(id, newText) {
      const task = this.tasks.find((t) => t.id === id)
      if (!task) return

      try {
        const apiTodo = await apiService.updateTodo(id, {
          title: newText,
          description: '',
          isCompleted: task.completed,
          completedDate: task.completed ? new Date().toISOString() : null
        })

        if (!apiTodo) {
          this.$router.push('/login')
          return
        }

        task.text = newText
      } catch (error) {
        alert('Failed to update todo')
        console.error(error)
      }
    },

    // EVENT HANDLER: Called when TaskItem emits 'delete'
    async handleDelete(id) {
      try {
        const success = await apiService.deleteTodo(id)
        if (success) {
          // Remove from local array - Vue reactivity updates UI
          this.tasks = this.tasks.filter((t) => t.id !== id)
        }
      } catch (error) {
        alert('Failed to delete todo')
        console.error(error)
      }
    },

    // EVENT HANDLER: Called when TaskFilter emits 'filter-change'
    setFilter(filter) {
      this.currentFilter = filter
    },

    // Clear all completed tasks
    async handleClearCompleted() {
      const completedTasks = this.tasks.filter((t) => t.completed)

      if (completedTasks.length === 0) {
        alert('No completed tasks to clear!')
        return
      }

      if (!confirm(`Delete ${completedTasks.length} completed task(s)?`)) {
        return
      }

      try {
        // Delete all completed tasks in parallel
        await Promise.all(
          completedTasks.map((task) => apiService.deleteTodo(task.id))
        )
        // Remove from local array
        this.tasks = this.tasks.filter((t) => !t.completed)
      } catch (error) {
        alert('Failed to clear completed todos')
        console.error(error)
      }
    },

    // Handle logout - clear auth and navigate to login
    handleLogout() {
      if (!confirm('Are you sure you want to logout?')) return

      logout()
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.container {
  background: white;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e0e0e0;
}

.app-header h1 {
  margin: 0;
  color: #333;
  font-size: 28px;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-section span {
  color: #666;
  font-size: 14px;
}

.btn-logout {
  background: #f44336;
  color: white;
  padding: 8px 16px;
  font-size: 14px;
}

.btn-logout:hover {
  background: #da190b;
}

.task-list {
  list-style: none;
  margin-bottom: 20px;
  max-height: 400px;
  overflow-y: auto;
}

.empty-state {
  text-align: center;
  padding: 30px;
  color: #999;
  font-size: 16px;
  margin-bottom: 20px;
}

.task-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #e0e0e0;
}

.task-summary span {
  color: #666;
}

.btn-clear {
  background: #999;
  color: white;
}

.btn-clear:hover {
  background: #777;
}
</style>
