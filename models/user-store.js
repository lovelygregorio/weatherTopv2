import { v4 as uuid } from "uuid";

const users = [];

export const userStore = {

  // create a new user and save to array
  async create({ firstName, lastName, email, password }) {
    const user = {
      _id: uuid(), // unique user id
      firstName: String(firstName || "").trim(), // convert input to text and trim spaces
      lastName: String(lastName || "").trim(),  // convert input to text and trim spaces
      email: String(email || "").trim().toLowerCase(), // save email in small caps to avoid mismatch
      password: String(password || ""), // save password as text
    };

    users.push(user); // store in memory list
    return user; // return new user to controller
  },

  // find a user by email 
  async findByEmail(email) {
    const cleanedEmail = String(email || "").trim().toLowerCase(); // clean email input
    const user = users.find((u) => u.email === cleanedEmail); // check if email matches stored one
    return user || null; // return user or null if none
  },

  // find a user by id
  async findById(id) {
    return users.find((u) => u._id === id) || null; // return user or null if missing
  },

  // update user fields by id (profile settings uses this)
  //  avoids overwriting missing fields)
  async update(id, updatedFields) {
    const user = await this.findById(id); // lookup user
    if (!user) return null; // exit early if user not found

    // update only if field was sent from form
    if (updatedFields.firstName !== undefined) {
      user.firstName = String(updatedFields.firstName).trim();
    }
    if (updatedFields.lastName !== undefined) {
      user.lastName = String(updatedFields.lastName).trim();
    }
    if (updatedFields.email !== undefined) {
      user.email = String(updatedFields.email).trim().toLowerCase();
    }
    if (updatedFields.password !== undefined && updatedFields.password !== "") {
      user.password = String(updatedFields.password);
    }

    return user; // send updated user back to controller
  },
};
