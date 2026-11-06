import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { collection, addDoc, doc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let currentUser = null;
let currentUsername = "bloom_user";

// Make sure user is signed in  fetch their saved username
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        try {
            // Fetch user profile username from Firestore
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

// DOM Elements
const saveArtButton = document.getElementById("save-art-button");
const artTitleInput = document.getElementById("art-title");
const artDescriptionInput = document.getElementById("art-description");
const artFileInput = document.getElementById("art-upload");
const previewImage = document.getElementById("preview-image");
const uploadBox = document.querySelector(".upload-box");

//  Instant Image Preview & Toggle Box Text
if (artFileInput) {
    artFileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (previewImage) {
                    previewImage.src = e.target.result;
                    previewImage.style.display = "block";
                }
                if (uploadBox) {
                    const boxHeading = uploadBox.querySelector("h2");
                    const boxText = uploadBox.querySelector("p");
                    if (boxHeading) boxHeading.style.display = "none";
                    if (boxText) boxText.style.display = "none";
                }
            };
            reader.readAsDataURL(file);
        } else {
            if (previewImage) previewImage.style.display = "none";
            if (uploadBox) {
                const boxHeading = uploadBox.querySelector("h2");
                const boxText = uploadBox.querySelector("p");
                if (boxHeading) boxHeading.style.display = "block";
                if (boxText) boxText.style.display = "block";
            }
        }
    });
}

//  Save Artwork Document
if (saveArtButton) {
    saveArtButton.addEventListener("click", async () => {
        if (!currentUser) return;

        const title = artTitleInput ? artTitleInput.value.trim() : "";
        const description = artDescriptionInput ? artDescriptionInput.value.trim() : "";
        const file = artFileInput && artFileInput.files.length > 0 ? artFileInput.files[0] : null;

        if (!title || !description) {
            alert("Please give your artwork a title and description! 🌸");
            return;
        }

        if (!file) {
            alert("Please select an image file to upload! 🎨");
            return;
        }

        saveArtButton.disabled = true;
        saveArtButton.textContent = "Processing Image... 🎨";

        try {
            // Compress image to fit within Firestore document limits
            const compressedBase64 = await new Promise((resolve, reject) => {
                const img = new Image();
                img.src = URL.createObjectURL(file);
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const MAX_WIDTH = 800;
                    const scaleSize = MAX_WIDTH / img.width;

                    if (scaleSize < 1) {
                        canvas.width = MAX_WIDTH;
                        canvas.height = img.height * scaleSize;
                    } else {
                        canvas.width = img.width;
                        canvas.height = img.height;
                    }

                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    resolve(canvas.toDataURL("image/jpeg", 0.7));
                };
                img.onerror = (err) => reject(err);
            });

            saveArtButton.textContent = "Publishing... 🌸";

            // Save post matching the writing structure so images display everywhere on 
            // the feed and profile.
            await addDoc(collection(db, "posts"), {
                userId: currentUser.uid,
                username: currentUsername,
                type: "Art",
                category: "Art",
                title: title,
                description: description,
                imageUrl: compressedBase64,
                likes: 0,
                timestamp: serverTimestamp()
            });

            alert("Your artwork has bloomed! 🎨🌸");
            window.location.href = "feed.html"; // Set to "profile.html" if you prefer returning to profile
        } catch (error) {
            console.error("Error saving artwork:", error);
            alert("Failed to publish artwork: " + error.message);
            saveArtButton.disabled = false;
            saveArtButton.textContent = "Save Creation 🌸";
        }
    });
}