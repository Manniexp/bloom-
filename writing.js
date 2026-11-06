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
            // Fetch the user's username from the 'users' collection
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists() && userSnap.data().username) {
                currentUsername = userSnap.data().username;
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

const saveWritingButton = document.getElementById("save-writing-button");

if (saveWritingButton) {
    saveWritingButton.addEventListener("click", async () => {
        if (!currentUser) return;

        const title = document.getElementById("writing-title").value.trim();
        const genre = document.getElementById("writing-genre").value.trim();
        const description = document.getElementById("writing-description").value.trim();

        if (!title || !description) {
            alert("Please provide a title and story details! 🌸");
            return;
        }

        saveWritingButton.disabled = true;
        saveWritingButton.textContent = "Saving... 🌸";

        try {
            await addDoc(collection(db, "posts"), {
                userId: currentUser.uid,
                username: currentUsername,               // Added for Feed header display
                type: "Writing",
                category: "Writing",                     // Added so category tag renders
                title: title,
                genre: genre || "General",
                description: description,
                likes: 0,                                // Initialized for feed like button
                timestamp: serverTimestamp()             // Fixed: changed from createdAt to timestamp
            });

            alert("Your writing bloomed! ✍️🌸");
            window.location.href = "feed.html";          // Changed to send you straight to feed!
        } catch (error) {
            console.error("Error saving writing:", error);
            alert("Failed to save: " + error.message);
            saveWritingButton.disabled = false;
            saveWritingButton.textContent = "Save Story 🌸";
        }
    });
}