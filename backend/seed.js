/**
 * seed.js  — Creates demo data on first launch only.
 * Called automatically from server.js after DB connects.
 * Run manually: node seed.js
 */

const mongoose = require('mongoose');
const Project = require('./models/Project');
const Task = require('./models/Task');
const Release = require('./models/Release');

async function seedIfEmpty() {
  const count = await Project.countDocuments();
  if (count > 0) {
    console.log('ℹ️  Database already has data — skipping seed');
    return;
  }

  console.log('🌱 Seeding demo data...');

  // ── Projects ──────────────────────────────────────────────────────────────
  const [alpha, beta, gamma] = await Project.insertMany([
    {
      name: 'Project Alpha',
      description: 'Core platform rewrite with microservices architecture.',
      status: 'Active',
    },
    {
      name: 'Project Beta',
      description: 'Customer-facing mobile app for iOS and Android.',
      status: 'Active',
    },
    {
      name: 'Project Gamma',
      description: 'Internal analytics dashboard for business intelligence.',
      status: 'Planning',
    },
  ]);

  // ── Tasks ─────────────────────────────────────────────────────────────────
  const future = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
  };

  await Task.insertMany([
    // Alpha tasks (mostly done → release will be nearly ready)
    { title: 'Set up CI/CD pipeline', description: 'Configure GitHub Actions.', status: 'Completed', priority: 'High', dueDate: future(-5), project: alpha._id },
    { title: 'Database schema design', description: 'Design MongoDB schemas.', status: 'Completed', priority: 'High', dueDate: future(-3), project: alpha._id },
    { title: 'REST API implementation', description: 'Build all CRUD endpoints.', status: 'Completed', priority: 'High', dueDate: future(-1), project: alpha._id },
    { title: 'Write unit tests', description: 'Jest unit tests for all models.', status: 'In Progress', priority: 'Medium', dueDate: future(2), project: alpha._id },
    { title: 'Performance testing', description: 'Load test with k6.', status: 'To Do', priority: 'Medium', dueDate: future(5), project: alpha._id },

    // Beta tasks (partially done → release blocked)
    { title: 'UI wireframes', description: 'Figma wireframes for all screens.', status: 'Completed', priority: 'High', dueDate: future(-7), project: beta._id },
    { title: 'Authentication flow', description: 'JWT login and registration.', status: 'Completed', priority: 'High', dueDate: future(-4), project: beta._id },
    { title: 'Push notifications', description: 'Firebase Cloud Messaging setup.', status: 'In Progress', priority: 'Medium', dueDate: future(3), project: beta._id },
    { title: 'App Store submission', description: 'Prepare build and metadata.', status: 'To Do', priority: 'High', dueDate: future(10), project: beta._id },

    // Gamma tasks (early stage)
    { title: 'Requirements gathering', description: 'Stakeholder interviews.', status: 'Completed', priority: 'High', dueDate: future(-10), project: gamma._id },
    { title: 'Tech stack selection', description: 'Choose BI tools and DB.', status: 'In Progress', priority: 'Medium', dueDate: future(4), project: gamma._id },
    { title: 'Prototype dashboard', description: 'Build MVP with dummy data.', status: 'To Do', priority: 'Medium', dueDate: future(14), project: gamma._id },
  ]);

  // ── Releases ──────────────────────────────────────────────────────────────
  await Release.insertMany([
    {
      version: 'v1.0.0',
      notes: 'First production release of Project Alpha. Includes the full REST API, database layer, and CI/CD pipeline.',
      project: alpha._id,
      plannedDate: future(7),
    },
    {
      version: 'v0.9.0-beta',
      notes: 'Beta release of mobile app for internal testing. Push notifications and final App Store submission still pending.',
      project: beta._id,
      plannedDate: future(14),
    },
    {
      version: 'v0.1.0-alpha',
      notes: 'Early prototype release of the analytics dashboard for stakeholder review.',
      project: gamma._id,
      plannedDate: future(21),
    },
  ]);

  console.log('✅ Demo data seeded successfully');
}

// Allow running this file directly: node seed.js
if (require.main === module) {
  require('dotenv').config();
  mongoose
    .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shipshape')
    .then(async () => {
      await seedIfEmpty();
      mongoose.disconnect();
    })
    .catch((err) => {
      console.error('Seed error:', err);
      process.exit(1);
    });
}

module.exports = { seedIfEmpty };
