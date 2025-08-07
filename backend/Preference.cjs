// Preference.cjs
const mongoose = require('mongoose');

const preferenceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: { type: Object, required: true },
}, { timestamps: true });

const Preference = mongoose.model('Preference', preferenceSchema);
module.exports = Preference;
