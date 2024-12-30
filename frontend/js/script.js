const signUpForm = document.getElementById("signUpForm");

function showError(input, message) {
  const inputGroup = input.parentElement;
  const errorMessage = inputGroup.querySelector(".error-message");
  errorMessage.textContent = message;
  errorMessage.classList.add("visible");
  input.classList.add("error-border");
}

function clearError(input) {
  const inputGroup = input.parentElement;
  const errorMessage = inputGroup.querySelector(".error-message");
  errorMessage.textContent = "";
  errorMessage.classList.remove("visible");
  input.classList.remove("error-border");
}

signUpForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirmPassword");

  let isValid = true;

  if (username.value.trim() === "") {
    showError(username, "Username is required.");
    isValid = false;
  } else {
    clearError(username);
  }

  if (email.value.trim() === "") {
    showError(email, "Email is required.");
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    showError(email, "Enter a valid email address.");
    isValid = false;
  } else {
    clearError(email);
  }

  if (password.value.trim() === "") {
    showError(password, "Password is required.");
    isValid = false;
  } else if (password.value.length < 6) {
    showError(password, "Password must be at least 6 characters.");
    isValid = false;
  } else {
    clearError(password);
  }

  if (confirmPassword.value.trim() === "") {
    showError(confirmPassword, "Please confirm your password.");
    isValid = false;
  } else if (confirmPassword.value !== password.value) {
    showError(confirmPassword, "Passwords do not match.");
    isValid = false;
  } else {
    clearError(confirmPassword);
  }

  const obj = {
    name: username.value,
    email: email.value,
    password: password.value,
  }
  if (isValid) {
    await axios.post("http://localhost:3000/signup", obj)
      .then((res) => {
        console.log(res.data);
        window.location.href = '../frontend/login.html';
      })
      .catch((err) => {
        if (err.response.data === "ER_DUP_ENTRY") {
          showError(email, "Email already exists.");
        }
      });
  }
});