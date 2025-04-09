import { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'

/**
 * Controller for video generation functionality
 */
class VideoGenerationController {
    private apiKey: string
    private baseUrl: string = 'https://api.minimax.chat'
    private version: string = 'v1'
    private modelName: string = 'deep-canvas'
    private storageDir: string

    constructor() {
        // Initialize with environment variables or default settings
        this.apiKey = process.env.DEEP_CANVAS_API_KEY || process.env.MINIMAX_API_KEY || ''
        if (!this.apiKey) {
            console.warn('DEEP_CANVAS_API_KEY not found in environment variables')
        }

        this.storageDir = process.env.VIDEO_STORAGE_DIR || path.join(process.cwd(), 'storage', 'videos')
        this.ensureStorageDir()

        // Bind methods
        this.generateVideoFromText = this.generateVideoFromText.bind(this)
        this.generateVideoFromImage = this.generateVideoFromImage.bind(this)
        this.checkVideoStatus = this.checkVideoStatus.bind(this)
    }

    /**
     * Ensure storage directory exists
     */
    private ensureStorageDir(): void {
        if (!fs.existsSync(this.storageDir)) {
            fs.mkdirSync(this.storageDir, { recursive: true })
            console.info(`Created video storage directory: ${this.storageDir}`)
        }
    }

    /**
     * Generate video from text prompt
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     */
    async generateVideoFromText(req: Request, res: Response): Promise<Response> {
        try {
            const { prompt, style, duration, userId } = req.body

            if (!prompt) {
                return res.status(400).json({ error: 'Prompt is required' })
            }

            // Get generation settings
            const settings = this.getVideoGenerationSettings(req.body)

            console.info(`Starting text-to-video generation for user ${userId || 'anonymous'}`)

            const endpoint = `${this.baseUrl}/${this.version}/text_to_video`

            const requestData = {
                model: this.modelName,
                prompt,
                ...(style && { style }),
                ...(duration && { duration }),
                ...settings
            }

            const response = await axios({
                method: 'POST',
                url: endpoint,
                data: requestData,
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 60000 // 60 seconds timeout
            })

            // Log the job ID for tracking
            console.info(`Video generation job created: ${response.data.job_id}`)

            return res.status(200).json({
                success: true,
                jobId: response.data.job_id,
                estimatedTime: response.data.estimated_time || 'unknown'
            })
        } catch (error: any) {
            console.error('Error generating video from text:', error)
            return res.status(500).json({
                error: 'Failed to generate video',
                message: error.message
            })
        }
    }

    /**
     * Generate video from uploaded image
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     */
    async generateVideoFromImage(req: Request, res: Response): Promise<Response> {
        try {
            const { prompt, style, userId } = req.body

            // Check if image file was uploaded
            if (!req.file) {
                return res.status(400).json({ error: 'Image file is required' })
            }

            // Get generation settings
            const settings = this.getVideoGenerationSettings(req.body)

            console.info(`Starting image-to-video generation for user ${userId || 'anonymous'}`)

            const endpoint = `${this.baseUrl}/${this.version}/image_to_video`

            const formData = new FormData()
            formData.append('model', this.modelName)

            // Add image file
            const imageBuffer = fs.readFileSync(req.file.path)
            const blob = new Blob([imageBuffer], { type: req.file.mimetype })
            formData.append('image', blob, req.file.originalname)

            if (prompt) formData.append('prompt', prompt)
            if (style) formData.append('style', style)

            // Add any additional parameters
            Object.entries(settings).forEach(([key, value]) => {
                formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value))
            })

            const response = await axios({
                method: 'POST',
                url: endpoint,
                data: formData,
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'multipart/form-data'
                },
                timeout: 60000 // 60 seconds timeout
            })

            // Log the job ID for tracking
            console.info(`Video generation job created: ${response.data.job_id}`)

            return res.status(200).json({
                success: true,
                jobId: response.data.job_id,
                estimatedTime: response.data.estimated_time || 'unknown'
            })
        } catch (error: any) {
            console.error('Error generating video from image:', error)
            return res.status(500).json({
                error: 'Failed to generate video',
                message: error.message
            })
        }
    }

    /**
     * Check the status of a video generation job
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     */
    async checkVideoStatus(req: Request, res: Response): Promise<Response> {
        try {
            const { jobId } = req.params

            if (!jobId) {
                return res.status(400).json({ error: 'Job ID is required' })
            }

            const endpoint = `${this.baseUrl}/${this.version}/video_jobs/${jobId}`

            const response = await axios({
                method: 'GET',
                url: endpoint,
                headers: {
                    Authorization: `Bearer ${this.apiKey}`
                },
                timeout: 30000 // 30 seconds timeout
            })

            // If the video is ready, save it to our storage
            if (response.data.status === 'completed' && response.data.result && response.data.result.video_url) {
                try {
                    // Save the video to our storage system
                    const savedVideoInfo = await this.saveGeneratedVideo(response.data.result.video_url, req.query.userId as string, jobId)

                    // Add our local video URL to the response
                    response.data.localVideoUrl = savedVideoInfo.url
                } catch (saveError) {
                    console.error('Error saving generated video:', saveError)
                    // Continue with the response even if saving fails
                }
            }

            return res.status(200).json(response.data)
        } catch (error: any) {
            console.error('Error checking video status:', error)
            return res.status(500).json({
                error: 'Failed to check video status',
                message: error.message
            })
        }
    }

    /**
     * Get video generation settings based on user input and defaults
     * @param {Object} userInput - User provided settings
     * @returns {Object} - Combined settings for video generation
     */
    private getVideoGenerationSettings(userInput: any = {}): Record<string, any> {
        // Default settings
        const defaultSettings = {
            resolution: '720p',
            fps: 24,
            quality: 'high',
            format: 'mp4'
        }

        // Extract relevant settings from user input
        const {
            resolution,
            fps,
            quality,
            format
            // Add any other supported parameters here
        } = userInput

        // Combine with defaults, using user values when provided
        const settings = {
            ...defaultSettings,
            ...(resolution && { resolution }),
            ...(fps && { fps }),
            ...(quality && { quality }),
            ...(format && { format })
        }

        // Validate settings
        return this.validateSettings(settings)
    }

    /**
     * Validate and sanitize video generation settings
     * @param {Object} settings - Settings to validate
     * @returns {Object} - Validated and sanitized settings
     */
    private validateSettings(settings: Record<string, any>): Record<string, any> {
        const validatedSettings = { ...settings }

        // Validate resolution
        const validResolutions = ['480p', '720p', '1080p']
        if (!validResolutions.includes(validatedSettings.resolution)) {
            validatedSettings.resolution = '720p' // Default to 720p if invalid
        }

        // Validate fps
        const fps = parseInt(validatedSettings.fps as string)
        if (isNaN(fps) || fps < 15 || fps > 60) {
            validatedSettings.fps = 24 // Default to 24fps if invalid
        } else {
            validatedSettings.fps = fps
        }

        // Validate quality
        const validQualities = ['low', 'medium', 'high']
        if (!validQualities.includes(validatedSettings.quality)) {
            validatedSettings.quality = 'high' // Default to high if invalid
        }

        // Validate format
        const validFormats = ['mp4', 'webm']
        if (!validFormats.includes(validatedSettings.format)) {
            validatedSettings.format = 'mp4' // Default to mp4 if invalid
        }

        return validatedSettings
    }

    /**
     * Save a generated video from a URL to local storage
     * @param {string} videoUrl - URL of the generated video
     * @param {string} userId - User ID who generated the video
     * @param {string} jobId - Job ID of the generation
     * @returns {Promise<Object>} - Information about the saved video
     */
    private async saveGeneratedVideo(
        videoUrl: string,
        userId?: string,
        jobId?: string
    ): Promise<{ url: string; path: string; filename: string; size: number }> {
        try {
            // Create user directory if it doesn't exist
            const userDir = userId ? path.join(this.storageDir, userId) : this.storageDir
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
                    const relativePath = path.relative(this.storageDir, filePath)
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
            console.error('Error saving video:', error)
            throw new Error(`Failed to save video: ${(error as Error).message}`)
        }
    }

    /**
     * Get a list of videos for a user
     * @param {string} userId - User ID
     * @returns {Array<Object>} - List of video information
     */
    getUserVideos(userId: string): Array<{ filename: string; url: string; path: string; size: number; createdAt: Date }> {
        try {
            // Create user directory if it doesn't exist
            const userDir = userId ? path.join(this.storageDir, userId) : this.storageDir
            if (!fs.existsSync(userDir)) {
                return []
            }

            const files = fs.readdirSync(userDir)

            return files
                .filter((file) => file.endsWith('.mp4'))
                .map((file) => {
                    const filePath = path.join(userDir, file)
                    const stats = fs.statSync(filePath)
                    const relativePath = path.relative(this.storageDir, filePath)

                    return {
                        filename: file,
                        url: `/api/videos/${relativePath.replace(/\\/g, '/')}`,
                        path: filePath,
                        size: stats.size,
                        createdAt: stats.birthtime
                    }
                })
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()) // Sort by creation date, newest first
        } catch (error) {
            console.error('Error getting user videos:', error)
            return []
        }
    }

    /**
     * Delete a video
     * @param {string} videoPath - Path to the video file
     * @returns {boolean} - Whether the deletion was successful
     */
    deleteVideo(videoPath: string): boolean {
        try {
            if (fs.existsSync(videoPath)) {
                fs.unlinkSync(videoPath)
                return true
            }
            return false
        } catch (error) {
            console.error('Error deleting video:', error)
            return false
        }
    }
}

export default new VideoGenerationController()
