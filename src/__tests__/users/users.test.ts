import { getUsers } from "./getUsers.js";
import { createUser } from "./createUser.js";
import { deleteUser } from "./deleteUser.js";
import { getUserById } from "./getUserById.js";
import { updateUser } from "./updateUser.js";

describe("Kategori", () => {
  getUsers();
  createUser();
  getUserById();
  updateUser();
  deleteUser();
});
