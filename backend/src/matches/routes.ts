import { Router } from 'express';
import { createMatch, getMatches, simulateMatch, getMatchById, createBotMatch, simulateBotMatch, getBotMatches, getMatchHighlights } from './handlers';

const router = Router();

// Bot match routes (must be before /:id routes)
router.post('/bot', createBotMatch);
router.get('/bot', getBotMatches);
router.post('/bot/:id/simulate', simulateBotMatch);
router.get('/bot/:id/highlights', getMatchHighlights);

// Create a new match
router.post('/', createMatch);

// Get all matches (optionally filtered by leagueId)
router.get('/', getMatches);

// Get match by ID
router.get('/:id', getMatchById);

// Simulate a match
router.post('/:id/simulate', simulateMatch);

export default router;
