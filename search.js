import { db, auth } from "./firebase.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { sendFriendRequest } from "./friends.js";

const searchBtn = document.getElementById("search-btn");
const searchInput = document.getElementById("search-input");
const resultsContainer = document.getElementById("search-results");

if (searchBtn) {
    searchBtn.addEventListener("click", async () => {
        const searchTerm = searchInput.value.trim().toLowerCase();
        if (!searchTerm) return;

        resultsContainer.innerHTML = "<p>Searching...</p>";

        try {
            // Query users collection where username matches
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("username", "==", searchTerm));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                resultsContainer.innerHTML = "<p>No users found matching that username. 🌸</p>";
                return;
            }

            resultsContainer.innerHTML = "";

            snapshot.forEach((docSnap) => {
                const userData = docSnap.data();
                const targetUserId = docSnap.id;

                // Doesn't allow sending a friend request to yourself
                if (auth.currentUser && targetUserId === auth.currentUser.uid) return;

                const userCard = document.createElement("div");
                userCard.className = "user-card";
                userCard.style.cssText = "display: flex; align-items: center; justify-content: space-between; background: #fff; padding: 12px; border-radius: 10px; margin-top: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);";
                
                userCard.innerHTML = `
                    <div>
                        <strong>${userData.name || "Bloom User"}</strong><br>
                        <span style="color: #666; font-size: 0.9rem;">@${userData.username}</span>
                    </div>
                    <button class="add-friend-btn" style="background: #ff6584; color: white; border: none; padding: 6px 14px; border-radius: 6px; cursor: pointer;">Add Friend 💌</button>
                `;

                // Add event listener for the "Add Friend" button
                const addBtn = userCard.querySelector(".add-friend-btn");
                addBtn.addEventListener("click", async () => {
                    addBtn.disabled = true;
                    addBtn.textContent = "Sending...";
                    
                    // Get current user info object
                    const currentUser = auth.currentUser;
                    await sendFriendRequest(currentUser, targetUserId, userData.username);
                    
                    addBtn.textContent = "Request Sent! ✨";
                });

                resultsContainer.appendChild(userCard);
            });

        } catch (error) {
            console.error("Error searching users:", error);
            resultsContainer.innerHTML = "<p>Error searching for users.</p>";
        }
    });
}