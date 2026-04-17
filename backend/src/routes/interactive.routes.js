const { Router } = require('express');
const { getAllInteractive, getInteractiveById } = require('../services/interactive.service');

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const data = await getAllInteractive(req.query.courseId);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const item = await getInteractiveById(req.params.id);
    res.json(item);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
