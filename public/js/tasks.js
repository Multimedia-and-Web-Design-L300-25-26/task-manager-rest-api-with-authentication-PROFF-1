const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const statusMessage = document.getElementById("statusMessage");
const tokenInput = document.getElementById("tokenInput");
const saveTokenButton = document.getElementById("saveTokenButton");
const refreshTasksButton = document.getElementById("refreshTasksButton");
const logoutButton = document.getElementById("logoutButton");

const TOKEN_KEY = "task_manager_token";

const updateStatus = (message, isError = false) => {
  statusMessage.textContent = message;
  statusMessage.style.color = isError ? "#ff91a1" : "#b8c3ff";
};

const getToken = () => localStorage.getItem(TOKEN_KEY);

const request = async (url, options = {}) => {
  const { headers = {}, ...restOptions } = options;

  const response = await fetch(url, {
    ...restOptions,
    headers: {
      "Content-Type": "application/json",
      ...headers
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

const createTaskElement = (task) => {
  const item = document.createElement("li");
  item.className = "task-item";

  const info = document.createElement("div");

  const title = document.createElement("p");
  title.className = "task-title";
  title.textContent = task.title;

  const description = document.createElement("p");
  description.className = "task-desc";
  description.textContent = task.description || "No description";

  info.appendChild(title);
  info.appendChild(description);

  const deleteButton = document.createElement("button");
  deleteButton.className = "danger";
  deleteButton.textContent = "Delete";

  deleteButton.addEventListener("click", async () => {
    try {
      const token = getToken();
      await request(`/api/tasks/${task._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      updateStatus("Task deleted.");
      await loadTasks();
    } catch (error) {
      updateStatus(error.message, true);
    }
  });

  item.appendChild(info);
  item.appendChild(deleteButton);

  return item;
};

const loadTasks = async () => {
  taskList.innerHTML = "";

  try {
    const token = getToken();
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const tasks = await request("/api/tasks", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` }
    });

    if (tasks.length === 0) {
      updateStatus("No tasks found for this user.");
      return;
    }

    tasks.forEach((task) => {
      taskList.appendChild(createTaskElement(task));
    });

    updateStatus(`Loaded ${tasks.length} task(s).`);
  } catch (error) {
    if (error.message.toLowerCase().includes("unauthorized")) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = "/login";
      return;
    }

    updateStatus(error.message, true);
  }
};

taskForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const token = getToken();
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const title = document.getElementById("taskTitle").value.trim();
    const description = document.getElementById("taskDescription").value.trim();

    await request("/api/tasks", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title, description })
    });

    taskForm.reset();
    updateStatus("Task created.");
    await loadTasks();
  } catch (error) {
    updateStatus(error.message, true);
  }
});

saveTokenButton.addEventListener("click", () => {
  const value = tokenInput.value.trim();

  if (!value) {
    updateStatus("Paste a token first.", true);
    return;
  }

  localStorage.setItem(TOKEN_KEY, value);
  updateStatus("Token updated.");
  loadTasks();
});

refreshTasksButton.addEventListener("click", () => {
  loadTasks();
});

logoutButton.addEventListener("click", () => {
  localStorage.removeItem(TOKEN_KEY);
  window.location.href = "/login";
});

const boot = () => {
  const token = getToken();
  if (!token) {
    window.location.href = "/login";
    return;
  }

  tokenInput.value = token;
  loadTasks();
};

boot();
