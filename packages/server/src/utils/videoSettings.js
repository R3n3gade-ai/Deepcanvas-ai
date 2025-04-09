/**
 * Utility functions for video generation settings
 */

/**
 * Get video generation settings based on user input and defaults
 * @param {Object} userInput - User provided settings
 * @returns {Object} - Combined settings for video generation
 */
function getVideoGenerationSettings(userInput = {}) {
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
    return validateSettings(settings)
}

/**
 * Validate and sanitize video generation settings
 * @param {Object} settings - Settings to validate
 * @returns {Object} - Validated and sanitized settings
 */
function validateSettings(settings) {
    const validatedSettings = { ...settings }

    // Validate resolution
    const validResolutions = ['480p', '720p', '1080p']
    if (!validResolutions.includes(validatedSettings.resolution)) {
        validatedSettings.resolution = '720p' // Default to 720p if invalid
    }

    // Validate fps
    const fps = parseInt(validatedSettings.fps)
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

module.exports = {
    getVideoGenerationSettings
}
