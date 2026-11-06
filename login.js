import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("login-email");
const passwordInput = document.getElementById("password");
const showPasswordBtn = document.getElementById("showPassword");

// Password Show / Hide Toggle
if (passwordInput && showPasswordBtn) {
    showPasswordBtn.addEventListener("click", () => {
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            showPasswordBtn.textContent = "🙈";
        } else {
            passwordInput.type = "password";
            showPasswordBtn.textContent = "👁️";
        }
    });
}

// Handle Firebase Login Submission
if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault(); // Stop page from refreshing on form submit

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            alert("Please fill in both email and password!");
            return;
        }

       try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Logged in successfully! User:", userCredential.user);
    alert("Welcome back! 🌸");
    window.location.href = "./dashboard.html"; // Added ./ to ensure relative path
} catch (error) {
    console.error("Login failed:", error);
    alert(error.message);
}
    });
}