import React, { useState, useRef } from 'react'
import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Divider,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    IconButton
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { useTheme } from '@mui/material/styles'
import MovieIcon from '@mui/icons-material/Movie'
import ImageIcon from '@mui/icons-material/Image'
import DeleteIcon from '@mui/icons-material/Delete'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import VideoPreview from './VideoPreview.jsx'
import GenerationStatus from './GenerationStatus.jsx'
import { generateVideoFromImage, checkVideoStatus } from '../../../api/videoGenerationService.jsx'
import { useAuth } from '../../../hooks/useAuth'

// Styled components
const UploadBox = styled(Box)(({ theme, isDragActive, hasImage }) => ({
    border: `2px dashed ${isDragActive ? theme.palette.primary.main : hasImage ? theme.palette.success.main : theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(4),
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: isDragActive
        ? theme.palette.mode === 'dark'
            ? 'rgba(0, 171, 85, 0.08)'
            : 'rgba(0, 171, 85, 0.08)'
        : hasImage
        ? theme.palette.mode === 'dark'
            ? 'rgba(0, 171, 85, 0.08)'
            : 'rgba(0, 171, 85, 0.08)'
        : 'transparent',
    transition: 'all 0.3s ease',
    '&:hover': {
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.08)' : 'rgba(144, 202, 249, 0.08)',
        borderColor: theme.palette.primary.main
    }
}))

const PromptTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            borderColor: theme.palette.mode === 'dark' ? theme.palette.divider : theme.palette.grey[300]
        },
        '&:hover fieldset': {
            borderColor: theme.palette.primary.main
        },
        '&.Mui-focused fieldset': {
            borderColor: theme.palette.primary.main
        }
    }
}))

const ImageToVideoGenerator = ({ onVideoGenerated }) => {
    const theme = useTheme()
    const { user } = useAuth()
    const fileInputRef = useRef(null)

    // State variables
    const [uploadedImage, setUploadedImage] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [prompt, setPrompt] = useState('')
    const [style, setStyle] = useState('realistic')
    const [isDragActive, setIsDragActive] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [generationStatus, setGenerationStatus] = useState(null)
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState(null)
    const [error, setError] = useState(null)

    // Handle file upload
    const handleFileUpload = (event) => {
        const file = event.target.files[0]
        if (file && file.type.startsWith('image/')) {
            setUploadedImage(file)

            // Create image preview
            const reader = new FileReader()
            reader.onload = () => {
                setImagePreview(reader.result)
            }
            reader.readAsDataURL(file)

            setError(null)
        } else if (file) {
            setError('Please upload an image file (JPEG, PNG, etc.)')
        }
    }

    // Handle drag events
    const handleDragEnter = (event) => {
        event.preventDefault()
        event.stopPropagation()
        setIsDragActive(true)
    }

    const handleDragLeave = (event) => {
        event.preventDefault()
        event.stopPropagation()
        setIsDragActive(false)
    }

    const handleDragOver = (event) => {
        event.preventDefault()
        event.stopPropagation()
    }

    const handleDrop = (event) => {
        event.preventDefault()
        event.stopPropagation()
        setIsDragActive(false)

        const file = event.dataTransfer.files[0]
        if (file && file.type.startsWith('image/')) {
            setUploadedImage(file)

            // Create image preview
            const reader = new FileReader()
            reader.onload = () => {
                setImagePreview(reader.result)
            }
            reader.readAsDataURL(file)

            setError(null)
        } else if (file) {
            setError('Please upload an image file (JPEG, PNG, etc.)')
        }
    }

    // Handle prompt change
    const handlePromptChange = (event) => {
        setPrompt(event.target.value)
    }

    // Handle style change
    const handleStyleChange = (event) => {
        setStyle(event.target.value)
    }

    // Clear uploaded image
    const handleClearImage = () => {
        setUploadedImage(null)
        setImagePreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    // Generate video
    const handleGenerateVideo = async () => {
        if (!uploadedImage) {
            setError('Please upload an image')
            return
        }

        setError(null)
        setIsGenerating(true)
        setGenerationStatus({ status: 'starting', progress: 0, message: 'Starting video generation...' })

        try {
            // Create form data
            const formData = new FormData()
            formData.append('image', uploadedImage)
            formData.append('prompt', prompt)
            formData.append('style', style)
            formData.append('userId', user?.id || '')

            // Call API to start video generation
            const response = await generateVideoFromImage(formData)

            if (response.success && response.jobId) {
                setGenerationStatus({
                    status: 'processing',
                    progress: 10,
                    message: 'Processing your video...',
                    jobId: response.jobId,
                    estimatedTime: response.estimatedTime
                })

                // Start polling for status
                pollGenerationStatus(response.jobId)
            } else {
                throw new Error('Failed to start video generation')
            }
        } catch (err) {
            console.error('Error generating video:', err)
            setError(err.message || 'Failed to generate video')
            setIsGenerating(false)
            setGenerationStatus(null)
        }
    }

    // Poll for generation status
    const pollGenerationStatus = async (jobId) => {
        try {
            const statusResponse = await checkVideoStatus(jobId)

            if (statusResponse.status === 'completed') {
                // Video generation completed successfully
                setGenerationStatus({
                    status: 'completed',
                    progress: 100,
                    message: 'Video generated successfully!'
                })

                setGeneratedVideoUrl(statusResponse.localVideoUrl || statusResponse.result.video_url)
                setIsGenerating(false)

                // Notify parent component
                if (onVideoGenerated) {
                    onVideoGenerated({
                        id: jobId,
                        url: statusResponse.localVideoUrl || statusResponse.result.video_url,
                        prompt,
                        style,
                        imagePreview,
                        createdAt: new Date().toISOString()
                    })
                }
            } else if (statusResponse.status === 'failed') {
                // Video generation failed
                setError(statusResponse.error || 'Video generation failed')
                setIsGenerating(false)
                setGenerationStatus(null)
            } else {
                // Video generation still in progress
                const progress = statusResponse.progress || (statusResponse.status === 'processing' ? 50 : 20)

                setGenerationStatus({
                    status: statusResponse.status,
                    progress,
                    message: statusResponse.message || `${statusResponse.status}...`,
                    jobId,
                    estimatedTime: statusResponse.estimated_time
                })

                // Continue polling
                setTimeout(() => pollGenerationStatus(jobId), 5000)
            }
        } catch (err) {
            console.error('Error checking video status:', err)
            setError(err.message || 'Failed to check video status')
            setIsGenerating(false)
            setGenerationStatus(null)
        }
    }

    return (
        <Grid container spacing={3}>
            {/* Left column - Input controls */}
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant='h3' gutterBottom>
                            Image to Video
                        </Typography>

                        <Typography variant='body1' color='textSecondary' paragraph>
                            Upload an image and our AI will bring it to life as a video.
                        </Typography>

                        {/* Image upload */}
                        <input type='file' accept='image/*' onChange={handleFileUpload} style={{ display: 'none' }} ref={fileInputRef} />

                        <UploadBox
                            onClick={() => fileInputRef.current.click()}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            isDragActive={isDragActive}
                            hasImage={!!imagePreview}
                            sx={{ mb: 3 }}
                        >
                            {imagePreview ? (
                                <Box sx={{ position: 'relative' }}>
                                    <img
                                        src={imagePreview}
                                        alt='Uploaded'
                                        style={{
                                            maxWidth: '100%',
                                            maxHeight: '200px',
                                            borderRadius: theme.shape.borderRadius
                                        }}
                                    />
                                    <IconButton
                                        sx={{
                                            position: 'absolute',
                                            top: 8,
                                            right: 8,
                                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                            color: 'white',
                                            '&:hover': {
                                                backgroundColor: 'rgba(0, 0, 0, 0.7)'
                                            }
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleClearImage()
                                        }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            ) : (
                                <>
                                    <CloudUploadIcon sx={{ fontSize: 48, color: theme.palette.text.secondary, mb: 2 }} />
                                    <Typography variant='h5' gutterBottom>
                                        {isDragActive ? 'Drop your image here' : 'Upload an image'}
                                    </Typography>
                                    <Typography variant='body2' color='textSecondary'>
                                        Drag and drop an image here, or click to select a file
                                    </Typography>
                                    <Typography variant='caption' color='textSecondary' sx={{ mt: 1, display: 'block' }}>
                                        Supported formats: JPEG, PNG, GIF, WebP
                                    </Typography>
                                </>
                            )}
                        </UploadBox>

                        {error && (
                            <Typography variant='body2' color='error' sx={{ mt: 1, mb: 2 }}>
                                {error}
                            </Typography>
                        )}

                        <Divider sx={{ my: 3 }} />

                        {/* Prompt input */}
                        <Typography variant='h4' gutterBottom>
                            Description (Optional)
                        </Typography>

                        <PromptTextField
                            label='Describe how you want the image to animate'
                            multiline
                            rows={3}
                            fullWidth
                            value={prompt}
                            onChange={handlePromptChange}
                            placeholder="E.g., 'The camera slowly zooms in on the subject' or 'The character smiles and waves'"
                            variant='outlined'
                            margin='normal'
                            disabled={isGenerating}
                        />

                        <Typography variant='body2' color='textSecondary' sx={{ mt: 1, mb: 3 }}>
                            Adding a description helps the AI understand how you want the image to animate. Leave blank for default
                            animation.
                        </Typography>

                        <Divider sx={{ my: 3 }} />

                        {/* Style selection */}
                        <Typography variant='h4' gutterBottom>
                            Animation Style
                        </Typography>

                        <FormControl fullWidth variant='outlined' sx={{ mb: 3 }}>
                            <InputLabel id='style-select-label'>Style</InputLabel>
                            <Select
                                labelId='style-select-label'
                                id='style-select'
                                value={style}
                                onChange={handleStyleChange}
                                label='Style'
                                disabled={isGenerating}
                            >
                                <MenuItem value='realistic'>Realistic Motion</MenuItem>
                                <MenuItem value='cinematic'>Cinematic</MenuItem>
                                <MenuItem value='anime'>Anime</MenuItem>
                                <MenuItem value='3d_animation'>3D Animation</MenuItem>
                                <MenuItem value='artistic'>Artistic</MenuItem>
                                <MenuItem value='live2d'>Live2D (for character animation)</MenuItem>
                            </Select>
                        </FormControl>

                        {/* Generate button */}
                        <Button
                            variant='contained'
                            color='primary'
                            size='large'
                            fullWidth
                            startIcon={isGenerating ? <CircularProgress size={24} color='inherit' /> : <MovieIcon />}
                            onClick={handleGenerateVideo}
                            disabled={isGenerating || !uploadedImage}
                            sx={{ mt: 2, py: 1.5 }}
                        >
                            {isGenerating ? 'Generating...' : 'Generate Video'}
                        </Button>
                    </CardContent>
                </Card>
            </Grid>

            {/* Right column - Preview and status */}
            <Grid item xs={12} md={6}>
                {generationStatus ? <GenerationStatus status={generationStatus} /> : null}

                {generatedVideoUrl ? (
                    <VideoPreview videoUrl={generatedVideoUrl} prompt={prompt} style={style} sourceImage={imagePreview} />
                ) : (
                    <Card
                        sx={{
                            height: '100%',
                            minHeight: 400,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.grey[100]
                        }}
                    >
                        <CardContent sx={{ textAlign: 'center' }}>
                            <MovieIcon sx={{ fontSize: 80, color: theme.palette.text.secondary, opacity: 0.3, mb: 2 }} />
                            <Typography variant='h4' gutterBottom>
                                Video Preview
                            </Typography>
                            <Typography variant='body1' color='textSecondary'>
                                Your generated video will appear here
                            </Typography>
                            <Typography variant='body2' color='textSecondary' sx={{ mt: 2 }}>
                                Upload an image and click "Generate Video" to animate it
                            </Typography>
                        </CardContent>
                    </Card>
                )}
            </Grid>
        </Grid>
    )
}

export default ImageToVideoGenerator
