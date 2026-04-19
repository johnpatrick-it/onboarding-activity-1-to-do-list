const { createApp } = Vue;

const TodoApp = {
  data() {
    return {
      tasks: [],
      apiService: new ApiService(),
      currentFilter: 'all',
      userInfo: null,
      // NEW: Store the text being typed in the input field
      // This enables Vue's two-way data binding with v-model directive
      // Instead of reading input.value in vanilla JS, Vue keeps this synced automatically
      newTaskText: ''
    }
  },

  async mounted() {
    // AUTHENTICATION: Enhanced auth check with debugging
    // Instead of immediately redirecting, let's check what's happening
    const token = getToken();
    const userInfo = getUserInfo();

    console.log('Vue mounted - Auth check:', {
      hasToken: !!token,
      hasUserInfo: !!userInfo,
      userInfo: userInfo
    });

    // If no token at all, redirect to login
    if (!token) {
      console.log('No token found, redirecting to login');
      window.location.href = 'login.html';
      return;
    }

    // If token exists but userInfo is missing, something's wrong
    if (!userInfo) {
      console.log('Token exists but no userInfo, clearing auth and redirecting');
      logout();
      return;
    }

    // Check token expiration more carefully
    if (userInfo.expiresAt) {
      const expirationDate = new Date(userInfo.expiresAt);
      const now = new Date();
      console.log('Token expiration check:', {
        expiresAt: userInfo.expiresAt,
        expirationDate: expirationDate,
        now: now,
        isExpired: expirationDate < now
      });

      if (expirationDate < now) {
        console.log('Token expired, redirecting to login');
        logout();
        return;
      }
    }

    // Authentication successful - proceed with app initialization
    console.log('Authentication successful, loading app');

    // Display user info in Vue data
    this.userInfo = userInfo;

    // Load tasks from API
    await this.loadTasks();
  },

  // COMPUTED PROPERTIES: These are reactive getters that automatically recalculate
  // when their dependencies change. Unlike methods that run on every call,
  // computed properties are cached and only re-run when their dependencies update.
  computed: {
    // Filter tasks based on currentFilter state
    // This replaces manual DOM manipulation - when currentFilter changes,
    // Vue automatically re-renders the task list with the new filtered results
    filteredTasks() {
      switch (this.currentFilter) {
        case 'active':
          // Show only incomplete tasks
          return this.tasks.filter(t => !t.completed);
        case 'completed':
          // Show only completed tasks
          return this.tasks.filter(t => t.completed);
        default:
          // Show all tasks
          return this.tasks;
      }
    },

    // COMPUTED PROPERTY: Task count display that respects current filter
    // This demonstrates Vue's MULTIPLE DEPENDENCY TRACKING:
    // - Vue detects this uses BOTH this.tasks AND this.currentFilter
    // - When tasks array changes (add/delete/toggle), this automatically recalculates
    // - When currentFilter changes (user clicks filter buttons), this also recalculates
    // - The UI bound to {{ taskCountText }} automatically updates for BOTH changes
    // This shows Vue's power: one computed property reacts to multiple data sources!
    taskCountText() {
      // Switch based on current filter to show context-appropriate counts
      switch (this.currentFilter) {
        case 'active':
          // When viewing active tasks, show only active count
          const activeCount = this.tasks.filter(t => !t.completed).length;
          // Pluralization logic: Use singular "task" when count is 1, otherwise "tasks"
          // This provides proper grammar (e.g., "1 active task" vs "2 active tasks")
          return `${activeCount} active task${activeCount !== 1 ? 's' : ''}`;

        case 'completed':
          // When viewing completed tasks, show only completed count
          const completedCount = this.tasks.filter(t => t.completed).length;
          // Same pluralization pattern for grammatical correctness
          return `${completedCount} completed task${completedCount !== 1 ? 's' : ''}`;

        default: // 'all'
          // When viewing all tasks, show active vs total breakdown
          const active = this.tasks.filter(t => !t.completed).length;
          const total = this.tasks.length;
          return `${active} active / ${total} total`;
      }
    }
  },

  methods: {
    async loadTasks() {
      try {
        const apiTodos = await this.apiService.fetchTodos();
        // Map API format to front-end format
        // VUE REACTIVITY: Adding edit state properties to each task
        // These additional properties enable inline editing functionality
        // isEditing: tracks whether this task is currently being edited
        // editText: stores the temporary text value while editing (before save/cancel)
        this.tasks = apiTodos.map(todo => ({
          id: todo.id,
          text: todo.title,
          completed: todo.isCompleted,
          createdAt: todo.createdDate,
          // Vue's reactivity system tracks these properties too
          // When isEditing changes, Vue automatically shows/hides edit mode UI
          isEditing: false,
          editText: todo.title
        }));
      } catch (error) {
        alert('Failed to load todos from server');
        console.error(error);
      }
    },

    // VUE EVENT HANDLER: Handle adding new tasks
    // This is called by @click on the button and @keypress.enter on the input
    // Vue methods have direct access to 'this' which refers to the Vue instance
    async addTask() {
      // Access the input value through Vue's reactive data (bound via v-model)
      // No need for document.getElementById - Vue keeps newTaskText synced!
      const text = this.newTaskText.trim();

      if (!text) {
        alert('Please enter a task!');
        return;
      }

      try {
        // Call the API service to create a new todo
        const apiTodo = await this.apiService.createTodo({
          title: text,
          description: '',
          isCompleted: false
        });

        if (!apiTodo) return; // Unauthorized handled by API service

        // Add to Vue's reactive tasks array
        // Vue's reactivity system detects this change and automatically updates the DOM
        // No need for createElement, appendChild, or innerHTML manipulation!
        // IMPORTANT: Include edit state properties for consistency with loadTasks
        this.tasks.push({
          id: apiTodo.id,
          text: apiTodo.title,
          completed: apiTodo.isCompleted,
          createdAt: apiTodo.createdDate,
          // New tasks start in non-editing mode
          isEditing: false,
          editText: apiTodo.title
        });

        // Clear the input field by updating Vue data
        // Thanks to v-model, the input element's value automatically updates
        this.newTaskText = '';
      } catch (error) {
        alert('Failed to create todo');
        console.error(error);
      }
    },

    // VUE EVENT HANDLER: Handle filter button clicks
    // Called by @click directive on filter buttons
    // Parameter 'filter' is passed from the template (e.g., @click="setFilter('all')")
    setFilter(filter) {
      // Update Vue's reactive data
      // Vue automatically updates the UI in two ways:
      // 1. The :class binding on buttons updates to show the active state
      // 2. The filteredTasks computed property recalculates and updates the task list
      this.currentFilter = filter;
    },

    // VUE EVENT HANDLER: Handle logout button click
    // Called by @click directive on logout button
    // This integrates Vue with existing auth.js functionality
    handleLogout() {
      if (confirm('Are you sure you want to logout?')) {
        // Call the existing logout function from auth.js
        // This is a good example of Vue working alongside vanilla JS modules
        logout();
      }
    },

    // ========== TASK CRUD OPERATIONS ==========
    // These methods demonstrate core Vue patterns for state management

    // TOGGLE OPERATION: Handle checkbox click to toggle task completion
    // VUE PATTERN: Event handler with parameter
    // Called by: @change="toggleTask(task.id)"
    // This shows how Vue passes parameters from template to method
    async toggleTask(id) {
      // REACTIVE STATE LOOKUP: Find task in the reactive array
      // Unlike vanilla JS where we'd query the DOM, we work with data
      const task = this.tasks.find(t => t.id === id);

      if (task) {
        try {
          // Calculate new completion state
          const newCompleted = !task.completed;

          // API INTEGRATION: Update backend first
          // This ensures data consistency between client and server
          const apiTodo = await this.apiService.updateTodo(id, {
            title: task.text,
            description: '',
            isCompleted: newCompleted,
            completedDate: newCompleted ? new Date().toISOString() : null
          });

          if (!apiTodo) return; // Unauthorized handled by API service

          // VUE REACTIVITY IN ACTION: Direct property assignment
          // In vanilla JS, we'd need to manually update the checkbox and styling
          // With Vue, we just update the data and Vue handles the rest:
          // - Checkbox :checked binding automatically updates
          // - :class="{ completed: task.completed }" automatically adds/removes class
          // - Task count (via computed property) automatically recalculates
          task.completed = newCompleted;
        } catch (error) {
          alert('Failed to update todo');
          console.error(error);
        }
      }
    },

    // DELETE OPERATION: Handle delete button click
    // VUE PATTERN: Event handler with parameter
    // Called by: @click="deleteTask(task.id)"
    async deleteTask(id) {
      // User confirmation before destructive action
      if (confirm('Are you sure you want to delete this task?')) {
        try {
          // API call to delete from backend
          const success = await this.apiService.deleteTodo(id);

          if (success) {
            // VUE REACTIVITY: Array filtering creates new array
            // Vue detects the array replacement and automatically:
            // - Removes the task's <li> element from the DOM
            // - Updates the v-for rendering
            // - Recalculates taskCountText computed property
            // - Updates all UI elements bound to tasks array
            // In vanilla JS, we'd need to manually find and remove the DOM element
            this.tasks = this.tasks.filter(t => t.id !== id);
          }
        } catch (error) {
          alert('Failed to delete todo');
          console.error(error);
        }
      }
    },

    // EDIT OPERATION - START: Enter edit mode for a task
    // VUE PATTERN: Event handler with object parameter
    // Called by: @click="startEdit(task)"
    // Notice we pass the entire task object, not just the ID
    startEdit(task) {
      // VUE REACTIVITY: Direct property assignment
      // Setting isEditing to true triggers Vue's conditional rendering:
      // - v-if="!task.isEditing" hides the display mode
      // - v-if="task.isEditing" shows the edit input and buttons
      // This is much cleaner than manually showing/hiding DOM elements!
      task.isEditing = true;

      // Reset editText to current task text
      // This ensures the input shows the current value when entering edit mode
      task.editText = task.text;
    },

    // EDIT OPERATION - SAVE: Save the edited task text
    // VUE PATTERN: Event handler with object parameter
    // Called by: @click="saveEdit(task)" or @keypress.enter="saveEdit(task)"
    async saveEdit(task) {
      // Validate input
      const newText = task.editText.trim();
      if (!newText) {
        alert('Task cannot be empty!');
        return;
      }

      try {
        // API call to update backend
        const apiTodo = await this.apiService.updateTodo(task.id, {
          title: newText,
          description: '',
          isCompleted: task.completed,
          completedDate: task.completed ? new Date().toISOString() : null
        });

        if (!apiTodo) return; // Unauthorized handled by API service

        // VUE REACTIVITY: Update task properties
        // These assignments trigger Vue to:
        // 1. Update task.text -> display text changes when we exit edit mode
        // 2. Set isEditing to false -> switches from edit mode to display mode
        // Vue's conditional rendering (v-if) automatically swaps the UI
        task.text = newText;
        task.isEditing = false;
      } catch (error) {
        alert('Failed to update todo');
        console.error(error);
      }
    },

    // EDIT OPERATION - CANCEL: Cancel editing without saving
    // VUE PATTERN: Event handler with object parameter
    // Called by: @click="cancelEdit(task)" or @keyup.esc="cancelEdit(task)"
    cancelEdit(task) {
      // VUE REACTIVITY: Exit edit mode
      // Simply setting isEditing to false triggers Vue to:
      // - Hide the edit input and Save/Cancel buttons
      // - Show the task text and Edit/Delete buttons
      // No need to manually manipulate DOM classes or visibility!
      task.isEditing = false;

      // Reset editText to original value
      // This discards any changes made in the input field
      task.editText = task.text;
    },

    // CLEAR COMPLETED OPERATION: Delete all completed tasks
    // VUE PATTERN: Event handler without parameters
    // Called by: @click="clearCompleted"
    // This demonstrates batch operations with Vue reactivity
    async clearCompleted() {
      // Filter to get completed tasks
      const completedTasks = this.tasks.filter(t => t.completed);

      // Validate there are tasks to clear
      if (completedTasks.length === 0) {
        alert('No completed tasks to clear!');
        return;
      }

      // User confirmation before bulk deletion
      if (confirm(`Delete ${completedTasks.length} completed task(s)?`)) {
        try {
          // API INTEGRATION: Delete all completed tasks from backend
          // Promise.all runs all delete operations in parallel
          // This is more efficient than deleting one at a time
          await Promise.all(
            completedTasks.map(task => this.apiService.deleteTodo(task.id))
          );

          // VUE REACTIVITY: Filter out all completed tasks
          // This single assignment triggers Vue to:
          // - Remove all completed task elements from the DOM
          // - Update the v-for loop rendering
          // - Recalculate taskCountText (shows new totals)
          // - Update filteredTasks if we're on 'completed' filter
          // All of this happens automatically with one line of code!
          this.tasks = this.tasks.filter(t => !t.completed);
        } catch (error) {
          alert('Failed to clear completed todos');
          console.error(error);
        }
      }
    }
  }
};

createApp(TodoApp).mount('#app');
