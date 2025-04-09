import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

// Initialize the Gemini API
const initializeGeminiAPI = (apiKey) => {
    return new GoogleGenerativeAI(apiKey)
}

// Configure safety settings
const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
    }
]

// Create a chat session
const createChatSession = async (apiKey, modelName = 'gemini-2.0-flash') => {
    try {
        const genAI = initializeGeminiAPI(apiKey)
        const model = genAI.getGenerativeModel({ model: modelName })

        return model.startChat({
            safetySettings,
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 8192
            }
        })
    } catch (error) {
        console.error('Error creating chat session:', error)
        throw error
    }
}

// Send a message to Gemini
const sendMessageToGemini = async (chatSession, message, systemInstruction = '') => {
    try {
        // If system instruction is provided, include it
        const messageWithInstruction = systemInstruction ? `${systemInstruction}\n\nUser: ${message}` : message

        const result = await chatSession.sendMessage(messageWithInstruction)
        return result.response.text()
    } catch (error) {
        console.error('Error sending message to Gemini:', error)
        throw error
    }
}

// Send an image to Gemini
const sendImageToGemini = async (apiKey, modelName, message, imageData, systemInstruction = '') => {
    try {
        const genAI = initializeGeminiAPI(apiKey)
        const model = genAI.getGenerativeModel({ model: modelName })

        // Convert image data to proper format
        const imageParts = [
            {
                inlineData: {
                    data: imageData,
                    mimeType: 'image/jpeg' // Adjust based on your image type
                }
            }
        ]

        // If system instruction is provided, include it
        const prompt = systemInstruction ? `${systemInstruction}\n\nUser: ${message}` : message

        const result = await model.generateContent([prompt, ...imageParts])
        return result.response.text()
    } catch (error) {
        console.error('Error sending image to Gemini:', error)
        throw error
    }
}

// Text-to-speech conversion
const textToSpeech = async (apiKey, text, voice = 'alloy') => {
    // This is a placeholder for actual text-to-speech implementation
    // In a real implementation, you would use a TTS API like Google's Text-to-Speech
    console.log(`Converting text to speech with voice ${voice}: ${text}`)
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(`audio-data-for-${text}`)
        }, 500)
    })
}

export { initializeGeminiAPI, createChatSession, sendMessageToGemini, sendImageToGemini, textToSpeech }
