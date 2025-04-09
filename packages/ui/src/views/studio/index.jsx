import React, { useState, useRef, useCallback } from 'react'
import {
    Grid,
    Typography,
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress,
    Alert,
    Paper,
    IconButton,
    Tabs,
    Tab,
    Chip,
    Tooltip,
    LinearProgress
} from '@mui/material'
import { styled } from '@mui/material/styles'
import MainCard from '@/ui-component/cards/MainCard'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import ImageIcon from '@mui/icons-material/Image'
import TextFieldsIcon from '@mui/icons-material/TextFields'
import DeleteIcon from '@mui/icons-material/Delete'
import DownloadIcon from '@mui/icons-material/Download'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import axios from 'axios'

// Styled components
const DropZone = styled('div')(({ theme, isDragActive, hasFile }) => ({
    width: '100%',
    height: '300px',
    border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.grey[300]}`,
    borderRadius: theme.shape.borderRadius,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(4),
    cursor: 'pointer',
    backgroundColor: isDragActive ? theme.palette.primary.lighter : hasFile ? theme.palette.grey[100] : 'transparent',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
        backgroundColor: theme.palette.grey[100],
        borderColor: theme.palette.primary.light
    }
}))

const VideoPreview = styled('video')(({ theme }) => ({
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: theme.shape.borderRadius
}))

const ImagePreview = styled('img')(({ theme }) => ({
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: theme.shape.borderRadius
}))

const VideoGallery = styled(Grid)(({ theme }) => ({
    marginTop: theme.spacing(4),
    gap: theme.spacing(2)
}))

const VideoCard = styled(Card)(({ theme }) => ({
    position: 'relative',
    overflow: 'hidden',
    height: '200px',
    '&:hover .video-controls': {
        opacity: 1
    }
}))

const VideoControls = styled(Box)(({ theme }) => ({
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing(1),
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'space-between',
    opacity: 0,
    transition: 'opacity 0.3s ease',
    zIndex: 2
}))

const PromptField = styled(TextField)(({ theme }) => ({
    marginTop: theme.spacing(2),
    width: '100%'
}))

// ==============================|| STUDIO VIEW ||============================== //

const Studio = () => {
    // State variables
    const [activeTab, setActiveTab] = useState(0) // 0 = Text to Video, 1 = Image to Video
    const [prompt, setPrompt] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const [isDragActive, setIsDragActive] = useState(false)
    const [selectedFile, setSelectedFile] = useState(null)
    const [previewUrl, setPreviewUrl] = useState(null)
    const [generatedVideos, setGeneratedVideos] = useState([])
    const [generationProgress, setGenerationProgress] = useState(0)
    const [isGenerating, setIsGenerating] = useState(false)

    // Refs
    const fileInputRef = useRef(null)
    const dropZoneRef = useRef(null)

    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue)
        // Reset states when switching tabs
        setSelectedFile(null)
        setPreviewUrl(null)
        setPrompt('')
        setError(null)
        setSuccess(null)
    }

    // Handle file selection
    const handleFileSelect = (event) => {
        const file = event.target.files[0]
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file)
            const fileUrl = URL.createObjectURL(file)
            setPreviewUrl(fileUrl)
            setError(null)
        } else {
            setError('Please select a valid image file')
        }
    }

    // Handle file drop
    const handleDrop = useCallback((event) => {
        event.preventDefault()
        setIsDragActive(false)

        if (event.dataTransfer.files && event.dataTransfer.files[0]) {
            const file = event.dataTransfer.files[0]
            if (file.type.startsWith('image/')) {
                setSelectedFile(file)
                const fileUrl = URL.createObjectURL(file)
                setPreviewUrl(fileUrl)
                setError(null)
            } else {
                setError('Please drop a valid image file')
            }
        }
    }, [])

    // Handle drag events
    const handleDragOver = useCallback((event) => {
        event.preventDefault()
        setIsDragActive(true)
    }, [])

    const handleDragLeave = useCallback(() => {
        setIsDragActive(false)
    }, [])

    // Handle click on drop zone
    const handleDropZoneClick = () => {
        fileInputRef.current.click()
    }

    // Handle file removal
    const handleRemoveFile = () => {
        setSelectedFile(null)
        setPreviewUrl(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    // Fetch generated videos
    const fetchGeneratedVideos = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            // In a real implementation, you would call your API
            // const response = await axios.get('/api/video/user/current-user')
            // setGeneratedVideos(response.data)

            // Mock data for demonstration
            setTimeout(() => {
                setGeneratedVideos([
                    {
                        id: '1',
                        url: 'https://example.com/video1.mp4',
                        thumbnail: 'https://via.placeholder.com/300x200',
                        prompt: 'A cinematic shot of a futuristic city with flying cars',
                        createdAt: new Date().toISOString()
                    },
                    {
                        id: '2',
                        url: 'https://example.com/video2.mp4',
                        thumbnail: 'https://via.placeholder.com/300x200',
                        prompt: 'A peaceful mountain landscape with a flowing river',
                        createdAt: new Date().toISOString()
                    },
                    {
                        id: '3',
                        url: 'https://example.com/video3.mp4',
                        thumbnail: 'https://via.placeholder.com/300x200',
                        prompt: 'A serene beach at sunset with gentle waves',
                        createdAt: new Date().toISOString()
                    }
                ])
                setLoading(false)
            }, 1000)
        } catch (error) {
            console.error('Error fetching videos:', error)
            setError('Failed to fetch videos')
            setLoading(false)
        }
    }, [])

    // Generate video from text
    const generateVideoFromText = async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt')
            return
        }

        try {
            setIsGenerating(true)
            setGenerationProgress(0)
            setError(null)
            setSuccess(null)

            // Simulate a more realistic generation process
            // Step 1: Initial processing (0-10%)
            setSuccess('Starting video generation process...')

            const progressInterval = setInterval(() => {
                setGenerationProgress((prev) => {
                    // Slower progress simulation to be more realistic
                    const increment = Math.random() * 2 // Smaller increments
                    const newProgress = prev + increment

                    // Different messages at different stages
                    if (prev < 10 && newProgress >= 10) {
                        setSuccess('Analyzing prompt and preparing generation...')
                    } else if (prev < 25 && newProgress >= 25) {
                        setSuccess('Creating initial frames...')
                    } else if (prev < 50 && newProgress >= 50) {
                        setSuccess('Rendering video sequences...')
                    } else if (prev < 75 && newProgress >= 75) {
                        setSuccess('Applying final touches and effects...')
                    } else if (prev < 95 && newProgress >= 95) {
                        setSuccess('Finalizing video...')
                    }

                    return newProgress >= 100 ? 99 : newProgress // Stop at 99% until actually complete
                })
            }, 800) // Slower updates

            // In a real implementation, you would call your API
            // const response = await axios.post('/api/video/text-to-video', {
            //     prompt,
            //     style: 'realistic',
            //     duration: 5
            // })

            // Simulate a longer API call (30-45 seconds is more realistic for AI video generation)
            const generationTime = 30000 + Math.random() * 15000 // 30-45 seconds

            setTimeout(() => {
                clearInterval(progressInterval)
                setGenerationProgress(100)

                // Add the new video to the list
                const newVideo = {
                    id: Date.now().toString(),
                    url: 'https://example.com/generated-video.mp4',
                    thumbnail: 'https://via.placeholder.com/300x200',
                    prompt: prompt,
                    createdAt: new Date().toISOString()
                }

                setGeneratedVideos((prev) => [newVideo, ...prev])
                setSuccess('Video generated successfully!')
                setIsGenerating(false)
                setPrompt('')
            }, generationTime)
        } catch (error) {
            console.error('Error generating video:', error)
            setError('Failed to generate video')
            setIsGenerating(false)
        }
    }

    // Generate video from image
    const generateVideoFromImage = async () => {
        if (!selectedFile) {
            setError('Please select or drop an image')
            return
        }

        if (!prompt.trim()) {
            setError('Please enter a prompt to guide the video generation')
            return
        }

        try {
            setIsGenerating(true)
            setGenerationProgress(0)
            setError(null)
            setSuccess(null)

            // Simulate a more realistic generation process
            // Step 1: Initial processing (0-10%)
            setSuccess('Starting image-to-video generation...')

            const progressInterval = setInterval(() => {
                setGenerationProgress((prev) => {
                    // Slower progress simulation to be more realistic
                    const increment = Math.random() * 2 // Smaller increments
                    const newProgress = prev + increment

                    // Different messages at different stages
                    if (prev < 10 && newProgress >= 10) {
                        setSuccess('Analyzing image and prompt...')
                    } else if (prev < 25 && newProgress >= 25) {
                        setSuccess('Extracting image features...')
                    } else if (prev < 40 && newProgress >= 40) {
                        setSuccess('Generating motion vectors...')
                    } else if (prev < 60 && newProgress >= 60) {
                        setSuccess('Creating animation sequences...')
                    } else if (prev < 80 && newProgress >= 80) {
                        setSuccess('Rendering final video...')
                    } else if (prev < 95 && newProgress >= 95) {
                        setSuccess('Applying post-processing effects...')
                    }

                    return newProgress >= 100 ? 99 : newProgress // Stop at 99% until actually complete
                })
            }, 800) // Slower updates

            // In a real implementation, you would upload the file and call your API
            // const formData = new FormData()
            // formData.append('image', selectedFile)
            // formData.append('prompt', prompt)
            // const response = await axios.post('/api/video/image-to-video', formData)

            // Simulate a longer API call (35-50 seconds is more realistic for AI image-to-video generation)
            const generationTime = 35000 + Math.random() * 15000 // 35-50 seconds

            setTimeout(() => {
                clearInterval(progressInterval)
                setGenerationProgress(100)

                // Add the new video to the list
                const newVideo = {
                    id: Date.now().toString(),
                    url: 'https://example.com/generated-video.mp4',
                    thumbnail: previewUrl, // Use the uploaded image as thumbnail
                    prompt: prompt,
                    createdAt: new Date().toISOString()
                }

                setGeneratedVideos((prev) => [newVideo, ...prev])
                setSuccess('Video generated successfully!')
                setIsGenerating(false)
                setPrompt('')
                setSelectedFile(null)
                setPreviewUrl(null)
            }, generationTime)
        } catch (error) {
            console.error('Error generating video:', error)
            setError('Failed to generate video')
            setIsGenerating(false)
        }
    }

    // Delete a video
    const handleDeleteVideo = (videoId) => {
        // In a real implementation, you would call your API
        // await axios.delete(`/api/video/${videoId}`)

        // Update the local state
        setGeneratedVideos((prev) => prev.filter((video) => video.id !== videoId))
    }

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    // Load videos on component mount
    React.useEffect(() => {
        fetchGeneratedVideos()
    }, [fetchGeneratedVideos])

    return (
        <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <MainCard title='AI Video Studio'>
                        <Typography variant='h3' gutterBottom>
                            Deep Canvas Video Generator
                        </Typography>

                        <Typography variant='body1' paragraph>
                            Generate high-quality videos from text descriptions or images using our state-of-the-art AI model.
                        </Typography>

                        {/* Tabs for switching between Text-to-Video and Image-to-Video */}
                        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }} variant='fullWidth'>
                            <Tab icon={<TextFieldsIcon />} label='Text to Video' iconPosition='start' />
                            <Tab icon={<ImageIcon />} label='Image to Video' iconPosition='start' />
                        </Tabs>

                        {/* Error and Success Messages */}
                        {error && (
                            <Alert severity='error' sx={{ mb: 2 }} onClose={() => setError(null)}>
                                {error}
                            </Alert>
                        )}

                        {success && (
                            <Alert severity='success' sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
                                {success}
                            </Alert>
                        )}

                        {/* Text to Video Tab */}
                        {activeTab === 0 && (
                            <Box>
                                <PromptField
                                    label='Describe your video'
                                    multiline
                                    rows={4}
                                    fullWidth
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder='Enter a detailed description of the video you want to generate...'
                                    variant='outlined'
                                    disabled={isGenerating}
                                />

                                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button
                                        onClick={generateVideoFromText}
                                        variant='contained'
                                        color='primary'
                                        disabled={isGenerating || !prompt.trim()}
                                        startIcon={isGenerating ? <CircularProgress size={20} /> : null}
                                    >
                                        {isGenerating ? 'Generating...' : 'Generate Video'}
                                    </Button>
                                </Box>
                            </Box>
                        )}

                        {/* Image to Video Tab */}
                        {activeTab === 1 && (
                            <Box>
                                <input
                                    type='file'
                                    accept='image/*'
                                    style={{ display: 'none' }}
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    disabled={isGenerating}
                                />

                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <DropZone
                                            ref={dropZoneRef}
                                            isDragActive={isDragActive}
                                            hasFile={!!selectedFile}
                                            onClick={handleDropZoneClick}
                                            onDrop={handleDrop}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                        >
                                            {selectedFile ? (
                                                <>
                                                    <ImagePreview src={previewUrl} alt='Selected image' />
                                                    <Box
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 10,
                                                            right: 10,
                                                            zIndex: 10,
                                                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                                            borderRadius: '50%'
                                                        }}
                                                    >
                                                        <IconButton
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleRemoveFile()
                                                            }}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Box>
                                                </>
                                            ) : (
                                                <>
                                                    <CloudUploadIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                                                    <Typography variant='h6' gutterBottom>
                                                        Drag & Drop an Image
                                                    </Typography>
                                                    <Typography variant='body2' color='textSecondary'>
                                                        or click to browse files
                                                    </Typography>
                                                </>
                                            )}
                                        </DropZone>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                            <PromptField
                                                label='Add a description to guide the video generation'
                                                multiline
                                                rows={8}
                                                fullWidth
                                                value={prompt}
                                                onChange={(e) => setPrompt(e.target.value)}
                                                placeholder='Describe how you want the image to be animated...'
                                                variant='outlined'
                                                disabled={isGenerating}
                                                sx={{ flexGrow: 1, mb: 2 }}
                                            />
                                            <Button
                                                onClick={generateVideoFromImage}
                                                variant='contained'
                                                color='primary'
                                                fullWidth
                                                disabled={isGenerating || !selectedFile || !prompt.trim()}
                                                startIcon={isGenerating ? <CircularProgress size={20} /> : null}
                                            >
                                                {isGenerating ? 'Generating...' : 'Generate Video'}
                                            </Button>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>
                        )}

                        {/* Generation Progress */}
                        {isGenerating && (
                            <Box sx={{ mt: 3 }}>
                                <Typography variant='body2' color='textSecondary' gutterBottom>
                                    Generating video... {Math.round(generationProgress)}%
                                </Typography>
                                <LinearProgress variant='determinate' value={generationProgress} />
                            </Box>
                        )}

                        {/* Video Gallery */}
                        <Box sx={{ mt: 4 }}>
                            <Typography variant='h5' gutterBottom>
                                Your Generated Videos
                            </Typography>

                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                    <CircularProgress />
                                </Box>
                            ) : generatedVideos.length > 0 ? (
                                <VideoGallery container spacing={2}>
                                    {generatedVideos.map((video) => (
                                        <Grid item xs={12} sm={6} md={4} key={video.id}>
                                            <VideoCard>
                                                <Box
                                                    component='img'
                                                    src={video.thumbnail}
                                                    alt={video.prompt}
                                                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                                <VideoControls className='video-controls'>
                                                    <Tooltip title='Play'>
                                                        <IconButton size='small' sx={{ color: 'white' }}>
                                                            <PlayArrowIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title='Download'>
                                                        <IconButton size='small' sx={{ color: 'white' }}>
                                                            <DownloadIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title='Delete'>
                                                        <IconButton
                                                            size='small'
                                                            sx={{ color: 'white' }}
                                                            onClick={() => handleDeleteVideo(video.id)}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </VideoControls>
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        right: 0,
                                                        padding: 1,
                                                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                                        color: 'white',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    <Tooltip title={video.prompt}>
                                                        <Typography variant='caption'>{video.prompt}</Typography>
                                                    </Tooltip>
                                                </Box>
                                            </VideoCard>
                                        </Grid>
                                    ))}
                                </VideoGallery>
                            ) : (
                                <Box sx={{ textAlign: 'center', p: 3, bgcolor: 'background.paper', borderRadius: 1 }}>
                                    <Typography variant='body1'>
                                        You haven't generated any videos yet. Start by creating one above!
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        <Typography variant='h6' gutterBottom>
                            About Deep Canvas Video Generator
                        </Typography>

                        <Typography variant='body2' color='textSecondary' paragraph>
                            Deep Canvas Video Generator is a state-of-the-art AI video generation model that can create high-quality videos
                            from text descriptions or images. It supports various styles and can generate videos up to 6 seconds in length
                            at 720p resolution and 25fps.
                        </Typography>
                    </MainCard>
                </Grid>
            </Grid>
        </Box>
    )
}

export default Studio
