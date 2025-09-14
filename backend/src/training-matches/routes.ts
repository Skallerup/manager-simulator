import { Router } from 'express';
import { 
  getLeagueTeams, 
  createTrainingMatch, 
  getTrainingMatches, 
  simulateTrainingMatch 
} from './handlers';

const router = Router();

// Get all teams in user's league (for opponent selection)
router.get('/league-teams', getLeagueTeams);

// Get all training matches for user
router.get('/', getTrainingMatches);

// Create a new training match
router.post('/', createTrainingMatch);

// Simulate a training match
router.post('/:id/simulate', simulateTrainingMatch);

export default router;
