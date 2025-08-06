import { Router } from 'express';
import {
  createTask,
  getUserTasks,
  getTaskById, // ✅ Import the new controller
  updateTask,
  deleteTask
} from '../controllers/task.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Create a new task
router.post('/', verifyJWT, createTask);

// Get all tasks of the user
router.get('/', verifyJWT, getUserTasks);

// ✅ Get a single task by ID
router.get('/:id', verifyJWT, getTaskById);

// Update a task (you are using PATCH, which is fine for partial updates)
router.put('/:id', verifyJWT, updateTask);

// Delete a task
router.delete('/:id', verifyJWT, deleteTask);

export default router;
