const Project = require('./project.model');

// Dashboard Analytics
const getDashboardStats = async () => {
  const allProjects = await Project.find();

  let activeProjects = 0;
  let totalAgreed = 0;
  let totalPaid = 0;
  let onTimeCount = 0;
  let deliveredWithDatesCount = 0;
  let totalRating = 0;
  let ratingCount = 0;
  let monthlyRevenue = 0;
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const deliveredLast30DaysByType = {};
  const activeProjectsByType = {};

  allProjects.forEach(p => {
    // Active check
    if (p.status !== 'ENTREGADO' && p.status !== 'CANCELADO') {
      activeProjects++;
      activeProjectsByType[p.serviceType] = (activeProjectsByType[p.serviceType] || 0) + 1;
      
      if (p.finances) {
        totalAgreed += (p.finances.agreedPrice || 0);
        totalPaid += (p.finances.amountPaid || 0);
      }
    }

    // Monthly revenue check (payments in the last 30 days)
    if (p.finances && p.finances.payments) {
      p.finances.payments.forEach(payment => {
        if (payment.date && new Date(payment.date) >= thirtyDaysAgo) {
          monthlyRevenue += payment.amount;
        }
      });
    }

    // On-Time check for delivered projects
    if (p.status === 'ENTREGADO') {
      if (p.actualDeliveryDate && p.expectedDeliveryDate) {
        deliveredWithDatesCount++;
        if (p.actualDeliveryDate <= p.expectedDeliveryDate) {
          onTimeCount++;
        }
      }

      // Ratings
      if (p.satisfaction && p.satisfaction.clientRating) {
        totalRating += p.satisfaction.clientRating;
        ratingCount++;
      }

      // Delivered last 30 days
      if (p.actualDeliveryDate && p.actualDeliveryDate >= thirtyDaysAgo) {
        deliveredLast30DaysByType[p.serviceType] = (deliveredLast30DaysByType[p.serviceType] || 0) + 1;
      }
    }
  });

  const onTimePercentage = deliveredWithDatesCount > 0 
    ? Math.round((onTimeCount / deliveredWithDatesCount) * 100) 
    : 0;

  const averageRating = ratingCount > 0 
    ? (totalRating / ratingCount).toFixed(1) 
    : 0;

  const totalPending = Math.max(0, totalAgreed - totalPaid);

  return {
    activeProjects,
    deliveredLast30DaysByType,
    activeProjectsByType,
    financials: {
      monthlyRevenue,
      activeAgreed: totalAgreed,
      activePaid: totalPaid,
      activePending: totalPending
    },
    performance: {
      onTimePercentage,
      averageRating: Number(averageRating)
    }
  };
};

// Standard CRUD
const getProjects = async (filter = {}) => {
  return await Project.find(filter).populate('developers', 'name photoUrl');
};

const getProjectById = async (id) => {
  const project = await Project.findById(id).populate('developers', 'name photoUrl');
  if (!project) throw new Error('Proyecto no encontrado');
  return project;
};

const createProject = async (data) => {
  return await Project.create(data);
};

const updateProject = async (id, data) => {
  // If status is changed to ENTREGADO and actualDeliveryDate is not set, set it automatically
  if (data.status === 'ENTREGADO' && !data.actualDeliveryDate) {
    data.actualDeliveryDate = new Date();
  }
  
  const project = await Project.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!project) throw new Error('Proyecto no encontrado');
  return project;
};

const deleteProject = async (id) => {
  const project = await Project.findByIdAndDelete(id);
  if (!project) throw new Error('Proyecto no encontrado');
  return;
};

module.exports = {
  getDashboardStats,
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
};
