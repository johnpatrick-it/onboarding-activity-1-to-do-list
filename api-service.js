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
