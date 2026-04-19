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
    // Authentication check
    requireAuth();

    // Display user info
    this.userInfo = getUserInfo();

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
    }
  },

  methods: {
    async loadTasks() {
      try {
        const apiTodos = await this.apiService.fetchTodos();
        // Map API format to front-end format
        this.tasks = apiTodos.map(todo => ({
          id: todo.id,
          text: todo.title,
          completed: todo.isCompleted,
          createdAt: todo.createdDate
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
        this.tasks.push({
          id: apiTodo.id,
          text: apiTodo.title,
          completed: apiTodo.isCompleted,
          createdAt: apiTodo.createdDate
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
    }
  }
};

createApp(TodoApp).mount('#app');
