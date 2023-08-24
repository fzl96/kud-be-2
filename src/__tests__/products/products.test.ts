import { getProducts } from "./get-products.js";
import { createProduct } from "./create-product.js";
import { getProduct } from "./get-product-by-id.js";
import { updateProduct } from "./update-product.js";
import { deleteProduct } from "./delete-product.js";

describe("Produk", () => {
  getProducts();
  createProduct();
  getProduct();
  updateProduct();
  deleteProduct();
});
