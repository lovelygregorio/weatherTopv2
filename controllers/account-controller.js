// handles signup, login, logout, view and update account pages
import { userStore } from "../models/user-store.js";

export const accountController = {
  // show signup page
  showSignup(request, response) {
    return response.render("signup-view", { title: "Signup" });
  },

  // register a new user and save them to the session
  async signup(request, response) {
    try {
      // read form fields
      const firstName = request.body.firstName;
      const lastName = request.body.lastName;
      const email = request.body.email?.toLowerCase(); // make email lowercase
      const password = request.body.password;

      // check if email is already in use
      const existingUser = await userStore.findByEmail(email);
      if (existingUser) {
        return response.status(400).render("signup-view", {
          title: "Signup",
          error: "Email is already registered",
        });
      }

      // create the new user in the store
      const newUser = await userStore.create({
        firstName,
        lastName,
        email,
        password,
      });

      // keep the user logged in using the session
      request.session.user = newUser;

      // go to dashboard
      return response.redirect("/dashboard");
    } catch (error) {
      console.error("Signup failed:", error);
      return response.render("error-view", {
        title: "Signup Error",
        message: "Account not created",
      });
    }
  },

  // show login page
  showLogin(request, response) {
    return response.render("login-view", { title: "Login" });
  },

  // log user in and save them to the session
  async login(request, response) {
    try {
      // read form fields
      const email = request.body.email?.toLowerCase();
      const password = request.body.password;

      // find user by email
      const user = await userStore.findByEmail(email);

      // check if user exists and password matches
      if (!user || user.password !== password) {
        return response.status(401).render("login-view", {
          title: "Login",
          error: "Invalid email or password",
        });
      }

      // save user to session
      request.session.user = user;

      // go to dashboard
      return response.redirect("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      return response.render("error-view", {
        title: "Login Error",
        message: "Login not complete",
      });
    }
  },

  // log user out and clear session
  logout(request, response) {
    request.session.destroy(() => {
      return response.redirect("/login");
    });
  },

  // show account settings page for the logged-in user
  async settings(request, response) {
    const user = request.session.user;

    // if no user in session, send to login page
    if (!user) {
      return response.redirect("/login");
    }

    return response.render("account-view", {
      title: "Account",
      user,
    });
  },

  // update user account and refresh session
  async update(request, response) {
    try {
      const user = request.session.user;

      // if no user in session, send to login page
      if (!user) {
        return response.redirect("/login");
      }

      // update user in store by id using form data
      const updatedUser = await userStore.update(user._id, request.body);

      // save updated user back into the session
      request.session.user = updatedUser;

      // go back to account settings page
      return response.redirect("/account");
    } catch (error) {
      console.error("Update failed:", error);
      return response.render("error-view", {
        title: "Update Error",
        message: "Account not updated",
      });
    }
  },
};
