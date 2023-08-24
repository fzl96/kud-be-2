import { getCategories } from "./getCategories.js";
import { getCategory } from "./getCategoryById.js";
import { createCategory } from "./createCategory.js";
import { updateCategory } from "./updateCategory.js";
import { deleteCategory } from "./deleteCategory.js";

describe("Kategori", () => {
  getCategories();
  getCategory();
  createCategory();
  updateCategory();
  deleteCategory();
});
