const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const Release = require('../models/Release');

// GET /api/dashboard
// Returns aggregate stats for the dashboard
router.get('/', async (req, res) => {
  try {
    const [
      totalProjects,
      totalTasks,
      completedTasks,
      recentProjects,
      upcomingReleases,
      allProjects,
    ] = await Promise.all([
      Project.countDocuments(),
      Task.countDocuments(),
      Task.countDocuments({ status: 'Completed' }),
      Project.find().sort({ createdAt: -1 }).limit(5),
      Release.find({ plannedDate: { $gte: new Date() } })
        .sort({ plannedDate: 1 })
        .limit(5)
        .populate('project', 'name'),
      Project.find().select('_id name'),
    ]);

    const pendingTasks = totalTasks - completedTasks;

    // Build readiness for each release
    const releasesWithReadiness = await Promise.all(
      upcomingReleases.map(async (release) => {
        const projectTasks = await Task.find({ project: release.project._id });
        const total = projectTasks.length;
        const completed = projectTasks.filter(
          (t) => t.status === 'Completed'
        ).length;
        const pct = total === 0 ? 100 : Math.round((completed / total) * 100);
        return {
          _id: release._id,
          version: release.version,
          project: release.project,
          plannedDate: release.plannedDate,
          readiness: { total, completed, percentage: pct, isReady: pct === 100 },
        };
      })
    );

    res.json({
      stats: {
        totalProjects,
        totalTasks,
        completedTasks,
        pendingTasks,
        completionRate:
          totalTasks === 0
            ? 0
            : Math.round((completedTasks / totalTasks) * 100),
      },
      recentProjects,
      upcomingReleases: releasesWithReadiness,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
