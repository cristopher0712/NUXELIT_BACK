const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  method: { type: String, default: 'Transferencia' },
  reference: { type: String },
  receiptUrl: { type: String }
});

const projectSchema = new mongoose.Schema({
  client: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    company: { type: String }
  },
  referredBy: {
    type: String,
    default: 'Desconocido'
  },
  developers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Developer'
  }],
  serviceType: {
    type: String,
    required: true,
    enum: ['Landing Page', 'Software', 'App Movil', 'E-commerce', 'Otro']
  },
  status: {
    type: String,
    enum: ['EN_DISENO', 'EN_DESARROLLO', 'TESTING', 'ENTREGADO', 'EN_PAUSA', 'CANCELADO'],
    default: 'EN_DISENO'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  expectedDeliveryDate: {
    type: Date
  },
  actualDeliveryDate: {
    type: Date
  },
  finances: {
    agreedPrice: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
    paymentMethod: { type: String, default: 'Transferencia' },
    payments: [paymentSchema]
  },
  satisfaction: {
    clientRating: { type: Number, min: 1, max: 5 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for pendingAmount
projectSchema.virtual('finances.pendingAmount').get(function() {
  if (!this.finances) return 0;
  const agreed = this.finances.agreedPrice || 0;
  const paid = this.finances.amountPaid || 0;
  return Math.max(0, agreed - paid);
});

// Virtual for isDeliveredOnTime
projectSchema.virtual('isDeliveredOnTime').get(function() {
  if (this.status !== 'ENTREGADO' || !this.actualDeliveryDate || !this.expectedDeliveryDate) {
    return null; // N/A
  }
  return this.actualDeliveryDate <= this.expectedDeliveryDate;
});

module.exports = mongoose.model('Project', projectSchema);
