import express from 'express';
import { deleteAlert, getAlertById, getContactForm, handleAlertSubmit, sendOTP, updateAlert, verifyOTP } from '../controllers/alertController.js';

const router = express.Router();

router.post('/send-otp',sendOTP);
router.post('/verify-otp',verifyOTP);
router.post('/submit-alert',handleAlertSubmit);
router.get('/get-userAlert/:alertId',getAlertById);
router.put('/update-alert/:alertId',updateAlert);
router.delete('/delete-userAlert/:alertId',deleteAlert);
router.post('/submit-contact-form',getContactForm);

export default router;