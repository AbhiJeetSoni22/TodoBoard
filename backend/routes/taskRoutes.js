import express from 'express';
import * as taskController from '../controllers/taskController.js';

const router = express.Router();

router.post('/', taskController.createTask);
router.get('/', taskController.getTasks);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);
router.post('/:id/smart-assign', taskController.smartAssign);

export default router;