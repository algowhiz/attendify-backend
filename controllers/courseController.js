const Attendance = require('../models/Attendance');
const Course = require('../models/Course');
const Notice = require('../models/Notice');
const User = require('../models/User');

// Get all courses
exports.getCourses = async (req, res) => {
  const { adminId } = req.query; 
  if (!adminId) {
    return res.status(400).json({ message: 'No admin ID provided.' });
  }

  try {
    const courses = await Course.find({ adminId });
    console.log(courses);
    if (courses.length === 0) {
      return res.status(404).json({ message: 'No courses found for the given admin.' });
    }
  
    
    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching courses', error: err });
  }
};

exports.getCoursesByTeacher = async (req, res) => {
  const { teacherId } = req.query;

  if (!teacherId) {
    return res.status(400).json({ message: 'No teacher ID provided.' });
  }

  try {
    const courses = await Course.find({ teachers: teacherId }).populate('students').populate('teachers');
    console.log(courses);
    
    if (courses.length === 0) {
      return res.status(404).json({ message: 'No courses found for the given teacher.' });
    }

    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching courses', error: err });
  }
};



// Create a new course
exports.createCourse = async (req, res) => {
  const { name, adminId } = req.body;
  try {
    const newCourse = new Course({ name, adminId });
    const savedCourse = await newCourse.save();
    console.log("created");

    res.status(201).json(savedCourse);
  } catch (err) {
    res.status(500).json({ message: 'Error creating course', error: err });
  }
};


exports.getCourseById =  async (req, res) => {
  const { courseId } = req.params;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.status(200).json(course);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching course', error: err.message });
  }
};

exports.addTeacher = async (req, res) => {
  const { courseId } = req.params;
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'teacher') {
      return res.status(403).json({ message: 'User is not authorized to be added as a teacher' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if the user is already a teacher in the course
    if (course.teachers.includes(user._id)) {
      return res.status(400).json({ message: 'User is already a teacher for this course' });
    }

    // Add user as a teacher to the course
    course.teachers.push(user._id);
     user.teacherClassId = courseId;
    await user.save();
    await course.save();

    res.status(200).json({ message: 'Teacher added successfully', course });
  } catch (err) {    
    res.status(500).json({ message: 'Error adding teacher', error: err.message });
  }
};

exports.addStudent = async (req, res) => {
  const { courseId } = req.params;
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'student') {
      return res.status(403).json({ message: 'User is not authorized to be added as a student' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if the user is already a student in the course
    if (course.students.includes(user._id)) {
      return res.status(400).json({ message: 'User is already a student for this course' });
    }

    // Add user as a student to the course
    course.students.push(user._id);
    user.studentClassId = courseId;
    await user.save();
    await course.save();

    res.status(200).json({ message: 'Student added successfully', course });
  } catch (err) {
    res.status(500).json({ message: 'Error adding student', error: err.message });
  }
};


exports.getInfoOfUsers = async (req, res) => {
  try {
      const userIds = req.body.ids; // Array of user IDs from the request
      if (!userIds || userIds.length === 0) {
          return res.status(400).json({ message: 'No user IDs provided' });
      }

      const users = await User.find({ _id: { $in: userIds } }); // Query the database for user details

      if (users.length === 0) {
          return res.status(404).json({ message: 'No users found for the provided IDs' });
      }

      // Separate teachers and students
      const teachers = users.filter(user => user.role === 'teacher');
      const students = users.filter(user => user.role === 'student');

      // Group teachers and students in an object
      const groupedData = {
          teachers,
          students
      };

      res.json(groupedData); // Send the grouped data as a response
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};


exports.saveAttendance = async (req, res) => {
  const { courseId, year, month, attendanceData, teacherId } = req.body;

  try {
    // Find the course to validate that it exists and the user is a teacher of the course
    const course = await Course.findById(courseId);
    console.log(course);
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if the teacher is associated with the course
    if (!course.teachers.includes(teacherId)) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }


    // Create or update the attendance record
    const attendanceRecord = await Attendance.findOneAndUpdate(
      { courseId, year, month },
      { days: attendanceData },
      { upsert: true, new: true }
    );
    
    res.status(200).json(attendanceRecord);
  } catch (error) {
    console.error('Error saving attendance:', error); // Log the error for debugging
    res.status(500).json({ error: 'Failed to save attendance' });
  }
};



// In the API handler for creating notices
exports.createNotice = async (req, res) => {
  const { title, description, courseId, senderId, senderRole } = req.body;

  try {
    // Validate course exists and belongs to the sender
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    console.log(course);
    
    // Create new notice
    const newNotice = new Notice({
      title,
      description,
      courseId,
      senderId,
      senderRole,
    });

    await newNotice.save();

    res.status(201).json(newNotice);
  } catch (error) {
    console.error('Error creating notice:', error);
    res.status(500).json({ error: 'Failed to create notice' });
  }
};


exports.createAdminNotice = async (req, res) => {
  const { title, description, courseNames, senderId, senderRole } = req.body;

  try {
    // Validate that each course name exists and belongs to the sender (admin)
    const courses = await Course.find({ name: { $in: courseNames }, adminId: senderId });

    if (courses.length === 0) {
      return res.status(404).json({ error: 'No courses found or courses not associated with admin' });
    }

    // Create notices for each course
    const notices = await Promise.all(
      courses.map(async (course) => {
        return await Notice.create({
          title,
          description,
          courseId: course._id,
          senderId,
          senderRole,
        });
      })
    );

    res.status(201).json(notices);
  } catch (error) {
    console.log('Error creating notices:', error);
    res.status(500).json({ error: 'Failed to create notices' });
  }
};

exports.getStudentCourses = async (req, res) => {
  try {
    const { studentId } = req.body;
  
    // Find courses where the studentId is included in the students array
    const courses = await Course.find({ students: { $in: [studentId] } });

    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};


exports.getNotices = async (req, res) => {
  try {
    const { courseId } = req.body;

    // Find all notices that match any of the provided courseIds
    const notices = await Notice.find({courseId});

    res.json(notices);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching notices');
  }
};