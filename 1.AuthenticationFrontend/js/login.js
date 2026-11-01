const loginForm = document.getElementById("loginForm")
const message = document.getElementById("message")

loginForm.addEventListener("submit", async event => {
  event.preventDefault()

  const username = document.getElementById("username").value
  const password = document.getElementById("password").value

  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    })

    const result = await response.json()

    if (!response.ok) {
      message.textContent = result.message
      return
    }

    const token = result.data.token

    saveToken(token)

    window.location.href = "./dashboard.html"
  } catch (error) {
    console.error(error)
    message.textContent = "Unable to connect to server"
  }
})
