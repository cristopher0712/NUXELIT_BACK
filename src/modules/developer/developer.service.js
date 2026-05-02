const Developer = require('./developer.model');
const Project = require('../project/project.model');

// Helper to format the count
const formatCount = (count) => {
  if (count < 100) return count.toString();
  if (count < 1000) {
    const rounded = Math.floor(count / 100) * 100;
    return `+${rounded}`;
  }
  const rounded = Math.floor(count / 100) * 100; // e.g. 1590 -> 1500
  return `+${rounded}`;
};

const getPublicDevelopers = async () => {
  const developers = await Developer.find({ isActive: true });
  
  // For each developer, count their delivered projects
  const devsWithStats = await Promise.all(developers.map(async (dev) => {
    const count = await Project.countDocuments({
      developers: dev._id,
      status: 'ENTREGADO'
    });

    return {
      id: dev._id,
      name: dev.name,
      photoUrl: dev.photoUrl,
      bio: dev.bio,
      deliveredCount: count,
      formattedCount: formatCount(count)
    };
  }));

  return devsWithStats;
};

const getAllDevelopers = async () => {
  return await Developer.find();
};

const createDeveloper = async (data) => {
  return await Developer.create(data);
};

const updateDeveloper = async (id, data) => {
  const dev = await Developer.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!dev) throw new Error('Desarrollador no encontrado');
  return dev;
};

const deleteDeveloper = async (id) => {
  const dev = await Developer.findByIdAndDelete(id);
  if (!dev) throw new Error('Desarrollador no encontrado');
  return;
};

module.exports = {
  getPublicDevelopers,
  getAllDevelopers,
  createDeveloper,
  updateDeveloper,
  deleteDeveloper
};
