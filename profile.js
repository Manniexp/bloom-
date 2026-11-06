// Handles user profile display, editing, and post management
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
    doc, 
    getDoc, 
    setDoc, 
    deleteDoc, 
    collection, 
    query, 
    where, 
    getDocs, 
    onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// DOM Elements
const editProfileButton = document.getElementById("edit-profile-button");
const editProfile = document.getElementById("edit-profile");
const saveProfileButton = document.getElementById("save-profile-button");
const cancelProfileButton = document.getElementById("cancel-profile-button");

const profileName = document.getElementById("profile-name");
const profileUsername = document.querySelector(".username");
const profileBio = document.querySelector(".bio");
const profileInterests = document.querySelector(".interests");

const profileImage = document.getElementById("profile-image");
const profilePlaceholder = document.getElementById("profile-placeholder");
const editProfilePicture = document.getElementById("edit-profile-picture");

let currentUser = null;
let userProfileData = null; // Stores exact database state so inputs load pre-filled
let selectedImageBase64 = null;

// Loads saved profile data and profile picture from Firestore
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        try {
            const userRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(userRef);

            if (docSnap.exists()) {
                userProfileData = docSnap.data(); // Save snapshot data locally
                
                // Flexible check for Name
                const savedName = userProfileData.name || userProfileData.displayName;
                if (savedName && profileName) profileName.textContent = savedName;

                // Flexible check for Username
                const savedUsername = userProfileData.username || userProfileData.handle;
                if (savedUsername && profileUsername) {
                    profileUsername.textContent = savedUsername.startsWith("@") ? savedUsername : "@" + savedUsername;
                }

                // Check for Bio/About
                const savedBio = userProfileData.bio || userProfileData.about;
                if (savedBio && profileBio) profileBio.textContent = savedBio;
                
                // Load saved profile picture
                if (userProfileData.profilePic && profileImage) {
                    profileImage.src = userProfileData.profilePic;
                    profileImage.style.display = "block";
                    if (profilePlaceholder) profilePlaceholder.style.display = "none";
                }

                if (userProfileData.interests && Array.isArray(userProfileData.interests) && profileInterests) {
                    profileInterests.innerHTML = "";
                    userProfileData.interests.forEach((interest) => {
                        const span = document.createElement("span");
                        span.textContent = interest;
                        profileInterests.appendChild(span);
                    });
                }
            }

            // Load user stats and creations grid
            loadProfileStats(user.uid);
            loadUserCreations(user.uid);

        } catch (error) {
            console.error("Error loading user profile:", error);
        }
    } else {
        window.location.href = "index.html";
    }
});

// Profile Picture Upload Preview Handler
if (editProfilePicture) {
    editProfilePicture.addEventListener("change", function() {
        const file = editProfilePicture.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                selectedImageBase64 = e.target.result;
                if (profileImage) {
                    profileImage.src = selectedImageBase64;
                    profileImage.style.display = "block";
                }
                if (profilePlaceholder) profilePlaceholder.style.display = "none";
            };
            reader.readAsDataURL(file);
        }
    });
}

// Open Edit Profile Drawer/Form (Pre-fills from Database Data)
if (editProfileButton && editProfile) {
    editProfileButton.addEventListener("click", function() {
        editProfile.style.display = "block";

        const nameInput = document.getElementById("edit-name");
        const usernameInput = document.getElementById("edit-username");
        const bioInput = document.getElementById("edit-bio");
        const interestsInput = document.getElementById("edit-interests");

        // Use cached userProfileData first, fall back to UI text content
        if (nameInput) {
            nameInput.value = (userProfileData && (userProfileData.name || userProfileData.displayName)) 
                ? (userProfileData.name || userProfileData.displayName) 
                : (profileName ? profileName.textContent.trim() : "");
        }

        if (usernameInput) {
            const rawUsername = (userProfileData && (userProfileData.username || userProfileData.handle)) 
                ? (userProfileData.username || userProfileData.handle) 
                : (profileUsername ? profileUsername.textContent.trim() : "");
            usernameInput.value = rawUsername.replace("@", "");
        }

        if (bioInput) {
            bioInput.value = (userProfileData && (userProfileData.bio || userProfileData.about)) 
                ? (userProfileData.bio || userProfileData.about) 
                : (profileBio ? profileBio.textContent.trim() : "");
        }

        if (interestsInput) {
            if (userProfileData && userProfileData.interests && Array.isArray(userProfileData.interests)) {
                interestsInput.value = userProfileData.interests.join(", ");
            } else if (profileInterests) {
                const currentInterests = Array.from(profileInterests.querySelectorAll("span"))
                    .map((span) => span.textContent.trim());
                interestsInput.value = currentInterests.join(", ");
            }
        }

        editProfile.scrollIntoView({ behavior: "smooth" });
    });
}

// Save Updated Profile Data & Picture to Firestore
if (saveProfileButton) {
    saveProfileButton.addEventListener("click", async function() {
        const newName = document.getElementById("edit-name")?.value.trim();
        const newUsername = document.getElementById("edit-username")?.value.trim();
        const newBio = document.getElementById("edit-bio")?.value.trim();
        const newInterests = document.getElementById("edit-interests")?.value.trim();

        // Immediate UI updates
        if (newName && profileName) profileName.textContent = newName;
        if (newUsername && profileUsername) profileUsername.textContent = newUsername.startsWith("@") ? newUsername : "@" + newUsername;
        if (newBio && profileBio) profileBio.textContent = newBio;

        let interestsArray = [];
        if (newInterests && profileInterests) {
            profileInterests.innerHTML = "";
            interestsArray = newInterests.split(",").map((item) => item.trim()).filter((item) => item !== "");
            interestsArray.forEach((interest) => {
                const span = document.createElement("span");
                span.textContent = interest;
                profileInterests.appendChild(span);
            });
        }

        if (currentUser) {
            try {
                const userRef = doc(db, "users", currentUser.uid);
                
                const dataToSave = {
                    name: newName || (userProfileData?.name || userProfileData?.displayName || ""),
                    username: newUsername ? newUsername.replace("@", "") : (userProfileData?.username || userProfileData?.handle || ""),
                    bio: newBio || (userProfileData?.bio || userProfileData?.about || ""),
                    interests: interestsArray
                };

                if (selectedImageBase64) {
                    dataToSave.profilePic = selectedImageBase64;
                }

                await setDoc(userRef, dataToSave, { merge: true });

                // Update stored cache so subsequent edits open with latest saved values
                userProfileData = { ...userProfileData, ...dataToSave };

                alert("Profile and picture saved permanently! 🌸");
            } catch (error) {
                console.error("Firestore Save Error:", error);
                alert("Failed to save: " + error.message);
            }
        }

        if (editProfile) editProfile.style.display = "none";
    });
}

// Cancel Profile Edit
if (cancelProfileButton && editProfile) {
    cancelProfileButton.addEventListener("click", function() {
        editProfile.style.display = "none";
    });
}

// Load User Creations into Profile Grid with Clickable Preview Modals
function loadUserCreations(uid) {
    const creationGrid = document.querySelector(".creation-grid") || document.getElementById("profile-posts-grid") || document.getElementById("user-posts-container");
    if (!creationGrid) return;

    const postsRef = collection(db, "posts");
    const q = query(postsRef, where("userId", "==", uid));

    onSnapshot(q, (snapshot) => {
        creationGrid.innerHTML = "";

        if (snapshot.empty) {
            creationGrid.innerHTML = `<p style="grid-column: 1/-1; color: #888; text-align: center; padding: 20px;">No creations posted yet! 🌸</p>`;
            return;
        }

        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        docs.sort((a, b) => {
            const timeA = a.timestamp?.seconds || 0;
            const timeB = b.timestamp?.seconds || 0;
            return timeB - timeA;
        });

        docs.forEach((post) => {
            let icon = "🎮";
            const category = post.category || post.type || "Creation";
            if (category === "Art" || category === "Digital Art") icon = "🎨";
            if (category === "Writing") icon = "✍️";
            if (category === "Music") icon = "🎵";
            if (category === "Projects" || category === "DIY") icon = "💡";

            const card = document.createElement("div");
            card.className = "creation-card profile-post-card";
            card.style.cursor = "pointer";

            const imageTag = post.imageUrl 
                ? `<img src="${post.imageUrl}" alt="${post.title || 'Creation'}" style="width: 100%; height: 140px; object-fit: cover; border-radius: 10px; margin-bottom: 8px;">` 
                : `<div class="creation-icon" style="font-size: 2.5rem; margin-bottom: 8px; text-align: center;">${icon}</div>`;

            // Build music mini preview if it's music
            let cardMusicHTML = "";
            if ((post.type === "Music" || post.category === "Music") && post.fileUrl) {
                cardMusicHTML = `
                    <div style="margin-top: 8px;" onclick="event.stopPropagation()">
                        <audio controls style="width: 100%; height: 28px;">
                            <source src="${post.fileUrl}">
                        </audio>
                    </div>
                `;
            }

            card.innerHTML = `
                ${imageTag}
                <span class="creation-tag" style="display: inline-block; background: rgba(255, 183, 197, 0.4); color: #d81b60; font-size: 11px; padding: 2px 8px; border-radius: 10px; font-weight: 600;">${category}</span>
                <h3 style="font-size: 16px; margin: 6px 0 4px 0;">${post.title || "Untitled Creation"}</h3>
                <p style="font-size: 13px; color: #666; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 4px;">${post.description || post.text || ""}</p>
                ${cardMusicHTML}
            `;

            // Open full preview modal on click
            card.addEventListener("click", () => {
                openPostModal(post, icon);
            });

            creationGrid.appendChild(card);
        });
    }, (error) => {
        console.error("Error loading creations:", error);
    });
}

// Full Post Preview Modal / Popup (Includes Delete Action & Music Player)
function openPostModal(post, icon) {
    const existingModal = document.querySelector(".modal-overlay");
    if (existingModal) existingModal.remove();

    const modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        padding: 20px;
        box-sizing: border-box;
    `;
    
    const mediaHTML = post.imageUrl 
        ? `<img src="${post.imageUrl}" alt="${post.title || 'Creation'}" style="width: 100%; max-height: 280px; object-fit: cover; border-radius: 12px; margin-bottom: 1rem;">` 
        : `<div style="font-size: 3rem; margin-bottom: 0.5rem; text-align: center;">${icon}</div>`;

    // Build audio player inside modal if it's music
    let modalMusicHTML = "";
    if ((post.type === "Music" || post.category === "Music") && post.fileUrl) {
        modalMusicHTML = `
            <div style="margin-bottom: 1.2rem; background: #fff8fb; padding: 12px; border-radius: 12px; border: 1px solid #ffe4ed;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                    <span>🎵</span>
                    <span style="font-size: 0.85rem; color: #d63384; font-weight: 500;">Audio Track Player</span>
                </div>
                <audio controls style="width: 100%; height: 36px; border-radius: 18px;">
                    <source src="${post.fileUrl}">
                    Your browser does not support the audio element.
                </audio>
            </div>
        `;
    }

    let postDate = "Just now";
    if (post.timestamp && typeof post.timestamp.toDate === "function") {
        postDate = new Date(post.timestamp.toDate()).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    }

    modal.innerHTML = `
        <div class="modal-content" style="background: #fff; padding: 24px; border-radius: 16px; max-width: 500px; width: 100%; position: relative; box-shadow: 0 10px 25px rgba(0,0,0,0.2); max-height: 90vh; overflow-y: auto;">
            <button class="modal-close" style="position: absolute; top: 12px; right: 16px; background: none; border: none; font-size: 28px; cursor: pointer; color: #666;">&times;</button>
            ${mediaHTML}
            <h2 style="margin: 0 0 6px 0; font-size: 1.4rem;">${post.title || "Untitled Creation"}</h2>
            <p style="color: #888; font-size: 0.85rem; margin-bottom: 1rem;">
                Category: <strong>${post.category || post.type || "Creation"}</strong> ${post.genre ? `• ${post.genre}` : ""} | ${postDate}
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin-bottom: 1rem;">
            ${modalMusicHTML}
            <p style="white-space: pre-wrap; line-height: 1.6; color: #333; font-size: 0.95rem; margin-bottom: 1.5rem;">${post.description || post.text || "No description provided."}</p>
            
            <div style="display: flex; justify-content: flex-end;">
                <button class="delete-post-btn" style="background: #fff0f3; color: #e91e63; border: 1px solid #ffccd5; padding: 8px 16px; border-radius: 12px; font-weight: 600; cursor: pointer; transition: 0.2s;">
                    🗑️ Delete Post
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Close button event
    const closeBtn = modal.querySelector(".modal-close");
    if (closeBtn) {
        closeBtn.addEventListener("click", () => modal.remove());
    }
    
    modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.remove();
    });

    // Delete post handler
    const deleteBtn = modal.querySelector(".delete-post-btn");
    if (deleteBtn) {
        deleteBtn.addEventListener("click", async () => {
            const confirmed = confirm("Are you sure you want to delete this bloom? 🌸 It will be removed from your profile and feed.");
            if (!confirmed) return;

            try {
                await deleteDoc(doc(db, "posts", post.id));
                modal.remove();
                alert("Post deleted permanently! 🌸");
            } catch (error) {
                console.error("Error deleting post:", error);
                alert("Failed to delete post: " + error.message);
            }
        });
    }
}

// Load and Update Profile Stats Counters
async function loadProfileStats(uid) {
    try {
        // Post Count
        const postsRef = collection(db, "posts");
        const postsQuery = query(postsRef, where("userId", "==", uid));
        const postsSnap = await getDocs(postsQuery);
        
        const postsCountEl = document.getElementById("posts-count");
        if (postsCountEl) postsCountEl.textContent = postsSnap.size;

        // Followers Count
        const followersRef = collection(db, "users", uid, "followers");
        const followersSnap = await getDocs(followersRef);
        
        const followersCountEl = document.getElementById("followers-count");
        if (followersCountEl) followersCountEl.textContent = followersSnap.size;

        // Following Count
        const followingRef = collection(db, "users", uid, "following");
        const followingSnap = await getDocs(followingRef);
        
        const followingCountEl = document.getElementById("following-count");
        if (followingCountEl) followingCountEl.textContent = followingSnap.size;

    } catch (error) {
        console.error("Error fetching profile stats:", error);
    }
}