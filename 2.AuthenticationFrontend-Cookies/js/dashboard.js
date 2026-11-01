const viewProfileBtn = document.getElementById("viewProfileBtn")
const getUsersBtn = document.getElementById("getUsersBtn")
const logoutBtn = document.getElementById("logoutBtn")

const profileView = document.getElementById("profileView")
const usersView = document.getElementById("usersView")

const message = document.getElementById("message")
const usersContainer = document.getElementById("usersContainer")

let loggedUser = null
let usersLoaded = false

// Initialize dashboard
// Authentication will be checked by the backend
loadLoggedUserProfile()

// Switch dashboard views
function showView(view) {
  const isProfile = view === "profile"

  profileView.hidden = !isProfile
  usersView.hidden = isProfile

  viewProfileBtn.classList.toggle("active", isProfile)
  getUsersBtn.classList.toggle("active", !isProfile)

  viewProfileBtn.setAttribute("aria-pressed", String(isProfile))
  getUsersBtn.setAttribute("aria-pressed", String(!isProfile))
}

// Load profile automatically
async function loadLoggedUserProfile() {
  try {
    const response = await fetch(`${API_BASE_URL}/loggedUserProfileInfo`, {
      method: "GET",
      credentials: "include"
    })

    if (response.status === 401) {
      clearSession()
      return
    }

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || "Failed to load profile")
    }

    loggedUser = result.data

    const { username, userCode, role, createdAt } = loggedUser

    // Welcome section
    document.getElementById("welcomeMessage").textContent = `Welcome back, ${username}!`

    // Account summary
    document.getElementById("summaryUsername").textContent = username
    document.getElementById("summaryUserCode").textContent = userCode
    document.getElementById("profileAvatar").textContent = username.charAt(0).toUpperCase()

    const summaryRole = document.getElementById("summaryRole")
    summaryRole.textContent = role
    summaryRole.hidden = false

    // Profile fields
    document.getElementById("profileUsername").textContent = username
    document.getElementById("profileUserCode").textContent = userCode
    document.getElementById("profileRole").textContent = role
    document.getElementById("profileCreatedAt").textContent = createdAt

    // Show All Users only to admins
    getUsersBtn.hidden = role !== "admin"

    showView("profile")
  } catch (error) {
    console.error(error)

    document.getElementById("summaryUsername").textContent = "Unable to load profile"

    document.getElementById("summaryUserCode").textContent = error.message || "Please try again"
  }
}

// My Profile button
viewProfileBtn.addEventListener("click", () => {
  showView("profile")
})

// All Users button
getUsersBtn.addEventListener("click", async () => {
  if (!loggedUser || loggedUser.role !== "admin") {
    return
  }

  showView("users")

  // Avoid repeated requests when switching tabs
  if (usersLoaded) {
    return
  }

  await loadAllUsers()
})

// Retrieve all users (admin only)
async function loadAllUsers() {
  try {
    getUsersBtn.disabled = true

    message.style.color = ""
    message.textContent = "Loading users..."

    const response = await fetch(`${API_BASE_URL}/getAllUsersList`, {
      method: "GET",
      credentials: "include"
    })

    if (response.status === 401) {
      clearSession()
      return
    }

    const result = await response.json()

    if (response.status === 403) {
      message.textContent = "Access denied"
      message.style.color = "red"
      return
    }

    if (!response.ok) {
      throw new Error(result.message || "Failed to fetch users")
    }

    usersContainer.innerHTML = ""

    const users = result.data

    if (!users.length) {
      message.textContent = "No users found"
      return
    }

    // Create table
    const table = document.createElement("table")
    table.className = "users-table"

    const thead = document.createElement("thead")
    const headerRow = document.createElement("tr")

    ;["User Code", "Username", "Role"].forEach(heading => {
      const th = document.createElement("th")
      th.textContent = heading
      headerRow.appendChild(th)
    })

    thead.appendChild(headerRow)
    table.appendChild(thead)

    const tbody = document.createElement("tbody")

    users.forEach(user => {
      const row = document.createElement("tr")

      ;[user.userCode, user.username, user.role].forEach(value => {
        const td = document.createElement("td")
        td.textContent = value ?? "-"
        row.appendChild(td)
      })

      tbody.appendChild(row)
    })

    table.appendChild(tbody)
    usersContainer.appendChild(table)

    message.textContent = ""
    usersLoaded = true
  } catch (error) {
    console.error(error)
    message.style.color = "red"
    message.textContent = error.message || "Unable to fetch users"
  } finally {
    getUsersBtn.disabled = false
  }
}

// Logout
logoutBtn.addEventListener("click", async () => {
  logoutBtn.disabled = true

  try {
    await logout()
  } finally {
    logoutBtn.disabled = false
  }
})
