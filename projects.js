import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let currentUser = null;

// Wait for auth state
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
    } else {
        window.location.href = "login.html";
    }
});

// DOM Elements
const saveProjectButton = document.getElementById("save-project-button");
const projectTitleInput = document.getElementById("project-title");
const projectTypeInput = document.getElementById("project-type");
const projectToolsInput = document.getElementById("project-tools");
const projectDescriptionInput = document.getElementById("project-description");

// Save project post to Firestore
if (saveProjectButton) {
    saveProjectButton.addEventListener("click", async () => {
        if (!currentUser) {
            alert("You must be logged in to save! 🌸");
            return;
        }

        const title = projectTitleInput ? projectTitleInput.value.trim() : "";
        const type = projectTypeInput ? projectTypeInput.value.trim() : "General";
        const tools = projectToolsInput ? projectToolsInput.value.trim() : "";
        const description = projectDescriptionInput ? projectDescriptionInput.value.trim() : "";

        if (!title || !description) {
            alert("Please give your project a title and description! 🌸");
            return;
        }

        saveProjectButton.disabled = true;
        saveProjectButton.textContent = "Saving... 🌸";

        try {
            // Save post document to "posts" collection
            await addDoc(collection(db, "posts"), {
                userId: currentUser.uid,
                category: "Projects",
                type: "Projects",
                projectType: type,
                tools: tools,
                title: title,
                description: description,
                timestamp: serverTimestamp() // Uses timestamp so feed and profile can sort properly
            });

            alert("Your project has bloomed! 💡🌸");
            window.location.href = "profile.html";
        } catch (error) {
            console.error("Error saving project:", error);
            alert("Failed to save project: " + error.message);
            saveProjectButton.disabled = false;
            saveProjectButton.textContent = "Save Project 🌸";
        }
    });
}