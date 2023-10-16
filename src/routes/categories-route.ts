import express from "express";
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  deleteCategories,
} from "../controllers/categories-controller.js";

const router = express.Router();

/**
 * @swagger
 * /categories:
 *  get:
 *    description: Get all categories
 *    tags:
 *      - Categories
 *    responses:
 *      200:
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  id:
 *                    type: string
 *                  name:
 *                    type: string
 *                  createdAt:
 *                    type: string
 *                  updatedAt:
 *                    type: string
 *            example:
 *              - id: "1"
 *                name: "Category 1"
 *                createdAt: "2022-01-01T00:00:00.000Z"
 *                updatedAt: "2022-01-01T00:00:00.000Z"
 *              - id: "2"
 *                name: "Category 2"
 *                createdAt: "2022-01-02T00:00:00.000Z"
 *                updatedAt: "2022-01-02T00:00:00.000Z"
 *      500:
 *        description: Internal Server Error
 */
router.get("/", getCategories);


router.get("/:id", getCategory);
router.post("/", createCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);
router.delete("/", deleteCategories);

export default router;
