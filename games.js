import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { collection, addDoc, doc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let currentUser = null;
let currentUsername = "bloom_user";

// Ensure user is signed in & fetch their saved username
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        try {
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const data = userSnap.data();
                currentUsername = data.username || data.handle || data.displayName || user.displayName || "bloom_user";
            } else if (user.displayName) {
                currentUsername = user.displayName;
            }
        } catch (err) {
            console.error("Error fetching username:", err);
        }
    } else {
        window.location.href = "login.html";
    }
});

// DOM Elements
const saveGameButton = document.getElementById("save-game-button");
const gameTitleInput = document.getElementById("game-title");
const gameGenreInput = document.getElementById("game-genre");
const gameEngineInput = document.getElementById("game-engine");
const gameDescriptionInput = document.getElementById("game-description");
const gameFileUrlInput = document.getElementById("game-file-url");

// Save game post to Firestore
if (saveGameButton) {
    saveGameButton.addEventListener("click", async (e) => {
        if (e) e.preventDefault(); // Prevent default form submission behavior
        
        console.log("Save Game button clicked!");

        if (!currentUser) {
            alert("Please wait, checking login status... 🌸");
            return;
        }

        // Validate inputs
        const title = gameTitleInput ? gameTitleInput.value.trim() : "";
        const genre = gameGenreInput ? gameGenreInput.value.trim() : "General";
        const engine = gameEngineInput ? gameEngineInput.value.trim() : "Custom";
        const description = gameDescriptionInput ? gameDescriptionInput.value.trim() : "";
        const fileUrl = gameFileUrlInput ? gameFileUrlInput.value.trim() : "";

        if (!title || !description) {
            alert("Please give your game a title and description! 🌸");
            return;
        }

        saveGameButton.disabled = true;
        saveGameButton.textContent = "Saving... 🌸";

        try {
            // Save post document straight to Firestore
            await addDoc(collection(db, "posts"), {
                userId: currentUser.uid,
                username: currentUsername,
                category: "Games",
                type: "Games",
                title: title,
                genre: genre,
                engine: engine,
                description: description,
                fileUrl: fileUrl, // Saves your game download link also holds the game link 
                likes: 0,
                timestamp: serverTimestamp() 
            });
            // If successful, alert the user and redirect to feed
            alert("Your game has bloomed to the feed! 🎮🌸");
            window.location.href = "feed.html";

            // If you dont have all the fields filled out, it will alert you to fill them out and not save the post.
        } catch (error) {
            console.error("Detailed Game Save Error:", error);
            alert("Failed to save game: " + error.message);
            saveGameButton.disabled = false;
            saveGameButton.textContent = "Save Game 🌸";
        }
    });
}