const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');

// GET /api/tasks?project=<id>  (optional filter by project)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.project) filter.project = req.query.project;
    if (req.query.status) filter.status = req.query.status;

    const tasks = await Task.find(filter)
      .sort({ createdAt: -1 })
      .populate('project', 'name');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tasks/:id
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project', 'name');
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tasks
router.post('/', async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, project } = req.body;

    if (!title || !title.trim())
      return res.status(400).json({ error: 'Task title is required' });
    if (!project)
      return res.status(400).json({ error: 'Project is required' });

    // Verify project exists
    const proj = await Project.findById(project);
    if (!proj) return res.status(400).json({ error: 'Project not found' });

    const task = new Task({
      title: title.trim(),
      description,
      status,
      priority,
      dueDate: dueDate || null,
      project,
    });
    await task.save();
    await task.populate('project', 'name');
    res.status(201).json(task);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: Object.values(err.errors)[0].message });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/tasks/:id
router.put('/:id', async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, project } = req.body;

    if (!title || !title.trim())
      return res.status(400).json({ error: 'Task title is required' });
    if (!project)
      return res.status(400).json({ error: 'Project is required' });

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { title: title.trim(), description, status, priority, dueDate: dueDate || null, project },
      { new: true, runValidators: true }
    ).populate('project', 'name');

    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: Object.values(err.errors)[0].message });
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
