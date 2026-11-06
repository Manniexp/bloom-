import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// 1. DOM Elements (Defined at the top so they are available immediately)
const logoutButton = document.getElementById("logout-button");
const greeting = document.getElementById("greeting");
const changingWord = document.getElementById("changing-word");

// 2. Check if user is logged in on page load
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Logged-in user UID:", user.uid);
    } else {
        // No user is signed in -> redirect to login page
        alert("Please log in to access the dashboard.");
        window.location.href = "index.html";
    }
});

// 3. Logout functionality
if (logoutButton) {
    logoutButton.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
            await signOut(auth);
            alert("Signed out successfully! 🌸");
            window.location.href = "index.html";
        } catch (error) {
            console.error("Logout Error:", error);
            alert("Error signing out: " + error.message);
        }
    });
}

// 4. 🌸 Dashboard Changing Words
const words = [
    "art",
    "writing",
    "music",
    "games",
    "projects"
];

let index = 0;

if (changingWord) {
    setInterval(() => {
        index++;
        if (index >= words.length) {
            index = 0;
        }
        changingWord.textContent = words[index];
    }, 2000);
}

// 5. Greeting message based on time of day
if (greeting) {
    const hour = new Date().getHours();

    if (hour < 12) {
        greeting.textContent = "Good Morning, Creator 🌸";
    } else if (hour < 18) {
        greeting.textContent = "Good Afternoon, Creator -ˋˏ ༻❁✿❀༺ ˎˊ-";
    } else {
        greeting.textContent = "Good Evening, Creator ⭒₊ ⊹🌕₊ ⊹⭒";
    }
}