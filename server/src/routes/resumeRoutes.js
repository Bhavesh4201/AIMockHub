import express from "express";
import multer from 'multer';
const router = express.Router();
import resumeKeyExteckt from '../controllers/resumeController.js'

const uploads = multer({dest : "./uploads"})

router.post('/:id/key' , uploads.single('file' ), resumeKeyExteckt  )
// router.post('/key' , uploads.single('file'), resumeKeyExteckt  )

export default router