const registerForm = document.getElementById("registerForm")
const usersContainer = document.getElementById("usersContainer")
const addUserBtn = document.getElementById("addUserBtn")
const registerBtn = document.getElementById("registerBtn")
const message = document.getElementById("message")
const modeInputs = document.querySelectorAll('input[name="mode"]')

const jsonUploadContainer = document.getElementById("jsonUploadContainer")
const jsonFileInput = document.getElementById("jsonFile")
const fileInfo = document.getElementById("fileInfo")

const MAX_USERS = 20
const MAX_FILE_SIZE = 1024 * 1024
const roles = ["admin", "employee"]

let registrationMode = "single"

// =====================================
// Create User Input Fields
// =====================================

function createUserFields() {
  const userDiv = document.createElement("div")
  userDiv.className = "user-fields"

  userDiv.innerHTML = `
    <input
      type="text"
      class="username"
      placeholder="Enter username"
      required
    >

    <input
      type="password"
      class="password"
      placeholder="Enter password"
      required
    >

    <select class="role" required>
      <option value="employee">Employee</option>
      <option value="admin">Admin</option>
    </select>

    <button type="button" class="remove-user-btn">
      Remove User
    </button>
  `

  const removeBtn = userDiv.querySelector(".remove-user-btn")

  removeBtn.addEventListener("click", () => {
    if (usersContainer.children.length > 1) {
      userDiv.remove()
      updateButtons()
    }
  })

  usersContainer.appendChild(userDiv)
  updateButtons()
}

// =====================================
// Update Buttons
// =====================================

function updateButtons() {
  const count = usersContainer.children.length

  const isMultiple = registrationMode === "multiple"
  const isJSON = registrationMode === "json"

  addUserBtn.hidden = !isMultiple || count >= MAX_USERS

  if (isJSON) {
    registerBtn.textContent = "Upload & Register Users"
  } else if (isMultiple) {
    registerBtn.textContent = `Register ${count} Users`
  } else {
    registerBtn.textContent = "Register User"
  }

  usersContainer.querySelectorAll(".remove-user-btn").forEach(btn => {
    btn.hidden = !isMultiple || count === 1
  })
}

// =====================================
// Switch Registration Mode
// =====================================

modeInputs.forEach(input => {
  input.addEventListener("change", event => {
    registrationMode = event.target.value

    message.textContent = ""
    usersContainer.innerHTML = ""
    jsonFileInput.value = ""
    fileInfo.textContent = ""

    if (registrationMode === "json") {
      usersContainer.hidden = true
      jsonUploadContainer.hidden = false
    } else {
      usersContainer.hidden = false
      jsonUploadContainer.hidden = true
      createUserFields()
    }

    updateButtons()
  })
})

// =====================================
// Add Another User
// =====================================

addUserBtn.addEventListener("click", () => {
  if (usersContainer.children.length < MAX_USERS) {
    createUserFields()
  }
})

// =====================================
// Read Manual User Input
// =====================================

function getUsersData() {
  const userSections = usersContainer.querySelectorAll(".user-fields")

  return Array.from(userSections).map(section => ({
    username: section.querySelector(".username").value.trim(),
    password: section.querySelector(".password").value,
    role: section.querySelector(".role").value
  }))
}

// =====================================
// Validate User Records
// =====================================

function validateUsers(users) {
  if (!Array.isArray(users) || users.length === 0) {
    throw new Error("At least one user is required")
  }

  if (users.length > MAX_USERS) {
    throw new Error(`Maximum ${MAX_USERS} users allowed`)
  }

  for (let i = 0; i < users.length; i++) {
    const user = users[i]

    if (
      !user ||
      typeof user.username !== "string" ||
      !user.username.trim() ||
      typeof user.password !== "string" ||
      !user.password.trim() ||
      !roles.includes(user.role)
    ) {
      throw new Error(`Invalid user details at record ${i + 1}`)
    }
  }

  const usernames = users.map(user => user.username.trim())

  if (new Set(usernames).size !== usernames.length) {
    throw new Error("Duplicate usernames are not allowed")
  }

  return users
}

// =====================================
// Read and Validate JSON File
// =====================================

async function getUsersFromJSON() {
  const file = jsonFileInput.files[0]

  if (!file) {
    throw new Error("Please select a JSON file")
  }

  if (!file.name.toLowerCase().endsWith(".json")) {
    throw new Error("Only JSON files are allowed")
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("JSON file must be 1 MB or smaller")
  }

  const fileContent = await file.text()

  let parsedData

  try {
    parsedData = JSON.parse(fileContent)
  } catch {
    throw new Error("Invalid JSON file format")
  }

  if (!parsedData || !Array.isArray(parsedData.users)) {
    throw new Error("JSON must contain a users array")
  }

  return validateUsers(parsedData.users)
}

// =====================================
// Show Selected File Name
// =====================================

jsonFileInput.addEventListener("change", () => {
  const file = jsonFileInput.files[0]

  fileInfo.textContent = file ? `Selected file: ${file.name}` : ""
})

// =====================================
// Submit Registration Form
// =====================================

registerForm.addEventListener("submit", async event => {
  event.preventDefault()

  message.textContent = ""
  message.style.color = "red"

  try {
    registerBtn.disabled = true

    // Step 1: Read users
    let users

    if (registrationMode === "json") {
      users = await getUsersFromJSON()
    } else {
      users = validateUsers(getUsersData())
    }

    // Step 2: Determine API endpoint
    const isSingle = registrationMode === "single"

    const endpoint = isSingle ? "/register/single" : "/register/bulk"

    // Step 3: Prepare request body
    const requestBody = isSingle ? users[0] : { users }

    // Step 4: Call registration API
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    })

    const result = await response.json()

    // Step 5: Handle API error
    if (!response.ok) {
      throw new Error(result.message || "Registration failed")
    }

    // Step 6: Display registration result
    if (isSingle) {
      message.style.color = "green"
      message.textContent = result.message
    } else {
      const { insertedCount, failedCount, existingCount } = result.data

      message.style.color = insertedCount > 0 ? "green" : "red"

      message.textContent =
        `${result.message} ` +
        `Registered: ${insertedCount}, ` +
        `Failed: ${failedCount}, ` +
        `Already Existing: ${existingCount}`
    }

    // Step 7: Determine whether to reset form
    const shouldReset = isSingle || result.data.insertedCount > 0

    // Step 8: Reset only after successful insertion
    if (shouldReset) {
      registerForm.reset()

      if (registrationMode === "json") {
        jsonFileInput.value = ""
        fileInfo.textContent = ""
      } else {
        usersContainer.innerHTML = ""
        createUserFields()
      }
    }
  } catch (error) {
    console.error(error)

    message.style.color = "red"
    message.textContent = error.message || "Unable to connect to server"
  } finally {
    registerBtn.disabled = false
  }
})

// =====================================
// Initialize Registration Page
// =====================================

createUserFields()
