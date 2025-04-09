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

// Format instructions for Gemini to structure responses properly
const formattingInstructions = `
Please format your responses using proper Markdown formatting to improve readability:

1. Use headings (# for main headings, ## for subheadings, etc.) to organize your response
2. Use bullet points (* or -) for lists
3. Use numbered lists (1. 2. 3.) for sequential steps
4. Use **bold** for emphasis
5. Use code blocks with triple backticks for code examples
6. Use > for blockquotes
7. Break your response into clear paragraphs
8. Use tables when presenting structured data

This formatting will make your responses more readable and easier to understand.
`

// Send a message to Gemini with streaming support
const sendMessageToGemini = async (chatSession, message, systemInstruction = '', onChunk = null) => {
    try {
        // Combine system instruction with formatting instructions
        const combinedInstructions = systemInstruction ? `${systemInstruction}\n\n${formattingInstructions}` : formattingInstructions

        // If system instruction is provided, include it
        const messageWithInstruction = combinedInstructions ? `${combinedInstructions}\n\nUser: ${message}` : message

        // If no onChunk callback is provided, use the non-streaming version
        if (!onChunk) {
            const result = await chatSession.sendMessage(messageWithInstruction)
            return result.response.text()
        }

        // Use streaming for a more interactive experience
        const result = await chatSession.sendMessageStream(messageWithInstruction)

        // Initialize an empty response
        let fullResponse = ''

        // Process each chunk as it arrives
        for await (const chunk of result.stream) {
            const chunkText = chunk.text()
            fullResponse += chunkText

            // Call the callback with the current chunk and full response so far
            if (onChunk) {
                onChunk(chunkText, fullResponse)
            }
        }

        return fullResponse
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
