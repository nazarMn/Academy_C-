/**
 * projects.service.js — Projects CRUD with MongoDB
 */
const Project = require('../models/project.model');
const { NotFoundError, ValidationError } = require('../utils/errors');

async function getAllProjects(courseId) {
  const filter = courseId ? { courseId } : {};
  return await Project.find(filter).sort({ createdAt: 1 });
}

async function getProjectById(id) {
  const project = await Project.findOne({ id });
  if (!project) throw new NotFoundError(`Проєкт з ID "${id}" не знайдено.`);
  return project;
}

async function createProject(data) {
  const existing = await Project.findOne({ id: data.id });
  if (existing) throw new ValidationError(`Проєкт з ID "${data.id}" вже існує.`);
  
  const project = new Project(data);
  await project.save();
  return project;
}

async function updateProject(id, data) {
  const project = await Project.findOneAndUpdate({ id }, data, { new: true });
  if (!project) throw new NotFoundError(`Проєкт з ID "${id}" не знайдено.`);
  return project;
}

async function deleteProject(id) {
  const project = await Project.findOneAndDelete({ id });
  if (!project) throw new NotFoundError(`Проєкт з ID "${id}" не знайдено.`);
  return true;
}

module.exports = { getAllProjects, getProjectById, createProject, updateProject, deleteProject };
