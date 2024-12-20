const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
  },
  password: { 
    type: String, 
    required: true,
    select: false  //  password will not be send in response....
  },
  role: { 
    type: String, 
    required: true, 
    enum: ['student', 'admin', 'teacher'], 
    default: 'student' 
  }, 
  studentClassId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course', 
  },
  teacherClassId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course', 
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
