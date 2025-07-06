import express from 'express';
import * as taskController from '../controllers/taskController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import actionLogger from '../middleware/actionLogger.js';

const router = express.Router();

router.use(authMiddleware);
router.post('/', actionLogger, taskController.createTask);
router.get('/', taskController.getTasks);
router.put('/:id', actionLogger, taskController.updateTask);
router.delete('/:id', actionLogger, taskController.deleteTask);
router.post('/:taskId/smart-assign', actionLogger, taskController.smartAssign);

export default router;