import Note from '../models/Note.js';
import Subject from '../models/Subject.js';

// @desc    Get all notes with search and filters
// @route   GET /api/notes
// @access  Private
export const getNotes = async (req, res) => {
  try {
    const { search, subjectId, favorite } = req.query;
    let query = { userId: req.user._id };

    if (subjectId && subjectId !== 'all') {
      query.subjectId = subjectId;
    }

    if (favorite === 'true') {
      query.isFavorite = true;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const notes = await Note.find(query)
      .populate('subjectId', 'name code color')
      .sort({ isFavorite: -1, updatedAt: -1 });

    const totalCount = await Note.countDocuments({ userId: req.user._id });
    const favoriteCount = await Note.countDocuments({ userId: req.user._id, isFavorite: true });

    return res.status(200).json({
      success: true,
      counts: {
        total: totalCount,
        favorites: favoriteCount
      },
      notes
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching notes'
    });
  }
};

// @desc    Create a note
// @route   POST /api/notes
// @access  Private
export const createNote = async (req, res) => {
  try {
    const { title, content, subjectId, isFavorite, tags, color } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide note title and content'
      });
    }

    if (subjectId) {
      const subject = await Subject.findOne({ _id: subjectId, userId: req.user._id });
      if (!subject) {
        return res.status(400).json({
          success: false,
          message: 'Selected subject does not belong to you'
        });
      }
    }

    const note = await Note.create({
      userId: req.user._id,
      subjectId: subjectId || null,
      title,
      content,
      isFavorite: Boolean(isFavorite),
      tags: Array.isArray(tags) ? tags : [],
      color: color || '#ffffff'
    });

    const populated = await note.populate('subjectId', 'name code color');

    return res.status(201).json({
      success: true,
      message: 'Note created successfully',
      note: populated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error creating note'
    });
  }
};

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
export const updateNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    const { title, content, subjectId, isFavorite, tags, color } = req.body;

    if (subjectId !== undefined) {
      if (subjectId) {
        const subject = await Subject.findOne({ _id: subjectId, userId: req.user._id });
        if (!subject) {
          return res.status(400).json({
            success: false,
            message: 'Selected subject does not belong to you'
          });
        }
        note.subjectId = subjectId;
      } else {
        note.subjectId = null;
      }
    }

    if (title) note.title = title;
    if (content !== undefined) note.content = content;
    if (isFavorite !== undefined) note.isFavorite = Boolean(isFavorite);
    if (tags !== undefined) note.tags = Array.isArray(tags) ? tags : [];
    if (color) note.color = color;

    const updated = await note.save();
    const populated = await updated.populate('subjectId', 'name code color');

    return res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      note: populated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating note'
    });
  }
};

// @desc    Toggle favorite note
// @route   PATCH /api/notes/:id/favorite
// @access  Private
export const toggleNoteFavorite = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    note.isFavorite = !note.isFavorite;
    const updated = await note.save();
    const populated = await updated.populate('subjectId', 'name code color');

    return res.status(200).json({
      success: true,
      message: note.isFavorite ? 'Added to favorites' : 'Removed from favorites',
      note: populated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error toggling favorite'
    });
  }
};

// @desc    Delete note
// @route   DELETE /api/notes/:id
// @access  Private
export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    await Note.deleteOne({ _id: note._id });

    return res.status(200).json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error deleting note'
    });
  }
};
