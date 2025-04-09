import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
    Grid,
    Typography,
    Box,
    Paper,
    TextField,
    IconButton,
    Button,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemButton,
    Drawer,
    AppBar,
    Toolbar,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    FormControlLabel,
    Tooltip,
    CircularProgress,
    Avatar,
    Alert,
    Snackbar,
    Tabs,
    Tab
} from '@mui/material'
import { styled } from '@mui/material/styles'
import SendIcon from '@mui/icons-material/Send'
import MicIcon from '@mui/icons-material/Mic'
import ScreenShareIcon from '@mui/icons-material/ScreenShare'
import SettingsIcon from '@mui/icons-material/Settings'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import CodeIcon from '@mui/icons-material/Code'
import InfoIcon from '@mui/icons-material/Info'
import StopIcon from '@mui/icons-material/Stop'
// Use alternative icons for ones that might not be available
import VpnKeyIcon from '@mui/icons-material/VpnKey'
import VolumeDownIcon from '@mui/icons-material/VolumeDown'
import FunctionsIcon from '@mui/icons-material/Functions'
import MicOffIcon from '@mui/icons-material/MicOff'
import HomeIcon from '@mui/icons-material/Home'
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks'

// Import Gemini service and config
import { createChatSession, sendMessageToGemini, sendImageToGemini, textToSpeech } from '@/services/geminiService'
import geminiConfig from '@/config/geminiConfig'

// ==============================|| DASHBOARD VIEW ||============================== //

// Styled components
const ChatContainer = styled(Paper)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 180px)',
    overflow: 'hidden',
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`
}))

const MessageContainer = styled(Box)(({ theme }) => ({
    flexGrow: 1,
    overflow: 'auto',
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2)
}))

const MessageBubble = styled(Paper)(({ theme, isUser }) => ({
    padding: theme.spacing(2),
    maxWidth: '80%',
    alignSelf: isUser ? 'flex-end' : 'flex-start',
    backgroundColor: isUser ? theme.palette.primary.light : theme.palette.background.paper,
    color: isUser ? theme.palette.primary.contrastText : theme.palette.text.primary,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1]
}))

const InputContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    padding: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.divider}`
}))

const FeatureButton = styled(Button)(({ theme }) => ({
    padding: theme.spacing(2),
    margin: theme.spacing(1),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '120px',
    width: '200px',
    gap: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[2],
    '&:hover': {
        boxShadow: theme.shadows[4]
    }
}))

const SystemInstructionContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper
}))

// Removed the Drawer component in favor of a simple Box for the Library

// Tab Panel component
function TabPanel(props) {
    const { children, value, index, ...other } = props

    return (
        <div
            role='tabpanel'
            hidden={value !== index}
            id={`dashboard-tabpanel-${index}`}
            aria-labelledby={`dashboard-tab-${index}`}
            {...other}
            style={{ height: 'calc(100% - 48px)', overflow: 'auto' }}
        >
            {value === index && <Box sx={{ p: 0, height: '100%' }}>{children}</Box>}
        </div>
    )
}

function a11yProps(index) {
    return {
        id: `dashboard-tab-${index}`,
        'aria-controls': `dashboard-tabpanel-${index}`
    }
}

const Dashboard = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [tabValue, setTabValue] = useState(0)

    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue)

        // Navigate to the appropriate route based on tab
        switch (newValue) {
            case 0: // Home/TED Live
                navigate('/dashboard')
                break
            case 1: // Chatflows
                navigate('/chatflows')
                break
            case 2: // Agentflows
                navigate('/agentflows')
                break
            case 3: // Marketplaces
                navigate('/marketplaces')
                break
            default:
                navigate('/dashboard')
        }
    }

    // Set the active tab based on the current route
    useEffect(() => {
        if (location.pathname.includes('/chatflows')) {
            setTabValue(1)
        } else if (location.pathname.includes('/agentflows')) {
            setTabValue(2)
        } else if (location.pathname.includes('/marketplaces')) {
            setTabValue(3)
        } else {
            setTabValue(0)
        }
    }, [location])

    // Set the active tab based on the current route
    useEffect(() => {
        if (location.pathname.includes('/chatflows')) {
            setTabValue(1)
        } else if (location.pathname.includes('/agentflows')) {
            setTabValue(2)
        } else if (location.pathname.includes('/marketplaces')) {
            setTabValue(3)
        } else {
            setTabValue(0)
        }
    }, [location])
    // State for chat messages
    const [messages, setMessages] = useState([{ id: 1, text: "Hello! I'm TED. How can I help you today?", isUser: false }])

    // State for input text
    const [inputText, setInputText] = useState('')

    // State for system instruction
    const [systemInstruction, setSystemInstruction] = useState('')

    // State for settings
    const [settings, setSettings] = useState({
        model: geminiConfig.models.flash,
        voice: 'alloy',
        outputFormat: 'text',
        codeExecution: false,
        functionCalling: false
    })

    // State for API key (using permanent key)
    const [apiKey, setApiKey] = useState(geminiConfig.apiKey)
    const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false) // Never show dialog automatically

    // State for chat session
    const [chatSession, setChatSession] = useState(null)

    // State for error handling
    const [error, setError] = useState(null)

    // State for recording
    const [isRecording, setIsRecording] = useState(false)

    // State for screen sharing
    const [isScreenSharing, setIsScreenSharing] = useState(false)

    // State for loading
    const [isLoading, setIsLoading] = useState(false)

    // State for settings drawer
    const [settingsOpen, setSettingsOpen] = useState(false)

    // State for library drawer
    const [libraryOpen, setLibraryOpen] = useState(false)

    // State for chat history
    const [chatHistory, setChatHistory] = useState([{ id: 'default', name: 'New Chat', messages: [...messages] }])

    // State for current chat
    const [currentChatId, setCurrentChatId] = useState('default')

    // Ref for message container to auto-scroll
    const messageContainerRef = useRef(null)

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight
        }
    }, [messages])

    // Function to create a new chat
    const createNewChat = () => {
        const newChatId = `chat-${Date.now()}`
        const newChat = {
            id: newChatId,
            name: `Chat ${chatHistory.length + 1}`,
            messages: [{ id: 1, text: "Hello! I'm TED. How can I help you today?", isUser: false }]
        }

        setChatHistory([...chatHistory, newChat])
        switchChat(newChatId)
        setLibraryOpen(false)
    }

    // Function to switch between chats
    const switchChat = (chatId) => {
        setCurrentChatId(chatId)
        const chat = chatHistory.find((c) => c.id === chatId)
        if (chat) {
            setMessages([...chat.messages])
        }
        setLibraryOpen(false)
    }

    // Function to delete a chat
    const deleteChat = (chatId, e) => {
        e.stopPropagation()
        if (chatHistory.length <= 1) {
            // Don't delete the last chat
            return
        }

        const newChatHistory = chatHistory.filter((chat) => chat.id !== chatId)
        setChatHistory(newChatHistory)

        // If the current chat is deleted, switch to the first chat
        if (currentChatId === chatId) {
            switchChat(newChatHistory[0].id)
        }
    }

    // Initialize chat session when API key is set
    useEffect(() => {
        if (apiKey) {
            initializeChatSession()
        }
    }, [apiKey, settings.model])

    // Initialize chat session
    const initializeChatSession = async () => {
        try {
            const session = await createChatSession(apiKey, settings.model)
            setChatSession(session)
        } catch (error) {
            console.error('Error initializing chat session:', error)
            setError('Failed to initialize chat session. Please check your API key.')
        }
    }

    // Handle sending a message
    const handleSendMessage = async () => {
        if (inputText.trim() === '' || !chatSession) return

        // Add user message to chat
        const userMessage = { id: Date.now(), text: inputText, isUser: true }
        const updatedMessages = [...messages, userMessage]
        setMessages(updatedMessages)
        setInputText('')

        // Set loading state
        setIsLoading(true)

        try {
            // Send message to Gemini
            const response = await sendMessageToGemini(chatSession, inputText, systemInstruction)

            // Create bot response
            const botResponse = {
                id: Date.now() + 1,
                text: response,
                isUser: false
            }

            const finalMessages = [...updatedMessages, botResponse]
            setMessages(finalMessages)

            // Update chat history
            updateChatHistory(finalMessages)

            // If output format is audio, convert text to speech
            if (settings.outputFormat === 'audio') {
                const audioData = await textToSpeech(apiKey, response, settings.voice)
                // In a real implementation, you would play this audio
                console.log('Audio data:', audioData)

                // Simulate playing audio
                const audio = new Audio()
                audio.src = 'data:audio/mp3;base64,' + audioData
                audio.play()
            }

            setIsLoading(false)
        } catch (error) {
            console.error('Error sending message to Gemini:', error)
            setError('Failed to get response from Gemini. Please try again.')
            setIsLoading(false)
        }
    }

    // Handle voice input
    const handleVoiceInput = () => {
        if (!isRecording) {
            // Start recording
            setIsRecording(true)

            // Check if browser supports SpeechRecognition
            if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
                const recognition = new SpeechRecognition()

                recognition.continuous = true
                recognition.interimResults = true

                recognition.onresult = (event) => {
                    const transcript = Array.from(event.results)
                        .map((result) => result[0])
                        .map((result) => result.transcript)
                        .join('')

                    setInputText(transcript)
                }

                recognition.onend = () => {
                    setIsRecording(false)
                }

                recognition.start()

                // Store recognition instance to stop it later
                window.recognitionInstance = recognition
            } else {
                alert('Speech recognition is not supported in your browser.')
                setIsRecording(false)
            }
        } else {
            // Stop recording
            setIsRecording(false)
            if (window.recognitionInstance) {
                window.recognitionInstance.stop()
            }
        }
    }

    // Handle screen sharing
    const handleScreenShare = async () => {
        if (!isScreenSharing && chatSession) {
            try {
                const mediaStream = await navigator.mediaDevices.getDisplayMedia({
                    video: true
                })

                setIsScreenSharing(true)

                // Store the stream to stop it later
                window.screenShareStream = mediaStream

                // Add a message indicating screen sharing has started
                const screenShareMessage = {
                    id: Date.now(),
                    text: 'Screen sharing started. TED can now see your screen.',
                    isUser: false
                }
                const updatedMessages = [...messages, screenShareMessage]
                setMessages(updatedMessages)
                updateChatHistory(updatedMessages)

                // Capture a screenshot from the stream
                const videoTrack = mediaStream.getVideoTracks()[0]
                const imageCapture = new ImageCapture(videoTrack)

                // Function to periodically capture and send screenshots
                const captureAndSendInterval = setInterval(async () => {
                    if (!isScreenSharing) {
                        clearInterval(captureAndSendInterval)
                        return
                    }

                    try {
                        // Capture a frame from the stream
                        const bitmap = await imageCapture.grabFrame()

                        // Convert to base64
                        const canvas = document.createElement('canvas')
                        canvas.width = bitmap.width
                        canvas.height = bitmap.height
                        const context = canvas.getContext('2d')
                        context.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height)
                        const base64Image = canvas.toDataURL('image/jpeg').split(',')[1]

                        // Send to Gemini
                        // In a real implementation, you would send this to Gemini's vision model
                        console.log('Captured screenshot and sent to Gemini')

                        // For demo purposes, we'll just log this
                        // In a real implementation, you would use sendImageToGemini
                        // const response = await sendImageToGemini(apiKey, settings.model, 'What do you see in this screen?', base64Image, systemInstruction)
                    } catch (error) {
                        console.error('Error capturing or sending screenshot:', error)
                    }
                }, 5000) // Capture every 5 seconds

                // Listen for the end of screen sharing
                mediaStream.getVideoTracks()[0].onended = () => {
                    clearInterval(captureAndSendInterval)
                    setIsScreenSharing(false)
                    const screenShareEndedMessage = {
                        id: Date.now(),
                        text: 'Screen sharing ended.',
                        isUser: false
                    }
                    const finalMessages = [...updatedMessages, screenShareEndedMessage]
                    setMessages(finalMessages)
                    updateChatHistory(finalMessages)
                }
            } catch (error) {
                console.error('Error sharing screen:', error)
                setError('Error sharing screen. Please try again.')
            }
        } else {
            // Stop screen sharing
            if (window.screenShareStream) {
                window.screenShareStream.getTracks().forEach((track) => track.stop())
            }
            setIsScreenSharing(false)
        }
    }

    // Update chat history
    const updateChatHistory = (updatedMessages) => {
        const updatedHistory = chatHistory.map((chat) => (chat.id === currentChatId ? { ...chat, messages: updatedMessages } : chat))
        setChatHistory(updatedHistory)

        // Save to local storage
        localStorage.setItem('chatHistory', JSON.stringify(updatedHistory))
    }

    // Load chat history from local storage
    useEffect(() => {
        const savedHistory = localStorage.getItem('chatHistory')
        if (savedHistory) {
            try {
                const parsedHistory = JSON.parse(savedHistory)
                if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
                    setChatHistory(parsedHistory)
                    setCurrentChatId(parsedHistory[0].id)
                    setMessages(parsedHistory[0].messages)
                }
            } catch (e) {
                console.error('Error parsing chat history:', e)
            }
        }
    }, [])

    // Initialize chat session when API key is set
    useEffect(() => {
        if (apiKey) {
            initializeChatSession()
        }
    }, [apiKey])

    // Handle API key update
    const handleApiKeyUpdate = (newApiKey) => {
        setApiKey(newApiKey)
        localStorage.setItem('geminiApiKey', newApiKey)
        setApiKeyDialogOpen(false)
    }

    // Load API key from local storage on component mount
    useEffect(() => {
        const savedApiKey = localStorage.getItem('geminiApiKey')
        if (savedApiKey) {
            setApiKey(savedApiKey)
        }
    }, [])

    // Handle error dismissal
    const handleErrorClose = () => {
        setError(null)
    }

    // Check if we're on the home tab (TED Live)
    const isHomePage = tabValue === 0

    return (
        <Box sx={{ mt: 2, height: 'calc(100vh - 88px)', display: 'flex', flexDirection: 'column' }}>
            <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label='dashboard tabs'
                sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
            >
                <Tab icon={<HomeIcon />} label='TED Live' {...a11yProps(0)} />
                <Tab label='Chatflows' {...a11yProps(1)} />
                <Tab label='Agentflows' {...a11yProps(2)} />
                <Tab label='Marketplaces' {...a11yProps(3)} />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant='h3'>TED Live</Typography>
                            <Box>
                                {/* API Key button hidden as we're using a permanent key */}
                                <Tooltip title='Library'>
                                    <IconButton onClick={() => setLibraryOpen(!libraryOpen)} sx={{ mr: 1 }}>
                                        <LibraryBooksIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title='Settings'>
                                    <IconButton onClick={() => setSettingsOpen(!settingsOpen)}>
                                        <SettingsIcon />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>

                        {/* Main chat interface */}
                        <ChatContainer>
                            {/* System instruction input */}
                            <SystemInstructionContainer>
                                <TextField
                                    fullWidth
                                    variant='outlined'
                                    placeholder='Optional: Add system instructions to set tone and style for the model'
                                    value={systemInstruction}
                                    onChange={(e) => setSystemInstruction(e.target.value)}
                                    InputProps={{
                                        endAdornment: (
                                            <Tooltip title='System instructions help set the tone and behavior of the AI'>
                                                <IconButton size='small'>
                                                    <InfoIcon fontSize='small' />
                                                </IconButton>
                                            </Tooltip>
                                        )
                                    }}
                                />
                            </SystemInstructionContainer>

                            {/* Feature buttons */}
                            {messages.length === 1 && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4, flexWrap: 'wrap' }}>
                                    <FeatureButton variant='outlined' onClick={handleVoiceInput} disabled={isScreenSharing}>
                                        <MicIcon fontSize='large' />
                                        <Typography>Talk to TED</Typography>
                                        <Typography variant='caption'>Start a real conversation using your microphone</Typography>
                                    </FeatureButton>

                                    <FeatureButton variant='outlined' onClick={handleScreenShare} disabled={isRecording}>
                                        <ScreenShareIcon fontSize='large' />
                                        <Typography>Share your screen</Typography>
                                        <Typography variant='caption'>Show TED what you're working on</Typography>
                                    </FeatureButton>
                                </Box>
                            )}

                            {/* Messages */}
                            <MessageContainer ref={messageContainerRef}>
                                {messages.map((message) => (
                                    <MessageBubble key={message.id} isUser={message.isUser}>
                                        <Typography variant='body1'>{message.text}</Typography>
                                    </MessageBubble>
                                ))}
                                {isLoading && (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                        <CircularProgress size={24} />
                                    </Box>
                                )}
                            </MessageContainer>

                            {/* Input area */}
                            <InputContainer>
                                <TextField
                                    fullWidth
                                    variant='outlined'
                                    placeholder='Message TED...'
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault()
                                            handleSendMessage()
                                        }
                                    }}
                                    disabled={isLoading}
                                    sx={{ mr: 1 }}
                                />
                                <IconButton color='primary' onClick={handleSendMessage} disabled={inputText.trim() === '' || isLoading}>
                                    <SendIcon />
                                </IconButton>
                                <IconButton
                                    color={isRecording ? 'error' : 'primary'}
                                    onClick={handleVoiceInput}
                                    disabled={isScreenSharing || isLoading}
                                >
                                    {isRecording ? <MicOffIcon /> : <MicIcon />}
                                </IconButton>
                                <IconButton
                                    color={isScreenSharing ? 'error' : 'primary'}
                                    onClick={handleScreenShare}
                                    disabled={isRecording || isLoading}
                                >
                                    {isScreenSharing ? <StopIcon /> : <ScreenShareIcon />}
                                </IconButton>
                            </InputContainer>
                        </ChatContainer>
                    </Grid>
                </Grid>

                {/* Error Snackbar */}
                <Snackbar open={!!error} autoHideDuration={6000} onClose={handleErrorClose}>
                    <Alert onClose={handleErrorClose} severity='error' sx={{ width: '100%' }}>
                        {error}
                    </Alert>
                </Snackbar>

                {/* API Key Dialog */}
                <Drawer
                    anchor='right'
                    open={apiKeyDialogOpen}
                    onClose={() => setApiKeyDialogOpen(false)}
                    sx={{ '& .MuiDrawer-paper': { width: 320, padding: 2 } }}
                >
                    <Box sx={{ p: 2 }}>
                        <Typography variant='h4' sx={{ mb: 3 }}>
                            API Key
                        </Typography>
                        <Typography variant='body2' sx={{ mb: 2 }}>
                            Enter your API key to use the TED Live chat.
                        </Typography>
                        <TextField
                            fullWidth
                            label='API Key'
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            type='password'
                            sx={{ mb: 2 }}
                        />
                        <Button variant='contained' onClick={() => handleApiKeyUpdate(apiKey)} disabled={!apiKey} fullWidth>
                            Save API Key
                        </Button>
                    </Box>
                </Drawer>

                {/* Settings Drawer */}
                <Drawer
                    anchor='right'
                    open={settingsOpen}
                    onClose={() => setSettingsOpen(false)}
                    sx={{ '& .MuiDrawer-paper': { width: 320, padding: 2 } }}
                >
                    <Box sx={{ p: 2 }}>
                        <Typography variant='h4' sx={{ mb: 3 }}>
                            Settings
                        </Typography>

                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Model</InputLabel>
                            <Select
                                value={settings.model}
                                label='Model'
                                onChange={(e) => {
                                    setSettings({ ...settings, model: e.target.value })
                                    // Re-initialize chat session with new model
                                    initializeChatSession()
                                }}
                            >
                                <MenuItem value={geminiConfig.models.flash}>Flash</MenuItem>
                                <MenuItem value={geminiConfig.models.pro}>Pro</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Voice</InputLabel>
                            <Select
                                value={settings.voice}
                                label='Voice'
                                onChange={(e) => setSettings({ ...settings, voice: e.target.value })}
                            >
                                <MenuItem value='alloy'>Alloy</MenuItem>
                                <MenuItem value='echo'>Echo</MenuItem>
                                <MenuItem value='fable'>Fable</MenuItem>
                                <MenuItem value='onyx'>Onyx</MenuItem>
                                <MenuItem value='nova'>Nova</MenuItem>
                                <MenuItem value='shimmer'>Shimmer</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Output Format</InputLabel>
                            <Select
                                value={settings.outputFormat}
                                label='Output Format'
                                onChange={(e) => setSettings({ ...settings, outputFormat: e.target.value })}
                            >
                                <MenuItem value='text'>Text</MenuItem>
                                <MenuItem value='audio'>Audio</MenuItem>
                            </Select>
                        </FormControl>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant='h6' sx={{ mb: 2 }}>
                            Tools
                        </Typography>

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={settings.codeExecution}
                                    onChange={(e) => setSettings({ ...settings, codeExecution: e.target.checked })}
                                />
                            }
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <CodeIcon sx={{ mr: 1 }} />
                                    <Typography>Code Execution</Typography>
                                </Box>
                            }
                            sx={{ mb: 1 }}
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={settings.functionCalling}
                                    onChange={(e) => setSettings({ ...settings, functionCalling: e.target.checked })}
                                />
                            }
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <FunctionsIcon sx={{ mr: 1 }} />
                                    <Typography>Function Calling</Typography>
                                </Box>
                            }
                        />
                    </Box>
                </Drawer>

                {/* Library Drawer (Chat History) */}
                <Drawer
                    anchor='right'
                    open={libraryOpen}
                    onClose={() => setLibraryOpen(false)}
                    sx={{ '& .MuiDrawer-paper': { width: 320, padding: 2 } }}
                >
                    <Box sx={{ p: 2 }}>
                        <Typography variant='h4' sx={{ mb: 3 }}>
                            Library
                        </Typography>

                        <Button startIcon={<AddIcon />} onClick={createNewChat} size='small' variant='outlined' fullWidth sx={{ mb: 2 }}>
                            New Chat
                        </Button>

                        <Divider sx={{ mb: 2 }} />

                        <List sx={{ overflow: 'auto' }}>
                            {chatHistory.map((chat) => (
                                <ListItem
                                    key={chat.id}
                                    disablePadding
                                    secondaryAction={
                                        <IconButton edge='end' onClick={(e) => deleteChat(chat.id, e)} size='small'>
                                            <DeleteIcon fontSize='small' />
                                        </IconButton>
                                    }
                                    sx={{ mb: 1 }}
                                >
                                    <ListItemButton
                                        selected={currentChatId === chat.id}
                                        onClick={() => switchChat(chat.id)}
                                        sx={{ borderRadius: 1 }}
                                    >
                                        <ListItemText
                                            primary={chat.name}
                                            secondary={
                                                chat.messages.length > 1
                                                    ? chat.messages[1]?.text.substring(0, 30) + '...'
                                                    : 'New conversation'
                                            }
                                        />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                </Drawer>
            </TabPanel>
        </Box>
    )
}

export default Dashboard
