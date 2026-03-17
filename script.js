// API Service Layer - Handles all communication with backend
class ApiService {
    constructor() {
        this.baseUrl = 'http://localhost:5282/api/todos';
    }

    // Get auth headers
    getHeaders() {
        const token = getToken();
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    // Handle 401 Unauthorized responses
    handleUnauthorized(response) {
        if (response.status === 401) {
            logout();
            return true;
        }
        return false;
    }

    // GET: Fetch all todos
    async fetchTodos() {
        try {
            const response = await fetch(this.baseUrl, {
                headers: this.getHeaders()
            });

            if (this.handleUnauthorized(response)) return [];

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const todos = await response.json();
            return todos;
        } catch (error) {
            console.error('Error fetching todos:', error);
            throw error;
        }
    }

    // GET: Fetch single todo by ID
    async fetchTodoById(id) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                headers: this.getHeaders()
            });

            if (this.handleUnauthorized(response)) return null;

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const todo = await response.json();
            return todo;
        } catch (error) {
            console.error('Error fetching todo:', error);
            throw error;
        }
    }

    // POST: Create new todo
    async createTodo(todoData) {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(todoData)
            });

            if (this.handleUnauthorized(response)) return null;

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const newTodo = await response.json();
            return newTodo;
        } catch (error) {
            console.error('Error creating todo:', error);
            throw error;
        }
    }

    // PUT: Update existing todo
    async updateTodo(id, todoData) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(todoData)
            });

            if (this.handleUnauthorized(response)) return null;

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const updatedTodo = await response.json();
            return updatedTodo;
        } catch (error) {
            console.error('Error updating todo:', error);
            throw error;
        }
    }

    // DELETE: Delete todo
    async deleteTodo(id) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });

            if (this.handleUnauthorized(response)) return false;

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return true;
        } catch (error) {
            console.error('Error deleting todo:', error);
            throw error;
        }
    }
}

// Task Manager Class
class TaskManager {
    constructor() {
        this.tasks = [];
        this.apiService = new ApiService();
        this.currentFilter = 'all';
        this.init();
    }

    async init() {
        // AUTHENTICATION CHECK - Redirect to login if not authenticated
        requireAuth();

        // Display user info in header
        displayUserInfo();

        this.cacheDOMElements();
        this.bindEvents();
        await this.loadTasks();
        this.render();
    }

    cacheDOMElements() {
        this.taskInput = document.getElementById('taskInput');
        this.descriptionInput = document.getElementById('descriptionInput');
        this.addBtn = document.getElementById('addBtn');
        this.taskList = document.getElementById('taskList');
        this.taskCount = document.getElementById('taskCount');
        this.clearCompletedBtn = document.getElementById('clearCompleted');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.logoutBtn = document.getElementById('logoutBtn');
    }

    bindEvents() {
        this.addBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });

        // LOGOUT FUNCTIONALITY
        this.logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                logout();
            }
        });
    }

    // CREATE - Add new task
    async addTask() {
        const text = this.taskInput.value.trim();
        const description = this.descriptionInput.value.trim();

        if (!text) {
            alert('Please enter a task!');
            return;
        }

        try {
            const apiTodo = await this.apiService.createTodo({
                title: text,
                description: description,
                isCompleted: false
            });

            if (!apiTodo) return; // Unauthorized handled by API service

            // Add to local array
            this.tasks.push({
                id: apiTodo.id,
                text: apiTodo.title,
                description: apiTodo.description,
                completed: apiTodo.isCompleted,
                createdAt: apiTodo.createdDate
            });
            this.render();
            this.taskInput.value = '';
            this.descriptionInput.value = '';
            this.taskInput.focus();
        } catch (error) {
            alert('Failed to create todo');
            console.error(error);
        }
    }

    // READ - Load tasks from API
    async loadTasks() {
        try {
            const apiTodos = await this.apiService.fetchTodos();
            // Map API format to front-end format
            this.tasks = apiTodos.map(todo => ({
                id: todo.id,
                text: todo.title,
                description: todo.description || '',
                completed: todo.isCompleted,
                createdAt: todo.createdDate
            }));
        } catch (error) {
            alert('Failed to load todos from server');
            console.error(error);
        }
    }

    // UPDATE - Toggle task completion
    async toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            try {
                const newCompleted = !task.completed;
                const apiTodo = await this.apiService.updateTodo(id, {
                    title: task.text,
                    description: task.description || '',
                    isCompleted: newCompleted,
                    completedDate: newCompleted ? new Date().toISOString() : null
                });

                if (!apiTodo) return; // Unauthorized handled by API service

                task.completed = newCompleted;
                this.render();
            } catch (error) {
                alert('Failed to update todo');
                console.error(error);
            }
        }
    }

    // UPDATE - Edit task text and description
    async editTask(id, newText, newDescription) {
        const task = this.tasks.find(t => t.id === id);
        if (task && newText.trim()) {
            try {
                const apiTodo = await this.apiService.updateTodo(id, {
                    title: newText.trim(),
                    description: newDescription?.trim() || '',
                    isCompleted: task.completed,
                    completedDate: task.completed ? new Date().toISOString() : null
                });

                if (!apiTodo) return; // Unauthorized handled by API service

                task.text = newText.trim();
                task.description = newDescription?.trim() || '';
                this.render();
            } catch (error) {
                alert('Failed to update todo');
                console.error(error);
            }
        }
    }

    // DELETE - Remove task
    async deleteTask(id) {
        try {
            const success = await this.apiService.deleteTodo(id);
            if (success) {
                this.tasks = this.tasks.filter(t => t.id !== id);
                this.render();
            }
        } catch (error) {
            alert('Failed to delete todo');
            console.error(error);
        }
    }

    // DELETE - Clear all completed tasks
    async clearCompleted() {
        const completedTasks = this.tasks.filter(t => t.completed);
        if (completedTasks.length === 0) {
            alert('No completed tasks to clear!');
            return;
        }

        if (confirm(`Delete ${completedTasks.length} completed task(s)?`)) {
            try {
                // Delete all completed tasks from API
                await Promise.all(completedTasks.map(task => this.apiService.deleteTodo(task.id)));

                // Update local state
                this.tasks = this.tasks.filter(t => !t.completed);
                this.render();
            } catch (error) {
                alert('Failed to clear completed todos');
                console.error(error);
            }
        }
    }

    // Filter tasks
    setFilter(filter) {
        this.currentFilter = filter;
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.render();
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(t => !t.completed);
            case 'completed':
                return this.tasks.filter(t => t.completed);
            default:
                return this.tasks;
        }
    }

    // Render tasks to DOM
    render() {
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            this.taskList.innerHTML = '<div class="empty-state">No tasks to display</div>';
        } else {
            this.taskList.innerHTML = filteredTasks.map(task => this.createTaskHTML(task)).join('');
        }

        this.updateTaskCount();
        this.attachTaskEventListeners();
    }

    createTaskHTML(task) {
        const descriptionHTML = task.description
            ? `<p class="task-description">${this.escapeHTML(task.description)}</p>`
            : '';

        return `
            <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <div class="task-content">
                    <span class="task-text">${this.escapeHTML(task.text)}</span>
                    ${descriptionHTML}
                </div>
                <div class="task-edit-inputs" style="display:none;">
                    <input type="text" class="task-title-input" value="${this.escapeHTML(task.text)}">
                    <textarea class="task-description-input" rows="2">${this.escapeHTML(task.description || '')}</textarea>
                </div>
                <div class="task-actions">
                    <button class="btn-edit">Edit</button>
                    <button class="btn-delete">Delete</button>
                    <button class="btn-save" style="display:none;">Save</button>
                    <button class="btn-cancel" style="display:none;">Cancel</button>
                </div>
            </li>
        `;
    }

    attachTaskEventListeners() {
        // Checkbox listeners
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const id = parseInt(e.target.closest('.task-item').dataset.id);
                this.toggleTask(id);
            });
        });

        // Edit button listeners
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.enterEditMode(e.target.closest('.task-item'));
            });
        });

        // Delete button listeners
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.closest('.task-item').dataset.id);
                if (confirm('Are you sure you want to delete this task?')) {
                    this.deleteTask(id);
                }
            });
        });

        // Save button listeners
        document.querySelectorAll('.btn-save').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.saveEdit(e.target.closest('.task-item'));
            });
        });

        // Cancel button listeners
        document.querySelectorAll('.btn-cancel').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.cancelEdit(e.target.closest('.task-item'));
            });
        });

        // Enter key to save edit (on title input only)
        document.querySelectorAll('.task-title-input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.saveEdit(e.target.closest('.task-item'));
                }
            });
        });
    }

    enterEditMode(taskItem) {
        const taskContent = taskItem.querySelector('.task-content');
        const taskEditInputs = taskItem.querySelector('.task-edit-inputs');
        const taskTitleInput = taskItem.querySelector('.task-title-input');
        const editBtn = taskItem.querySelector('.btn-edit');
        const deleteBtn = taskItem.querySelector('.btn-delete');
        const saveBtn = taskItem.querySelector('.btn-save');
        const cancelBtn = taskItem.querySelector('.btn-cancel');

        taskContent.style.display = 'none';
        taskEditInputs.style.display = 'block';
        editBtn.style.display = 'none';
        deleteBtn.style.display = 'none';
        saveBtn.style.display = 'inline-block';
        cancelBtn.style.display = 'inline-block';
        taskTitleInput.focus();
        taskTitleInput.select();
    }

    saveEdit(taskItem) {
        const id = parseInt(taskItem.dataset.id);
        const taskTitleInput = taskItem.querySelector('.task-title-input');
        const taskDescriptionInput = taskItem.querySelector('.task-description-input');
        const newText = taskTitleInput.value.trim();
        const newDescription = taskDescriptionInput.value.trim();

        if (!newText) {
            alert('Task title cannot be empty!');
            return;
        }

        this.editTask(id, newText, newDescription);
    }

    cancelEdit(taskItem) {
        const taskContent = taskItem.querySelector('.task-content');
        const taskEditInputs = taskItem.querySelector('.task-edit-inputs');
        const taskTitleInput = taskItem.querySelector('.task-title-input');
        const taskDescriptionInput = taskItem.querySelector('.task-description-input');
        const editBtn = taskItem.querySelector('.btn-edit');
        const deleteBtn = taskItem.querySelector('.btn-delete');
        const saveBtn = taskItem.querySelector('.btn-save');
        const cancelBtn = taskItem.querySelector('.btn-cancel');

        taskContent.style.display = 'block';
        taskEditInputs.style.display = 'none';
        editBtn.style.display = 'inline-block';
        deleteBtn.style.display = 'inline-block';
        saveBtn.style.display = 'none';
        cancelBtn.style.display = 'none';

        // Reset input values to original
        const task = this.tasks.find(t => t.id === parseInt(taskItem.dataset.id));
        if (task) {
            taskTitleInput.value = task.text;
            taskDescriptionInput.value = task.description || '';
        }
    }

    updateTaskCount() {
        const activeCount = this.tasks.filter(t => !t.completed).length;
        const totalCount = this.tasks.length;
        this.taskCount.textContent = `${activeCount} active / ${totalCount} total`;
    }

    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new TaskManager();
});
