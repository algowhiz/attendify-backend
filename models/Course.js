const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' , default: []} ], 
  teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'  }], 
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Course', CourseSchema);
