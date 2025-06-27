import { Router } from 'express';
import { InterviewController } from '../controllers/interviewController';

const router = Router();
const interviewController = new InterviewController();

// POST /api/messages - Submit a user message
router.post('/messages', (req, res) => interviewController.createMessage(req, res));

// GET /api/sessions/:id - Get conversation thread
router.get('/sessions/:id', (req, res) => interviewController.getSession(req, res));

// GET /api/themes/:sessionId - Get accumulated themes
router.get('/themes/:sessionId', (req, res) => interviewController.getThemes(req, res));

export default router; 