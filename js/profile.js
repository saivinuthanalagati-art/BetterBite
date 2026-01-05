// Profile information
const viewProfile = document.querySelector(".view-profile");
const editProfile = document.querySelector(".edit-profile");
const editBtn = document.querySelector(".edit-btn");
const cancelBtn = document.querySelector(".cancel-btn");
const saveBtn = document.querySelector(".save-btn");
const profileImg = document.querySelector(".profile-img img");
const uploadBtn = document.querySelector(".upload-btn");

// View account info fields
const firstNameDisplay = document.querySelector(".firstName");
const lastNameDisplay = document.querySelector(".lastName");
const usernameDisplay = document.querySelector(".username");
const emailDisplay = document.querySelector(".email");
const passwordDisplay = document.querySelector(".password");

// Edit account info input fields
const firstNameInput = document.getElementById("firstNameInput");
const lastNameInput = document.getElementById("lastNameInput");
const usernameInput = document.getElementById("usernameInput");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");

// Hidden file input
const fileInput = document.createElement("input");
fileInput.type = "file";
fileInput.accept = "image/*";
fileInput.style.display = "none";
document.body.appendChild(fileInput);

// Update page header user picture + name on load
document.addEventListener("DOMContentLoaded", () => {
  function updateHeader() {
    const headerProfileImg = document.querySelector(".header-profile-img");
    const headerProfileName = document.querySelector(".profile-name");

    const storedProfile = JSON.parse(localStorage.getItem("userProfile")) || {};
    const profileImage = storedProfile.profileImage || "assets/images/default-user.png";
    const firstName = storedProfile.firstName || "Jane Doe";
    const lastName = storedProfile.lastName || "Smith";

    // Update profile picture
    if (headerProfileImg) {
      headerProfileImg.src = profileImage;
    }

    // Update user name display
    if (headerProfileName) {
      headerProfileName.textContent = `${firstName}`;
    }
  }

  // Update header on page load
  updateHeader();

  // Load saved profile data 
  function loadProfileData() {
    const storedProfile = JSON.parse(localStorage.getItem("userProfile"));

    // Get user information if it exists. Offer default values if it doesn't exist
    if (storedProfile) {
      if (firstNameDisplay) firstNameDisplay.textContent = storedProfile.firstName || "—";
      if (lastNameDisplay) lastNameDisplay.textContent = storedProfile.lastName || "—";
      if (usernameDisplay) usernameDisplay.textContent = storedProfile.username || "—";
      if (emailDisplay) emailDisplay.textContent = storedProfile.email || "—";
      if (passwordDisplay) passwordDisplay.textContent = storedProfile.password || "********";

      const imgSrc = storedProfile.profileImage || "assets/images/default-user.png";
      if (profileImg) profileImg.src = imgSrc;

      // Update header with stored data
      updateHeader();
    }
  }

  // Save profile data to local storage
  function saveProfileData(imageData) {
    // Get data from local storage
    const storedProfile = JSON.parse(localStorage.getItem("userProfile")) || {};

    // Update profile data
    const updatedProfile = {
      ...storedProfile,
      firstName: firstNameDisplay ? firstNameDisplay.textContent.trim() : storedProfile.firstName || "",
      lastName: lastNameDisplay ? lastNameDisplay.textContent.trim() : storedProfile.lastName || "",
      username: usernameDisplay ? usernameDisplay.textContent.trim() : storedProfile.username || "",
      email: emailDisplay ? emailDisplay.textContent.trim() : storedProfile.email || "",
      password: passwordDisplay && passwordDisplay.textContent === "********" ? (storedProfile.password || "") : "",
      profileImage: imageData || (storedProfile.profileImage || "assets/images/default-user.png"),
    };

    // Save updated profile to local storage
    localStorage.setItem("userProfile", JSON.stringify(updatedProfile));

    // Update header after saving
    updateHeader();
  }

  // Load current values into edit form input boxes
  function loadCurrentValues() {
    if (firstNameInput) firstNameInput.value = firstNameDisplay ? firstNameDisplay.textContent : "";
    if (lastNameInput) lastNameInput.value = lastNameDisplay ? lastNameDisplay.textContent : "";
    if (usernameInput) usernameInput.value = usernameDisplay ? usernameDisplay.textContent : "";
    if (emailInput) emailInput.value = emailDisplay ? emailDisplay.textContent : "";
    if (passwordInput) passwordInput.value = "";
  }

  // Initially show view profile information div + hide edit profile div
  if (viewProfile && editProfile) {
    viewProfile.style.display = "block";
    editProfile.style.display = "none";
    loadProfileData();
  }

  // Save button click - save info + show view profile div / hide edit profile div
  if (saveBtn) {
    saveBtn.addEventListener("click", (e) => {
      e.preventDefault();

      // Update user information from input fields
      if (firstNameDisplay) firstNameDisplay.textContent = firstNameInput.value || "—";
      if (lastNameDisplay) lastNameDisplay.textContent = lastNameInput.value || "—";
      if (usernameDisplay) usernameDisplay.textContent = usernameInput.value || "—";
      if (emailDisplay) emailDisplay.textContent = emailInput.value || "—";

      // Hide password information
      if (passwordInput && passwordInput.value.trim() !== "") {
        passwordDisplay.textContent = "********";
      }

      // Save data to local storage
      saveProfileData(); 

      // Show view profile + hide edit profile
      editProfile.style.display = "none";
      viewProfile.style.display = "block";
    });
  }

  // Edit button click - show edit profile + hide view profile
  if (editBtn) {
    editBtn.addEventListener("click", (e) => {
      e.preventDefault();
      loadCurrentValues();  // Load current values into edit form
      viewProfile.style.display = "none";
      editProfile.style.display = "block";
    });
  }

  // Cancel button click - show view profile + hide edit profile
  if (cancelBtn) {
    cancelBtn.addEventListener("click", (e) => {
      e.preventDefault();
      editProfile.style.display = "none";
      viewProfile.style.display = "block";
    });
  }

  // Change photo click - upload profile image
  if (uploadBtn) {
    uploadBtn.addEventListener("click", () => fileInput.click());
  }

  // Get file from user's device
  fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      // Update user image
      const imageData = e.target.result;
      if (profileImg) profileImg.src = imageData;

      // Save image to local storage
      saveProfileData(imageData);  
    };

    reader.readAsDataURL(file);
  });
});
