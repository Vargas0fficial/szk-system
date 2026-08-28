import mongoose from 'mongoose';

const AppointmentSchema = new mongoose.Schema({
  customer: { type: String, required: true },
  sticker: { type: String, required: true },
  model: { type: String },
  plate: { type: String },
  contact: { type: String },
  mileage: { type: String },
  serviceType: { type: String, default: 'PMS' },
  advisor: { type: String },
  technician: { type: String },
  date: { type: String },
  time: { type: String },
  remarks: { type: String },
  status: { type: String, default: 'Pending' },
}, { timestamps: true });

// NOTE: This is exported as a schema, not a compiled model, because with
// multi-branch support the Appointment model needs to be compiled against
// a *different* database connection depending on which branch is being
// queried (see getBranchConnection() in db.js). A single global
// mongoose.model() call (like before) would always point at one fixed db.
export default AppointmentSchema;

// Returns (or reuses) the Appointment model compiled against a specific
// branch connection. Safe to call repeatedly — mongoose caches it per
// connection so it won't try to recompile the model on every request.
export function getAppointmentModel(connection) {
  return connection.models.Appointment || connection.model('Appointment', AppointmentSchema);
}