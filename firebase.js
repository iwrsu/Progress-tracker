const firebaseConfig = {

  apiKey: "AIzaSyBZoWEkvbT_NhIOoEye8dZA4fbrCc4VbUk",

  authDomain: "dashboard-1b866.firebaseapp.com",

  projectId: "dashboard-1b866",

  storageBucket: "dashboard-1b866.firebasestorage.app",

  messagingSenderId: "245705220261",

  appId: "1:245705220261:web:91c26c131c699dcbe26d4c",

  measurementId: "G-0P1C6TXHSG"

};


// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Default user (replace with auth.uid if using multiple users)
const userDoc = db.collection("users").doc("currentUser");

// ======= FUNCTIONS =======

// Save username
function saveUsername(username) {
  userDoc.set({ username: username }, { merge: true });
}

// Load username
function loadUsername() {
  userDoc.get().then(doc => {
    if (doc.exists && doc.data().username) {
      document.getElementById("usernameInput").value = doc.data().username;
    }
  });
}

// Save task list (example: tasks = [{name: "Task 1", done: false}, ...])
function saveTasks(tasks) {
  userDoc.set({ tasks: tasks }, { merge: true });
}

// Load tasks
function loadTasks() {
  userDoc.get().then(doc => {
    if (doc.exists && doc.data().tasks) {
      const tasks = doc.data().tasks;
      const container = document.getElementById("tasksContainer");
      container.innerHTML = "";
      tasks.forEach((task, index) => {
        const div = document.createElement("div");
        div.className = "task-item" + (task.done ? " completed" : "");
        div.innerHTML = `
          <input type="checkbox" class="task-checkbox" ${task.done ? "checked" : ""} data-index="${index}">
          <span class="task-label">${task.name}</span>
        `;
        container.appendChild(div);
      });
    }
  });
}

// Add a new task
function addTask(name) {
  userDoc.get().then(doc => {
    let tasks = doc.exists && doc.data().tasks ? doc.data().tasks : [];
    tasks.push({ name: name, done: false });
    saveTasks(tasks);
    loadTasks();
  });
}

// Toggle task done/undone
document.addEventListener("change", (e) => {
  if (e.target.classList.contains("task-checkbox")) {
    const index = e.target.dataset.index;
    userDoc.get().then(doc => {
      let tasks = doc.exists && doc.data().tasks ? doc.data().tasks : [];
      tasks[index].done = e.target.checked;
      saveTasks(tasks);
      loadTasks();
    });
  }
});

// Initial load
window.onload = () => {
  loadUsername();
  loadTasks();
};
