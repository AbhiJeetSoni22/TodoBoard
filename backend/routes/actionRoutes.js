import express from 'express';
import * as actionController from '../controllers/actionController.js';

const router = express.Router();

router.get('/',actionController.getActions);

export default router;