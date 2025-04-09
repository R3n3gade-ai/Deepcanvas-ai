const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')
const path = require('path')
const { v4: uuidv4 } = require('uuid')

/**
 * MiniMax Video API Client
 * Handles interactions with the MiniMax Video-01 API for text-to-video and image-to-video generation
 */
class MiniMaxVideoAPI {
    constructor(apiKey, options = {}) {
        this.apiKey = apiKey
        this.baseUrl = options.baseUrl || 'https://api.minimax.chat'
        this.version = options.version || 'v1'
        this.modelName = options.modelName || 'video-01'
        this.timeout = options.timeout || 300000 // 5 minutes default timeout
        this.retries = options.retries || 3
        this.retryDelay = options.retryDelay || 2000
    }

    /**
     * Generate video from text prompt
     * @param {Object} params - Generation parameters
     * @param {string} params.prompt - Text prompt describing the video to generate
     * @param {string} params.style - Optional style parameter (e.g., 'realistic', 'anime')
     * @param {number} params.duration - Optional duration in seconds (default is max supported by the model)
     * @param {Object} params.additionalParams - Any additional parameters to pass to the API
     * @returns {Promise<Object>} - Response from the API
     */
    async generateFromText(params) {
        const { prompt, style, duration, additionalParams = {} } = params

        const endpoint = `${this.baseUrl}/${this.version}/text_to_video`

        const requestData = {
            model: this.modelName,
            prompt,
            ...additionalParams
        }

        if (style) requestData.style = style
        if (duration) requestData.duration = duration

        return this._makeRequest(endpoint, requestData)
    }

    /**
     * Generate video from image
     * @param {Object} params - Generation parameters
     * @param {string|Buffer} params.image - Image file path or buffer
     * @param {string} params.prompt - Optional text prompt to guide the generation
     * @param {string} params.style - Optional style parameter
     * @param {Object} params.additionalParams - Any additional parameters to pass to the API
     * @returns {Promise<Object>} - Response from the API
     */
    async generateFromImage(params) {
        const { image, prompt, style, additionalParams = {} } = params

        const endpoint = `${this.baseUrl}/${this.version}/image_to_video`

        const form = new FormData()
        form.append('model', this.modelName)

        // Handle image input (file path or buffer)
        if (typeof image === 'string') {
            // It's a file path
            form.append('image', fs.createReadStream(image))
        } else if (Buffer.isBuffer(image)) {
            // It's a buffer
            const tempFilePath = path.join(process.cwd(), 'temp', `${uuidv4()}.png`)
            fs.mkdirSync(path.dirname(tempFilePath), { recursive: true })
            fs.writeFileSync(tempFilePath, image)
            form.append('image', fs.createReadStream(tempFilePath))

            // Clean up temp file after request
            setTimeout(() => {
                try {
                    fs.unlinkSync(tempFilePath)
                } catch (err) {
                    console.error('Error cleaning up temp file:', err)
                }
            }, 5000)
        } else {
            throw new Error('Image must be a file path or Buffer')
        }

        if (prompt) form.append('prompt', prompt)
        if (style) form.append('style', style)

        // Add any additional parameters
        Object.entries(additionalParams).forEach(([key, value]) => {
            form.append(key, typeof value === 'object' ? JSON.stringify(value) : value)
        })

        return this._makeFormRequest(endpoint, form)
    }

    /**
     * Check the status of a video generation job
     * @param {string} jobId - The job ID returned from the generation request
     * @returns {Promise<Object>} - Response with job status
     */
    async checkStatus(jobId) {
        const endpoint = `${this.baseUrl}/${this.version}/video_jobs/${jobId}`
        return this._makeRequest(endpoint, {}, 'GET')
    }

    /**
     * Make a JSON request to the API
     * @private
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request data
     * @param {string} method - HTTP method
     * @returns {Promise<Object>} - API response
     */
    async _makeRequest(endpoint, data, method = 'POST') {
        let attempts = 0

        while (attempts < this.retries) {
            try {
                const response = await axios({
                    method,
                    url: endpoint,
                    data: method === 'POST' ? data : undefined,
                    headers: {
                        Authorization: `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: this.timeout
                })

                return response.data
            } catch (error) {
                attempts++

                // If we've used all retries, throw the error
                if (attempts >= this.retries) {
                    throw this._formatError(error)
                }

                // Otherwise wait and retry
                await new Promise((resolve) => setTimeout(resolve, this.retryDelay))
            }
        }
    }

    /**
     * Make a form data request to the API
     * @private
     * @param {string} endpoint - API endpoint
     * @param {FormData} formData - Form data
     * @returns {Promise<Object>} - API response
     */
    async _makeFormRequest(endpoint, formData) {
        let attempts = 0

        while (attempts < this.retries) {
            try {
                const response = await axios({
                    method: 'POST',
                    url: endpoint,
                    data: formData,
                    headers: {
                        Authorization: `Bearer ${this.apiKey}`,
                        ...formData.getHeaders()
                    },
                    timeout: this.timeout
                })

                return response.data
            } catch (error) {
                attempts++

                // If we've used all retries, throw the error
                if (attempts >= this.retries) {
                    throw this._formatError(error)
                }

                // Otherwise wait and retry
                await new Promise((resolve) => setTimeout(resolve, this.retryDelay))
            }
        }
    }

    /**
     * Format error for better debugging
     * @private
     * @param {Error} error - Original error
     * @returns {Error} - Formatted error
     */
    _formatError(error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            const errorMessage = error.response.data?.error?.message || error.response.data?.message || 'Unknown API error'

            const formattedError = new Error(`MiniMax API Error (${error.response.status}): ${errorMessage}`)
            formattedError.status = error.response.status
            formattedError.data = error.response.data
            return formattedError
        } else if (error.request) {
            // The request was made but no response was received
            return new Error(`MiniMax API Network Error: No response received - ${error.message}`)
        } else {
            // Something happened in setting up the request that triggered an Error
            return new Error(`MiniMax API Request Error: ${error.message}`)
        }
    }
}

module.exports = MiniMaxVideoAPI
