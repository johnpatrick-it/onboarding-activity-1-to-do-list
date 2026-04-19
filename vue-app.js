const { createApp } = Vue;

const TodoApp = {
  data() {
    return {
      message: 'Vue.js with API service ready!',
      apiService: new ApiService()
    }
  },
  mounted() {
    // Initialize authentication on page load
    requireAuth();
    displayUserInfo();
  }
};

createApp(TodoApp).mount('#app');
