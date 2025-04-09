import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import {
    Box,
    Typography,
    Button,
    Grid,
    Card,
    CardMedia,
    IconButton,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tabs,
    Tab,
    Divider,
    Tooltip,
    Menu,
    MenuItem,
    Avatar,
    CircularProgress,
    LinearProgress,
    Paper,
    Chip,
    FormControl,
    InputLabel,
    Select
} from '@mui/material'
import { styled } from '@mui/material/styles'
import dayjs from 'dayjs'

// Icons
import AddIcon from '@mui/icons-material/Add'
import ImageIcon from '@mui/icons-material/Image'
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import CollectionsIcon from '@mui/icons-material/Collections'
import TextFieldsIcon from '@mui/icons-material/TextFields'
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill'
import FilterIcon from '@mui/icons-material/Filter'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate'
import ScheduleIcon from '@mui/icons-material/Schedule'
import TagIcon from '@mui/icons-material/Tag'
import RepeatIcon from '@mui/icons-material/Repeat'
import CloseIcon from '@mui/icons-material/Close'

// Styled components
const DesignCanvas = styled(Box)(({ theme }) => ({
    flexGrow: 1,
    backgroundColor: '#111827',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    color: 'white',
    position: 'relative',
    overflow: 'hidden'
}))

const AiStyleChip = styled(Chip)(({ theme, selected }) => ({
    margin: theme.spacing(0.5),
    backgroundColor: selected ? theme.palette.primary.main : '#1e293b',
    color: 'white',
    '&:hover': {
        backgroundColor: selected ? theme.palette.primary.dark : '#2d3748'
    }
}))

// Media Design Component
const MediaDesign = ({ open, onClose, onSave }) => {
    // State for media items
    const [mediaItems, setMediaItems] = useState([
        { id: '1', type: 'image', url: 'https://source.unsplash.com/random/600x400?social', name: 'Social Media Template 1' },
        { id: '2', type: 'image', url: 'https://source.unsplash.com/random/600x400?marketing', name: 'Marketing Template' },
        { id: '3', type: 'image', url: 'https://source.unsplash.com/random/600x400?business', name: 'Business Template' },
        { id: '4', type: 'image', url: 'https://source.unsplash.com/random/600x400?product', name: 'Product Showcase' }
    ])

    // State for tabs
    const [tabValue, setTabValue] = useState(0)

    // State for selected media
    const [selectedMedia, setSelectedMedia] = useState(null)

    // State for post content
    const [postContent, setPostContent] = useState('')

    // State for post title
    const [postTitle, setPostTitle] = useState('')

    // State for selected platform
    const [selectedPlatform, setSelectedPlatform] = useState(null)

    // State for file upload
    const [uploadedFile, setUploadedFile] = useState(null)
    const [uploadPreview, setUploadPreview] = useState('')

    // State for AI image generation
    const [aiPrompt, setAiPrompt] = useState('')
    const [aiLoading, setAiLoading] = useState(false)
    const [aiStyles, setAiStyles] = useState([
        'Realistic',
        'Cartoon',
        'Anime',
        'Fantasy',
        'Abstract',
        'Pixel Art',
        'Sketch',
        'Watercolor',
        'Minimalist',
        'Cyberpunk',
        'Monochromatic',
        'Surreal',
        'Pop Art',
        'Fantasy Realism'
    ])
    const [selectedAiStyle, setSelectedAiStyle] = useState('Realistic')

    // State for scheduling
    const [scheduledDate, setScheduledDate] = useState(dayjs())

    // State for tags
    const [tags, setTags] = useState([
        { id: '1', name: 'Social', color: '#1DA1F2' },
        { id: '2', name: 'Marketing', color: '#4267B2' },
        { id: '3', name: 'Announcement', color: '#C13584' }
    ])
    const [selectedTags, setSelectedTags] = useState([])

    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue)
    }

    // Handle post content change
    const handlePostContentChange = (event) => {
        setPostContent(event.target.value)
    }

    // Handle post title change
    const handlePostTitleChange = (event) => {
        setPostTitle(event.target.value)
    }

    // Handle file upload
    const handleFileUpload = (event) => {
        const file = event.target.files[0]
        if (file) {
            setUploadedFile(file)

            // Create a preview URL
            const reader = new FileReader()
            reader.onload = () => {
                setUploadPreview(reader.result)

                // Create a new media item from the uploaded file
                const newMedia = {
                    id: Date.now().toString(),
                    type: file.type.startsWith('image/') ? 'image' : 'video',
                    url: reader.result,
                    name: file.name,
                    size: file.size,
                    uploadedAt: new Date().toISOString()
                }

                // Add to media items and select it
                setMediaItems([newMedia, ...mediaItems])
                setSelectedMedia(newMedia)

                // Switch to the design tab
                setTabValue(2)
            }
            reader.readAsDataURL(file)
        }
    }

    // Handle drag and drop
    const handleDragOver = (event) => {
        event.preventDefault()
        event.stopPropagation()
    }

    const handleDrop = (event) => {
        event.preventDefault()
        event.stopPropagation()

        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            const file = event.dataTransfer.files[0]
            if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
                // Create a file input event-like object
                const mockEvent = {
                    target: {
                        files: [file]
                    }
                }
                handleFileUpload(mockEvent)
            }
        }
    }

    // Handle AI image generation with Gemini API
    const generateAiImage = useCallback(async () => {
        if (aiPrompt.length < 30) {
            // Show a message that the prompt is too short
            return
        }

        setAiLoading(true)

        try {
            // Use Gemini API to generate an image
            const apiKey = 'AIzaSyDOnRHxuSmGIL7VygWXzWJsSrgEeQipGII' // Using the permanent API key
            const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'

            // Create a prompt that includes the style
            const fullPrompt = `I need a detailed description for an image that I can use with an image generation service.

Description: ${aiPrompt}

Style: ${selectedAiStyle}

Please provide a detailed, vivid description that would work well with image generation AI. Include specific details about composition, colors, lighting, and mood. Format your response as a paragraph without any explanations or introductions - just the enhanced description itself.`

            // Make the API request
            const response = await fetch(`${apiUrl}?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: fullPrompt
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 2048
                    }
                })
            })

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`)
            }

            const data = await response.json()

            // For Gemini Pro, we'll get text back, not an image directly
            // We'll use the text to create a prompt for an image service
            let imageUrl = ''

            // Extract image URL if available in the response
            if (
                data.candidates &&
                data.candidates[0] &&
                data.candidates[0].content &&
                data.candidates[0].content.parts &&
                data.candidates[0].content.parts[0]
            ) {
                // If Gemini returns an image URL directly
                const content = data.candidates[0].content.parts[0]
                if (content.inlineData && content.inlineData.data) {
                    // If there's inline image data
                    imageUrl = `data:image/jpeg;base64,${content.inlineData.data}`
                } else if (content.text) {
                    // If there's text, use it as an enhanced prompt for Unsplash
                    const enhancedPrompt = content.text || `${aiPrompt} ${selectedAiStyle}`
                    // Check if the text contains a URL
                    const urlMatch = enhancedPrompt.match(/https?:\/\/[^\s]+\.(jpg|jpeg|png|gif)/i)
                    if (urlMatch) {
                        imageUrl = urlMatch[0]
                    } else {
                        // Use the enhanced description from Gemini with Unsplash
                        imageUrl = `https://source.unsplash.com/random/600x400?${encodeURIComponent(enhancedPrompt)}`
                    }
                }
            } else {
                // Fallback to Unsplash
                imageUrl = `https://source.unsplash.com/random/600x400?${encodeURIComponent(aiPrompt + ' ' + selectedAiStyle)}`
            }

            // Get the enhanced prompt if available from Gemini's response
            let enhancedPrompt = aiPrompt
            if (
                data.candidates &&
                data.candidates[0] &&
                data.candidates[0].content &&
                data.candidates[0].content.parts &&
                data.candidates[0].content.parts[0] &&
                data.candidates[0].content.parts[0].text
            ) {
                enhancedPrompt = data.candidates[0].content.parts[0].text
            }

            const aiGeneratedImage = {
                id: `ai-${Date.now()}`,
                type: 'image',
                url: imageUrl,
                name: `AI Generated: ${aiPrompt.substring(0, 20)}...`,
                isAiGenerated: true,
                prompt: aiPrompt,
                enhancedPrompt: enhancedPrompt,
                style: selectedAiStyle,
                createdAt: new Date().toISOString()
            }

            // Add to media items and select it
            setMediaItems([aiGeneratedImage, ...mediaItems])
            setSelectedMedia(aiGeneratedImage)

            // Switch to the design tab
            setTabValue(3)
            setAiLoading(false)
        } catch (error) {
            console.error('Error generating AI image:', error)
            setAiLoading(false)
            // Show error message
            alert(`Error generating image: ${error.message}. Using fallback image source.`)

            // Fallback to Unsplash
            const fallbackImage = {
                id: `ai-${Date.now()}`,
                type: 'image',
                url: `https://source.unsplash.com/random/600x400?${encodeURIComponent(aiPrompt + ' ' + selectedAiStyle)}`,
                name: `AI Generated (Fallback): ${aiPrompt.substring(0, 20)}...`,
                isAiGenerated: true,
                prompt: aiPrompt,
                style: selectedAiStyle,
                createdAt: new Date().toISOString()
            }

            setMediaItems([fallbackImage, ...mediaItems])
            setSelectedMedia(fallbackImage)
            setTabValue(3)
        }
    }, [aiPrompt, selectedAiStyle, mediaItems])

    // Handle AI style selection
    const handleAiStyleSelect = (style) => {
        setSelectedAiStyle(style)
    }

    // Handle tag selection
    const handleTagSelect = (tagId) => {
        if (selectedTags.includes(tagId)) {
            setSelectedTags(selectedTags.filter((id) => id !== tagId))
        } else {
            setSelectedTags([...selectedTags, tagId])
        }
    }

    // Save post
    const savePost = () => {
        const newPost = {
            id: Date.now().toString(),
            title: postTitle || 'Untitled Post',
            content: postContent,
            publishDate: scheduledDate.toISOString(),
            state: 'SCHEDULED',
            integration: {
                id: selectedPlatform?.id || '1',
                name: selectedPlatform?.name || 'Twitter',
                identifier: selectedPlatform?.identifier || 'twitter',
                picture: selectedPlatform?.picture || '/icons/platforms/twitter.png'
            },
            media:
                selectedMedia || uploadPreview
                    ? {
                          url: selectedMedia?.url || uploadPreview,
                          type: selectedMedia?.type || 'image',
                          isAiGenerated: selectedMedia?.isAiGenerated || false,
                          prompt: selectedMedia?.prompt || '',
                          style: selectedMedia?.style || ''
                      }
                    : null,
            tags:
                selectedTags.length > 0
                    ? selectedTags.map((tagId) => ({
                          tag: tags.find((tag) => tag.id === tagId)
                      }))
                    : [{ tag: { name: 'Social', color: '#1DA1F2' } }]
        }

        if (onSave) {
            onSave(newPost)
        }

        resetForm()
        onClose()
    }

    // Reset form
    const resetForm = () => {
        setPostTitle('')
        setPostContent('')
        setSelectedMedia(null)
        setSelectedPlatform(null)
        setUploadedFile(null)
        setUploadPreview('')
        setAiPrompt('')
        setSelectedAiStyle('Realistic')
        setScheduledDate(dayjs())
        setSelectedTags([])
        setTabValue(0)
    }

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth='md'>
            <DialogTitle>Create New Post</DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2}>
                    {/* Post Content */}
                    <Grid item xs={12} md={7}>
                        <TextField
                            label='Post Title'
                            fullWidth
                            margin='normal'
                            value={postTitle}
                            onChange={handlePostTitleChange}
                            placeholder='Enter a title for your post'
                        />
                        <TextField
                            label='Post Content'
                            fullWidth
                            multiline
                            rows={6}
                            margin='normal'
                            value={postContent}
                            onChange={handlePostContentChange}
                            placeholder="What's on your mind?"
                        />

                        <Box sx={{ mt: 2 }}>
                            <Typography variant='subtitle2' gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                <ScheduleIcon sx={{ mr: 1, fontSize: 20 }} />
                                Scheduling Options
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label='Date'
                                        type='date'
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        value={scheduledDate.format('YYYY-MM-DD')}
                                        onChange={(e) => setScheduledDate(dayjs(e.target.value))}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label='Time'
                                        type='time'
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        value={scheduledDate.format('HH:mm')}
                                        onChange={(e) => {
                                            const [hours, minutes] = e.target.value.split(':')
                                            setScheduledDate(scheduledDate.hour(parseInt(hours)).minute(parseInt(minutes)))
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Box>

                        <Box sx={{ mt: 2 }}>
                            <Typography variant='subtitle2' gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                <TagIcon sx={{ mr: 1, fontSize: 20 }} />
                                Tags
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {tags.map((tag) => (
                                    <Chip
                                        key={tag.id}
                                        label={tag.name}
                                        sx={{
                                            backgroundColor: selectedTags.includes(tag.id) ? tag.color : 'transparent',
                                            color: selectedTags.includes(tag.id) ? 'white' : 'inherit',
                                            border: `1px solid ${tag.color}`,
                                            '&:hover': {
                                                backgroundColor: selectedTags.includes(tag.id) ? tag.color : `${tag.color}22`
                                            }
                                        }}
                                        onClick={() => handleTagSelect(tag.id)}
                                    />
                                ))}
                            </Box>
                        </Box>
                    </Grid>

                    {/* Media Design */}
                    <Grid item xs={12} md={5}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={tabValue} onChange={handleTabChange} aria-label='media design tabs'>
                                <Tab label='Upload' icon={<CloudUploadIcon />} />
                                <Tab label='Library' icon={<CollectionsIcon />} />
                                <Tab label='AI' icon={<AutoFixHighIcon />} />
                                <Tab label='Design' icon={<EditIcon />} />
                            </Tabs>
                        </Box>

                        {/* Upload Tab */}
                        {tabValue === 0 && (
                            <Box sx={{ p: 2, textAlign: 'center' }}>
                                <Box
                                    sx={{
                                        border: '2px dashed',
                                        borderColor: 'divider',
                                        borderRadius: 1,
                                        p: 3,
                                        mb: 2,
                                        cursor: 'pointer',
                                        position: 'relative',
                                        '&:hover': {
                                            borderColor: 'primary.main',
                                            backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                        }
                                    }}
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                    onClick={() => document.getElementById('file-upload').click()}
                                >
                                    {uploadPreview ? (
                                        <Box sx={{ position: 'relative', width: '100%', height: '200px' }}>
                                            <Box
                                                component='img'
                                                src={uploadPreview}
                                                alt='Preview'
                                                sx={{
                                                    maxWidth: '100%',
                                                    maxHeight: '200px',
                                                    objectFit: 'contain',
                                                    display: 'block',
                                                    margin: '0 auto'
                                                }}
                                            />
                                            <IconButton
                                                sx={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    right: 0,
                                                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                                    color: 'white',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(0, 0, 0, 0.7)'
                                                    }
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setUploadPreview('')
                                                    setUploadedFile(null)
                                                }}
                                            >
                                                <DeleteIcon fontSize='small' />
                                            </IconButton>
                                        </Box>
                                    ) : (
                                        <>
                                            <CloudUploadIcon sx={{ fontSize: 40, mb: 1, color: 'primary.main' }} />
                                            <Typography variant='body2' gutterBottom>
                                                Drag & Drop Files Here
                                            </Typography>
                                            <Button variant='contained' component='label' size='small'>
                                                Browse Files
                                                <input
                                                    id='file-upload'
                                                    type='file'
                                                    hidden
                                                    accept='image/*,video/*'
                                                    onChange={handleFileUpload}
                                                />
                                            </Button>
                                        </>
                                    )}
                                </Box>
                                <Typography variant='caption' color='textSecondary'>
                                    Supported formats: JPG, PNG, GIF, MP4 (Max size: 10MB)
                                </Typography>
                            </Box>
                        )}

                        {/* Library Tab */}
                        {tabValue === 1 && (
                            <Box sx={{ p: 2 }}>
                                <Typography variant='body2' color='textSecondary' sx={{ mb: 2 }}>
                                    Select media from your library
                                </Typography>
                                {mediaItems.length > 0 ? (
                                    <Grid container spacing={1}>
                                        {mediaItems.map((item) => (
                                            <Grid item xs={6} key={item.id}>
                                                <Card
                                                    sx={{
                                                        cursor: 'pointer',
                                                        border: selectedMedia?.id === item.id ? '2px solid' : '2px solid transparent',
                                                        borderColor: selectedMedia?.id === item.id ? 'primary.main' : 'transparent',
                                                        '&:hover': {
                                                            borderColor: 'primary.main'
                                                        },
                                                        position: 'relative'
                                                    }}
                                                    onClick={() => setSelectedMedia(item)}
                                                >
                                                    <CardMedia
                                                        component='img'
                                                        height='100'
                                                        image={item.type === 'image' ? item.url : item.thumbnail || item.url}
                                                        alt={item.name}
                                                    />
                                                    <Box
                                                        sx={{
                                                            position: 'absolute',
                                                            bottom: 0,
                                                            left: 0,
                                                            right: 0,
                                                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                                            p: 0.5,
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center'
                                                        }}
                                                    >
                                                        <Typography
                                                            variant='caption'
                                                            sx={{ color: 'white', fontSize: '0.7rem', ml: 0.5 }}
                                                            noWrap
                                                        >
                                                            {item.name}
                                                        </Typography>
                                                        <IconButton
                                                            size='small'
                                                            sx={{ color: 'white', p: 0.3 }}
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                if (selectedMedia?.id === item.id) {
                                                                    setSelectedMedia(null)
                                                                }
                                                                setMediaItems(mediaItems.filter((i) => i.id !== item.id))
                                                            }}
                                                        >
                                                            <DeleteIcon fontSize='small' />
                                                        </IconButton>
                                                    </Box>
                                                </Card>
                                            </Grid>
                                        ))}
                                        {uploadPreview && !mediaItems.some((item) => item.url === uploadPreview) && (
                                            <Grid item xs={6}>
                                                <Card
                                                    sx={{
                                                        cursor: 'pointer',
                                                        border: '2px solid',
                                                        borderColor: 'primary.main',
                                                        position: 'relative'
                                                    }}
                                                >
                                                    <CardMedia component='img' height='100' image={uploadPreview} alt='New Upload' />
                                                    <Box
                                                        sx={{
                                                            position: 'absolute',
                                                            bottom: 0,
                                                            left: 0,
                                                            right: 0,
                                                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                                            p: 0.5,
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center'
                                                        }}
                                                    >
                                                        <Typography
                                                            variant='caption'
                                                            sx={{ color: 'white', fontSize: '0.7rem', ml: 0.5 }}
                                                            noWrap
                                                        >
                                                            New Upload
                                                        </Typography>
                                                        <IconButton
                                                            size='small'
                                                            sx={{ color: 'white', p: 0.3 }}
                                                            onClick={() => {
                                                                setUploadPreview('')
                                                                setUploadedFile(null)
                                                            }}
                                                        >
                                                            <DeleteIcon fontSize='small' />
                                                        </IconButton>
                                                    </Box>
                                                </Card>
                                            </Grid>
                                        )}
                                    </Grid>
                                ) : (
                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                        <CollectionsIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                                        <Typography variant='body2' color='textSecondary'>
                                            Your media library is empty
                                        </Typography>
                                        <Button variant='text' size='small' onClick={() => setTabValue(0)} sx={{ mt: 1 }}>
                                            Upload Media
                                        </Button>
                                    </Box>
                                )}
                            </Box>
                        )}

                        {/* AI Tab */}
                        {tabValue === 2 && (
                            <Box sx={{ p: 2 }}>
                                <Typography variant='body2' color='textSecondary' sx={{ mb: 2 }}>
                                    Generate images with AI
                                </Typography>
                                <TextField
                                    label='Describe the image you want to create'
                                    fullWidth
                                    multiline
                                    rows={4}
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    placeholder='Describe the image you want to generate in detail...'
                                    sx={{ mb: 2 }}
                                    helperText={
                                        aiPrompt.length < 30 ? `Add at least ${30 - aiPrompt.length} more characters` : 'Good description!'
                                    }
                                    error={aiPrompt.length > 0 && aiPrompt.length < 30}
                                />

                                <Typography variant='subtitle2' gutterBottom>
                                    Select Style
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                                    {aiStyles.map((style) => (
                                        <AiStyleChip
                                            key={style}
                                            label={style}
                                            onClick={() => handleAiStyleSelect(style)}
                                            selected={selectedAiStyle === style}
                                        />
                                    ))}
                                </Box>

                                <Button
                                    variant='contained'
                                    fullWidth
                                    startIcon={aiLoading ? <CircularProgress size={20} color='inherit' /> : <AutoFixHighIcon />}
                                    onClick={generateAiImage}
                                    disabled={aiPrompt.length < 30 || aiLoading}
                                    sx={{ mt: 2 }}
                                >
                                    {aiLoading ? 'Generating...' : 'Generate Image'}
                                </Button>

                                {aiLoading && (
                                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                                        <Typography variant='body2' color='textSecondary'>
                                            Creating your image with AI...
                                        </Typography>
                                        <LinearProgress sx={{ mt: 1 }} />
                                    </Box>
                                )}
                            </Box>
                        )}

                        {/* Design Tab */}
                        {tabValue === 3 && (
                            <Box sx={{ p: 2 }}>
                                <Box sx={{ display: 'flex', mb: 2 }}>
                                    <Box sx={{ width: 40, mr: 1 }}>
                                        <Tooltip title='Text'>
                                            <IconButton size='small' sx={{ mb: 1 }}>
                                                <TextFieldsIcon fontSize='small' />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title='Shapes'>
                                            <IconButton size='small' sx={{ mb: 1 }}>
                                                <FormatColorFillIcon fontSize='small' />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title='Images'>
                                            <IconButton
                                                size='small'
                                                sx={{ mb: 1 }}
                                                onClick={() => setTabValue(1)} // Switch to Library tab
                                            >
                                                <ImageIcon fontSize='small' />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title='Filters'>
                                            <IconButton size='small'>
                                                <FilterIcon fontSize='small' />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>

                                    <DesignCanvas sx={{ height: 250 }}>
                                        {selectedMedia ? (
                                            <img
                                                src={
                                                    selectedMedia.type === 'image'
                                                        ? selectedMedia.url
                                                        : selectedMedia.thumbnail || selectedMedia.url
                                                }
                                                alt={selectedMedia.name}
                                                style={{ maxWidth: '100%', maxHeight: '100%' }}
                                            />
                                        ) : uploadPreview ? (
                                            <img src={uploadPreview} alt='Uploaded Image' style={{ maxWidth: '100%', maxHeight: '100%' }} />
                                        ) : (
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Typography variant='body2' color='textSecondary' gutterBottom>
                                                    Select a template or upload an image
                                                </Typography>
                                                <Button
                                                    variant='outlined'
                                                    size='small'
                                                    startIcon={<CloudUploadIcon />}
                                                    onClick={() => setTabValue(0)}
                                                >
                                                    Upload Image
                                                </Button>
                                            </Box>
                                        )}
                                    </DesignCanvas>
                                </Box>

                                <Typography variant='subtitle2' gutterBottom>
                                    Templates
                                </Typography>
                                <Grid container spacing={1}>
                                    {[1, 2, 3, 4, 5, 6].map((item) => (
                                        <Grid item xs={4} key={item}>
                                            <Card
                                                sx={{
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        outline: '2px solid',
                                                        outlineColor: 'primary.main'
                                                    }
                                                }}
                                                onClick={() => {
                                                    // Create a template media item
                                                    const templateMedia = {
                                                        id: `template-${item}`,
                                                        type: 'image',
                                                        url: `https://source.unsplash.com/random/600x400?sig=${item}`,
                                                        name: `Template ${item}`,
                                                        isTemplate: true
                                                    }
                                                    setSelectedMedia(templateMedia)
                                                }}
                                            >
                                                <CardMedia
                                                    component='img'
                                                    height='50'
                                                    image={`https://source.unsplash.com/random/100x50?sig=${item}`}
                                                    alt={`Template ${item}`}
                                                />
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>

                                {/* Platform Selection */}
                                <Typography variant='subtitle2' sx={{ mt: 2, mb: 1 }}>
                                    Post to Platform
                                </Typography>
                                <Grid container spacing={1}>
                                    {['twitter', 'facebook', 'instagram', 'linkedin'].map((platform) => (
                                        <Grid item key={platform}>
                                            <Tooltip title={platform.charAt(0).toUpperCase() + platform.slice(1)}>
                                                <Avatar
                                                    src={`/icons/platforms/${platform}.png`}
                                                    alt={platform}
                                                    sx={{
                                                        width: 40,
                                                        height: 40,
                                                        cursor: 'pointer',
                                                        border: selectedPlatform?.identifier === platform ? '2px solid' : 'none',
                                                        borderColor: 'primary.main',
                                                        '&:hover': {
                                                            boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.5)'
                                                        }
                                                    }}
                                                    onClick={() =>
                                                        setSelectedPlatform({
                                                            id: platform,
                                                            name: platform.charAt(0).toUpperCase() + platform.slice(1),
                                                            identifier: platform,
                                                            picture: `/icons/platforms/${platform}.png`
                                                        })
                                                    }
                                                />
                                            </Tooltip>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant='contained' color='primary' onClick={savePost} disabled={!postContent.trim()}>
                    Schedule Post
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default MediaDesign
