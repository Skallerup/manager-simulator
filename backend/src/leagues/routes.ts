import { Router } from 'express';
import { 
  getAllLeagues, 
  getLeagueById,
  getLeagueStandings, 
  getUserLeague, 
  assignUserTeamToLeague,
  getLeagueMatches 
} from './handlers';

const router = Router();

// Public routes (no auth required)
router.get('/', getAllLeagues);
router.get('/:leagueId', getLeagueById);
router.get('/:leagueId/standings', getLeagueStandings);
router.get('/:leagueId/matches', getLeagueMatches);

// Protected routes (auth required)
router.get('/user/current', getUserLeague);
router.post('/assign-team', assignUserTeamToLeague);

export default router;