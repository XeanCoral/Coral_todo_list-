// State Management
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';
let searchQuery = '';

// DOM Elements
const tasksGrid = document.getElementById('tasksGrid');
const fabBtn = document.getElementById('fabBtn');
const addTaskModal = document.getElementById('addTaskModal');
const taskModal = document.getElementById('taskModal');
const closeAddModal = document.getElementById('closeAddModal');
const backBtn = document.getElementById('backBtn');
const taskForm = document.getElementById('taskForm');
const searchInput = document.getElementById('searchInput');
const navItems = document.querySelectorAll('.nav-item');

// Event Listeners
fabBtn.addEventListener('click', openAddModal);
closeAddModal.addEventListener('click', closeAddTaskModal);
backBtn.addEventListener('click', closeTaskModal);
taskForm.addEventListener('submit', handleAddTask);
searchInput.addEventListener('input', handleSearch);

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        navItems.forEach(nav => nav.classList.remove('active'));
        e.currentTarget.classList.add('active');
        currentFilter = e.currentTarget.dataset.view;
        renderTasks();
    });
});

// Open Add Task Modal
function openAddModal() {
    addTaskModal.classList.add('active');
    document.getElementById('taskInput').focus();
}

// Close Add Task Modal
function closeAddTaskModal() {
    addTaskModal.classList.remove('active');
    taskForm.reset();
}

// Close Task Detail Modal
function closeTaskModal() {
    taskModal.classList.remove('active');
}

// Handle Add Task
function handleAddTask(e) {
    e.preventDefault();
    
    const title = document.getElementById('taskInput').value.trim();
    const date = document.getElementById('taskDate').value;
    const priority = document.getElementById('taskPriority').value;
    const notes = document.getElementById('taskNotes').value.trim();

    if (!title) {
        alert('Please enter a task title');
        return;
    }

    const newTask = {
        id: Date.now(),
        title,
        date,
        priority,
        notes,
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.unshift(newTask);
    saveTasks();
    renderTasks();
    closeAddTaskModal();
}

// Handle Search
function handleSearch(e) {
    searchQuery = e.target.value.toLowerCase();
    renderTasks();
}

// Toggle Task Completion
function toggleTaskComplete(taskId, checkbox) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = checkbox.checked;
        saveTasks();
        renderTasks();
    }
}

// Delete Task
function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasks();
        renderTasks();
    }
}

// Show Task Detail
function showTaskDetail(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    let dateFormatted = 'No due date';
    if (task.date) {
        const dateObj = new Date(task.date);
        dateFormatted = dateObj.toLocaleDateString('en-US', { 
            weekday: 'long',
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
        });
    }

    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <div class="detail-item">
            <div class="detail-label">Task Title</div>
            <div class="detail-value">${escapeHtml(task.title)}</div>
        </div>

        ${task.notes ? `
        <div class="detail-item">
            <div class="detail-label">Notes</div>
            <div class="detail-value detail-notes">
                ${escapeHtml(task.notes)}
            </div>
        </div>
        ` : ''}

        ${task.date ? `
        <div class="detail-item">
            <div class="detail-label">Due Date</div>
            <div class="detail-value">${dateFormatted}</div>
        </div>
        ` : ''}

        <div class="detail-item">
            <div class="detail-label">Priority</div>
            <div class="detail-value">
                <span class="task-card-priority ${task.priority}">
                    ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
            </div>
        </div>

        <div class="detail-item">
            <div class="detail-label">Status</div>
            <div class="detail-value">
                ${task.completed ? '✓ Completed' : '○ Pending'}
            </div>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #f0f0f0; display: flex; gap: 10px;">
            <button class="btn-primary" style="flex: 1; background: #e74c3c; margin-top: 0;" onclick="deleteTask(${task.id}); closeTaskModal();">
                <i class="fa-solid fa-trash"></i> Delete Task
            </button>
        </div>
    `;

    taskModal.classList.add('active');
}

// Render Tasks
function renderTasks() {
    let filteredTasks = tasks;

    // Apply filter
    if (currentFilter === 'completed') {
        filteredTasks = filteredTasks.filter(t => t.completed);
    } else if (currentFilter === 'pending') {
        filteredTasks = filteredTasks.filter(t => !t.completed);
    }

    // Apply search
    if (searchQuery) {
        filteredTasks = filteredTasks.filter(t => 
            t.title.toLowerCase().includes(searchQuery) ||
            t.notes.toLowerCase().includes(searchQuery)
        );
    }

    // Clear grid
    tasksGrid.innerHTML = '';

    // Render tasks
    if (filteredTasks.length === 0) {
        tasksGrid.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #999; grid-column: 1 / -1;">
                <i class="fa-solid fa-inbox" style="font-size: 48px; margin-bottom: 20px; opacity: 0.5;"></i>
                <p style="font-size: 16px;">No tasks yet. Create one to get started!</p>
            </div>
        `;
        return;
    }

    filteredTasks.forEach(task => {
        let dateFormatted = '';
        if (task.date) {
            const dateObj = new Date(task.date);
            dateFormatted = dateObj.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric'
            });
        }

        const card = document.createElement('div');
        card.className = `task-card ${task.priority}${task.completed ? ' completed' : ''}`;
        card.innerHTML = `
            <div class="task-card-header">
                <span class="task-card-title">${escapeHtml(task.title)}</span>
                <input type="checkbox" class="task-card-checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTaskComplete(${task.id}, this)">
            </div>

            ${task.date ? `<div class="task-card-date"><i class="fa-solid fa-calendar"></i>${dateFormatted}</div>` : ''}

            <span class="task-card-priority ${task.priority}">
                ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>

            ${task.notes ? `<div class="task-card-description">${escapeHtml(task.notes)}</div>` : ''}

            <div class="task-card-footer">
                <button class="task-card-action" onclick="deleteTask(${task.id})" title="Delete task">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;

        card.addEventListener('click', (e) => {
            if (!e.target.closest('.task-card-checkbox') && !e.target.closest('.task-card-action')) {
                showTaskDetail(task.id);
            }
        });

        tasksGrid.appendChild(card);
    });
}

// Save Tasks to LocalStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initial Render
renderTasks();