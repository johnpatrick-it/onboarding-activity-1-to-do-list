// Basic Vue app setup
const { createApp } = Vue;

const TodoApp = {
  data() {
    return {
      message: 'Vue.js is working!'
    }
  }
};

// Mount the app
createApp(TodoApp).mount('#app');
