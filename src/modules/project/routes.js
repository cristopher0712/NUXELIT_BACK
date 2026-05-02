const express = require('express');
const router = express.Router();
const projectController = require('./project.controller');
const { protect, authorize } = require('../../middleware/auth');
const { ROLES } = require('../../utils/constants');

// Protected routes (Admin only) - Comentado temporalmente para pruebas locales
// router.use(protect);
// router.use(authorize(ROLES.SUPERADMIN, ROLES.ADMIN));

router.get('/dashboard', projectController.getDashboardStats);
router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProjectById);
router.post('/', projectController.createProject);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

module.exports = router;
