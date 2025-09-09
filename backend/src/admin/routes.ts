import express from 'express';
import { switchToTestAccount, switchToAdmin, getCurrentUser } from './handlers';

const router = express.Router();

// Get current user info
router.get('/current-user', getCurrentUser);

// Switch to test account (admin only)
router.post('/switch-to-test', switchToTestAccount);

// Switch back to admin (from test account)
router.post('/switch-to-admin', switchToAdmin);

export default router;
