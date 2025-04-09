const MiniMaxVideoAPI = require('../services/minimax-video-api')
const { getVideoGenerationSettings } = require('../utils/videoSettings')
const { saveGeneratedVideo } = require('../utils/fileStorage')
const logger = require('../utils/logger')

/**
 * Controller for video generation functionality
 */
class VideoGenerationController {
    constructor() {
        // Initialize with environment variables or default settings
        const apiKey = process.env.MINIMAX_API_KEY
        if (!apiKey) {
            logger.warn('MINIMAX_API_KEY not found in environment variables')
        }

        this.miniMaxClient = new MiniMaxVideoAPI(apiKey, {
            timeout: 600000 // 10 minutes timeout for video generation
        })

        // Bind methods
        this.generateVideoFromText = this.generateVideoFromText.bind(this)
        this.generateVideoFromImage = this.generateVideoFromImage.bind(this)
        this.checkVideoStatus = this.checkVideoStatus.bind(this)
    }

    /**
     * Generate video from text prompt
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async generateVideoFromText(req, res) {
        try {
            const { prompt, style, duration, userId } = req.body

            if (!prompt) {
                return res.status(400).json({ error: 'Prompt is required' })
            }

            // Get generation settings (may include user preferences or system defaults)
            const settings = getVideoGenerationSettings(req.body)

            logger.info(`Starting text-to-video generation for user ${userId || 'anonymous'}`)

            const response = await this.miniMaxClient.generateFromText({
                prompt,
                style,
                duration,
                additionalParams: settings
            })

            // Log the job ID for tracking
            logger.info(`Video generation job created: ${response.job_id}`)

            return res.status(200).json({
                success: true,
                jobId: response.job_id,
                estimatedTime: response.estimated_time || 'unknown'
            })
        } catch (error) {
            logger.error('Error generating video from text:', error)
            return res.status(500).json({
                error: 'Failed to generate video',
                message: error.message
            })
        }
    }

    /**
     * Generate video from uploaded image
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async generateVideoFromImage(req, res) {
        try {
            const { prompt, style, userId } = req.body

            // Check if image file was uploaded
            if (!req.file) {
                return res.status(400).json({ error: 'Image file is required' })
            }

            // Get generation settings
            const settings = getVideoGenerationSettings(req.body)

            logger.info(`Starting image-to-video generation for user ${userId || 'anonymous'}`)

            const response = await this.miniMaxClient.generateFromImage({
                image: req.file.path, // Path to the uploaded file
                prompt,
                style,
                additionalParams: settings
            })

            // Log the job ID for tracking
            logger.info(`Video generation job created: ${response.job_id}`)

            return res.status(200).json({
                success: true,
                jobId: response.job_id,
                estimatedTime: response.estimated_time || 'unknown'
            })
        } catch (error) {
            logger.error('Error generating video from image:', error)
            return res.status(500).json({
                error: 'Failed to generate video',
                message: error.message
            })
        }
    }

    /**
     * Check the status of a video generation job
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async checkVideoStatus(req, res) {
        try {
            const { jobId } = req.params

            if (!jobId) {
                return res.status(400).json({ error: 'Job ID is required' })
            }

            const response = await this.miniMaxClient.checkStatus(jobId)

            // If the video is ready, save it to our storage
            if (response.status === 'completed' && response.result && response.result.video_url) {
                try {
                    // Save the video to our storage system
                    const savedVideoInfo = await saveGeneratedVideo(response.result.video_url, req.query.userId, jobId)

                    // Add our local video URL to the response
                    response.localVideoUrl = savedVideoInfo.url
                } catch (saveError) {
                    logger.error('Error saving generated video:', saveError)
                    // Continue with the response even if saving fails
                }
            }

            return res.status(200).json(response)
        } catch (error) {
            logger.error('Error checking video status:', error)
            return res.status(500).json({
                error: 'Failed to check video status',
                message: error.message
            })
        }
    }
}

module.exports = new VideoGenerationController()
