const express = require('express');
const router = express.Router();
const Release = require('../models/Release');
const Project = require('../models/Project');
const Task = require('../models/Task');

// Helper: compute readiness for a release (based on its project's tasks)
async function computeReadiness(projectId) {
  const tasks = await Task.find({ project: projectId });
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'Completed').length;
  const percentage = total === 0 ? 100 : Math.round((completed / total) * 100);
  return {
    total,
    completed,
    percentage,
    // A release is "Ready" only when ALL tasks are completed (or there are none)
    isReady: percentage === 100,
    label: percentage === 100 ? 'Ready' : 'Blocked',
  };
}

// GET /api/releases
router.get('/', async (req, res) => {
  try {
    const releases = await Release.find()
      .sort({ createdAt: -1 })
      .populate('project', 'name');

    const result = await Promise.all(
      releases.map(async (r) => ({
        ...r.toObject(),
        readiness: await computeReadiness(r.project._id),
      }))
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/releases/:id
router.get('/:id', async (req, res) => {
  try {
    const release = await Release.findById(req.params.id).populate(
      'project',
      'name'
    );
    if (!release) return res.status(404).json({ error: 'Release not found' });
    const readiness = await computeReadiness(release.project._id);
    res.json({ ...release.toObject(), readiness });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/releases
router.post('/', async (req, res) => {
  try {
    const { version, notes, project, plannedDate } = req.body;

    if (!version || !version.trim())
      return res.status(400).json({ error: 'Version number is required' });
    if (!project)
      return res.status(400).json({ error: 'Project is required' });

    const proj = await Project.findById(project);
    if (!proj) return res.status(400).json({ error: 'Project not found' });

    const release = new Release({
      version: version.trim(),
      notes,
      project,
      plannedDate: plannedDate || null,
    });
    await release.save();
    await release.populate('project', 'name');

    const readiness = await computeReadiness(project);
    res.status(201).json({ ...release.toObject(), readiness });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: Object.values(err.errors)[0].message });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/releases/:id
router.put('/:id', async (req, res) => {
  try {
    const { version, notes, project, plannedDate } = req.body;

    if (!version || !version.trim())
      return res.status(400).json({ error: 'Version number is required' });
    if (!project)
      return res.status(400).json({ error: 'Project is required' });

    const release = await Release.findByIdAndUpdate(
      req.params.id,
      { version: version.trim(), notes, project, plannedDate: plannedDate || null },
      { new: true, runValidators: true }
    ).populate('project', 'name');

    if (!release) return res.status(404).json({ error: 'Release not found' });
    const readiness = await computeReadiness(release.project._id);
    res.json({ ...release.toObject(), readiness });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: Object.values(err.errors)[0].message });
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/releases/:id
router.delete('/:id', async (req, res) => {
  try {
    const release = await Release.findByIdAndDelete(req.params.id);
    if (!release) return res.status(404).json({ error: 'Release not found' });
    res.json({ message: 'Release deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
