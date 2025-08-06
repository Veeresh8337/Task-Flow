import { Task } from '../models/task.model.js';
import pkg from 'express-validator';
const { body } = pkg;

// Validation schema for task fields
const validateTaskInput = (data, isUpdate = false) => {
  const errors = [];

  if (isUpdate && data.status) {
    if (data.title && typeof data.title !== 'string') {
      errors.push('Title must be a string');
    }
  } else {
    if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
      errors.push('Title is required and must be a non-empty string');
    }
  }

  if (data.description && typeof data.description !== 'string') {
    errors.push('Description must be a string');
  }

  if (data.status && !['todo', 'in-progress', 'done'].includes(data.status)) {
    errors.push('Status must be one of: todo, in-progress, done');
  }

  if (data.priority && !['low', 'medium', 'high'].includes(data.priority)) {
    errors.push('Priority must be one of: low, medium, high');
  }

  if (data.dueDate && isNaN(Date.parse(data.dueDate))) {
    errors.push('Due date must be a valid date');
  }

  return errors;
};

// Middleware to sanitize inputs
const sanitizeTaskInput = (isUpdate = false) => [
  body('title').custom((value, { req }) => {
    if (isUpdate && req.body.status) return true;
    if (!value || value.trim().length === 0) {
      throw new Error('Title is required and must be a non-empty string');
    }
    return true;
  }).trim().escape(),
  body('description').optional().trim().escape(),
];

// Create a new task
export const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;
    const loggedInUser = req.user?._id;

    if (!loggedInUser) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No user found'
      });
    }

    const validationErrors = validateTaskInput(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    const task = await Task.create({
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : undefined,
      assignedTo: loggedInUser,
      user: loggedInUser,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.status(201).json({
      success: true,
      data: task,
      message: 'Task created successfully'
    });
  } catch (err) {
    console.error('Error creating task:', { error: err.message, stack: err.stack });
    res.status(500).json({
      success: false,
      message: 'Failed to create task',
      error: err.message
    });
  }
};

// Get all tasks created by the user
export const getUserTasks = async (req, res) => {
  try {
    const loggedInUser = req.user?._id;

    if (!loggedInUser) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No user found'
      });
    }

    const tasks = await Task.find({ user: loggedInUser })
      .populate('assignedTo', 'email')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: tasks,
      message: tasks.length ? 'Tasks retrieved successfully' : 'No tasks found',
      count: tasks.length
    });
  } catch (err) {
    console.error('Error fetching tasks:', { error: err.message, stack: err.stack });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks',
      error: err.message
    });
  }
};

// ✅ Get single task by ID
export const getTaskById = async (req, res) => {
  try {
    const loggedInUser = req.user?._id;
    const taskId = req.params.id;

    if (!loggedInUser) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No user found'
      });
    }

    const task = await Task.findOne({ _id: taskId, user: loggedInUser })
      .populate('assignedTo', 'email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or not authorized'
      });
    }

    res.status(200).json({
      success: true,
      data: task,
      message: 'Task retrieved successfully'
    });
  } catch (err) {
    console.error('Error fetching task by ID:', { error: err.message, stack: err.stack });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch task',
      error: err.message
    });
  }
};

// Update task
export const updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;
    const loggedInUser = req.user?._id;
    const taskId = req.params.id;

    if (!loggedInUser) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No user found'
      });
    }

    const validationErrors = validateTaskInput(req.body, true);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    const updateFields = {
      updatedAt: new Date()
    };

    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (status !== undefined) updateFields.status = status;
    if (priority !== undefined) updateFields.priority = priority;
    if (dueDate !== undefined) updateFields.dueDate = new Date(dueDate);

    const task = await Task.findOneAndUpdate(
      { _id: taskId, user: loggedInUser },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or not authorized'
      });
    }

    res.status(200).json({
      success: true,
      data: task,
      message: 'Task updated successfully'
    });
  } catch (err) {
    console.error('Error updating task:', { error: err.message, stack: err.stack });
    res.status(500).json({
      success: false,
      message: 'Failed to update task',
      error: err.message
    });
  }
};

// Delete task
export const deleteTask = async (req, res) => {
  try {
    const loggedInUser = req.user?._id;
    const taskId = req.params.id;

    if (!loggedInUser) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No user found'
      });
    }

    const task = await Task.findOne({ _id: taskId, user: loggedInUser });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or not authorized'
      });
    }

    await Task.deleteOne({ _id: taskId, user: loggedInUser });

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting task:', { error: err.message, stack: err.stack });
    res.status(500).json({
      success: false,
      message: 'Failed to delete task',
      error: err.message
    });
  }
};
