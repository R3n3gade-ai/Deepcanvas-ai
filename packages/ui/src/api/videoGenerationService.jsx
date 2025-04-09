import axios from 'axios'

// Base API URL
const API_URL = '/api/video'

/**
 * Generate video from text prompt
 * @param {Object} params - Generation parameters
 * @returns {Promise<Object>} - API response
 */
export const generateVideoFromText = async (params) => {
    try {
        const response = await axios.post(`${API_URL}/text-to-video`, params)
        return response.data
    } catch (error) {
        console.error('Error generating video from text:', error)
        throw error.response?.data || error
    }
}

/**
 * Generate video from image
 * @param {FormData} formData - Form data with image and parameters
 * @returns {Promise<Object>} - API response
 */
export const generateVideoFromImage = async (formData) => {
    try {
        const response = await axios.post(`${API_URL}/image-to-video`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        return response.data
    } catch (error) {
        console.error('Error generating video from image:', error)
        throw error.response?.data || error
    }
}

/**
 * Check video generation status
 * @param {string} jobId - Job ID
 * @returns {Promise<Object>} - API response with status
 */
export const checkVideoStatus = async (jobId) => {
    try {
        const response = await axios.get(`${API_URL}/status/${jobId}`)
        return response.data
    } catch (error) {
        console.error('Error checking video status:', error)
        throw error.response?.data || error
    }
}

/**
 * Get user's generated videos
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - List of videos
 */
export const getUserVideos = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/user/${userId}`)
        return response.data
    } catch (error) {
        console.error('Error getting user videos:', error)
        throw error.response?.data || error
    }
}

/**
 * Delete a video
 * @param {string} videoId - Video ID
 * @returns {Promise<Object>} - API response
 */
export const deleteVideo = async (videoId) => {
    try {
        const response = await axios.delete(`${API_URL}/${videoId}`)
        return response.data
    } catch (error) {
        console.error('Error deleting video:', error)
        throw error.response?.data || error
    }
}

/**
 * Share a video
 * @param {string} videoId - Video ID
 * @param {Object} shareOptions - Share options
 * @returns {Promise<Object>} - API response with share link
 */
export const shareVideo = async (videoId, shareOptions) => {
    try {
        const response = await axios.post(`${API_URL}/${videoId}/share`, shareOptions)
        return response.data
    } catch (error) {
        console.error('Error sharing video:', error)
        throw error.response?.data || error
    }
}
