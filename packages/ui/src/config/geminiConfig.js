// Gemini API configuration
const geminiConfig = {
    // This is a placeholder for the API key
    // In a production environment, this should be stored securely
    // and not committed to version control
    apiKey: 'AIzaSyDOnRHxuSmGIL7VygWXzWJsSrgEeQipGII',

    // Available models
    models: {
        flash: 'gemini-2.0-flash',
        pro: 'gemini-2.5'
    },

    // Voice options for text-to-speech
    voices: [
        { id: 'alloy', name: 'Alloy' },
        { id: 'echo', name: 'Echo' },
        { id: 'fable', name: 'Fable' },
        { id: 'onyx', name: 'Onyx' },
        { id: 'nova', name: 'Nova' },
        { id: 'shimmer', name: 'Shimmer' }
    ]
}

export default geminiConfig
