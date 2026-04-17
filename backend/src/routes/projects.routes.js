/**
 * projects.routes.js — Projects CRUD API routes
 */

const { Router } = require('express');
const { requireAdminKey } = require('../middleware/validator');
const { apiLimiter } = require('../middleware/rateLimiter');
const service = require('../services/projects.service');

const router = Router();

router.get('/', apiLimiter, async (req, res, next) => {
  try { res.json(await service.getAllProjects(req.query.courseId)); } catch (e) { next(e); }
});

router.get('/:id', apiLimiter, async (req, res, next) => {
  try { res.json(await service.getProjectById(req.params.id)); } catch (e) { next(e); }
});

router.post('/', apiLimiter, requireAdminKey, async (req, res, next) => {
  try { res.status(201).json(await service.createProject(req.body)); } catch (e) { next(e); }
});

router.put('/:id', apiLimiter, requireAdminKey, async (req, res, next) => {
  try { res.json(await service.updateProject(req.params.id, req.body)); } catch (e) { next(e); }
});

router.delete('/:id', apiLimiter, requireAdminKey, async (req, res, next) => {
  try {
    await service.deleteProject(req.params.id);
    res.status(204).send();
  } catch (e) { next(e); }
});

module.exports = router;
