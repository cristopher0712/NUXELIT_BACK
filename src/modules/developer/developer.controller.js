const developerService = require('./developer.service');

const getPublicDevelopers = async (req, res, next) => {
  try {
    const devs = await developerService.getPublicDevelopers();
    res.status(200).json({ success: true, data: devs });
  } catch (err) {
    next(err);
  }
};

const getAllDevelopers = async (req, res, next) => {
  try {
    const devs = await developerService.getAllDevelopers();
    res.status(200).json({ success: true, data: devs });
  } catch (err) {
    next(err);
  }
};

const createDeveloper = async (req, res, next) => {
  try {
    const dev = await developerService.createDeveloper(req.body);
    res.status(201).json({ success: true, data: dev });
  } catch (err) {
    next(err);
  }
};

const updateDeveloper = async (req, res, next) => {
  try {
    const dev = await developerService.updateDeveloper(req.params.id, req.body);
    res.status(200).json({ success: true, data: dev });
  } catch (err) {
    next(err);
  }
};

const deleteDeveloper = async (req, res, next) => {
  try {
    await developerService.deleteDeveloper(req.params.id);
    res.status(200).json({ success: true, message: 'Desarrollador eliminado' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPublicDevelopers,
  getAllDevelopers,
  createDeveloper,
  updateDeveloper,
  deleteDeveloper
};
