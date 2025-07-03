import ActionLog from '../models/ActionLog.schema.js';
import { io } from '../index.js';

const actionLogger = async (req, res, next) => {
  const { method, path, body, user } = req;
  let action = '';
  let details = '';

  if (method === 'POST' && path === '/tasks') {
    action = 'create';
    details = `Created task: ${body.title}`;
  } else if (method === 'PUT' && path.includes('/tasks/')) {
    action = 'update';
    details = `Updated task: ${body.title || req.params.id}`;
  } else if (method === 'DELETE' && path.includes('/tasks/')) {
    action = 'delete';
    details = `Deleted task: ${req.params.id}`;
  } else if (method === 'POST' && path.includes('/smart-assign')) {
    action = 'smart-assign';
    details = `Smart-assigned task: ${req.params.id}`;
  }

  if (action) {
    const actionLog = new ActionLog({
      user: user.id,
      action,
      taskId: req.params.id || null,
      details,
    });
    await actionLog.save();

    io.emit('actionUpdate', {
      user: user.name,
      action,
      details,
      timestamp: actionLog.timestamp,
    });
  }

  next();
};

export default actionLogger;