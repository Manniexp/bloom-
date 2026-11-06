// dashboard.html 
// This script handles the feed functionality, including loading posts, displaying likes and comments,
//  and managing user interactions.


import { db, auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
    collection, 
    doc, 
    getDoc, 
    setDoc, 
    deleteDoc, 
    addDoc, 
    serverTimestamp, 
    onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const postsContainer = document.getElementById("posts-container");
let currentUserId = null;

// Check user authentication state and load feed if logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUserId = user.uid;
        loadFeed();
    } else {
        window.location.href = "login.html";
    }
});

// Load and render feed posts in real-time
function loadFeed() {
    if (!postsContainer) return;

    const postsRef = collection(db, "posts");

    onSnapshot(postsRef, async (snapshot) => {
        if (snapshot.empty) {
            postsContainer.innerHTML = `
                <div class="empty-feed">
                    <h2>No blooms yet! 🌸</h2>
                    <p>Be the first one to post a creation.</p>
                </div>
            `;
            return;
        }

        const posts = snapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
        }));

        posts.sort((a, b) => {
            const timeA = a.timestamp?.seconds || 0;
            const timeB = b.timestamp?.seconds || 0;
            return timeB - timeA;
        });

        postsContainer.innerHTML = "";

        for (const post of posts) {
            const postElement = await createPostElement(post);
            postsContainer.appendChild(postElement);
        }
    }, (error) => {
        console.error("Error loading feed:", error);
    });
}

// Construct post card with likes, comments, game previews, and music players
async function createPostElement(post) {
    const postCard = document.createElement("div");
    postCard.className = "post-card";
    postCard.setAttribute("data-id", post.id);

    // Fetch user profile info if missing
    let rawUsername = post.username || "";
    let userPfp = post.profilePic || "";

    if ((!userPfp || !rawUsername) && post.userId) {
        try {
            const userSnap = await getDoc(doc(db, "users", post.userId));
            if (userSnap.exists()) {
                const userData = userSnap.data();
                if (!userPfp && userData.profilePic) {
                    userPfp = userData.profilePic;
                }
                if (!rawUsername) {
                    rawUsername = userData.username || userData.displayName || "bloom_user";
                }
            }
        } catch (e) {
            console.error("User profile fetch error:", e);
        }
    }

    // Ensure username is clean and has a fallback
    if (!rawUsername) rawUsername = "bloom_user";
    const cleanUsername = rawUsername.startsWith("@") ? rawUsername.slice(1) : rawUsername;

    const pfpHTML = userPfp 
        ? `<img src="${userPfp}" class="post-profile-picture" alt="${cleanUsername}">`
        : `<div class="post-profile-picture post-avatar-fallback">${cleanUsername[0].toUpperCase()}</div>`;

    // Post timestamp formatting
    let postDate = "Just now";
    if (post.timestamp) {
        let dateObj = null;

        if (typeof post.timestamp.toDate === "function") {
            dateObj = post.timestamp.toDate();
        } else if (post.timestamp.seconds) {
            dateObj = new Date(post.timestamp.seconds * 1000);
        } else if (typeof post.timestamp === "string" || typeof post.timestamp === "number") {
            dateObj = new Date(post.timestamp);
        }

        if (dateObj && !isNaN(dateObj.getTime())) {
            const now = new Date();
            const diffInSeconds = Math.floor((now - dateObj) / 1000);

            if (diffInSeconds < 60) {
                postDate = "Just now";
            } else if (diffInSeconds < 3600) {
                const mins = Math.floor(diffInSeconds / 60);
                postDate = `${mins}m ago`;
            } else if (diffInSeconds < 86400) {
                const hours = Math.floor(diffInSeconds / 3600);
                postDate = `${hours}h ago`;
            } else {
                postDate = dateObj.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric"
                });
            }
        }
    }

    const imageHTML = post.imageUrl 
        ? `<img src="${post.imageUrl}" class="post-image" alt="${post.title || 'Post Content'}">` 
        : "";

    // Display game details if the post is of type "Games"
    let gameDetailsHTML = "";
    if (post.type === "Games") {
        let badgesHTML = "";
        if (post.genre) badgesHTML += `<span class="post-tag" style="background:#f0e6f6; color:#8e44ad; margin-right:6px;">Genre: ${post.genre}</span>`;
        if (post.engine) badgesHTML += `<span class="post-tag" style="background:#e8f4f8; color:#2980b9;">Engine: ${post.engine}</span>`;
        
        let linkHTML = "";
        if (post.fileUrl) {
            linkHTML = `
                <div class="game-link-preview" style="margin-top: 12px; display: flex; align-items: center; justify-content: space-between; background: #fff8fb; padding: 10px 14px; border-radius: 12px; border: 1px solid #ffe4ed;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 0.8rem; color: #d63384; font-weight: 500; font-style: italic;">Create games people will love. 🌸</span>
                    </div>
                    <a href="${post.fileUrl}" target="_blank" class="feed-game-btn" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; background: #ff758c; color: white; border-radius: 20px; text-decoration: none; font-size: 0.82rem; font-weight: 600; box-shadow: 0 2px 6px rgba(255, 117, 140, 0.25);">
                        🎮 Play Game 𖹭
                    </a>
                </div>
            `;
        }

        gameDetailsHTML = `
            <div class="game-meta-section" style="margin-top: 10px;">
                ${badgesHTML}
                ${linkHTML}
            </div>
        `;
    }

    // Display music player and details if the post is of type/category "Music"
    let musicDetailsHTML = "";
    if (post.type === "Music" || post.category === "Music") {
        let audioPlayerHTML = "";
        if (post.fileUrl) {
            audioPlayerHTML = `
                <div class="music-preview-box" style="margin-top: 12px; background: #fff8fb; padding: 12px; border-radius: 12px; border: 1px solid #ffe4ed;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 0.9rem;">🎵</span>
                            <span style="font-size: 0.8rem; color: #d63384; font-weight: 500; font-style: italic;">Let the rhythm bloom 🌸</span>
                        </div>
                        <span style="font-size: 0.75rem; color: #888;">✨ Audio Track</span>
                    </div>
                    
                    <audio controls style="width: 100%; height: 36px; border-radius: 20px;">
                        <source src="${post.fileUrl}" type="audio/mpeg">
                        Your browser does not support the audio element.
                    </audio>
                    
                    <div style="margin-top: 6px; text-align: right;">
                        <a href="${post.fileUrl}" target="_blank" style="font-size: 0.75rem; color: #ec4899; text-decoration: none; font-weight: 500;">
                            🔗 Open Direct Audio Link
                        </a>
                    </div>
                </div>
            `;
        }

        musicDetailsHTML = `
            <div class="music-meta-section" style="margin-top: 10px;">
                ${post.genre ? `<span class="post-tag" style="background:#f0e6f6; color:#8e44ad; margin-right:6px;">Genre: ${post.genre}</span>` : ""}
                ${audioPlayerHTML}
            </div>
        `;
    }

    // Build post card HTML structure
    postCard.innerHTML = `
        <div class="post-header">
            ${pfpHTML}
            <div class="post-user-info">
                <span class="post-username">@${cleanUsername}</span>
                <span class="post-date">• ${postDate}</span>
            </div>
        </div>

        <div class="post-content">
            ${post.category || post.type ? `<span class="post-tag">${post.category || post.type}</span>` : ""}
            ${post.title ? `<h3 class="post-title">${post.title}</h3>` : ""}
            <p class="post-text">${post.description || post.text || ""}</p>
            ${imageHTML}
            ${gameDetailsHTML}
            ${musicDetailsHTML}
        </div>

        <div class="post-actions">
            <button class="like-btn" data-id="${post.id}">
                💖 <span class="like-count">0</span>
            </button>
            <button class="comment-btn" data-id="${post.id}">
                💬 <span class="comment-count">0</span> Comments
            </button>
        </div>

        <div class="comments-section" style="display: none; margin-top: 12px; border-top: 1px solid #f0f0f0; padding-top: 10px;">
            <div class="comments-list" style="max-height: 150px; overflow-y: auto; margin-bottom: 10px;"></div>
            <div style="display: flex; gap: 8px;">
                <input type="text" class="comment-input" placeholder="Write a comment..." style="flex: 1; padding: 8px 12px; border-radius: 20px; border: 1px solid #ddd; outline: none; font-size: 0.85rem;">
                <button class="send-comment-btn" style="background: #e91e63; color: white; border: none; padding: 6px 14px; border-radius: 20px; cursor: pointer; font-size: 0.85rem;">Send</button>
            </div>
        </div>
    `;

    // Handle likes and update like count in real-time
    const postLikesRef = collection(db, "posts", post.id, "likes");
    const userLikeDocRef = doc(db, "posts", post.id, "likes", currentUserId);
    const likeBtn = postCard.querySelector(".like-btn");
    const likeCountEl = postCard.querySelector(".like-count");

    onSnapshot(postLikesRef, (snapshot) => { likeCountEl.textContent = snapshot.size; });
    onSnapshot(userLikeDocRef, (docSnap) => {
        likeBtn.style.opacity = docSnap.exists() ? "1" : "0.7";
        likeBtn.style.fontWeight = docSnap.exists() ? "bold" : "normal";
    });
    likeBtn.addEventListener("click", () => toggleLike(post.id));

    // Handle comment section and submissions
    const commentsRef = collection(db, "posts", post.id, "comments");
    const commentBtn = postCard.querySelector(".comment-btn");
    const commentSection = postCard.querySelector(".comments-section");
    const commentsList = postCard.querySelector(".comments-list");
    const commentInput = postCard.querySelector(".comment-input");
    const sendCommentBtn = postCard.querySelector(".send-comment-btn");
    const commentCountEl = postCard.querySelector(".comment-count");

    commentBtn.addEventListener("click", () => {
        const isHidden = commentSection.style.display === "none";
        commentSection.style.display = isHidden ? "block" : "none";
    });

    onSnapshot(commentsRef, (snapshot) => {
        commentCountEl.textContent = snapshot.size;
        commentsList.innerHTML = "";

        const comments = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
        comments.sort((a, b) => (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0));

        comments.forEach(c => {
            const commentDiv = document.createElement("div");
            commentDiv.style.cssText = "font-size: 0.85rem; margin-bottom: 6px; background: #f9f9f9; padding: 6px 10px; border-radius: 8px;";
            commentDiv.innerHTML = `<strong>@${c.username || 'user'}</strong>: ${c.text}`;
            commentsList.appendChild(commentDiv);
        });
    });

    sendCommentBtn.addEventListener("click", async () => {
        const text = commentInput.value.trim();
        if (!text || !currentUserId) return;

        try {
            const currentUserDoc = await getDoc(doc(db, "users", currentUserId));
            const activeUsername = currentUserDoc.exists() ? (currentUserDoc.data().username || "bloom_user") : "bloom_user";

            await addDoc(commentsRef, {
                text: text,
                userId: currentUserId,
                username: activeUsername,
                timestamp: serverTimestamp()
            });

            commentInput.value = "";
        } catch (err) {
            console.error("Error posting comment:", err);
            alert("Could not post comment: " + err.message);
        }
    });

    return postCard;
}

// Makes sure that that one user can only like a post once and can unlike it if they change their mind
async function toggleLike(postId) {
    if (!currentUserId) return;

    const likeRef = doc(db, "posts", postId, "likes", currentUserId);

    try {
        const docSnap = await getDoc(likeRef);
        if (docSnap.exists()) {
            await deleteDoc(likeRef);
        } else {
            await setDoc(likeRef, {
                likedAt: new Date(),
                userId: currentUserId
            });
        }
    } catch (err) {
        console.error("Error toggling like:", err);
    }
}