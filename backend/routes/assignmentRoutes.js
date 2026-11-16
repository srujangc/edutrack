import express from 'express';
import {
  getAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  toggleAssignmentStatus,
  deleteAssignment
} from '../controllers/assignmentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAssignments)
  .post(createAssignment);

router.route('/:id')
  .get(getAssignmentById)
  .put(updateAssignment)
  .delete(deleteAssignment);

router.patch('/:id/toggle', toggleAssignmentStatus);

export default router;
