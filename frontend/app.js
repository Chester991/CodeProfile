const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : '/api';

let accessToken = localStorage.getItem('accessToken');
let currentUser = null;
let popularUsers = null;
let currentPlatformTab = 'leetcode';

// DOM Elements
const elements = {
  app: document.getElementById('app'),
  loginBtn: document.getElementById('loginBtn'),
  registerBtn: document.getElementById('registerBtn'),
  userMenu: document.getElementById('userMenu'),
  userDisplay: document.getElementById('userDisplay'),
  logoutBtn: document.getElementById('logoutBtn'),
  darkModeToggle: document.getElementById('darkModeToggle'),
  darkModeIcon: document.getElementById('darkModeIcon'),
  authModal: document.getElementById('authModal'),
  modalTitle: document.getElementById('modalTitle'),
  authForm: document.getElementById('authForm'),
  usernameGroup: document.getElementById('usernameGroup'),
  usernameInput: document.getElementById('username'),
  emailInput: document.getElementById('email'),
  passwordInput: document.getElementById('password'),
  platformFields: document.getElementById('platformFields'),
  regLeetcode: document.getElementById('regLeetcode'),
  regCodeforces: document.getElementById('regCodeforces'),
  regCodechef: document.getElementById('regCodechef'),
  heroSection: document.getElementById('heroSection'),
  publicSearchInput: document.getElementById('publicSearchInput'),
  platformSelect: document.getElementById('platformSelect'),
  publicSearchBtn: document.getElementById('publicSearchBtn'),
  publicStatsSection: document.getElementById('publicStatsSection'),
  publicUsername: document.getElementById('publicUsername'),
  publicStatsCard: document.getElementById('publicStatsCard'),
  publicCardHeader: document.getElementById('publicCardHeader'),
  publicPlatformName: document.getElementById('publicPlatformName'),
  publicCardBody: document.getElementById('publicCardBody'),
  popularSection: document.getElementById('popularSection'),
  popularUsersGrid: document.getElementById('popularUsersGrid'),
  dashboard: document.getElementById('dashboard'),
  dashboardUsername: document.getElementById('dashboardUsername'),
  platformForm: document.getElementById('platformForm'),
  leetcodeUsername: document.getElementById('leetcodeUsername'),
  codeforcesUsername: document.getElementById('codeforcesUsername'),
  codechefUsername: document.getElementById('codechefUsername'),
  leetcodeCard: document.getElementById('leetcodeCard'),
  codeforcesCard: document.getElementById('codeforcesCard'),
  codechefCard: document.getElementById('codechefCard'),
  message: document.getElementById('message')
};

let isLoginMode = true;

// Dark Mode Functions
function initDarkMode() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateDarkModeIcon(savedTheme);
}

function toggleDarkMode() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateDarkModeIcon(newTheme);
}

function updateDarkModeIcon(theme) {
  elements.darkModeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// Message Functions
function showMessage(text, type = 'success') {
  elements.message.textContent = text;
  elements.message.className = `message ${type}`;
  elements.message.classList.remove('hidden');

  setTimeout(() => {
    elements.message.classList.add('hidden');
  }, 3000);
}

// UI Update Functions
function updateUI() {
  if (accessToken) {
    elements.loginBtn.classList.add('hidden');
    elements.registerBtn.classList.add('hidden');
    elements.userMenu.classList.remove('hidden');
    elements.userDisplay.textContent = currentUser?.username || 'User';
    elements.heroSection.classList.add('hidden');
    elements.popularSection.classList.add('hidden');
    elements.publicStatsSection.classList.add('hidden');
    loadUserProfile();
  } else {
    elements.loginBtn.classList.remove('hidden');
    elements.registerBtn.classList.remove('hidden');
    elements.userMenu.classList.add('hidden');
    elements.dashboard.classList.add('hidden');
    elements.heroSection.classList.remove('hidden');
    elements.popularSection.classList.remove('hidden');
  }
}

// API Request Function
async function apiRequest(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include'
  });

  const data = await response.json();
  return { status: response.status, data };
}

// Load User Profile
async function loadUserProfile() {
  try {
    const { data } = await apiRequest('/user/profile');

    if (data.success) {
      currentUser = data.user;
      elements.dashboardUsername.textContent = currentUser.username;
      elements.leetcodeUsername.value = currentUser.leetcodeUsername || '';
      elements.codeforcesUsername.value = currentUser.codeforcesUsername || '';
      elements.codechefUsername.value = currentUser.codechefUsername || '';
      elements.dashboard.classList.remove('hidden');
    }
  } catch (error) {
    console.error('Error loading profile:', error);
  }
}

// Authentication Functions
async function authenticate(endpoint, formData) {
  try {
    const { status, data } = await apiRequest(`/auth/${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(formData)
    });

    if (data.success) {
      accessToken = data.accessToken;
      currentUser = data.user;
      localStorage.setItem('accessToken', accessToken);
      closeModal();
      updateUI();
      showMessage(data.message, 'success');
    } else {
      showMessage(data.message, 'error');
    }
  } catch (error) {
    console.error('Authentication error:', error);
    showMessage('Authentication failed. Please try again.', 'error');
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = elements.emailInput.value;
  const password = elements.passwordInput.value;
  await authenticate('login', { email, password });
}

async function handleRegister(e) {
  e.preventDefault();
  const username = elements.usernameInput.value;
  const email = elements.emailInput.value;
  const password = elements.passwordInput.value;
  const leetcodeUsername = elements.regLeetcode.value;
  const codeforcesUsername = elements.regCodeforces.value;
  const codechefUsername = elements.regCodechef.value;

  await authenticate('register', {
    username,
    email,
    password,
    leetcodeUsername,
    codeforcesUsername,
    codechefUsername
  });
}

// Modal Functions
function openModal(mode) {
  isLoginMode = mode === 'login';
  elements.modalTitle.textContent = isLoginMode ? 'Login' : 'Register';
  elements.usernameGroup.style.display = isLoginMode ? 'none' : 'block';
  elements.platformFields.classList.toggle('hidden', isLoginMode);
  elements.authModal.classList.remove('hidden');
}

function closeModal() {
  elements.authModal.classList.add('hidden');
  elements.authForm.reset();
}

// Logout Function
async function handleLogout() {
  try {
    await apiRequest('/auth/logout', { method: 'POST' });
    accessToken = null;
    currentUser = null;
    localStorage.removeItem('accessToken');
    updateUI();
    showMessage('Logged out successfully', 'success');
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// Save Profile Function
async function saveProfile() {
  try {
    const { data } = await apiRequest('/user/profile', {
      method: 'PUT',
      body: JSON.stringify({
        leetcodeUsername: elements.leetcodeUsername.value,
        codeforcesUsername: elements.codeforcesUsername.value,
        codechefUsername: elements.codechefUsername.value
      })
    });

    if (data.success) {
      currentUser = data.user;
      showMessage('Profile saved successfully', 'success');
    } else {
      showMessage(data.message, 'error');
    }
  } catch (error) {
    console.error('Save profile error:', error);
    showMessage('Failed to save profile', 'error');
  }
}

// Public Search Function
async function publicSearch() {
  const username = elements.publicSearchInput.value.trim();
  const platform = elements.platformSelect.value;

  if (!username) {
    showMessage('Please enter a username', 'error');
    return;
  }

  try {
    showMessage(`Fetching ${platform} data...`, 'success');
    const { data } = await apiRequest(`/platform/${platform}/${username}`);

    if (data.success) {
      displayPublicStats(platform, username, data.data);
      showMessage(`${platform} data fetched successfully`, 'success');
    } else {
      showMessage(data.message || 'User not found', 'error');
    }
  } catch (error) {
    console.error('Public search error:', error);
    showMessage('Failed to fetch data', 'error');
  }
}

// Display Public Stats
function displayPublicStats(platform, username, data) {
  elements.publicUsername.textContent = `${username} (${platform})`;
  elements.publicCardHeader.className = `card-header ${platform}`;
  elements.publicPlatformName.textContent = platform.charAt(0).toUpperCase() + platform.slice(1);

  let statsHtml = '';

  if (platform === 'leetcode') {
    statsHtml = `
      <div class="stat-item"><span class="stat-label">Total Solved</span><span class="stat-value">${data.problemsSolved || '-'}</span></div>
      <div class="stat-item"><span class="stat-label">Easy</span><span class="stat-value easy">${data.easySolved || '-'}</span></div>
      <div class="stat-item"><span class="stat-label">Medium</span><span class="stat-value medium">${data.mediumSolved || '-'}</span></div>
      <div class="stat-item"><span class="stat-label">Hard</span><span class="stat-value hard">${data.hardSolved || '-'}</span></div>
      <div class="stat-item"><span class="stat-label">Contest Rating</span><span class="stat-value">${data.contestRating || '-'}</span></div>
    `;
  } else if (platform === 'codeforces') {
    statsHtml = `
      <div class="stat-item"><span class="stat-label">Rating</span><span class="stat-value">${data.rating || '-'}</span></div>
      <div class="stat-item"><span class="stat-label">Max Rating</span><span class="stat-value">${data.maxRating || '-'}</span></div>
      <div class="stat-item"><span class="stat-label">Rank</span><span class="stat-value">${data.rank || '-'}</span></div>
      <div class="stat-item"><span class="stat-label">Contests</span><span class="stat-value">${data.contestsAttended || '-'}</span></div>
      <div class="stat-item"><span class="stat-label">Country</span><span class="stat-value">${data.country || '-'}</span></div>
    `;
  } else if (platform === 'codechef') {
    statsHtml = `
      <div class="stat-item"><span class="stat-label">Rating</span><span class="stat-value">${data.rating || '-'}</span></div>
      <div class="stat-item"><span class="stat-label">Max Rating</span><span class="stat-value">${data.maxRating || '-'}</span></div>
      <div class="stat-item"><span class="stat-label">Stars</span><span class="stat-value">${data.stars || '-'}</span></div>
      <div class="stat-item"><span class="stat-label">Global Rank</span><span class="stat-value">${data.globalRank || '-'}</span></div>
      <div class="stat-item"><span class="stat-label">Fully Solved</span><span class="stat-value">${data.fullySolved || '-'}</span></div>
    `;
  }

  elements.publicCardBody.innerHTML = statsHtml;
  elements.publicStatsSection.classList.remove('hidden');
}

// Load Popular Users
async function loadPopularUsers() {
  try {
    const { data } = await apiRequest('/platform/popular');

    if (data.success) {
      popularUsers = data.data;
      displayPopularUsers(currentPlatformTab);
    }
  } catch (error) {
    console.error('Error loading popular users:', error);
  }
}

// Display Popular Users
function displayPopularUsers(platform) {
  if (!popularUsers || !popularUsers[platform]) return;

  const users = popularUsers[platform];
  elements.popularUsersGrid.innerHTML = users.map(user => `
    <div class="popular-user-card" data-username="${user.username}" data-platform="${platform}">
      <h4>${user.displayName}</h4>
      <p>Click to view stats</p>
    </div>
  `).join('');

  // Add click handlers
  document.querySelectorAll('.popular-user-card').forEach(card => {
    card.addEventListener('click', () => {
      const username = card.dataset.username;
      const platform = card.dataset.platform;
      elements.publicSearchInput.value = username;
      elements.platformSelect.value = platform;
      publicSearch();
    });
  });
}

// Fetch Platform Data (for dashboard)
async function fetchPlatformData(platform) {
  const usernameElements = {
    leetcode: elements.leetcodeUsername,
    codeforces: elements.codeforcesUsername,
    codechef: elements.codechefUsername
  };

  const username = usernameElements[platform].value.trim();

  if (!username) {
    showMessage('Please enter a username first', 'error');
    return;
  }

  try {
    showMessage(`Fetching ${platform} data...`, 'success');
    const { data } = await apiRequest(`/platform/${platform}/${username}`);

    if (data.success) {
      displayPlatformData(platform, data.data);
      showMessage(`${platform} data fetched successfully`, 'success');
    } else {
      showMessage(data.message, 'error');
    }
  } catch (error) {
    console.error(`Fetch ${platform} error:`, error);
    showMessage(`Failed to fetch ${platform} data`, 'error');
  }
}

// Display Platform Data (for dashboard)
function displayPlatformData(platform, data) {
  if (platform === 'leetcode') {
    document.getElementById('leetcodeTotal').textContent = data.problemsSolved || '-';
    document.getElementById('leetcodeEasy').textContent = data.easySolved || '-';
    document.getElementById('leetcodeMedium').textContent = data.mediumSolved || '-';
    document.getElementById('leetcodeHard').textContent = data.hardSolved || '-';
    document.getElementById('leetcodeRating').textContent = data.contestRating || '-';
    elements.leetcodeCard.classList.remove('hidden');
  } else if (platform === 'codeforces') {
    document.getElementById('codeforcesRating').textContent = data.rating || '-';
    document.getElementById('codeforcesMaxRating').textContent = data.maxRating || '-';
    document.getElementById('codeforcesRank').textContent = data.rank || '-';
    document.getElementById('codeforcesContests').textContent = data.contestsAttended || '-';
    document.getElementById('codeforcesCountry').textContent = data.country || '-';
    elements.codeforcesCard.classList.remove('hidden');
  } else if (platform === 'codechef') {
    document.getElementById('codechefRating').textContent = data.rating || '-';
    document.getElementById('codechefMaxRating').textContent = data.maxRating || '-';
    document.getElementById('codechefStars').textContent = data.stars || '-';
    document.getElementById('codechefGlobalRank').textContent = data.globalRank || '-';
    document.getElementById('codechefFullySolved').textContent = data.fullySolved || '-';
    elements.codechefCard.classList.remove('hidden');
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  updateUI();
  loadPopularUsers();

  // Dark mode toggle
  elements.darkModeToggle.addEventListener('click', toggleDarkMode);

  // Auth buttons
  elements.loginBtn.addEventListener('click', () => openModal('login'));
  elements.registerBtn.addEventListener('click', () => openModal('register'));
  elements.logoutBtn.addEventListener('click', handleLogout);

  // Modal
  document.querySelector('.close-modal').addEventListener('click', closeModal);
  elements.authModal.addEventListener('click', (e) => {
    if (e.target === elements.authModal) {
      closeModal();
    }
  });

  // Auth form
  elements.authForm.addEventListener('submit', (e) => {
    if (isLoginMode) {
      handleLogin(e);
    } else {
      handleRegister(e);
    }
  });

  // Public search
  elements.publicSearchBtn.addEventListener('click', publicSearch);
  elements.publicSearchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      publicSearch();
    }
  });

  // Platform tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentPlatformTab = btn.dataset.platform;
      displayPopularUsers(currentPlatformTab);
    });
  });

  // Dashboard platform form
  elements.platformForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveProfile();
  });

  // Fetch buttons
  document.querySelectorAll('.btn-fetch').forEach(btn => {
    btn.addEventListener('click', () => {
      const platform = btn.dataset.platform;
      fetchPlatformData(platform);
    });
  });
});
