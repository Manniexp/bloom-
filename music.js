import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { collection, addDoc, doc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let currentUser = null;
let currentUsername = "bloom_user";

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

const saveMusicButton = document.getElementById("save-music-button");
const musicTitleInput = document.getElementById("music-title");
const musicGenreInput = document.getElementById("music-genre");
const musicDescriptionInput = document.getElementById("music-description");
const musicFileUrlInput = document.getElementById("music-file-url");

if (saveMusicButton) {
    saveMusicButton.addEventListener("click", async (e) => {
        if (e) e.preventDefault();

        if (!currentUser) {
            alert("Please wait, checking login status... 🌸");
            return;
        }

        const title = musicTitleInput ? musicTitleInput.value.trim() : "";
        const genre = musicGenreInput ? musicGenreInput.value.trim() : "General";
        const description = musicDescriptionInput ? musicDescriptionInput.value.trim() : "";
        const fileUrl = musicFileUrlInput ? musicFileUrlInput.value.trim() : "";

        if (!title || !description) {
            alert("Please give your song a title and description! 🌸");
            return;
        }

        saveMusicButton.disabled = true;
        saveMusicButton.textContent = "Saving... 🌸";

        try {
            await addDoc(collection(db, "posts"), {
                userId: currentUser.uid,
                username: currentUsername,
                category: "Music",
                type: "Music",
                title: title,
                genre: genre,
                description: description,
                fileUrl: fileUrl,
                likes: 0,
                timestamp: serverTimestamp() 
            });

            alert("Your song has bloomed to the feed! 🎵🌸");
            window.location.href = "feed.html";

        } catch (error) {
            console.error("Detailed Music Save Error:", error);
            alert("Failed to save song: " + error.message);
            saveMusicButton.disabled = false;
            saveMusicButton.textContent = "Save Song 🌸";
        }
    });
}