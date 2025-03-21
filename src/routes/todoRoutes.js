import express from "express";
import prisma from "../prismaClient.js";
const router = express.Router();

// Get all todos for a logged in user
router.get("/", async (req, res) => {
  const todos = await prisma.todo.findMany({
    where: {
      userId: req.userId,
    },
  });
  res.json(todos);
});

// Create a new todo
router.post("/", async (req, res) => {
  const { task } = req.body;
  if (!task) {
    return res.status(400).json({ message: "Task is reequired" });
  }
  const insertTodo = await prisma.todo.create({
    data: {
      task,
      userId: req.userId,
    },
  });
  res.status(201).json(insertTodo);
});

// Update a todo
router.put("/:id", async (req, res) => {
  const { completed } = req.body;
  const { id } = req.params;

  const updatedTodo = await prisma.todo.update({
    where: {
      id: parseInt(id),
      userId: req.userId, // Ensure the user can only update their own todos
    },
    data: {
      completed: !!completed, // Convert to boolean
    },
  });
  res.status(200).json(updatedTodo);
});

// Delete a todo
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const deleteTodo = await prisma.todo.delete({
    where: {
      id: parseInt(id),
      userId: req.userId, // Ensure the user can only delete their own todos
    },
  });
  res.status(200).json(deleteTodo);
});

export default router;
