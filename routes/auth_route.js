const router = require('express').Router(); 
const authController = require('../controllers/auth_controller'); 

router.post('/register', authController.register); 
router.post('/verify-registration', authController.verifyRegistration);
router.get('/history/:email', authController.getHistory); 
router.post('/login', authController.login); 
router.post('/verify-otp', authController.verifyOTP); // Route အသစ်

module.exports = router;