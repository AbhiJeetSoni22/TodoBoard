import Task from '../models/Task.schema.js';
import User from '../models/User.schema.js';
import ActionLog from '../models/ActionLog.schema.js';
import { io } from '../index.js';

export const createTask = async (req, res) => {
  const { title, description, priority,assignedUser } = req.body;
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
      assignedUser,
      lastModified: Date.now(),
    });

    await task.save();
    const populatedTask = await task.populate('assignedUser', 'name');
    res.locals.task = populatedTask; // Store for actionLogger
    io.emit('taskUpdate', populatedTask);
    res.status(201).json(populatedTask);
  } catch (err) {
    console.error('Create task error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().populate('assignedUser', 'name');
    res.json(tasks);
  } catch (err) {
    console.error('Get tasks error:', err);
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
    task.assignedUser = assignedUser !== undefined ? assignedUser : task.assignedUser;
    task.status = status || task.status;
    task.priority = priority || task.priority;
    task.lastModified = Date.now();

    await task.save();
    const updatedTask = await Task.findById(req.params.id).populate('assignedUser', 'name');
    io.emit('taskUpdate', updatedTask);
    res.json(updatedTask);
  } catch (err) {
    console.error('Update task error:', err);
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
    console.error('Delete task error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const smartAssign = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const users = await User.find();
    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    const userTaskCounts = await Promise.all(
      users.map(async (user) => {
        const taskCount = await Task.countDocuments({
          assignedUser: user._id,
          status: { $in: ['Todo', 'In Progress'] },
        });
        return { user, taskCount };
      })
    );

    const selectedUser = userTaskCounts.reduce((min, curr) =>
      curr.taskCount < min.taskCount || (curr.taskCount === min.taskCount && curr.user.name < min.user.name) ? curr : min
    ).user;

   

    task.assignedUser = selectedUser._id;
    // const assignedUserdata = await User.findOne(task.assignedUser)
    // console.log('assigned user data ',assignedUserdata)
    task.lastModified = Date.now();
    await task.save();

    const updatedTask = await Task.findById(req.params.taskId).populate('assignedUser', 'name');

    // Log the Smart Assign action
    const actionLog = new ActionLog({
      user: task.assignedUser,
      action: 'smart-assign',
      taskId: req.params.taskId,
      details: `Smart-assigned task: ${updatedTask.title || 'Unknown'} to ${updatedTask.assignedUser?.name || 'Unknown'}`,
      timestamp: new Date(),
    });
    await actionLog.save();
    const populatedAction = await ActionLog.findById(actionLog._id).populate('user', 'name');
    io.emit('actionUpdate', populatedAction);
  
    io.emit('taskUpdate', updatedTask);
  
    res.json(updatedTask);
  } catch (err) {
    console.error('Smart Assign error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};