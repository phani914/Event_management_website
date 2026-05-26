const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const themeToggle = document.querySelector(".theme-toggle");
const ticketButtons = document.querySelectorAll("[data-ticket-plan]");
const checkoutPrompt = document.getElementById("checkout-prompt");
const checkoutPromptTitle = document.getElementById("checkout-prompt-title");
const checkoutPromptCopy = document.getElementById("checkout-prompt-copy");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const loginMessage = document.getElementById("login-message");
const signupMessage = document.getElementById("signup-message");
const accountSummary = document.getElementById("account-summary");
const accountSummaryTitle = document.getElementById("account-summary-title");
const accountSummaryCopy = document.getElementById("account-summary-copy");
const accountPrimaryAction = document.getElementById("account-primary-action");
const logoutButton = document.getElementById("logout-button");
const accountLinks = document.querySelectorAll(".account-link");
const rememberLogin = document.getElementById("remember-login");
const forgotPasswordLink = document.getElementById("forgot-password-link");
const checkoutSection = document.getElementById("checkout");
const checkoutForm = document.getElementById("checkout-form");
const checkoutPlan = document.getElementById("checkout-plan");
const checkoutPrice = document.getElementById("checkout-price");
const checkoutQuantity = document.getElementById("checkout-quantity");
const checkoutQuantityLabel = document.getElementById("checkout-quantity-label");
const checkoutFee = document.getElementById("checkout-fee");
const checkoutTotal = document.getElementById("checkout-total");
const checkoutStatus = document.getElementById("checkout-status");
const checkoutSubmit = document.getElementById("checkout-submit");
const checkoutMessage = document.getElementById("checkout-message");
const checkoutLoginLink = document.getElementById("checkout-login-link");

const USERS_KEY = "eventhub-users";
const SESSION_KEY = "eventhub-current-user";
const TICKET_KEY = "eventhub-selected-ticket";
const TICKET_PRICE_KEY = "eventhub-selected-ticket-price";
const BOOKINGS_KEY = "eventhub-bookings";
const REMEMBERED_EMAIL_KEY = "eventhub-remembered-email";

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

function setCurrentUser(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function clearCurrentUser() {
  localStorage.removeItem(SESSION_KEY);
}

function formatCurrency(amount) {
  return `$${amount.toLocaleString("en-US")}`;
}

function setMessage(element, message, type = "success") {
  if (!element) return;

  element.textContent = message;
  element.className = `form-message ${type}`;
}

function getSelectedTicketPrice() {
  const savedPrice = Number(localStorage.getItem(TICKET_PRICE_KEY));
  return Number.isFinite(savedPrice) ? savedPrice : 0;
}

function getSelectedTicket() {
  return new URLSearchParams(window.location.search).get("ticket") || localStorage.getItem(TICKET_KEY);
}

function saveBooking(booking) {
  let bookings = [];

  try {
    bookings = JSON.parse(localStorage.getItem(BOOKINGS_KEY)) || [];
  } catch {
    bookings = [];
  }

  bookings.push(booking);
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}

function updateAccountLinks() {
  const currentUser = getCurrentUser();

  accountLinks.forEach((link) => {
    link.textContent = currentUser ? `Hi, ${currentUser.name.split(" ")[0]}` : "Login / Create Account";
    link.href = "account.html";
  });
}

function updateCheckoutLoginLink() {
  if (!checkoutLoginLink) return;

  const selectedTicket = getSelectedTicket();
  const ticketQuery = selectedTicket ? `?ticket=${encodeURIComponent(selectedTicket)}` : "";
  checkoutLoginLink.href = `account.html${ticketQuery}#account-panel`;
}

function updateCheckout() {
  if (!checkoutForm) return;

  const selectedTicket = getSelectedTicket();
  const selectedPrice = getSelectedTicketPrice();
  const quantity = Number(checkoutQuantity?.value || 1);
  const subtotal = selectedPrice * quantity;
  const fee = selectedPrice ? Math.max(4, Math.round(subtotal * 0.06)) : 0;
  const total = subtotal + fee;
  const currentUser = getCurrentUser();
  const attendeeNameInput = document.getElementById("checkout-name");
  const attendeeEmailInput = document.getElementById("checkout-email");

  if (checkoutPlan) checkoutPlan.textContent = selectedTicket || "Choose a ticket to begin";
  if (checkoutPrice) checkoutPrice.textContent = formatCurrency(selectedPrice);
  if (checkoutQuantityLabel) checkoutQuantityLabel.textContent = String(quantity);
  if (checkoutFee) checkoutFee.textContent = formatCurrency(fee);
  if (checkoutTotal) checkoutTotal.textContent = formatCurrency(total);

  if (currentUser && attendeeNameInput && !attendeeNameInput.value) {
    attendeeNameInput.value = currentUser.name;
  }

  if (currentUser && attendeeEmailInput && !attendeeEmailInput.value) {
    attendeeEmailInput.value = currentUser.email;
  }

  if (checkoutStatus) {
    checkoutStatus.textContent = selectedTicket
      ? currentUser
        ? `Signed in as ${currentUser.name}. Ready to checkout.`
        : "Login or create an account before confirming checkout."
      : "Select a ticket above to load checkout.";
  }

  if (checkoutSubmit) {
    checkoutSubmit.disabled = !selectedTicket;
    checkoutSubmit.textContent = currentUser ? "Confirm Checkout" : "Login Required";
  }

  updateCheckoutLoginLink();
}

function updateAccountSummary() {
  if (!accountSummary) return;

  const currentUser = getCurrentUser();
  const selectedTicket = getSelectedTicket();

  accountSummary.hidden = !currentUser;

  if (!currentUser) return;

  if (accountSummaryTitle) {
    accountSummaryTitle.textContent = `Welcome, ${currentUser.name}`;
  }

  if (accountSummaryCopy) {
    accountSummaryCopy.textContent = selectedTicket
      ? `You can continue checkout for the ${selectedTicket} pass.`
      : "You are signed in and ready to manage your bookings.";
  }

  if (accountPrimaryAction) {
    accountPrimaryAction.textContent = selectedTicket ? "Continue Checkout" : "Browse Tickets";
    accountPrimaryAction.href = selectedTicket ? "index.html#checkout" : "index.html#tickets";
  }
}

function finishAccountAccess(messageElement, actionLabel) {
  const selectedTicket = getSelectedTicket();
  const nextStep = selectedTicket
    ? `${actionLabel} successful. Return to checkout for your ${selectedTicket} pass.`
    : `${actionLabel} successful. Your account is ready.`;

  setMessage(messageElement, nextStep);
  updateAccountLinks();
  updateAccountSummary();
  updateCheckout();
}

function setTheme(theme) {
  const isDark = theme === "dark";
  document.body.classList.toggle("dark-theme", isDark);

  if (themeToggle) {
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  }

  localStorage.setItem("eventhub-theme", theme);
}

const savedTheme = localStorage.getItem("eventhub-theme") || "light";
setTheme(savedTheme);

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("dark-theme") ? "light" : "dark";
    setTheme(nextTheme);
  });
}

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.classList.toggle("active", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.addEventListener("click", (event) => {
    if (event.target.tagName === "A") {
      navLinks.classList.remove("open");
      navToggle.classList.remove("active");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

ticketButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const ticketPlan = button.dataset.ticketPlan;
    const ticketPrice = button.dataset.ticketPrice || "0";

    if (ticketPlan) {
      localStorage.setItem(TICKET_KEY, ticketPlan);
      localStorage.setItem(TICKET_PRICE_KEY, ticketPrice);
    }

    updateCheckout();
    setMessage(checkoutMessage, `${ticketPlan} pass selected. Review your checkout details.`);
    checkoutSection?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const selectedTicket = getSelectedTicket();

if (selectedTicket) {
  localStorage.setItem(TICKET_KEY, selectedTicket);
}

if (selectedTicket && checkoutPrompt) {
  checkoutPrompt.hidden = false;

  if (checkoutPromptTitle) {
    checkoutPromptTitle.textContent = `Login or create an account to buy the ${selectedTicket} pass`;
  }

  if (checkoutPromptCopy) {
    checkoutPromptCopy.textContent = "Enter your account details below to continue with ticket checkout.";
  }

  document.getElementById("login-email")?.focus();
}

if (signupForm) {
  signupForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim().toLowerCase();
    const password = document.getElementById("signup-password").value;
    const terms = signupForm.querySelector("input[type='checkbox']").checked;

    if (!name || !email || !password) {
      setMessage(signupMessage, "Please fill in all create account details.", "error");
      return;
    }

    if (password.length < 6) {
      setMessage(signupMessage, "Password must be at least 6 characters.", "error");
      return;
    }

    if (!terms) {
      setMessage(signupMessage, "Please accept the account terms to continue.", "error");
      return;
    }

    const users = getUsers();

    if (users.some((user) => user.email === email)) {
      setMessage(signupMessage, "An account already exists with this email. Please login instead.", "error");
      return;
    }

    const user = { name, email, password };
    users.push(user);
    saveUsers(users);
    setCurrentUser({ name, email });
    signupForm.reset();
    finishAccountAccess(signupMessage, "Account creation");
  });
}

if (loginForm) {
  const rememberedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);

  if (rememberedEmail) {
    document.getElementById("login-email").value = rememberedEmail;

    if (rememberLogin) {
      rememberLogin.checked = true;
    }
  }

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = document.getElementById("login-email").value.trim().toLowerCase();
    const password = document.getElementById("login-password").value;
    const user = getUsers().find((savedUser) => savedUser.email === email && savedUser.password === password);

    if (!email || !password) {
      setMessage(loginMessage, "Please enter your email and password.", "error");
      return;
    }

    if (!user) {
      setMessage(loginMessage, "No matching account found. Check your details or create an account.", "error");
      return;
    }

    setCurrentUser({ name: user.name, email: user.email });

    if (rememberLogin?.checked) {
      localStorage.setItem(REMEMBERED_EMAIL_KEY, user.email);
    } else {
      localStorage.removeItem(REMEMBERED_EMAIL_KEY);
    }

    loginForm.reset();
    finishAccountAccess(loginMessage, "Login");
  });
}

if (forgotPasswordLink) {
  forgotPasswordLink.addEventListener("click", (event) => {
    event.preventDefault();

    const email = document.getElementById("login-email").value.trim().toLowerCase();
    const userExists = getUsers().some((user) => user.email === email);

    if (!email) {
      setMessage(loginMessage, "Enter your email first, then choose forgot password.", "error");
      return;
    }

    setMessage(
      loginMessage,
      userExists
        ? "Password reset instructions would be sent to this email in a live site."
        : "No account was found for this email. Please create an account."
    );
  });
}

if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    clearCurrentUser();
    localStorage.removeItem(TICKET_KEY);
    localStorage.removeItem(TICKET_PRICE_KEY);
    updateAccountLinks();
    updateAccountSummary();
    updateCheckout();
    setMessage(loginMessage, "You have been logged out.");
  });
}

updateAccountLinks();
updateAccountSummary();
updateCheckout();

if (checkoutQuantity) {
  checkoutQuantity.addEventListener("change", updateCheckout);
}

if (checkoutForm) {
  checkoutForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const selectedTicket = getSelectedTicket();
    const selectedPrice = getSelectedTicketPrice();
    const currentUser = getCurrentUser();

    if (!selectedTicket || !selectedPrice) {
      setMessage(checkoutMessage, "Please select a ticket before checkout.", "error");
      document.getElementById("tickets")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (!currentUser) {
      setMessage(checkoutMessage, "Please login or create an account to continue checkout.", "error");
      updateCheckoutLoginLink();
      return;
    }

    const attendeeName = document.getElementById("checkout-name").value.trim();
    const attendeeEmail = document.getElementById("checkout-email").value.trim().toLowerCase();
    const attendeePhone = document.getElementById("checkout-phone").value.trim();
    const quantity = Number(checkoutQuantity?.value || 1);
    const subtotal = selectedPrice * quantity;
    const fee = Math.max(4, Math.round(subtotal * 0.06));
    const total = subtotal + fee;

    if (!attendeeName || !attendeeEmail || !attendeePhone) {
      setMessage(checkoutMessage, "Please fill in all attendee details.", "error");
      return;
    }

    saveBooking({
      ticket: selectedTicket,
      quantity,
      total,
      attendeeName,
      attendeeEmail,
      attendeePhone,
      accountEmail: currentUser.email,
      createdAt: new Date().toISOString(),
    });

    checkoutForm.reset();
    localStorage.removeItem(TICKET_KEY);
    localStorage.removeItem(TICKET_PRICE_KEY);
    updateCheckout();
    setMessage(checkoutMessage, `Checkout confirmed for ${quantity} ${selectedTicket} ticket${quantity > 1 ? "s" : ""}.`);
  });
}

const countdown = document.querySelector(".countdown");
const countdownStatus = document.getElementById("countdown-status");
const countdownUnits = countdown ? {
  days: countdown.querySelector("#days"),
  hours: countdown.querySelector("#hours"),
  minutes: countdown.querySelector("#minutes"),
  seconds: countdown.querySelector("#seconds"),
} : null;

function updateCountdown() {
  if (!countdown || !countdownUnits || Object.values(countdownUnits).some((unit) => !unit)) return;

  const eventDate = new Date(countdown.dataset.eventDate).getTime();
  const now = Date.now();
  const difference = Math.max(eventDate - now, 0);
  const isLive = eventDate <= now;

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / (1000 * 60)) % 60);
  const seconds = Math.floor((difference / 1000) % 60);

  countdownUnits.days.textContent = String(days).padStart(2, "0");
  countdownUnits.hours.textContent = String(hours).padStart(2, "0");
  countdownUnits.minutes.textContent = String(minutes).padStart(2, "0");
  countdownUnits.seconds.textContent = String(seconds).padStart(2, "0");

  if (countdownStatus && isLive) {
    countdownStatus.textContent = "The summit is live now";
  }
}

updateCountdown();
setInterval(updateCountdown, 1000);
