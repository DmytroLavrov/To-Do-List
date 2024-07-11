const todoList = JSON.parse(localStorage.getItem('todoList')) || [];
const todoInput = document.querySelector('.todo-input');
const todoAdd = document.querySelector('.todo-add');
const todoClear = document.querySelector('.todo-clear');
const todoFilters = document.querySelector('.todo-filters');

let currentFilter = 'all';
let editTaskId = null;
let isEditing = false;

renderTodoList();
setActiveFilter();

function renderTodoList() {
  const filteredList = todoList.filter(task => {
    if (currentFilter === 'working') return !task.isCompleted;
    if (currentFilter === 'done') return task.isCompleted;
    return true;
  });

  let todoListHTML = '';

  if (filteredList.length === 0) {
    todoListHTML = '<p class="todo-empty">No tasks found.</p>';
  } else {
    todoListHTML = filteredList.map(task => `
      <li class="todo-task">
        <label for="${task.id}" class="todo-task-container">
          <input type="checkbox" id="${task.id}" ${task.isCompleted ? 'checked' : ''}>
          <div class="${task.isCompleted ? 'completed' : ''} todo-task-name">
            <p>${task.name}</p>
          </div>
          <div class="todo-task-buttons">
            <button class="todo-task-edit">Edit</button>
            <button class="todo-task-delete">Delete</button>
          </div>
        </label>
      </li>
    `).join('');
  }

  document.querySelector('.todo-list').innerHTML = todoListHTML;

  document.querySelectorAll('.todo-task-edit').forEach((editButton, index) => {
    editButton.addEventListener('click', () => editTask(filteredList[index].id));
  });

  document.querySelectorAll('.todo-task-delete').forEach((deleteButton, index) => {
    deleteButton.addEventListener('click', () => deleteTask(filteredList[index].id));
  });

  document.querySelectorAll('.todo-task input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', handleCheckboxChange);
  });
}

todoAdd.addEventListener('click', () => {
  if (editTaskId !== null && isEditing) {
    saveEditedTask();
  } else {
    addTask();
    isEditing = false;
  }
});

todoClear.addEventListener('click', clearTasks);

todoFilters.addEventListener('click', (event) => {
  if (event.target.tagName === 'SPAN') {
    if (editTaskId !== null && isEditing) {
      cancelEdit();
    }
    currentFilter = event.target.id;
    renderTodoList();
    setActiveFilter();
  }
});

function addTask() {
  const taskName = todoInput.value.trim();
  if (taskName === '') {
    alert('Input cannot be empty!');
    return;
  }

  const newId = (todoList.length > 0 ? Math.max(...todoList.map(task => parseInt(task.id))) + 1 : 1).toString();
  todoList.push({ id: newId, name: taskName, isCompleted: false });
  todoInput.value = '';
  renderTodoList();
  saveToStorage();
}

function clearTasks() {
  if (confirm('Are you sure you want to clear all tasks?')) {
    todoList.length = 0;
    renderTodoList();
    saveToStorage();
  }
}

function editTask(taskId) {
  const task = todoList.find(task => task.id === taskId);
  const editButton = document.querySelector(`label[for="${taskId}"] .todo-task-edit`);

  if (editTaskId === taskId) {
    editTaskId = null;
    isEditing = false;
    todoInput.value = '';
    editButton.textContent = 'Edit';
  } else {
    if (editTaskId !== null) {
      const previousEditButton = document.querySelector(`label[for="${editTaskId}"] .todo-task-edit`);
      previousEditButton.textContent = 'Edit';
    }
    todoInput.value = task.name;
    editTaskId = taskId;
    isEditing = true;
    todoInput.focus();
    editButton.textContent = 'Cancel';
  }
}

function saveEditedTask() {
  const task = todoList.find(task => task.id === editTaskId);
  task.name = todoInput.value.trim();
  if (task.name === '') {
    alert('Task name cannot be empty!');
    return;
  }

  const editButton = document.querySelector(`label[for="${editTaskId}"] .todo-task-edit`);
  editButton.textContent = 'Edit';

  editTaskId = null;
  isEditing = false;
  todoInput.value = '';
  renderTodoList();
  saveToStorage();
}

function deleteTask(taskId) {
  const taskIndex = todoList.findIndex(task => task.id === taskId);
  todoList.splice(taskIndex, 1);
  renderTodoList();
  saveToStorage();
}

function handleCheckboxChange(event) {
  if (editTaskId !== null) {
    cancelEdit();
  }

  const taskId = event.target.id;
  const task = todoList.find(task => task.id === taskId);
  task.isCompleted = event.target.checked;

  const taskNameElement = document.querySelector(`label[for="${taskId}"] .todo-task-name`);
  taskNameElement.classList.toggle('completed', task.isCompleted);

  saveToStorage();
}

function cancelEdit() {
  const editButton = document.querySelector(`label[for="${editTaskId}"] .todo-task-edit`);
  editButton.textContent = 'Edit';
  editTaskId = null;
  isEditing = false;
  todoInput.value = '';
}

function setActiveFilter() {
  document.querySelectorAll('.todo-filters span').forEach(span => span.classList.remove('active'));
  document.getElementById(currentFilter).classList.add('active');
}

function saveToStorage() {
  localStorage.setItem('todoList', JSON.stringify(todoList));
}
