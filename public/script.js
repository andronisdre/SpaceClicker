let total = 0;
let clicks = 0;
let matterPerClick = 1;
let buyButtonsIterations = [
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
];
let upgradeButtonIterations = 1;
let totalPerSecond = 0;
let storedIteration = 1;
let notificationsEnabled = true;
let clickCooldown = false;

let musicMuted = false;
let audioMuted = false;

document.addEventListener("DOMContentLoaded", (event) => {
  const app = firebase.app();
  console.log(app);

  // Create the toggle button
  const toggleButton = document.createElement("button");
  toggleButton.id = "toggleNotificationsButton";
  toggleButton.className = "loginButton";
  toggleButton.innerText = "Disable Shooting stars";
  toggleButton.onclick = toggleNotifications;

  // Set the button position to top center
  toggleButton.style.position = "fixed";
  toggleButton.style.top = "10px";
  toggleButton.style.left = "50%";
  toggleButton.style.transform = "translateX(-50%)";

  // Append the button to the body
  document.body.appendChild(toggleButton);

  // Function to toggle notifications
  function toggleNotifications() {
    notificationsEnabled = !notificationsEnabled;
    toggleButton.innerText = notificationsEnabled
      ? "Disable Shooting stars"
      : "Enable Shooting stars";
  }

  // Disable the logout button initially
  document.getElementById("logoutButton").disabled = true;

  const db = firebase.firestore();

  // Create the leaderboard container
  const leaderboardContainer = document.createElement("div");
  leaderboardContainer.id = "leaderboardContainer";
  leaderboardContainer.style.position = "fixed";
  leaderboardContainer.style.top = "70px";
  leaderboardContainer.style.left = "5px";
  leaderboardContainer.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
  leaderboardContainer.style.border = "1px solid #000";
  leaderboardContainer.style.padding = "10px";
  leaderboardContainer.style.paddingTop = "40px";
  leaderboardContainer.style.userSelect = "none";
  leaderboardContainer.style.display = "none"; // Initially hidden

  // Create a button to toggle the leaderboard visibility
  const toggleLeaderboardButton = document.createElement("button");
  toggleLeaderboardButton.id = "toggleLeaderboardButton";
  toggleLeaderboardButton.className = "loginButton";
  toggleLeaderboardButton.innerText = "Show Leaderboard";
  toggleLeaderboardButton.style.position = "fixed"; // Add position style
  toggleLeaderboardButton.style.top = "40px";
  toggleLeaderboardButton.style.left = "5px";
  toggleLeaderboardButton.style.userSelect = "none";
  toggleLeaderboardButton.onclick = toggleLeaderboard;

  // Append the button to the body
  document.body.appendChild(toggleLeaderboardButton);

  // Append the leaderboard container to the body
  document.body.appendChild(leaderboardContainer);

  // Function to toggle the leaderboard visibility
  function toggleLeaderboard() {
    const leaderboardContainer = document.getElementById(
      "leaderboardContainer"
    );
    const toggleLeaderboardButton = document.getElementById(
      "toggleLeaderboardButton"
    );
    const showCookiesButton = document.getElementById("showCookiesButton");
    const showClicksButton = document.getElementById("showClicksButton");

    if (leaderboardContainer.style.display === "none") {
      leaderboardContainer.style.display = "block";
      toggleLeaderboardButton.innerText = "Hide Leaderboard";
      showCookiesButton.style.display = "inline-block";
      showClicksButton.style.display = "inline-block";

      sortBy = "totalMatter";
      isShowCookiesButtonDisabled = false;
      displayLeaderboard(sortBy);
    } else {
      leaderboardContainer.style.display = "none";
      toggleLeaderboardButton.innerText = "Show Leaderboard";
      showCookiesButton.style.display = "none";
      showClicksButton.style.display = "none";
    }
  }

  // Add event listeners for the cookies and clicks buttons to switch the leaderboard
  document
    .getElementById("showCookiesButton")
    .addEventListener("click", function () {
      displayLeaderboard("totalMatter");
    });

  document
    .getElementById("showClicksButton")
    .addEventListener("click", function () {
      displayLeaderboard("totalClicks");
    });

  let isShowCookiesButtonDisabled = false;
  let isShowClicksButtonDisabled = false;

  // Function to fetch and display the leaderboard data
  function displayLeaderboard(sortBy) {
    const leaderboardTable = document.createElement("table");
    leaderboardTable.style.width = "100%";

    // Perform a query to get the top 10 users ordered by the specified field (totalMatter or totalClicks)
    const fieldToOrderBy =
      sortBy === "totalMatter" ? "totalMatter" : "totalClicks";
    const query = db
      .collection("users")
      .orderBy(fieldToOrderBy, "desc")
      .limit(10);

    if (sortBy == "totalMatter") {
      isShowCookiesButtonDisabled = !isShowCookiesButtonDisabled;
      isShowClicksButtonDisabled = false;
      document.getElementById("showCookiesButton").disabled =
        isShowCookiesButtonDisabled;
      document.getElementById("showClicksButton").disabled = false;
    } else if (sortBy == "totalClicks") {
      isShowClicksButtonDisabled = !isShowClicksButtonDisabled;
      isShowCookiesButtonDisabled = false;
      document.getElementById("showClicksButton").disabled =
        isShowClicksButtonDisabled;
      document.getElementById("showCookiesButton").disabled = false;
    }

    query.get().then((snapshot) => {
      let position = 1;

      snapshot.forEach((doc) => {
        const data = doc.data();
        const userEmail = data.email.split("@")[0].substring(0, 10);
        const userScore = data[fieldToOrderBy];

        const row = leaderboardTable.insertRow();
        const cellPosition = row.insertCell(0);
        const cellUser = row.insertCell(1);
        const cellScore = row.insertCell(2);

        // Set IDs for the cells to easily target them for updates
        cellPosition.id = `position_${position}`;
        cellUser.id = `user_${position}`;
        cellScore.id = `score_${position}`;

        cellPosition.innerText = `${position}.`;
        cellUser.innerText = userEmail;
        cellScore.innerText = formatNumber(userScore);

        position++;
      });

      // Append the table to the leaderboard container
      leaderboardContainer.innerHTML = "";
      leaderboardContainer.appendChild(leaderboardTable);
    });
  }

  // Function to update user data in Firestore
  function updateUserData() {
    const userId = firebase.auth().currentUser.uid;
    const userRef = db.collection("users").doc(userId);

    // Log values before update
    console.log("Updating user data:", { total, clicks });

    // Update the Firestore document with the current values of totalMatter and totalClicks
    userRef
      .update({
        totalMatter: total,
        totalClicks: clicks,
        matterPerClickVar: matterPerClick,
        upgradeButtonIterationsVar: upgradeButtonIterations,
        totalPerSecondVar: totalPerSecond,
        buyButtonsIterationsVar: buyButtonsIterations,
      })
      .then(() => {
        console.log("User data updated in Firestore.");
      })
      .catch((error) => {
        console.error("Error updating user data:", error);
      });

    // Update the display
    updateDisplay();
  }

  // Set up the interval to update total every second, these are autoclicker functions
  setInterval(function () {
    total += totalPerSecond;
    document.getElementById("total").innerText = formatNumber(total);
    checkButtonBuyableStatus(); // Call the function to update button style

    if (totalPerSecond > 0 && notificationsEnabled == true) {
      for (let i = 1; i <= totalPerSecond && i <= 150; i++) {
        // Calculate a random delay within the 1000 millisecond interval
        let delay = Math.random() * 1000;

        // Use setTimeout to stagger the appearance of notifications
        setTimeout(function () {
          shootingStarNotification(500); // Show the notification
        }, delay);
      }
    }
  }, 1000);

  // Function to handle user login
  function handleLogin(user) {
    const userId = user.uid;
    const userRef = db.collection("users").doc(userId);

    // Check if the user already exists in the database
    userRef
      .get()
      .then((doc) => {
        if (doc.exists) {
          // User exists, fetch totalMatter, totalClicks, and email from the document
          const data = doc.data();
          email = data.email || "null";
          total = data.totalMatter || 0;
          clicks = data.totalClicks || 0;
          matterPerClick = data.matterPerClickVar || 1;
          upgradeButtonIterations = data.upgradeButtonIterationsVar || 1;
          totalPerSecond = data.totalPerSecondVar || 0;
          buyButtonsIterations = data.buyButtonsIterationsVar || [
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1,
          ];

          updateUserData();

          console.log(
            `User already exists. Total cookies: ${total}, Total clicks: ${clicks}, Email: ${email}`
          );
        } else {
          // User doesn't exist, create a new document
          userRef
            .set({
              created_at: new Date(),
              email: user.email,
              totalMatter: 0, // Set initial value for totalMatter
              totalClicks: 0, // Set initial value for totalClicks
              matterPerClickVar: 1,
              upgradeButtonIterationsVar: 1,
              totalPerSecondVar: 0,
              buyButtonsIterationsVar: [
                1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                1, 1, 1, 1,
              ],
            })
            .then(() => {
              console.log("New user created in the database.");
            })
            .catch((error) => {
              console.error("Error creating new user document:", error);
            });
        }
      })
      .catch((error) => {
        console.error("Error checking user existence:", error);
      });

    // Set up the interval to update data every hour
    setInterval(updateUserData, 3600000);

    // Update the display immediately after login
    updateDisplay();

    // Handle user logout when the browser is closed or refreshed
    window.onbeforeunload = function () {
      updateUserData();
      handleLogout();
    };
  }

  // Function to load user data from Firestore on login or refresh
  function loadUserData() {
    const userId = firebase.auth().currentUser.uid;
    const userRef = db.collection("users").doc(userId);

    userRef
      .get()
      .then((doc) => {
        if (doc.exists) {
          const data = doc.data();
          total = data.totalMatter || 0;
          clicks = data.totalClicks || 0;
          matterPerClick = data.matterPerClickVar || 1;
          upgradeButtonIterations = data.upgradeButtonIterationsVar || 1;
          totalPerSecond = data.totalPerSecondVar || 0;
          buyButtonsIterations = data.buyButtonsIterationsVar || [
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1,
          ];

          console.log("User data loaded from Firestore:", data);

          // Update the display
          updateDisplay();

          createButtonsFromUserData();

          upgradeButtonTextUpdate();
        }
      })
      .catch((error) => {
        console.error("Error loading user data:", error);
      });
  }

  function upgradeButtonTextUpdate() {
    const upgradeButton = document.getElementById("upgradeButton");
    upgradeButton.innerHTML = "";
    upgradeButton.style.display = "none";
    getNextUpgradeButton(100 * 3 ** (upgradeButtonIterations - 1), 2);
  }

  // Function to create buttons based on user data
  function createButtonsFromUserData() {
    let buttonGrid = document.getElementById("buttonGrid");
    buttonGrid.innerHTML = ""; // Clear existing buttons
    let upgradebuttonGrid = document.getElementById("upgradebuttonGrid");
    upgradebuttonGrid.innerHTML = ""; // Clear existing buttons

    for (let i = 1; i <= 25; i++) {
      if (buyButtonsIterations[i - 1] != 1) {
        storedIteration = buyButtonsIterations[i - 1];
        console.log(storedIteration + " " + (i - 1));
      } else {
        storedIteration = 1;
      }
      createButtonIteration(i, storedIteration);
    }

    // Initial update to set the correct buyable status
    checkButtonBuyableStatus();
  }

  // Function to initiate Google login
  function googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase
      .auth()
      .signInWithPopup(provider)
      .then((result) => {
        const user = result.user;
        console.log(user);
        handleLogin(user);

        // Disable the login button after successful login
        document.getElementById("loginButton").disabled = true;
        // Enable the logout button
        document.getElementById("logoutButton").disabled = false;
        loginButton.innerText = "Logged in";

        // Update the display immediately after login
        updateDisplay();
      })
      .catch((error) => {
        console.error("Google login error:", error);
      });
  }

  // Attach the login function to a button or other trigger
  const loginButton = document.getElementById("loginButton");
  loginButton.addEventListener("click", googleLogin);

  // Load user data on page load or refresh
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      console.log("User is logged in:", user);
      handleLogin(user);

      loadUserData();
    } else {
      console.log("User is logged out.");
    }
  });
  // Handle user logout when the browser is closed or refreshed
  window.onbeforeunload = function () {
    updateUserData();
    handleLogout();
  };

  // Function to handle user logout
  function handleLogout() {
    updateUserData();
    firebase
      .auth()
      .signOut()
      .then(() => {
        console.log("User logged out.");
        // You can perform additional tasks after logout if needed
        // Disable the logout button after successful logout
        document.getElementById("logoutButton").disabled = true;
        // Enable the login button
        document.getElementById("loginButton").disabled = false;
        loginButton.innerText = "Login with Google";
        location.reload();
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  }

  // Attach the logout function to a button or other trigger
  const logoutButton = document.getElementById("logoutButton");
  logoutButton.addEventListener("click", handleLogout);
});

function changeResolution(resolution) {
  if (resolution === "low") {
    document.body.style.backgroundImage = `url(
      "texture_cookie_game/background3Downscaled.jpeg"
    )`;
  } else if (resolution === "high") {
    document.body.style.backgroundImage = `url(
      "texture_cookie_game/background3Downscaled.jpeg"
    )`;
  }
}

let isAnimationsDisplayed = true;

function disableAnimations() {
  const disableAnimationsButton = document.getElementById(
    "disableAnimationsButton"
  );
  if (isAnimationsDisplayed) {
    disableAnimationsButton.innerText = "Enable Background Animation";
    document.body.style.animation = "none";
    isAnimationsDisplayed = false;
  } else {
    disableAnimationsButton.innerText = "Disable Background Animation";
    document.body.style.animation = "moveBackground 120s linear infinite";
    isAnimationsDisplayed = true;
  }
}

let isSettingsDisplayed = false;

function displaySettings() {
  const settings = document.getElementById("settingsDisplay");
  if (!isSettingsDisplayed) {
    settings.style.display = "flex";
    isSettingsDisplayed = true;
  } else {
    settings.style.display = "none";
    isSettingsDisplayed = false;
  }
}

// Function to update the display
function updateDisplay() {
  document.getElementById("total").innerText = formatNumber(total);
  document.getElementById("clicks").innerText = formatNumber(clicks);
  document.getElementById("totalPerSecond").innerText =
    formatNumber(totalPerSecond);
}

function playBackgroundMusic() {
  const backgroundMusic = document.getElementById("backgroundMusic");
  backgroundMusic.volume = 0.5; // Adjust volume as needed

  // Check if the audio context requires user interaction
  let playPromise = backgroundMusic.play();

  if (playPromise !== undefined) {
    playPromise
      .then((_) => {
        // Autoplay started successfully
      })
      .catch((error) => {
        // Autoplay was prevented, show a UI element to let the user start playback
        console.error("Autoplay prevented:", error);
      });
  }

  document.removeEventListener("click", playBackgroundMusic);
}

document.addEventListener("click", playBackgroundMusic);

function toggleMusic() {
  musicMuted = !musicMuted;
  const backgroundMusic = document.getElementById("backgroundMusic");
  backgroundMusic.muted = musicMuted;
  updateSoundButtons(); // Update sound control buttons
}

function toggleAudio() {
  audioMuted = !audioMuted;
  const clickSound = document.getElementById("clickSound");
  const buySound = document.getElementById("buySound");
  clickSound.muted = audioMuted;
  buySound.muted = audioMuted;
  updateSoundButtons(); // Update sound control buttons
}

function updateSoundButtons() {
  const musicToggle = document.getElementById("musicToggle");
  const audioToggle = document.getElementById("audioToggle");

  if (musicMuted) {
    musicToggle.innerText = "🎵 Music 🔇";
  } else {
    musicToggle.innerText = "🎵 Music 🔊";
  }

  if (audioMuted) {
    audioToggle.innerText = "🔊 Audio 🔇";
  } else {
    audioToggle.innerText = "🔊 Audio 🔊";
  }
}

function updateButtonStyle() {
  const buyButtons = document.querySelectorAll(".buyButton:not(.bought)");
  buyButtons.forEach(function (button) {
    const buttonCost = parseInt(button.innerText.match(/-(\d+)/)[1]);
    if (total < buttonCost) {
      button.classList.add("notBuyable");
    } else {
      button.classList.remove("notBuyable");
    }
  });
}

function checkButtonBuyableStatus() {
  const buyButtons = document.querySelectorAll(".buyButton:not(.bought)");
  buyButtons.forEach(function (button) {
    const buttonCost = parseInt(button.getAttribute("data-cost"));
    if (total < buttonCost) {
      button.classList.add("notBuyable");
    } else {
      button.classList.remove("notBuyable");
    }
  });
}

function incrementAndDisplay() {
  if (!clickCooldown) {
    total += matterPerClick;
    clicks++;
    document.getElementById("total").innerText = formatNumber(total);
    document.getElementById("clicks").innerText = formatNumber(clicks);
    checkButtonBuyableStatus(); // Call the function to update button style
    shootingStarNotification(500); // Show the notification
    playClickSound(); // Play the click sound
    clickCooldown = true;
    setTimeout(function () {
      clickCooldown = false;
    }, 50); // 0.05-second cooldown
  }
}

function playClickSound() {
  const clickSound = document.getElementById("clickSound");
  clickSound.pause();
  clickSound.volume = 0.05;
  clickSound.currentTime = 0;
  clickSound.play();
}

// Updated buyButton function to handle iteration replacement
function buyButton(cost, button, iter, baseCost) {
  let buttonCost = parseInt(cost);

  if (total >= buttonCost) {
    total -= buttonCost;

    buyButtonsIterations[iter - 1] += 1;

    // Update total cookies and display
    document.getElementById("total").innerText = formatNumber(total); // Format with commas

    // Hide the clicked button
    button.style.display = "none";

    // Show the next button
    let nextButton = button.nextSibling;
    while (nextButton && nextButton.nodeType !== 1) {
      nextButton = nextButton.nextSibling;
    }

    if (nextButton) {
      nextButton.style.display = "inline-block";
    }

    let toPerSecs = getButtonRate(baseCost);
    totalPerSecond += Math.round(toPerSecs);

    // Play sound for button purchase
    playBuySound();

    updateDisplay();

    // Show notification for autoclicker bought with a longer duration
    showNotification("Autoclicker Bought!", 3000);
  }
}

function playBuySound() {
  const buySound = document.getElementById("buySound");
  buySound.pause();
  buySound.volume = 0.5;
  buySound.currentTime = 0;
  buySound.play();
}

const cookieButton = document.getElementById("cookieButton");

function buyUpgradeButton(button) {
  let buttonCost = parseInt(button.getAttribute("data-cost"));
  const multiplier = parseInt(button.getAttribute("data-multiplier"));

  if (total >= buttonCost) {
    total -= buttonCost;

    upgradeButtonIterations += 1;

    // Mark the current button as bought and hide it
    button.classList.add("bought");
    button.style.display = "none";

    // Hide previous iterations of the button
    hidePreviousIterations(button);

    // Update total cookies and display
    document.getElementById("total").innerText = formatNumber(total);

    // Apply the multiplier for each click
    matterPerClick *= multiplier;

    // Play the button purchase sound
    playBuySound();

    // Check for the next upgrade button
    const nextCost = buttonCost * 3; // Next cost is 5 times the current cost
    const nextMultiplier = 2; // Multiplier for the next upgrade

    cookieButton.style.transform = "scale(1.6)";
    cookieButton.style.opacity = "0.5";

    setTimeout(() => {
      cookieButton.style.backgroundImage = `url(
        "texture_cookie_game/matter${upgradeButtonIterations}.png"
      )`;
      cookieButton.style.opacity = "1";
      cookieButton.style.transform = "scale(1)";
    }, 100);

    let upgradeButtonName = getUpgradeButtonName(upgradeButtonIterations);
    const clickTheMatterText = document.getElementById("clickTheMatter");
    clickTheMatterText.innerText = `Click the ${upgradeButtonName}!`;

    // Get or create the next upgrade button
    const nextButton = getNextUpgradeButton(nextCost, nextMultiplier);

    // Display the next button if it exists
    if (nextButton) {
      nextButton.style.display = "inline-block";
    }
  }
}

function hidePreviousIterations(currentButton) {
  //checkButtonBuyableStatus();

  // Find the container for the autoclicker buttons
  const autoclickerContainer = document.getElementById("buttonGrid");

  // Get all buttons in the container
  const allButtons = autoclickerContainer.getElementsByClassName("buyButton");

  // Iterate over the buttons
  for (let i = 0; i < allButtons.length; i++) {
    const button = allButtons[i];

    // Check if the button is not the current button and is bought
    if (button !== currentButton && button.classList.contains("bought")) {
      // Hide the button
      button.style.display = "none";
      console.log("Hiding previous iteration:", button);
    }
  }
}

function getNextUpgradeButton(cost, multiplier) {
  const nextButton = document.createElement("button");
  nextButton.className = "buyButton notBuyable";
  nextButton.id = "upgradeButton";
  nextButton.setAttribute("data-cost", cost);
  nextButton.setAttribute("data-multiplier", multiplier);
  checkButtonBuyableStatus();
  nextButton.onclick = function () {
    buyUpgradeButton(this);
  };
  const iteration = Math.log(cost / 10) / Math.log(3) + 1;
  const buttonName = getCookieButtonName(iteration);
  nextButton.innerText =
    "Upgrade celestial body" +
    " (-" +
    formatNumber(cost) +
    " total matter, " +
    multiplier +
    "* more matter from pressing the body)";

  // Find the container for the autoclicker buttons
  const autoclickerContainer = document.getElementById("upgradebuttonGrid");

  autoclickerContainer.style.display = "flex";
  autoclickerContainer.style.justifyContent = "center";

  // Insert the next button at the end of the autoclicker buttons container
  autoclickerContainer.appendChild(nextButton);

  console.log("Next button created:", nextButton);

  updateUserData();

  // Return the newly created button
  return nextButton;
}

function showNotification(message, duration = 1000) {
  const notificationContainer = document.getElementById(
    "notificationsContainer"
  );

  // Create a notification element
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.innerText = message;

  // Calculate random position within the entire screen
  const posX = getRandomInRange(
    0,
    window.innerWidth - notification.offsetWidth
  );
  const posY = getRandomInRange(
    0,
    window.innerHeight - notification.offsetHeight
  );

  // Ensure the notification is not covering buttons or "total cookies" text
  const elementsToAvoid = document.querySelectorAll(
    ".buyButton, #displayArea, #clickTheMatter"
  );
  elementsToAvoid.forEach(function (element) {
    const rect = element.getBoundingClientRect();
    if (
      posX < rect.right &&
      posX + notification.offsetWidth > rect.left &&
      posY < rect.bottom &&
      posY + notification.offsetHeight > rect.top
    ) {
      // If there's an overlap, adjust the position
      posX = rect.right;
      posY = rect.bottom;
    }
  });

  // Set the notification position
  notification.style.left = posX + "px";
  notification.style.top = posY + "px";

  // Append the notification to the container
  notificationContainer.appendChild(notification);

  // Schedule removal after the specified duration
  setTimeout(function () {
    notification.style.transition = "opacity " + duration / 1000 + "s ease-out";
    notification.style.opacity = 0;

    // Remove the notification after the transition
    setTimeout(function () {
      notification.remove();
    }, duration);
  }, 10); // Delay added to ensure smooth fading
}

function getRandomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

function isOverlapping(posX, posY) {
  // Check if the position overlaps with any button
  const buttons = document.querySelectorAll(".buyButton");
  for (let i = 0; buttons && i < buttons.length; i++) {
    const rect = buttons[i].getBoundingClientRect();
    if (
      posX < rect.right &&
      posX + notification.offsetWidth > rect.left &&
      posY < rect.bottom &&
      posY + notification.offsetHeight > rect.top
    ) {
      return true; // Overlapping
    }
  }
  return false; // Not overlapping
}

function startPop() {
  const cookieButton = document.getElementById("cookieButton");
  cookieButton.style.transform = "scale(1.1)";
}

function endPop() {
  const cookieButton = document.getElementById("cookieButton");
  cookieButton.style.transform = "scale(1)";
}

function getCookieButtonName(index) {
  // Add more names as needed
  const names = [
    "Laser",
    "Cannon",
    "Telekinesis",
    "Fragment",
    "Factor Y",
    "Quark Splitter",
    "Void Blaster",
    "Wizard",
    "Contorter",
    "Astral Cleaver",
    "Portal",
    "Time Machine",
    "Antimatter Condenser",
    "Strange",
    "Chancemaker",
    "Fractal Engine",
    "Silent Watcher",
    "Wonder",
    "Idle Dimension",
    "Universal Omitter",
    "Nuclear Extractor",
    "Black hole",
    "Reality Bending",
    "Deus",
    "Oghma Infinium",
  ];
  return names[index - 1] || "Unnamed"; // Default to "Unnamed" if out of names
}

function getUpgradeButtonName(index) {
  // Add more names as needed
  const names = [
    "Meteoroid",
    "Meteor",
    "Comet",
    "Asteroid",
    "Dwarf Planet",
    "Moon",
    "Terrestrial Planet",
    "Gas Giant",
    "Brown Dwarf",
    "Red Dwarf Star",
    "Yellow Dwarf Star",
    "White Dwarf Star",
    "Blue Giant Star",
    "Neutron Star",
    "Red Giant Star",
    "Black Hole",
    "Supermassive Black Hole",
    "Globular Cluster",
    "Galaxy",
    "Galaxy Cluster",
  ];
  return names[index - 1] || "Unnamed"; // Default to "Unnamed" if out of names
}

function getButtonRate(cost) {
  // Formula for button rate, rounded to the nearest integer
  return Math.round(1 + (1 / 400) * cost);
}

//document.addEventListener("click", event => {
const buttonGrid = document.getElementById("buttonGrid");
for (let i = 1; i <= 25; i++) {
  if (buyButtonsIterations[i - 1] != 1) {
    storedIteration = buyButtonsIterations[i - 1];
    console.log(storedIteration + " " + (i - 1));
  } else {
    storedIteration = 1;
  }
  createButtonIteration(i, storedIteration);
}

function createButtonIteration(iteration, storedIter) {
  const baseCost = 20 * Math.pow(4, iteration - 1);
  const buttonName = getCookieButtonName(iteration);
  const maxIterations = 11; // Maximum number of iterations

  // Retrieve the stored iteration count from the array

  for (let i = 1; i <= maxIterations; i++) {
    const button = document.createElement("button");
    button.className = "buyButton";
    const buttonCost = Math.round(baseCost * Math.pow(1.5, i - 1));
    const buttonRate = getButtonRate(baseCost);
    button.setAttribute("data-cost", buttonCost);

    if (i === storedIter && storedIter < maxIterations) {
      button.style.display = "inline-block"; // Display the first iteration
    } else {
      button.style.display = "none"; // Hide the rest
    }

    button.onclick = function () {
      const iter = iteration;
      buyButton(this.getAttribute("data-cost"), this, iter, baseCost);
    };

    if (i === maxIterations) {
      button.onclick = function () {
        // Do nothing when clicked (10th iteration)
      };
      // Create the "Max" button
      const maxButton = document.createElement("button");
      maxButton.className = "maxButton";
      if (storedIter !== maxIterations) {
        maxButton.style.display = "none"; // Initially hidden
      }
      if (storedIter === maxIterations) {
        maxButton.style.display = "inline-block"; // Initially shown
      }
      maxButton.innerText = "Max " + buttonName + " Bought!";
      buttonGrid.appendChild(maxButton);
    }

    button.innerText =
      "Buy " +
      buttonName +
      " " +
      i +
      " (-" +
      formatNumber(buttonCost) +
      ", +" +
      formatNumber(buttonRate) +
      "/sec)";

    buttonGrid.appendChild(button);
  }
}

// Initial update to set the correct buyable status
checkButtonBuyableStatus();

//})

// Create sound control buttons
const soundControl = document.createElement("div");
soundControl.id = "soundControl";

const musicToggle = document.createElement("button");
musicToggle.id = "musicToggle";
musicToggle.onclick = function () {
  toggleMusic();
};
musicToggle.innerText = "🎵 Music 🔊";
soundControl.appendChild(musicToggle);

const audioToggle = document.createElement("button");
audioToggle.id = "audioToggle";
audioToggle.onclick = function () {
  toggleAudio();
};
audioToggle.innerText = "🔊 Audio 🔊";
soundControl.appendChild(audioToggle);

// Append sound control buttons to the body
document.body.appendChild(soundControl);

function formatNumber(number) {
  if (number >= 1e15) {
    // Display in quadrillions
    return (number / 1e15).toFixed(2) + "Q";
  } else if (number >= 1e12) {
    // Display in trillions
    return (number / 1e12).toFixed(2) + "T";
  } else if (number >= 1e9) {
    // Display in billions
    return (number / 1e9).toFixed(2) + "B";
  } else if (number >= 1e6) {
    // Display in millions
    return (number / 1e6).toFixed(2) + "M";
  } else if (number >= 1e3) {
    // Display in thousands
    return (number / 1e3).toFixed(2) + "K";
  } else {
    return number.toLocaleString();
  }
}

const buttons = document.querySelectorAll(".buy-button");

function randomMovement() {
  buttons.forEach((button) => {
    let randomX = Math.random() * 400; // Random x position
    let randomY = Math.random() * 400; // Random y position
    randomX -= 1000;
    randomY -= 1000;
    button.style.transform = `translate(${randomX}px, ${randomY}px)`;
  });
}

// Move buttons every 2 seconds
setInterval(randomMovement, 1000);

function shootingStarNotification(duration) {
  const container = document.getElementById("notification-container");

  // Create a new shooting star element
  const star = document.createElement("div");
  star.classList.add("shooting-star");

  // Randomize the starting position
  const startX = Math.random() * window.innerWidth;
  const startY = Math.random() * window.innerHeight;
  star.style.left = `${startX}px`;
  star.style.top = `${startY}px`;
  star.style.zIndex = -2;

  // Append the star to the container
  container.appendChild(star);

  // Remove the star after the animation duration
  setTimeout(() => {
    container.removeChild(star);
  }, 500); // Match the duration of the animation
}
