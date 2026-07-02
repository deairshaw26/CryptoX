/* =========================================================
   CryptoX Authentication API
   In-memory demo backend (no real storage)
========================================================= */

const AuthAPI = {
  // Demo user for testing
  demoUser: {
    id: "user_demo",
    name: "Deair",
    handle: "deair_x",
    email: "deair@cryptox.io",
    password: "moon123",
  },

  // In-memory storage
  users: {},
  currentSession: null,

  // Initialize
  init() {
    this.users[this.demoUser.email] = this.demoUser;
  },

  // Sign in
  async signIn(emailOrHandle, password) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Demo account
        if (
          (emailOrHandle === this.demoUser.email ||
            emailOrHandle === "@" + this.demoUser.handle) &&
          password === this.demoUser.password
        ) {
          this.currentSession = { ...this.demoUser };
          resolve({ ok: true, user: this.currentSession });
          return;
        }

        // Check registered users
        for (let email in this.users) {
          const user = this.users[email];
          if (
            (emailOrHandle === email || emailOrHandle === "@" + user.handle) &&
            user.password === password
          ) {
            this.currentSession = { ...user };
            resolve({ ok: true, user: this.currentSession });
            return;
          }
        }

        resolve({ ok: false, error: "Invalid email/handle or password" });
      }, 400);
    });
  },

  // Register
  async register(data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { name, handle, email, password } = data;

        // Validation
        if (!name || !handle || !email || !password) {
          resolve({ ok: false, error: "All fields are required" });
          return;
        }
        if (password.length < 6) {
          resolve({
            ok: false,
            error: "Password must be at least 6 characters",
          });
          return;
        }
        if (this.users[email]) {
          resolve({ ok: false, error: "Email already in use" });
          return;
        }

        // Create user
        const user = {
          id: "user_" + Date.now(),
          name,
          handle,
          email,
          password,
        };
        this.users[email] = user;
        this.currentSession = { ...user };
        resolve({ ok: true, user: this.currentSession });
      }, 400);
    });
  },

  // Get current user
  async currentUser() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.currentSession);
      }, 100);
    });
  },

  // Sign out
  async signOut() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.currentSession = null;
        resolve();
      }, 100);
    });
  },

  // Reset password
  async resetPassword(email, newPassword) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Validation
        if (!email || !newPassword) {
          resolve({ ok: false, error: "Email and password are required" });
          return;
        }
        if (newPassword.length < 6) {
          resolve({
            ok: false,
            error: "Password must be at least 6 characters",
          });
          return;
        }

        // Find user by email
        const user = this.users[email];
        if (!user) {
          // Security: don't reveal if email exists
          resolve({
            ok: false,
            error: "Email not found or does not have an account",
          });
          return;
        }

        // Update password
        user.password = newPassword;
        this.users[email] = user;
        resolve({ ok: true });
      }, 400);
    });
  },
};

// Initialize auth
AuthAPI.init();
