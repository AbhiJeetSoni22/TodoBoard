import Task from '../models/Task.schema.js';
import User from '../models/User.schema.js';
import { io } from '../index.js';

export const createTask = async (req, res) => {
  const { title, description, priority } = req.body;
  const forbiddenTitles = ['Todo', 'In Progress', 'Done'];

  try {
    if (forbiddenTitles.includes(title)) {
      return res.status(400).json({ message: 'Task title cannot match column names' });
    }

    const existingTask = await Task.findOne({ title });
    if (existingTask) {
      return res.status(400).json({ message: 'Task title must be unique' });
    }

    const task = new Task({
      title,
      description,
      priority,
      assignedUser: req.user.id,
    });

    await task.save();
    io.emit('taskUpdate', task);
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().populate('assignedUser', 'name');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateTask = async (req, res) => {
  const { title, description, assignedUser, status, priority, lastModified } = req.body;
  const forbiddenTitles = ['Todo', 'In Progress', 'Done'];

  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Conflict detection
    if (lastModified && new Date(lastModified) < task.lastModified) {
      return res.status(409).json({
        message: 'Conflict detected',
        currentVersion: task,
        clientVersion: req.body,
      });
    }

    if (title && forbiddenTitles.includes(title)) {
      return res.status(400).json({ message: 'Task title cannot match column names' });
    }

    if (title && title !== task.title) {
      const existingTask = await Task.findOne({ title });
      if (existingTask) {
        return res.status(400).json({ message: 'Task title must be unique' });
      }
    }

    task.title = title || task.title;
    task.description = description || task.description;
    task.assignedUser = assignedUser || task.assignedUser;
    task.status = status || task.status;
    task.priority = priority || task.priority;
    task.lastModified = Date.now();

    await task.save();
    const updatedTask = await Task.findById(req.params.id).populate('assignedUser', 'name');
    io.emit('taskUpdate', updatedTask);
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.deleteOne();
    io.emit('taskDelete', req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const smartAssign = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Find user with fewest active tasks
    const users = await User.find();
    let minTasks = Infinity;
    let selectedUser = null;

    for (const user of users) {
      const taskCount = await Task.countDocuments({
        assignedUser: user._id,
        status: { $in: ['Todo', 'In Progress'] },
      });
      if (taskCount < minTasks) {
        minTasks = taskCount;
        selectedUser = user;
      }
    }

    if (!selectedUser) {
      return res.status(404).json({ message: 'No users found' });
    }

    task.assignedUser = selectedUser._id;
    task.lastModified = Date.now();
    await task.save();

    const updatedTask = await Task.findById(req.params.id).populate('assignedUser', 'name');
    io.emit('taskUpdate', updatedTask);
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};