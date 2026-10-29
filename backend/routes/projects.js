const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const Release = require('../models/Release');

// GET /api/projects
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    // Attach task counts to each project
    const result = await Promise.all(
      projects.map(async (p) => {
        const total = await Task.countDocuments({ project: p._id });
        const completed = await Task.countDocuments({
          project: p._id,
          status: 'Completed',
        });
        return { ...p.toObject(), taskCount: total, completedTaskCount: completed };
      })
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/projects/:id
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects
router.post('/', async (req, res) => {
  try {
    const { name, description, status } = req.body;
    if (!name || !name.trim())
      return res.status(400).json({ error: 'Project name is required' });

    const project = new Project({ name: name.trim(), description, status });
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: Object.values(err.errors)[0].message });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/projects/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, description, status } = req.body;
    if (!name || !name.trim())
      return res.status(400).json({ error: 'Project name is required' });

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { name: name.trim(), description, status },
      { new: true, runValidators: true }
    );
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: Object.values(err.errors)[0].message });
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/projects/:id
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    // Cascade-delete associated tasks and releases
    await Task.deleteMany({ project: req.params.id });
    await Release.deleteMany({ project: req.params.id });

    res.json({ message: 'Project and its tasks/releases deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
