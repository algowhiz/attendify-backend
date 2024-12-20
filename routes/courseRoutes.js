const express = require('express');
const { getCourses, createCourse, getCourseById, addTeacher, addStudent, getInfoOfUsers, getCoursesByTeacher, saveAttendance, createNotice, getStudentCourses, getNotices, createAdminNotice } = require('../controllers/courseController');
const router = express.Router();

router.get('/', getCourses); // Fetch all courses
router.get('/teacher', getCoursesByTeacher); // Fetch all courses
router.post('/', createCourse); // Create a new course
router.get('/:courseId', getCourseById); // Fetch only one course
router.post('/:courseId/add-teacher', addTeacher); // Add teacher
router.post('/:courseId/add-student', addStudent);  // Add student
router.post('/getInfoOfUsers', getInfoOfUsers);  // Add student
router.post('/save-attendence', saveAttendance);  // Add attendence
router.post('/create-notice', createNotice); // Create notice
router.post('/student-courses', getStudentCourses); // get course id of student
router.post('/get-notices', getNotices); //get all notice
router.post('/admin-notice', createAdminNotice); //get all notice

module.exports = router;
