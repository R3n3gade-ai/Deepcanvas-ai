import express from 'express'
import multer from 'multer'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'
import videoGenerationController from '../controllers/videoGeneration.controller'

const router = express.Router()

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads')
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir)
    },
    filename: function (req, file, cb) {
        const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`
        cb(null, uniqueFilename)
    }
})

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max file size
    },
    fileFilter: function (req, file, cb) {
        // Accept only image files
        const filetypes = /jpeg|jpg|png|gif|webp/
        const mimetype = filetypes.test(file.mimetype)
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase())

        if (mimetype && extname) {
            return cb(null, true)
        }

        cb(new Error('Only image files are allowed'))
    }
})

// Text-to-video generation endpoint
router.post('/text-to-video', videoGenerationController.generateVideoFromText)

// Image-to-video generation endpoint
router.post('/image-to-video', upload.single('image'), videoGenerationController.generateVideoFromImage)

// Check video generation status endpoint
router.get('/status/:jobId', videoGenerationController.checkVideoStatus)

// Get user's generated videos
router.get('/user/:userId', (req, res) => {
    const { getUserVideos } = require('../utils/fileStorage')
    const videos = getUserVideos(req.params.userId)
    res.json(videos)
})

// Delete a generated video
router.delete('/:videoId', (req, res) => {
    const { deleteVideo } = require('../utils/fileStorage')
    const videoPath = path.join(process.cwd(), 'storage', 'videos', req.params.videoId)

    const success = deleteVideo(videoPath)
    if (success) {
        res.json({ success: true, message: 'Video deleted successfully' })
    } else {
        res.status(404).json({ success: false, message: 'Video not found or could not be deleted' })
    }
})

// Serve static video files
router.get('/videos/*', (req, res) => {
    const videoPath = path.join(process.cwd(), 'storage', req.path.replace('/videos/', ''))

    if (fs.existsSync(videoPath)) {
        res.sendFile(videoPath)
    } else {
        res.status(404).json({ error: 'Video not found' })
    }
})

export default router
