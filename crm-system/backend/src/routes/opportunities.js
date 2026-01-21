const express = require('express');
const router = express.Router();
const opportunityController = require('../controllers/opportunityController');
const validate = require('../middlewares/validate');
const {
  createOpportunityValidation,
  updateOpportunityValidation,
  opportunityIdValidation,
  updateStageValidation,
  markAsClosedValidation,
  getOpportunitiesValidation,
  getStatsValidation
} = require('../validations/opportunityValidation');

router.get('/', getOpportunitiesValidation, validate, opportunityController.getOpportunities);
router.post('/', createOpportunityValidation, validate, opportunityController.createOpportunity);
router.get('/kanban', opportunityController.getKanbanData);
router.get('/stats', getStatsValidation, validate, opportunityController.getStats);
router.get('/stats/funnel', getStatsValidation, validate, opportunityController.getFunnel);
router.get('/stats/stage', getStatsValidation, validate, opportunityController.getStageStats);
router.get('/stats/forecast', getStatsValidation, validate, opportunityController.getForecast);
router.get('/stats/trend', getStatsValidation, validate, opportunityController.getTrend);
router.get('/stats/team-comparison', getStatsValidation, validate, opportunityController.getTeamComparison);
router.get('/stats/with-time-range', getStatsValidation, validate, opportunityController.getStatsWithTimeRange);
router.put('/:id/stage', updateStageValidation, validate, opportunityController.updateStage);
router.put('/:id/won', markAsClosedValidation, validate, opportunityController.markAsWon);
router.put('/:id/lost', markAsClosedValidation, validate, opportunityController.markAsLost);
router.get('/:id', opportunityIdValidation, validate, opportunityController.getOpportunityById);
router.put('/:id', updateOpportunityValidation, validate, opportunityController.updateOpportunity);
router.delete('/:id', opportunityIdValidation, validate, opportunityController.deleteOpportunity);

module.exports = router;
