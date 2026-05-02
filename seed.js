require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('./src/modules/project/project.model');
const Developer = require('./src/modules/developer/developer.model');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nuxelit';

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected!');

    // Clear existing data
    console.log('Clearing old data...');
    await Project.deleteMany({});
    await Developer.deleteMany({});

    // 1. Create Developers
    const devData = [
      { name: 'Cristopher Acevedo', bio: 'Senior Full Stack Engineer especializado en arquitectura backend y frontend', photoUrl: 'https://i.pravatar.cc/150?u=cris' },
      { name: 'Santiago Castilla', bio: 'Especialista en desarrollo web y optimización de rendimiento', photoUrl: 'https://i.pravatar.cc/150?u=santi' },
      { name: 'Richard Guzman', bio: 'Desarrollador de aplicaciones móviles y software empresarial', photoUrl: 'https://i.pravatar.cc/150?u=richard' }
    ];
    
    console.log('Creating developers...');
    const createdDevs = await Developer.insertMany(devData);

    // 2. Helper functions for random data
    const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

    const clientNames = ['Juan Pérez', 'Ana Gómez', 'Carlos Ruiz', 'Luisa Díaz', 'Miguel Torres', 'Sofía Vargas', 'David Silva', 'Laura Castro', 'Javier Peña', 'Elena Rojas'];
    const serviceTypes = ['Landing Page', 'Software', 'App Movil', 'E-commerce'];
    const statuses = ['EN_DISENO', 'EN_DESARROLLO', 'TESTING', 'ENTREGADO', 'ENTREGADO', 'ENTREGADO', 'EN_PAUSA', 'CANCELADO']; // More weight to ENTREGADO so we can see stats

    const getPriceRange = (type) => {
      switch(type) {
        case 'Landing Page': return randomInt(500, 1500);
        case 'E-commerce': return randomInt(1500, 4000);
        case 'App Movil': return randomInt(2500, 8000);
        case 'Software': return randomInt(3000, 10000);
        default: return 1000;
      }
    };

    const projects = [];
    
    console.log('Generating 10 projects...');
    for (let i = 0; i < 10; i++) {
      const name = clientNames[i];
      const serviceType = randomItem(serviceTypes);
      const status = randomItem(statuses);
      const agreedPrice = getPriceRange(serviceType);
      
      // Calculate realistic payments
      let amountPaid = 0;
      if (status === 'ENTREGADO') {
        amountPaid = agreedPrice; // Fully paid
      } else if (status === 'CANCELADO') {
        amountPaid = agreedPrice * 0.2; // Only deposit
      } else {
        amountPaid = agreedPrice * 0.5; // 50% paid
      }

      // Dates (from 3 months ago until now)
      const now = new Date();
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(now.getMonth() - 3);
      
      const startDate = randomDate(threeMonthsAgo, new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)); // Started at least 15 days ago
      
      const expectedDeliveryDate = new Date(startDate.getTime());
      expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + randomInt(15, 60)); // Expected to take 15-60 days

      let actualDeliveryDate = null;
      let clientRating = null;

      if (status === 'ENTREGADO') {
        // Did it deliver on time? 70% chance yes
        const onTime = Math.random() > 0.3;
        if (onTime) {
          actualDeliveryDate = new Date(expectedDeliveryDate.getTime() - randomInt(1, 5) * 24 * 60 * 60 * 1000); // 1-5 days early
          clientRating = randomItem([4, 5, 5]); // good rating
        } else {
          actualDeliveryDate = new Date(expectedDeliveryDate.getTime() + randomInt(2, 10) * 24 * 60 * 60 * 1000); // 2-10 days late
          clientRating = randomItem([2, 3, 4]); // worse rating
        }

        // Force recent deliveries to show up in dashboard (last 30 days)
        if (Math.random() > 0.3) {
          actualDeliveryDate = new Date(now.getTime() - randomInt(1, 25) * 24 * 60 * 60 * 1000);
        }
      }

      // Assign 1 or 2 random devs
      const assignedDevs = [randomItem(createdDevs)._id];
      if (Math.random() > 0.6) {
        const secondDev = randomItem(createdDevs)._id;
        if (secondDev.toString() !== assignedDevs[0].toString()) {
          assignedDevs.push(secondDev);
        }
      }

      projects.push({
        client: {
          name,
          email: `${name.split(' ')[0].toLowerCase()}@gmail.com`,
          company: `${name.split(' ')[1]} Corp`
        },
        referredBy: randomItem(['', 'Socio 1', 'Socio 2', 'Recomendación']),
        developers: assignedDevs,
        serviceType,
        status,
        startDate,
        expectedDeliveryDate,
        actualDeliveryDate,
        finances: {
          agreedPrice,
          amountPaid,
          paymentMethod: randomItem(['Transferencia', 'Stripe', 'PayPal']),
          payments: [
            { amount: amountPaid, date: startDate, method: 'Transferencia' }
          ]
        },
        satisfaction: {
          clientRating
        }
      });
    }

    await Project.insertMany(projects);
    console.log('Successfully seeded 10 projects!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
