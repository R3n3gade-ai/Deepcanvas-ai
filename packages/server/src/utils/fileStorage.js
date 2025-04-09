const fs = require('fs')
const path = require('path')
const axios = require('axios')
const { v4: uuidv4 } = require('uuid')
const logger = require('./logger')

// Base directory for storing generated videos
const STORAGE_DIR = process.env.VIDEO_STORAGE_DIR || path.join(process.cwd(), 'storage', 'videos')

/**
 * Ensure storage directory exists
 */
function ensureStorageDir() {
    if (!fs.existsSync(STORAGE_DIR)) {
        fs.mkdirSync(STORAGE_DIR, { recursive: true })
        logger.info(`Created video storage directory: ${STORAGE_DIR}`)
    }
}

/**
 * Save a generated video from a URL to local storage
 * @param {string} videoUrl - URL of the generated video
 * @param {string} userId - User ID who generated the video
 * @param {string} jobId - Job ID of the generation
 * @returns {Promise<Object>} - Information about the saved video
 */
async function saveGeneratedVideo(videoUrl, userId, jobId) {
    try {
        ensureStorageDir()

        // Create user directory if it doesn't exist
        const userDir = userId ? path.join(STORAGE_DIR, userId) : STORAGE_DIR
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true })
        }

        // Generate a unique filename
        const filename = `${jobId || uuidv4()}.mp4`
        const filePath = path.join(userDir, filename)

        // Download the video
        const response = await axios({
            method: 'GET',
            url: videoUrl,
            responseType: 'stream'
        })

        // Save the video to disk
        const writer = fs.createWriteStream(filePath)
        response.data.pipe(writer)

        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                // Generate a URL for accessing the video
                const relativePath = path.relative(STORAGE_DIR, filePath)
                const url = `/api/videos/${relativePath.replace(/\\/g, '/')}`

                resolve({
                    url,
                    path: filePath,
                    filename,
                    size: fs.statSync(filePath).size
                })
            })

            writer.on('error', reject)
        })
    } catch (error) {
        logger.error('Error saving video:', error)
        throw new Error(`Failed to save video: ${error.message}`)
    }
}

/**
 * Get a list of videos for a user
 * @param {string} userId - User ID
 * @returns {Array<Object>} - List of video information
 */
function getUserVideos(userId) {
    try {
        ensureStorageDir()

        const userDir = userId ? path.join(STORAGE_DIR, userId) : STORAGE_DIR
        if (!fs.existsSync(userDir)) {
            return []
        }

        const files = fs.readdirSync(userDir)

        return files
            .filter((file) => file.endsWith('.mp4'))
            .map((file) => {
                const filePath = path.join(userDir, file)
                const stats = fs.statSync(filePath)
                const relativePath = path.relative(STORAGE_DIR, filePath)

                return {
                    filename: file,
                    url: `/api/videos/${relativePath.replace(/\\/g, '/')}`,
                    path: filePath,
                    size: stats.size,
                    createdAt: stats.birthtime
                }
            })
            .sort((a, b) => b.createdAt - a.createdAt) // Sort by creation date, newest first
    } catch (error) {
        logger.error('Error getting user videos:', error)
        return []
    }
}

/**
 * Delete a video
 * @param {string} videoPath - Path to the video file
 * @returns {boolean} - Whether the deletion was successful
 */
function deleteVideo(videoPath) {
    try {
        if (fs.existsSync(videoPath)) {
            fs.unlinkSync(videoPath)
            return true
        }
        return false
    } catch (error) {
        logger.error('Error deleting video:', error)
        return false
    }
}

module.exports = {
    saveGeneratedVideo,
    getUserVideos,
    deleteVideo
}
