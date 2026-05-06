const express = require('express');
const router = express.Router();
const { createAssignment, getAssignments, updateAssignment, deleteAssignment } = require('../controllers/assignmentController');
const { protectRoute, adminOnly } = require('../middleware/authMiddleware');

router.route('/')
  .get(protectRoute, getAssignments)
  .post(protectRoute, adminOnly, createAssignment);

router.route('/:id')
  .put(protectRoute, adminOnly, updateAssignment)
  .delete(protectRoute, adminOnly, deleteAssignment);

module.exports = router;
