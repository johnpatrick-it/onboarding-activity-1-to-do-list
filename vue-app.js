const { createApp } = Vue;

const TodoApp = {
  data() {
    return {
      tasks: [],
      apiService: new ApiService(),
      currentFilter: 'all',
      userInfo: null
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
    }
  }
};

createApp(TodoApp).mount('#app');
