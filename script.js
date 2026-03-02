// Task Manager Class
class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.cacheDOMElements();
        this.bindEvents();
        this.render();
    }
    // MY CACHEC
    cacheDOMElements() {
        this.taskInput = document.getElementById('taskInput');
        this.addBtn = document.getElementById('addBtn');
        this.taskList = document.getElementById('taskList');
        this.taskCount = document.getElementById('taskCount');
        this.clearCompletedBtn = document.getElementById('clearCompleted');
        this.filterBtns = document.querySelectorAll('.filter-btn');
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
    }
    
//MY CRUDE OPERATIONS
    // CREATE - Add new task
    addTask() {
        const text = this.taskInput.value.trim();
        if (!text) {
            alert('Please enter a task!');
            return;
        }

        const task = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(task);
        this.saveTasks();
        this.render();
        this.taskInput.value = '';
        this.taskInput.focus();
    }

    // READ - Load tasks from Local Storage
    loadTasks() {
        const tasksJSON = localStorage.getItem('tasks');
        return tasksJSON ? JSON.parse(tasksJSON) : [];
    }

    // UPDATE - Save tasks to Local Storage
    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    // UPDATE - Toggle task completion
    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
        }
    }

    // UPDATE - Edit task text
    editTask(id, newText) {
        const task = this.tasks.find(t => t.id === id);
        if (task && newText.trim()) {
            task.text = newText.trim();
            this.saveTasks();
            this.render();
        }
    }

    // DELETE - Remove task
    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks();
        this.render();
    }

    // DELETE - Clear all completed tasks
    clearCompleted() {
        const completedCount = this.tasks.filter(t => t.completed).length;
        if (completedCount === 0) {
            alert('No completed tasks to clear!');
            return;
        }

        if (confirm(`Delete ${completedCount} completed task(s)?`)) {
            this.tasks = this.tasks.filter(t => !t.completed);
            this.saveTasks();
            this.render();
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
        return `
            <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${this.escapeHTML(task.text)}</span>
                <input type="text" class="task-input" value="${this.escapeHTML(task.text)}">
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

        // Enter key to save edit
        document.querySelectorAll('.task-input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.saveEdit(e.target.closest('.task-item'));
                }
            });
        });
    }

    enterEditMode(taskItem) {
        const taskText = taskItem.querySelector('.task-text');
        const taskInput = taskItem.querySelector('.task-input');
        const editBtn = taskItem.querySelector('.btn-edit');
        const deleteBtn = taskItem.querySelector('.btn-delete');
        const saveBtn = taskItem.querySelector('.btn-save');
        const cancelBtn = taskItem.querySelector('.btn-cancel');

        taskText.classList.add('editing');
        taskInput.classList.add('active');
        editBtn.style.display = 'none';
        deleteBtn.style.display = 'none';
        saveBtn.style.display = 'inline-block';
        cancelBtn.style.display = 'inline-block';
        taskInput.focus();
        taskInput.select();
    }

    saveEdit(taskItem) {
        const id = parseInt(taskItem.dataset.id);
        const taskInput = taskItem.querySelector('.task-input');
        const newText = taskInput.value.trim();

        if (!newText) {
            alert('Task cannot be empty!');
            return;
        }

        this.editTask(id, newText);
    }

    cancelEdit(taskItem) {
        const taskText = taskItem.querySelector('.task-text');
        const taskInput = taskItem.querySelector('.task-input');
        const editBtn = taskItem.querySelector('.btn-edit');
        const deleteBtn = taskItem.querySelector('.btn-delete');
        const saveBtn = taskItem.querySelector('.btn-save');
        const cancelBtn = taskItem.querySelector('.btn-cancel');

        taskText.classList.remove('editing');
        taskInput.classList.remove('active');
        editBtn.style.display = 'inline-block';
        deleteBtn.style.display = 'inline-block';
        saveBtn.style.display = 'none';
        cancelBtn.style.display = 'none';

        // Reset input value to original
        const task = this.tasks.find(t => t.id === parseInt(taskItem.dataset.id));
        taskInput.value = task ? task.text : '';
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
