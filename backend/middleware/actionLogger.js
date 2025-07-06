import ActionLog from '../models/ActionLog.schema.js';
import Task from '../models/Task.schema.js';
import { io } from '../index.js';

const actionLogger = async (req, res, next) => {
  const { method, path, body, user } = req;
  let action = '';
  let details = '';
  let taskId = null;

  try {
    if (method === 'POST' && path === '/tasks') {
      action = 'create';
      taskId = res.locals.task?._id || null;
      details = `Created task: ${res.locals.task?.title || body.title || 'Unknown'}`;
    } else if (method === 'PUT' && path.includes('/tasks/')) {
      action = 'update';
      taskId = req.params.id;
      const task = await Task.findById(taskId).select('title');
      details = `Updated task: ${task?.title || 'Unknown'}`;
    } else if (method === 'DELETE' && path.includes('/tasks/')) {
      action = 'delete';
      taskId = req.params.id;
      const task = await Task.findById(taskId).select('title');
      details = `Deleted task: ${task?.title || 'Unknown'}`;
    } else if (method === 'POST' && path.includes('/smart-assign')) {
      // Skip logging here; handled in smartAssign function
      return next();
    }

    if (action && user) {
      const actionLog = new ActionLog({
        user: user.id,
        action,
        taskId,
        details,
        timestamp: new Date(),
      });
      await actionLog.save();
      const populatedAction = await ActionLog.findById(actionLog._id).populate('user', 'name');
      console.log('Emitting actionUpdate:', populatedAction);
      io.emit('actionUpdate', populatedAction);
    }
  } catch (err) {
    console.error('Action logger error:', err);
  }

  next();
};

export default actionLogger;