// Firebase imports
import { db } from "./firebaseConfig.js";
import {
  doc, getDoc, setDoc, updateDoc
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

// Global state management
let state = {
    cses: {
        problems: [],
        solved: 0
    },
    codeforces: {
        problems: [],
        contests: 0,
        username: '',
        lastSync: null
    },
    courses: {
        tensorflow: { completed: 0, total: 50 },
        gfg: { completed: 0, total: 32 },
        codingBlocks: { completed: 0, total: 75 }
    },
    routine: {
        days: []
    },
    theme: 'light'
};

// ---------- CSES PROGRESS ----------
const csesBar = document.getElementById("csesBar");
const csesSolved = document.getElementById("csesSolved");
const csesPercent = document.getElementById("csesPercent");
const csesAddBtn = document.getElementById("csesAddBtn");

// Firebase CSES Progress Functions
async function loadCsesProgress() {
  const ref = doc(db, "progress", "cses");
  const snap = await getDoc(ref);
  if (snap.exists()) {
        const { solved, total, initialized } = snap.data();
        // One-time migration/reset to ensure counter is 0 after accidental increments
        if (!initialized) {
            await setDoc(ref, { solved: 0, total: total ?? 400, initialized: true }, { merge: true });
            updateCsesUI(0, total ?? 400);
            state.cses.solved = 0;
            return;
        }
    updateCsesUI(solved, total);
    state.cses.solved = solved;
  } else {
        await setDoc(ref, { solved: 0, total: 400, initialized: true });
    state.cses.solved = 0;
  }
}

function updateCsesUI(solved, total) {
  const percent = Math.round((solved / total) * 100);
  if (csesBar) csesBar.style.width = `${percent}%`;
  if (csesSolved) csesSolved.textContent = solved;
  if (csesPercent) csesPercent.textContent = `${percent}%`;
  
  // Also update dashboard elements
  const csesPercentage = document.getElementById('csesPercentage');
  if (csesPercentage) csesPercentage.textContent = `${percent}%`;
  
  // Update dashboard csesSolved if it's different from the main one
  const dashboardCsesSolved = document.getElementById('csesSolved');
  if (dashboardCsesSolved) dashboardCsesSolved.textContent = solved;
}

async function incrementCses() {
  const ref = doc(db, "progress", "cses");
  const snap = await getDoc(ref);
  let { solved, total } = snap.data();
  solved++;
  if (solved > total) solved = total;
  await updateDoc(ref, { solved });
  updateCsesUI(solved, total);
  state.cses.solved = solved;
}

async function decrementCses() {
  const ref = doc(db, "progress", "cses");
  const snap = await getDoc(ref);
  let { solved, total } = snap.data();
  solved--;
  if (solved < 0) solved = 0;
  await updateDoc(ref, { solved });
  updateCsesUI(solved, total);
  state.cses.solved = solved;
}

async function resetCses() {
  if (confirm('Are you sure you want to reset the CSES counter to 0?')) {
    const ref = doc(db, "progress", "cses");
    await updateDoc(ref, { solved: 0 });
    updateCsesUI(0, 400);
    state.cses.solved = 0;
  }
}

// CSES controls have been removed from UI; listeners intentionally omitted

// ---------- TASKS ----------
const taskList = document.getElementById("taskList");
const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");

async function loadTasks() {
  const ref = doc(db, "data", "tasks");
  const snap = await getDoc(ref);
  if (snap.exists()) renderTasks(snap.data().tasks || []);
  else await setDoc(ref, { tasks: [] });
}

async function saveTasks(tasks) {
  const ref = doc(db, "data", "tasks");
  await setDoc(ref, { tasks });
}

function renderTasks(tasks) {
  if (!taskList) return;
  taskList.innerHTML = "";
  tasks.forEach((t, i) => {
    const div = document.createElement("div");
    div.className = "task" + (t.done ? " done" : "");
    div.innerHTML = `
      <span>${t.text}</span>
      <div>
        <button onclick="toggleTask(${i})">✔</button>
        <button onclick="deleteTask(${i})">🗑</button>
      </div>
    `;
    taskList.appendChild(div);
  });
  window.currentTasks = tasks;
}

window.toggleTask = async (index) => {
  const tasks = window.currentTasks;
  tasks[index].done = !tasks[index].done;
  renderTasks(tasks);
  await saveTasks(tasks);
};

window.deleteTask = async (index) => {
  const tasks = window.currentTasks;
  tasks.splice(index, 1);
  renderTasks(tasks);
  await saveTasks(tasks);
};

if (addTaskBtn && taskInput) {
  addTaskBtn.addEventListener("click", async () => {
    const text = taskInput.value.trim();
    if (!text) return;
    const tasks = window.currentTasks || [];
    tasks.push({ text, done: false });
    taskInput.value = "";
    renderTasks(tasks);
    await saveTasks(tasks);
  });
  
  taskInput.addEventListener("keypress", async (e) => {
    if (e.key === "Enter") {
      const text = taskInput.value.trim();
      if (!text) return;
      const tasks = window.currentTasks || [];
      tasks.push({ text, done: false });
      taskInput.value = "";
      renderTasks(tasks);
      await saveTasks(tasks);
    }
  });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    await loadState();
    await loadCsesProgress();
    await loadTasks();
    setupEventListeners();
    setupTabs();
    updateDashboard();
    setupCourseSliders();
    initializeRoutine();
    applyTheme();
    initializeCodeforcesSync();
});

// Firebase State management functions
async function saveState() {
    try {
        const ref = doc(db, "state", "userState");
        await setDoc(ref, state);
        console.log('State saved to Firebase');
    } catch (error) {
        console.error('Error saving state to Firebase:', error);
    }
}

async function loadState() {
    try {
        const ref = doc(db, "state", "userState");
        const snap = await getDoc(ref);
        if (snap.exists()) {
            const firebaseState = snap.data();
            state = { ...state, ...firebaseState };
            console.log('State loaded from Firebase');
        } else {
            // Initialize with default state
            await saveState();
            console.log('Initialized default state in Firebase');
        }
    } catch (error) {
        console.error('Error loading state from Firebase:', error);
    }
}

// Theme management
function applyTheme() {
    console.log('Applying theme:', state.theme);
    document.body.setAttribute('data-theme', state.theme);
    document.documentElement.setAttribute('data-theme', state.theme);
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = state.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
}

// Event listeners setup
function setupEventListeners() {
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        console.log('Theme toggle button found, adding event listener');
        themeToggle.addEventListener('click', () => {
            console.log('Theme toggle clicked, current theme:', state.theme);
            state.theme = state.theme === 'light' ? 'dark' : 'light';
            console.log('New theme:', state.theme);
            applyTheme();
            saveState();
        });
    } else {
        console.log('Theme toggle button not found');
    }

    // CSES events
    const addCsesBtn = document.getElementById('addCsesProblem');
    if (addCsesBtn) {
        addCsesBtn.addEventListener('click', () => {
            const modal = document.getElementById('csesModal');
            if (modal) {
                modal.style.display = 'block';
            }
        });
    }

    const csesForm = document.getElementById('csesForm');
    if (csesForm) {
        csesForm.addEventListener('submit', handleCsesSubmit);
    }

    const csesSearch = document.getElementById('csesSearch');
    if (csesSearch) {
        csesSearch.addEventListener('input', filterCsesTable);
    }

    const csesFilter = document.getElementById('csesFilter');
    if (csesFilter) {
        csesFilter.addEventListener('change', filterCsesTable);
    }

    // Codeforces events
    const addCfBtn = document.getElementById('addCfProblem');
    if (addCfBtn) {
        addCfBtn.addEventListener('click', () => {
            const modal = document.getElementById('cfModal');
            if (modal) {
                modal.style.display = 'block';
            }
        });
    }

    const cfForm = document.getElementById('cfForm');
    if (cfForm) {
        cfForm.addEventListener('submit', handleCfSubmit);
    }

    const cfSearch = document.getElementById('cfSearch');
    if (cfSearch) {
        cfSearch.addEventListener('input', filterCfTable);
    }

    const cfDivFilter = document.getElementById('cfDivFilter');
    if (cfDivFilter) {
        cfDivFilter.addEventListener('change', filterCfTable);
    }

    const cfProblemFilter = document.getElementById('cfProblemFilter');
    if (cfProblemFilter) {
        cfProblemFilter.addEventListener('change', filterCfTable);
    }

    // Routine events
    const duplicateBtn = document.getElementById('duplicateDay');
    if (duplicateBtn) {
        duplicateBtn.addEventListener('click', duplicateToday);
    }

    const addRoutineBtn = document.getElementById('addRoutineDay');
    if (addRoutineBtn) {
        addRoutineBtn.addEventListener('click', addRoutineDay);
    }

    // Modal close events
    document.querySelectorAll('.close').forEach(close => {
        close.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

// Tab management
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            button.classList.add('active');
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
            
            // Trigger specific tab initialization
            if (targetTab === 'cses') {
                renderCsesTable();
            } else if (targetTab === 'codeforces') {
                renderCfTable();
                updateCodeforcesSync();
            } else if (targetTab === 'routine') {
                renderRoutineDays();
            }
        });
    });
}

// Dashboard functions
function updateDashboard() {
    // CSES Progress
    const csesPercentage = Math.round((state.cses.solved / 400) * 100);
    const csesPercentageEl = document.getElementById('csesPercentage');
    if (csesPercentageEl) {
        csesPercentageEl.textContent = `${csesPercentage}%`;
    }
    
    const csesSolvedEl = document.getElementById('csesSolved');
    if (csesSolvedEl) {
        csesSolvedEl.textContent = state.cses.solved;
    }
    
    // Update progress circle
    const progressCircle = document.querySelector('.progress-circle');
    if (progressCircle) {
        const angle = (csesPercentage / 100) * 360;
        progressCircle.style.background = `conic-gradient(var(--success-color) ${angle}deg, var(--border-color) ${angle}deg)`;
    }

    // Codeforces Stats
    const cfSolvedEl = document.getElementById('cfSolved');
    if (cfSolvedEl) {
        cfSolvedEl.textContent = state.codeforces.problems.length;
    }

    const cfContestsEl = document.getElementById('cfContests');
    if (cfContestsEl) {
        cfContestsEl.textContent = new Set(state.codeforces.problems.map(p => p.contest)).size;
    }

    // Course Progress Mini Bars
    updateCourseMiniProgress('tf', state.courses.tensorflow);
    updateCourseMiniProgress('gfg', state.courses.gfg);
    updateCourseMiniProgress('cb', state.courses.codingBlocks);

    // Today's stats
    updateTodayStats();
}

function updateCourseMiniProgress(prefix, course) {
    const percentage = Math.round((course.completed / course.total) * 100);
    const miniBar = document.getElementById(`${prefix}Mini`);
    if (miniBar) {
        miniBar.style.width = `${percentage}%`;
    }

    const percentEl = document.getElementById(`${prefix}Percent`);
    if (percentEl) {
        percentEl.textContent = `${percentage}%`;
    }
}

function updateTodayStats() {
    const today = new Date().toISOString().split('T')[0];
    const todayRoutine = state.routine.days.find(day => day.date === today);
    
    const todayCompletedEl = document.getElementById('todayCompleted');
    const todayTotalEl = document.getElementById('todayTotal');
    
    if (todayRoutine) {
        const completed = todayRoutine.tasks.filter(task => task.completed).length;
        const total = todayRoutine.tasks.length;
        if (todayCompletedEl) todayCompletedEl.textContent = completed;
        if (todayTotalEl) todayTotalEl.textContent = total;
    } else {
        if (todayCompletedEl) todayCompletedEl.textContent = '0';
        if (todayTotalEl) todayTotalEl.textContent = '0';
    }

    // Calculate streak
    const streak = calculateStreak();
    const streakEl = document.getElementById('currentStreak');
    if (streakEl) {
        streakEl.textContent = streak;
    }
}

function calculateStreak() {
    const sortedDays = state.routine.days
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < sortedDays.length; i++) {
        const dayDate = new Date(sortedDays[i].date);
        const daysDiff = Math.floor((today - dayDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === i) {
            const completed = sortedDays[i].tasks.filter(task => task.completed).length;
            const total = sortedDays[i].tasks.length;
            
            if (completed > 0 && (completed / total) >= 0.5) {
                streak++;
            } else {
                break;
            }
        } else {
            break;
        }
    }
    
    return streak;
}

// CSES Functions
function handleCsesSubmit(e) {
    e.preventDefault();
    
    const nameEl = document.getElementById('csesProblemName');
    const categoryEl = document.getElementById('csesProblemCategory');
    const notesEl = document.getElementById('csesProblemNotes');
    const approachEl = document.getElementById('csesProblemApproach');
    
    if (!nameEl || !categoryEl) return;
    
    const problem = {
        id: Date.now(),
        name: nameEl.value,
        category: categoryEl.value,
        status: 'unsolved',
        notes: notesEl ? notesEl.value : '',
        approach: approachEl ? approachEl.value : '',
        dateAdded: new Date().toISOString()
    };
    
    state.cses.problems.push(problem);
    saveState();
    
    const modal = document.getElementById('csesModal');
    if (modal) {
        modal.style.display = 'none';
    }
    
    const form = document.getElementById('csesForm');
    if (form) {
        form.reset();
    }
    
    renderCsesTable();
    updateCsesProgress();
    updateDashboard();
}

function renderCsesTable() {
    const tbody = document.getElementById('csesTableBody');
    if (!tbody) return;
    
    const searchEl = document.getElementById('csesSearch');
    const filterEl = document.getElementById('csesFilter');
    
    const searchTerm = searchEl ? searchEl.value.toLowerCase() : '';
    const categoryFilter = filterEl ? filterEl.value : 'all';
    
    let filteredProblems = state.cses.problems.filter(problem => {
        const matchesSearch = problem.name.toLowerCase().includes(searchTerm) ||
                            problem.category.toLowerCase().includes(searchTerm) ||
                            (problem.notes && problem.notes.toLowerCase().includes(searchTerm));
        const matchesCategory = categoryFilter === 'all' || problem.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });
    
    tbody.innerHTML = filteredProblems.map(problem => `
        <tr>
            <td>${escapeHtml(problem.name)}</td>
            <td>${escapeHtml(problem.category)}</td>
            <td>
                <span class="status-${problem.status}">${problem.status}</span>
            </td>
            <td title="${escapeHtml(problem.notes)}">${truncateText(problem.notes, 50)}</td>
            <td title="${escapeHtml(problem.approach)}">${truncateText(problem.approach, 50)}</td>
            <td>
                <button class="action-btn ${problem.status === 'solved' ? 'btn-edit' : 'btn-solve'}" 
                        onclick="toggleCsesProblemStatus(${problem.id})">
                    ${problem.status === 'solved' ? 'Unsolve' : 'Solve'}
                </button>
                <button class="action-btn btn-edit" onclick="editCsesProblem(${problem.id})">Edit</button>
                <button class="action-btn btn-delete" onclick="deleteCsesProblem(${problem.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

function filterCsesTable() {
    renderCsesTable();
}

window.toggleCsesProblemStatus = async function(id) {
    const problem = state.cses.problems.find(p => p.id === id);
    if (problem) {
        problem.status = problem.status === 'solved' ? 'unsolved' : 'solved';
        state.cses.solved = state.cses.problems.filter(p => p.status === 'solved').length;
        saveState();
        renderCsesTable();
        await updateCsesProgress();
        updateDashboard();
    }
}

window.editCsesProblem = function(id) {
    const problem = state.cses.problems.find(p => p.id === id);
    if (problem) {
        const nameEl = document.getElementById('csesProblemName');
        const categoryEl = document.getElementById('csesProblemCategory');
        const notesEl = document.getElementById('csesProblemNotes');
        const approachEl = document.getElementById('csesProblemApproach');
        
        if (nameEl) nameEl.value = problem.name;
        if (categoryEl) categoryEl.value = problem.category;
        if (notesEl) notesEl.value = problem.notes;
        if (approachEl) approachEl.value = problem.approach;
        
        // Remove the old problem and show modal for editing
        deleteCsesProblem(id);
        
        const modal = document.getElementById('csesModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }
}

window.deleteCsesProblem = async function(id) {
    state.cses.problems = state.cses.problems.filter(p => p.id !== id);
    state.cses.solved = state.cses.problems.filter(p => p.status === 'solved').length;
    saveState();
    renderCsesTable();
    await updateCsesProgress();
    updateDashboard();
}

async function updateCsesProgress() {
    const percentage = Math.round((state.cses.solved / 400) * 100);
    
    const progressFill = document.getElementById('csesProgressFill');
    if (progressFill) {
        progressFill.style.width = `${percentage}%`;
    }
    
    const counter = document.getElementById('csesCounter');
    if (counter) {
        counter.textContent = state.cses.solved;
    }
    
    const progressText = document.getElementById('csesProgressText');
    if (progressText) {
        progressText.textContent = `${percentage}%`;
    }
    
    // Also update Firebase
    const ref = doc(db, "progress", "cses");
    await updateDoc(ref, { solved: state.cses.solved });
}

// Codeforces Functions
function handleCfSubmit(e) {
    e.preventDefault();
    
    const contestEl = document.getElementById('cfContestName');
    const divisionEl = document.getElementById('cfDivision');
    const problemIdEl = document.getElementById('cfProblemId');
    const problemNameEl = document.getElementById('cfProblemNameInput');
    const notesEl = document.getElementById('cfLearningNotes');
    const tricksEl = document.getElementById('cfTricks');
    
    if (!contestEl || !divisionEl || !problemIdEl || !problemNameEl) return;
    
    const problem = {
        id: Date.now(),
        contest: contestEl.value,
        division: divisionEl.value,
        problemId: problemIdEl.value,
        problemName: problemNameEl.value,
        learningNotes: notesEl ? notesEl.value : '',
        tricks: tricksEl ? tricksEl.value : '',
        dateAdded: new Date().toISOString(),
        source: 'manual'
    };
    
    state.codeforces.problems.push(problem);
    saveState();
    
    const modal = document.getElementById('cfModal');
    if (modal) {
        modal.style.display = 'none';
    }
    
    const form = document.getElementById('cfForm');
    if (form) {
        form.reset();
    }
    
    renderCfTable();
    updateDashboard();
}

function renderCfTable() {
    const tbody = document.getElementById('cfTableBody');
    if (!tbody) return;
    
    const searchEl = document.getElementById('cfSearch');
    const divFilterEl = document.getElementById('cfDivFilter');
    const problemFilterEl = document.getElementById('cfProblemFilter');
    
    const searchTerm = searchEl ? searchEl.value.toLowerCase() : '';
    const divFilter = divFilterEl ? divFilterEl.value : 'all';
    const problemFilter = problemFilterEl ? problemFilterEl.value : 'all';
    
    let filteredProblems = state.codeforces.problems.filter(problem => {
        const matchesSearch = problem.contest.toLowerCase().includes(searchTerm) ||
                            problem.problemName.toLowerCase().includes(searchTerm) ||
                            (problem.learningNotes && problem.learningNotes.toLowerCase().includes(searchTerm));
        const matchesDiv = divFilter === 'all' || problem.division === divFilter;
        const matchesProblem = problemFilter === 'all' || problem.problemId === problemFilter;
        return matchesSearch && matchesDiv && matchesProblem;
    });
    
    tbody.innerHTML = filteredProblems.map(problem => `
        <tr>
            <td>${escapeHtml(problem.contest)} ${problem.source === 'api' ? '<span style="color: var(--success-color); font-size: 0.8em;">🔄 Auto</span>' : ''}</td>
            <td>${escapeHtml(problem.division)}</td>
            <td><strong>${escapeHtml(problem.problemId)}</strong></td>
            <td>${escapeHtml(problem.problemName)}</td>
            <td title="${escapeHtml(problem.learningNotes)}">${truncateText(problem.learningNotes, 50)}</td>
            <td title="${escapeHtml(problem.tricks)}">${truncateText(problem.tricks, 50)}</td>
            <td>
                <button class="action-btn btn-edit" onclick="editCfProblem(${problem.id})">Edit</button>
                <button class="action-btn btn-delete" onclick="deleteCfProblem(${problem.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

function filterCfTable() {
    renderCfTable();
}

window.editCfProblem = function(id) {
    const problem = state.codeforces.problems.find(p => p.id === id);
    if (problem) {
        const contestEl = document.getElementById('cfContestName');
        const divisionEl = document.getElementById('cfDivision');
        const problemIdEl = document.getElementById('cfProblemId');
        const problemNameEl = document.getElementById('cfProblemNameInput');
        const notesEl = document.getElementById('cfLearningNotes');
        const tricksEl = document.getElementById('cfTricks');
        
        if (contestEl) contestEl.value = problem.contest;
        if (divisionEl) divisionEl.value = problem.division;
        if (problemIdEl) problemIdEl.value = problem.problemId;
        if (problemNameEl) problemNameEl.value = problem.problemName;
        if (notesEl) notesEl.value = problem.learningNotes;
        if (tricksEl) tricksEl.value = problem.tricks;
        
        deleteCfProblem(id);
        
        const modal = document.getElementById('cfModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }
}

window.deleteCfProblem = function(id) {
    state.codeforces.problems = state.codeforces.problems.filter(p => p.id !== id);
    saveState();
    renderCfTable();
    updateDashboard();
}

// Codeforces API Integration
function initializeCodeforcesSync() {
    const cfUsernameEl = document.getElementById('cfUsername');
    const syncBtn = document.getElementById('syncCfBtn');
    
    if (cfUsernameEl && state.codeforces.username) {
        cfUsernameEl.value = state.codeforces.username;
    }
    
    if (cfUsernameEl) {
        cfUsernameEl.addEventListener('change', (e) => {
            state.codeforces.username = e.target.value;
            saveState();
        });
    }
    
    if (syncBtn) {
        syncBtn.addEventListener('click', syncWithCodeforces);
    }
}

function updateCodeforcesSync() {
    const cfUsernameEl = document.getElementById('cfUsername');
    const lastSyncEl = document.getElementById('lastSync');
    
    if (cfUsernameEl && state.codeforces.username) {
        cfUsernameEl.value = state.codeforces.username;
    }
    
    if (lastSyncEl && state.codeforces.lastSync) {
        const lastSync = new Date(state.codeforces.lastSync);
        lastSyncEl.textContent = `Last sync: ${lastSync.toLocaleString()}`;
    } else if (lastSyncEl) {
        lastSyncEl.textContent = 'Never synced';
    }
}

async function syncWithCodeforces() {
    const cfUsernameEl = document.getElementById('cfUsername');
    const syncBtn = document.getElementById('syncCfBtn');
    const syncStatus = document.getElementById('syncStatus');
    
    if (!cfUsernameEl || !cfUsernameEl.value.trim()) {
        showNotification('Please enter your Codeforces username', 'error');
        return;
    }
    
    const username = cfUsernameEl.value.trim();
    state.codeforces.username = username;
    
    // Update UI to show loading
    if (syncBtn) {
        syncBtn.disabled = true;
        syncBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';
    }
    
    if (syncStatus) {
        syncStatus.textContent = 'Fetching submissions from Codeforces...';
        syncStatus.style.color = 'var(--primary-color)';
    }
    
    try {
        const response = await fetch(`https://codeforces.com/api/user.status?handle=${username}&from=1&count=10000`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.status !== 'OK') {
            throw new Error(data.comment || 'Failed to fetch data from Codeforces');
        }
        
        const submissions = data.result;
        const solvedProblems = new Map();
        
        // Filter accepted submissions and get unique problems
        submissions
            .filter(sub => sub.verdict === 'OK')
            .forEach(sub => {
                const key = `${sub.problem.contestId}-${sub.problem.index}`;
                if (!solvedProblems.has(key)) {
                    solvedProblems.set(key, {
                        contestId: sub.problem.contestId,
                        contestName: sub.problem.contestId.toString(),
                        problemIndex: sub.problem.index,
                        problemName: sub.problem.name,
                        tags: sub.problem.tags || [],
                        rating: sub.problem.rating || null,
                        solvedAt: new Date(sub.creationTimeSeconds * 1000).toISOString()
                    });
                }
            });
        
        // Add new problems to state
        let newProblemsCount = 0;
        
        solvedProblems.forEach(problem => {
            // Check if problem already exists
            const exists = state.codeforces.problems.some(p => 
                p.contest.includes(problem.contestId.toString()) && 
                p.problemId === problem.problemIndex
            );
            
            if (!exists) {
                const division = getDivisionFromContestId(problem.contestId);
                
                const newProblem = {
                    id: Date.now() + newProblemsCount, // Ensure unique IDs
                    contest: `Contest ${problem.contestId}`,
                    division: division,
                    problemId: problem.problemIndex,
                    problemName: problem.problemName,
                    learningNotes: '',
                    tricks: '',
                    dateAdded: problem.solvedAt,
                    source: 'api',
                    rating: problem.rating,
                    tags: problem.tags
                };
                
                state.codeforces.problems.push(newProblem);
                newProblemsCount++;
            }
        });
        
        // Update sync time and save state
        state.codeforces.lastSync = new Date().toISOString();
        saveState();
        
        // Update UI
        renderCfTable();
        updateDashboard();
        updateCodeforcesSync();
        
        if (syncStatus) {
            syncStatus.textContent = `✅ Successfully synced! Added ${newProblemsCount} new problems.`;
            syncStatus.style.color = 'var(--success-color)';
        }
        
        showNotification(`Sync completed! Added ${newProblemsCount} new problems.`, 'success');
        
    } catch (error) {
        console.error('Codeforces sync error:', error);
        
        if (syncStatus) {
            syncStatus.textContent = `❌ Sync failed: ${error.message}`;
            syncStatus.style.color = 'var(--danger-color)';
        }
        
        showNotification(`Sync failed: ${error.message}`, 'error');
    } finally {
        // Reset button
        if (syncBtn) {
            syncBtn.disabled = false;
            syncBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Sync with Codeforces';
        }
    }
}

function getDivisionFromContestId(contestId) {
    const id = contestId.toString();
    
    // Educational rounds
    if (id.length >= 4 && (id.startsWith('13') || id.startsWith('14') || id.startsWith('15') || id.startsWith('16') || id.startsWith('17') || id.startsWith('18') || id.startsWith('19'))) {
        return 'Educational';
    }
    
    // Div 1 + Div 2 combined rounds (usually 4-digit, higher numbers)
    if (id.length === 4 && parseInt(id) >= 1400) {
        return 'Div. 2';
    }
    
    // Div 3 rounds (usually start with specific patterns)
    if (id.length >= 4 && parseInt(id) >= 1200 && parseInt(id) < 1400) {
        return 'Div. 3';
    }
    
    // Div 4 rounds (newer, usually higher numbers)
    if (parseInt(id) >= 1800) {
        return 'Div. 4';
    }
    
    // Older contests or special formats
    if (parseInt(id) < 1000) {
        return 'Div. 1';
    }
    
    // Default to Div. 2 for most contests
    return 'Div. 2';
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Course Functions
function setupCourseSliders() {
    // TensorFlow
    const tfSlider = document.getElementById('tfSlider');
    if (tfSlider) {
        tfSlider.value = state.courses.tensorflow.completed;
        tfSlider.addEventListener('input', (e) => {
            updateCourseProgress('tensorflow', parseInt(e.target.value), 50);
        });
    }

    // GFG DSA
    const gfgSlider = document.getElementById('gfgSlider');
    if (gfgSlider) {
        gfgSlider.value = state.courses.gfg.completed;
        gfgSlider.addEventListener('input', (e) => {
            updateCourseProgress('gfg', parseInt(e.target.value), 32);
        });
    }

    // Coding Blocks
    const cbSlider = document.getElementById('cbSlider');
    if (cbSlider) {
        cbSlider.value = state.courses.codingBlocks.completed;
        cbSlider.addEventListener('input', (e) => {
            updateCourseProgress('codingBlocks', parseInt(e.target.value), 75);
        });
    }

    // Initialize displays
    updateCourseDisplay('tensorflow', 'tf', 50);
    updateCourseDisplay('gfg', 'gfg', 32);
    updateCourseDisplay('codingBlocks', 'cb', 75);
}

function updateCourseProgress(course, completed, total) {
    state.courses[course].completed = completed;
    saveState();
    
    const prefix = course === 'tensorflow' ? 'tf' : course === 'codingBlocks' ? 'cb' : 'gfg';
    updateCourseDisplay(course, prefix, total);
    updateDashboard();
}

function updateCourseDisplay(course, prefix, total) {
    const completed = state.courses[course].completed;
    const percentage = Math.round((completed / total) * 100);
    
    const progressBar = document.getElementById(`${prefix}Progress`);
    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
    }
    
    const modulesEl = document.getElementById(`${prefix}Modules`);
    if (modulesEl) {
        modulesEl.textContent = completed;
    }
    
    const percentEl = document.getElementById(`${prefix}ProgressPercent`);
    if (percentEl) {
        percentEl.textContent = `${percentage}%`;
    }
}

// Routine Functions
function initializeRoutine() {
    // Add today if not exists
    const today = new Date().toISOString().split('T')[0];
    if (!state.routine.days.find(day => day.date === today)) {
        const dayOfWeek = new Date().getDay();
        const isWeekend = dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0; // Fri, Sat, Sun
        addRoutineDayWithDate(today, isWeekend ? 'grind' : 'regular');
    }
    renderRoutineDays();
}

function addRoutineDay() {
    const today = new Date().toISOString().split('T')[0];
    addRoutineDayWithDate(today, 'regular');
    renderRoutineDays();
}

function duplicateToday() {
    const today = new Date().toISOString().split('T')[0];
    const todayRoutine = state.routine.days.find(day => day.date === today);
    
    if (todayRoutine) {
        // Create tomorrow's routine
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowDate = tomorrow.toISOString().split('T')[0];
        
        const newDay = {
            id: Date.now(),
            date: tomorrowDate,
            type: todayRoutine.type,
            tasks: todayRoutine.tasks.map((task, index) => ({
                id: Date.now() + index + 1, // Ensure unique IDs
                text: task.text,
                completed: false
            }))
        };
        
        // Remove existing tomorrow if exists
        state.routine.days = state.routine.days.filter(day => day.date !== tomorrowDate);
        state.routine.days.push(newDay);
        saveState();
        renderRoutineDays();
    } else {
        // If no today routine exists, create today first
        addRoutineDayWithDate(today, 'regular');
        // Then duplicate
        setTimeout(() => duplicateToday(), 100);
    }
}

function addRoutineDayWithDate(date, type = 'regular') {
    const tasks = type === 'regular' ? [
        { id: 1, text: 'Codeforces Problem A', completed: false },
        { id: 2, text: 'Codeforces Problem B', completed: false },
        { id: 3, text: '2–3 CSES Problems', completed: false },
        { id: 4, text: 'TensorFlow / ML (1 hr)', completed: false },
        { id: 5, text: 'Review Log (write 1 CF trick, 1 CSES concept, 1 ML term)', completed: false }
    ] : [
        { id: 1, text: 'Codeforces Virtual Contest', completed: false },
        { id: 2, text: 'Upsolve all problems', completed: false },
        { id: 3, text: '4–6 CSES Problems', completed: false },
        { id: 4, text: 'TensorFlow Deep Session (Project / Research)', completed: false },
        { id: 5, text: 'Log Learnings', completed: false }
    ];
    
    const newDay = {
        id: Date.now(),
        date: date,
        type: type,
        tasks: tasks
    };
    
    // Remove existing day with same date
    state.routine.days = state.routine.days.filter(day => day.date !== date);
    state.routine.days.push(newDay);
    saveState();
    renderRoutineDays();
}

function renderRoutineDays() {
    const container = document.getElementById('routineContainer');
    if (!container) return;
    
    const sortedDays = state.routine.days.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    container.innerHTML = sortedDays.map(day => `
        <div class="routine-day">
            <div class="day-header">
                <div class="day-date">
                    📅 ${formatDate(day.date)}
                    ${isToday(day.date) ? '<span style="color: var(--success-color);"> (Today)</span>' : ''}
                </div>
                <div class="day-controls">
                    <div class="day-type">
                        <button class="type-btn ${day.type === 'regular' ? 'active' : ''}" 
                                onclick="changeDayType(${day.id}, 'regular')">
                            ☀️ Regular Day
                        </button>
                        <button class="type-btn ${day.type === 'grind' ? 'active' : ''}" 
                                onclick="changeDayType(${day.id}, 'grind')">
                            🔥 Grind Day
                        </button>
                    </div>
                    <button class="remove-day" onclick="removeRoutineDay(${day.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="routine-tasks">
                ${day.tasks.map(task => `
                    <div class="task-item ${task.completed ? 'completed' : ''}">
                        <input type="checkbox" class="task-checkbox" 
                               ${task.completed ? 'checked' : ''}
                               onchange="toggleRoutineTask(${day.id}, ${task.id})">
                        <label class="task-label">${escapeHtml(task.text)}</label>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

window.changeDayType = function(dayId, type) {
    const day = state.routine.days.find(d => d.id === dayId);
    if (day && day.type !== type) {
        day.type = type;
        // Reset tasks based on new type
        day.tasks = type === 'regular' ? [
            { id: 1, text: 'Codeforces Problem A', completed: false },
            { id: 2, text: 'Codeforces Problem B', completed: false },
            { id: 3, text: '2–3 CSES Problems', completed: false },
            { id: 4, text: 'TensorFlow / ML (1 hr)', completed: false },
            { id: 5, text: 'Review Log (write 1 CF trick, 1 CSES concept, 1 ML term)', completed: false }
        ] : [
            { id: 1, text: 'Codeforces Virtual Contest', completed: false },
            { id: 2, text: 'Upsolve all problems', completed: false },
            { id: 3, text: '4–6 CSES Problems', completed: false },
            { id: 4, text: 'TensorFlow Deep Session (Project / Research)', completed: false },
            { id: 5, text: 'Log Learnings', completed: false }
        ];
        saveState();
        renderRoutineDays();
        updateDashboard();
    }
}

window.toggleRoutineTask = function(dayId, taskId) {
    const day = state.routine.days.find(d => d.id === dayId);
    if (day) {
        const task = day.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            saveState();
            updateDashboard();
            // Re-render to show visual update
            renderRoutineDays();
        }
    }
}

window.removeRoutineDay = function(dayId) {
    if (confirm('Are you sure you want to remove this day?')) {
        state.routine.days = state.routine.days.filter(d => d.id !== dayId);
        saveState();
        renderRoutineDays();
        updateDashboard();
    }
}

// Utility Functions
function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return escapeHtml(text);
    return escapeHtml(text.substring(0, maxLength)) + '...';
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
}

function isToday(dateString) {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
}

// Note: Single initialization handled earlier on DOMContentLoaded