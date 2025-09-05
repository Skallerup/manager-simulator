import { Router } from 'express';
import { createMatch, getMatches, simulateMatch, getMatchById } from './handlers';

const router = Router();

// Create a new match
router.post('/', createMatch);

// Get all matches (optionally filtered by leagueId)
router.get('/', getMatches);

// Get match by ID
router.get('/:id', getMatchById);

// Simulate a match
router.post('/:id/simulate', simulateMatch);

export default router;
