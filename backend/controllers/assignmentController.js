import Assignment from '../models/Assignment.js';
import Subject from '../models/Subject.js';

// @desc    Get all assignments with filters, sorting, and overdue status
// @route   GET /api/assignments
// @access  Private
export const getAssignments = async (req, res) => {
  try {
    const { status, subjectId, priority, sortBy, search } = req.query;
    let query = { userId: req.user._id };

    if (subjectId && subjectId !== 'all') {
      query.subjectId = subjectId;
    }

    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    const now = new Date();

    if (status === 'Pending') {
      query.status = 'Pending';
    } else if (status === 'Completed') {
      query.status = 'Completed';
    } else if (status === 'Overdue') {
      query.status = 'Pending';
      query.dueDate = { $lt: now };
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    let sortOrder = { dueDate: 1 };
    if (sortBy === 'deadline-desc') {
      sortOrder = { dueDate: -1 };
    } else if (sortBy === 'priority') {
      // Custom sorting later or sort by createdAt
      sortOrder = { createdAt: -1 };
    } else if (sortBy === 'title') {
      sortOrder = { title: 1 };
    }

    const assignments = await Assignment.find(query)
      .populate('subjectId', 'name code color')
      .sort(sortOrder);

    // Compute remaining days and overdue flag dynamically
    const enrichedAssignments = assignments.map((assignment) => {
      const due = new Date(assignment.dueDate);
      const diffTime = due - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const isOverdue = assignment.status === 'Pending' && diffDays < 0;

      return {
        ...assignment.toObject(),
        daysRemaining: diffDays,
        isOverdue
      };
    });

    // Counts for tabs
    const [totalCount, pendingCount, completedCount, overdueCount] = await Promise.all([
      Assignment.countDocuments({ userId: req.user._id }),
      Assignment.countDocuments({ userId: req.user._id, status: 'Pending' }),
      Assignment.countDocuments({ userId: req.user._id, status: 'Completed' }),
      Assignment.countDocuments({ userId: req.user._id, status: 'Pending', dueDate: { $lt: now } })
    ]);

    return res.status(200).json({
      success: true,
      counts: {
        total: totalCount,
        pending: pendingCount,
        completed: completedCount,
        overdue: overdueCount
      },
      assignments: enrichedAssignments
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching assignments'
    });
  }
};

// @desc    Get single assignment
// @route   GET /api/assignments/:id
// @access  Private
export const getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('subjectId', 'name code color');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    return res.status(200).json({
      success: true,
      assignment
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching assignment'
    });
  }
};

// @desc    Create new assignment
// @route   POST /api/assignments
// @access  Private
export const createAssignment = async (req, res) => {
  try {
    const { title, subjectId, description, dueDate, priority, totalMarks } = req.body;

    if (!title || !subjectId || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, subject, and due date'
      });
    }

    // Verify subject belongs to user
    const subject = await Subject.findOne({ _id: subjectId, userId: req.user._id });
    if (!subject) {
      return res.status(400).json({
        success: false,
        message: 'Selected subject does not belong to your account'
      });
    }

    const assignment = await Assignment.create({
      userId: req.user._id,
      subjectId,
      title,
      description: description || '',
      dueDate,
      priority: priority || 'Medium',
      totalMarks: totalMarks || 100,
      status: 'Pending'
    });

    const populated = await assignment.populate('subjectId', 'name code color');

    return res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      assignment: populated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error creating assignment'
    });
  }
};

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private
export const updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    const { title, subjectId, description, dueDate, priority, status, obtainedMarks, totalMarks } = req.body;

    if (subjectId) {
      const subject = await Subject.findOne({ _id: subjectId, userId: req.user._id });
      if (!subject) {
        return res.status(400).json({
          success: false,
          message: 'Selected subject does not belong to your account'
        });
      }
      assignment.subjectId = subjectId;
    }

    if (title) assignment.title = title;
    if (description !== undefined) assignment.description = description;
    if (dueDate) assignment.dueDate = dueDate;
    if (priority) assignment.priority = priority;
    if (totalMarks !== undefined) assignment.totalMarks = totalMarks;
    if (obtainedMarks !== undefined) assignment.obtainedMarks = obtainedMarks;

    if (status && status !== assignment.status) {
      assignment.status = status;
      assignment.completedAt = status === 'Completed' ? new Date() : null;
    }

    const updated = await assignment.save();
    const populated = await updated.populate('subjectId', 'name code color');

    return res.status(200).json({
      success: true,
      message: 'Assignment updated successfully',
      assignment: populated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating assignment'
    });
  }
};

// @desc    Toggle assignment status (Pending <-> Completed)
// @route   PATCH /api/assignments/:id/toggle
// @access  Private
export const toggleAssignmentStatus = async (req, res) => {
  try {
    const assignment = await Assignment.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    const newStatus = assignment.status === 'Completed' ? 'Pending' : 'Completed';
    assignment.status = newStatus;
    assignment.completedAt = newStatus === 'Completed' ? new Date() : null;

    const updated = await assignment.save();
    const populated = await updated.populate('subjectId', 'name code color');

    return res.status(200).json({
      success: true,
      message: `Assignment marked as ${newStatus.toLowerCase()}`,
      assignment: populated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error toggling assignment status'
    });
  }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private
export const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    await Assignment.deleteOne({ _id: assignment._id });

    return res.status(200).json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error deleting assignment'
    });
  }
};
