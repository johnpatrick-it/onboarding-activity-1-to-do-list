# Vue.js TODO App Conversion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert existing vanilla JavaScript TODO app to Vue.js with component-by-component approach for educational learning

**Architecture:** Phase-by-phase conversion maintaining existing HTML structure initially, then progressively introducing Vue directives and finally component architecture. Keep API service and authentication utilities as separate modules.

**Tech Stack:** Vue.js 3 (CDN), existing .NET Core API, JWT authentication, vanilla CSS

---

## File Structure

**Create:**
- `vue-app.js` - Main Vue application 
- `api-service.js` - Extracted API service class
- `components/TodoApp.js` - Root component
- `components/TaskForm.js` - Task input component
- `components/TaskFilter.js` - Filter buttons component  
- `components/TaskList.js` - Task list container
- `components/TaskItem.js` - Individual task component
- `components/` - Directory for components

**Modify:**
- `index.html` - Add Vue CDN and update mounting point
- `style.css` - Minor Vue-specific class additions

**Preserve:**
- `auth.js` - Keep unchanged as utility module
- `login.html`, `register.html`, `login.js`, `register.js` - Authentication pages unchanged
- Existing CSS structure and styling

---

### Task 1: Setup Vue CDN and Basic Integration

**Files:**
- Modify: `index.html:38-40`
- Create: `vue-app.js`

- [ ] **Step 1: Add Vue.js CDN to index.html**

Replace the script tags at the bottom of index.html:

```html
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    <script src="auth.js"></script>
    <script src="vue-app.js"></script>
</body>
```

- [ ] **Step 2: Create basic Vue app structure**

Create `vue-app.js`:

```javascript
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
```

- [ ] **Step 3: Update HTML container for Vue mounting**

Modify `index.html` - change the container div:

```html
<div id="app" class="container">
  <div class="app-header">
    <h1>My To-Do List</h1>
    <div class="user-section">
      <span id="userInfo">{{ message }}</span>
      <button id="logoutBtn" class="btn btn-logout">Logout</button>
    </div>
  </div>
  <!-- rest of existing HTML structure -->
</div>
```

- [ ] **Step 4: Test Vue basic functionality**

Open `index.html` in browser. Expected: Header should show "Vue.js is working!" instead of user info.

- [ ] **Step 5: Commit Vue setup**

```bash
git add index.html vue-app.js
git commit -m "feat: add Vue.js CDN and basic app setup"
```

### Task 2: Extract API Service from script.js

**Files:**
- Create: `api-service.js`
- Modify: `vue-app.js`

- [ ] **Step 1: Create API service module**

Create `api-service.js` - extract ApiService class from script.js with all existing methods (fetchTodos, createTodo, updateTodo, deleteTodo) and authentication headers.

- [ ] **Step 2: Update index.html to include API service**

Add api-service.js to the script tags:

```html
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    <script src="auth.js"></script>
    <script src="api-service.js"></script>
    <script src="vue-app.js"></script>
</body>
```

- [ ] **Step 3: Test API service import**

Update `vue-app.js` to test API service:

```javascript
const { createApp } = Vue;

const TodoApp = {
  data() {
    return {
      message: 'Vue.js with API service ready!',
      apiService: new ApiService()
    }
  }
};

createApp(TodoApp).mount('#app');
```

- [ ] **Step 4: Verify API service works**

Open browser console, run: `window.vueApp = document.getElementById('app').__vue__`
Then: `window.vueApp.apiService` should show ApiService instance.

- [ ] **Step 5: Commit API service extraction**

```bash
git add api-service.js index.html vue-app.js
git commit -m "feat: extract API service from script.js for Vue integration"
```

### Task 3: Convert Tasks Data to Vue Reactivity

**Files:**
- Modify: `vue-app.js`
- Modify: `index.html`

- [ ] **Step 1: Add Vue data properties for tasks**

Update `vue-app.js` with reactive data and mounted lifecycle:

```javascript
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
```

- [ ] **Step 2: Update HTML to show user info from Vue data**

Modify the user info span in `index.html`:

```html
<span id="userInfo">{{ userInfo ? `Logged in as: ${userInfo.username}` : 'Loading...' }}</span>
```

- [ ] **Step 3: Add basic task display using v-for**

Update the task list section in `index.html`:

```html
<ul id="taskList" class="task-list">
  <li v-for="task in tasks" :key="task.id" class="task-item">
    <span>{{ task.text }}</span>
  </li>
</ul>
```

- [ ] **Step 4: Test Vue data reactivity**

Open browser, check:
1. User info displays correctly
2. Tasks load from API and display
3. Vue DevTools shows reactive data

- [ ] **Step 5: Commit Vue data integration**

```bash
git add vue-app.js index.html
git commit -m "feat: convert tasks data to Vue reactivity with API loading"
```

## Plan Complete

Plan complete and saved to `docs/superpowers/plans/2026-04-20-vue-conversion.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?