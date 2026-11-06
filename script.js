//  Password Show / Hide

const password = document.getElementById("password");
const showPassword = document.getElementById("showPassword");

if (password && showPassword) {

    showPassword.addEventListener("click", function() {

        if (password.type === "password") {

            password.type = "text";
            showPassword.textContent = "🙈";

        } else {

            password.type = "password";
            showPassword.textContent = "👁️";

        }

    });

}



// 🌸 Dashboard Changing Words

const words = [

    "art",
    "writing",
    "music",
    "games",
    "projects"

];

let index = 0;

const changingWord = document.getElementById("changing-word");

if (changingWord) {

    setInterval(() => {

        index++;

        if (index >= words.length) {

            index = 0;

        }

        changingWord.textContent = words[index];

    }, 2000);

}



// 🌞 Greeting

const greeting = document.getElementById("greeting");

if (greeting) {

    const hour = new Date().getHours();

    if (hour < 12) {

        greeting.textContent =
        "Good Morning, Creator 🌸";

    } else if (hour < 18) {

        greeting.textContent =
        "Good Afternoon, Creator -ˋˏ ༻❁✿❀༺ ˎˊ-";

    } else {

        greeting.textContent =
        "Good Evening, Creator ⭒₊ ⊹🌕₊ ⊹⭒";

    }

}



// 🎨 Art Image Preview

const upload = document.getElementById("art-upload");
const preview = document.getElementById("preview-image");

if (upload && preview) {

    upload.addEventListener("change", function() {

        const file = upload.files[0];

        if (file) {

            preview.src = URL.createObjectURL(file);

        }

    });

}



// 💡 PROJECTS

const projectUpload =
document.getElementById("project-upload");

const projectTitle =
document.getElementById("project-title");

const projectType =
document.getElementById("project-type");

const projectTools =
document.getElementById("project-tools");

const projectDescription =
document.getElementById("project-description");

const saveProjectButton =
document.getElementById("save-project-button");



if (saveProjectButton) {

    saveProjectButton.addEventListener("click", function() {

        const file =
        projectUpload.files[0];

        const title =
        projectTitle.value;

        const type =
        projectType.value;

        const tools =
        projectTools.value;

        const description =
        projectDescription.value;



        console.log("Project Saved! 🌸");

        console.log("File:", file);

        console.log("Title:", title);

        console.log("Type:", type);

        console.log("Tools:", tools);

        console.log("Description:", description);



        alert("Your project has bloomed! 🌸");

    });

}

//Edit Profile 

const editProfileButton = 
document.getElementById("edit-profile-button");

const editProfile = 
document.getElementById("edit-profile");

const saveProfileButton = 
document.getElementById("save-profile-button");

const cancelProfileButton = 
document.getElementById("cancel-profile-button");

const profileName = 
document.getElementById("profile-name");

const profileUsername = 
document.getElementById("profile-username");

const profileBio = 
document.querySelector(".bio");

const profileInterests =
document.getElementById(".interests");

if (editProfileButton && editProfile){
    editProfileButton.addEventListener("click", function() {
        editProfile.style.display = "block";

        document.getElementById("profile-name-input").value =
         profileName.textContent.trim();

          document.getElementById("edit-name").value =
        profileName.textContent.trim();

        document.getElementById("edit-username").value =
        profileUsername.textContent.trim();

        document.getElementById("edit-bio").value =
        profileBio.textContent.trim();

        editProfile.scrollIntoView({
            behavior: "smooth"
        });

    });


}

if (saveProfileButton) {

    saveProfileButton.addEventListener("click", function() {

        const newName =
        document.getElementById("edit-name").value;

        const newUsername =
        document.getElementById("edit-username").value;

        const newBio =
        document.getElementById("edit-bio").value;

        const newInterests =
        document.getElementById("edit-interests").value;

        if (newName) {

            profileName.textContent = newName;

        }

        if (newUsername) {

            profileUsername.textContent = newUsername;

            }

        if (newBio) {

            profileBio.textContent = newBio;

        }

       if (newInterests) {

    profileInterests.innerHTML = "";

    const interestsArray =
    newInterests.split(",");

    interestsArray.forEach(function(interest) {

        const span =
        document.createElement("span");

        span.textContent =
        interest.trim();

        if (span.textContent !== "") {

            profileInterests.appendChild(span);

        }

    });

}
         editProfile.style.display = "none";

    });

}


if (cancelProfileButton) {

    cancelProfileButton.addEventListener("click", function() {

        editProfile.style.display = "none";

    });

}

// 🌸 Profile Picture

const profileImage =
document.getElementById("profile-image");

const profilePlaceholder =
document.getElementById("profile-placeholder");

const editProfilePicture =
document.getElementById("edit-profile-picture");


if (editProfilePicture) {

    editProfilePicture.addEventListener("change", function() {

        const file = editProfilePicture.files[0];

        if (file) {

            const imageURL =
            URL.createObjectURL(file);

            profileImage.src = imageURL;

            profileImage.style.display = "block";

            profilePlaceholder.style.display = "none";

        }

    });

}




