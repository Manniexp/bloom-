import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const signupButton = document.getElementById("signup-button");

signupButton.addEventListener("click", async () => {

    const username = document.getElementById("signup-username").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value.trim();
    const confirmPassword = document.getElementById("signup-confirm-password").value.trim();

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    if (!username || !email || !password) {
        alert("Please fill in all fields!");
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
            username: username,
            email: email,
            bio: "",
            interests: []
        });

        alert("Your Account has blossomed! 🌸");
        window.location.href = "dashboard.html";

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
});