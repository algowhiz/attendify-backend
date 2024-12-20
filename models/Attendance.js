const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  month: {
    type: String,
    required: true,
    enum: [
      'Jan', 'Feb', 'Mar', 'Apr', 
      'May', 'Jun', 'Jul', 'Aug', 
      'Sep', 'Oct', 'Nov', 'Dec'
    ],
  },
  days: {
    type: Map,
    of: {
      type: Map,
      of: String, // 'p' for present, 'a' for absent
    },
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Attendance', AttendanceSchema);
