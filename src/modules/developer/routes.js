const express = require('express');
const router = express.Router();
const developerController = require('./developer.controller');
const { protect, authorize } = require('../../middleware/auth');
const { ROLES } = require('../../utils/constants');

// Public route for the landing page cards
router.get('/public', developerController.getPublicDevelopers);

// Protected routes (Admin only) - Comentado temporalmente
// router.use(protect);
// router.use(authorize(ROLES.SUPERADMIN, ROLES.ADMIN));

router.get('/', developerController.getAllDevelopers);
router.post('/', developerController.createDeveloper);
router.put('/:id', developerController.updateDeveloper);
router.delete('/:id', developerController.deleteDeveloper);

module.exports = router;
