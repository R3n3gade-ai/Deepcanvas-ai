import React, { useState } from 'react'
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
    Slider,
    TextField,
    Typography
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { useTheme } from '@mui/material/styles'
import MovieIcon from '@mui/icons-material/Movie'
import SendIcon from '@mui/icons-material/Send'
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates'
import VideoPreview from './VideoPreview.jsx'
import GenerationStatus from './GenerationStatus.jsx'
import { generateVideoFromText, checkVideoStatus } from '../../../api/videoGenerationService.jsx'
import { useAuth } from '../../../hooks/useAuth'

// Styled components
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

const StyleCard = styled(Card)(({ theme, selected }) => ({
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: selected ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: theme.shadows[10]
    }
}))

// Example prompts for inspiration
const examplePrompts = [
    'A cinematic shot of a futuristic city with flying cars and neon lights',
    'A peaceful mountain landscape with a flowing river and autumn trees',
    'A chef preparing a gourmet meal in a professional kitchen',
    'A space shuttle launching into orbit with dramatic clouds',
    'A timelapse of a blooming flower garden in spring'
]

// Video styles
const videoStyles = [
    { id: 'realistic', name: 'Realistic', description: 'Photorealistic style with natural lighting and textures' },
    { id: 'cinematic', name: 'Cinematic', description: 'Movie-like quality with dramatic lighting and composition' },
    { id: 'anime', name: 'Anime', description: 'Japanese animation style with vibrant colors' },
    { id: '3d_animation', name: '3D Animation', description: 'Computer-generated 3D animation style' },
    { id: 'artistic', name: 'Artistic', description: 'Creative artistic interpretation with stylized elements' }
]

const TextToVideoGenerator = ({ onVideoGenerated }) => {
    const theme = useTheme()
    const { user } = useAuth()

    // State variables
    const [prompt, setPrompt] = useState('')
    const [selectedStyle, setSelectedStyle] = useState('realistic')
    const [duration, setDuration] = useState(5)
    const [quality, setQuality] = useState('high')
    const [isGenerating, setIsGenerating] = useState(false)
    const [generationStatus, setGenerationStatus] = useState(null)
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState(null)
    const [error, setError] = useState(null)

    // Handle prompt change
    const handlePromptChange = (event) => {
        setPrompt(event.target.value)
    }

    // Handle style selection
    const handleStyleSelect = (styleId) => {
        setSelectedStyle(styleId)
    }

    // Handle duration change
    const handleDurationChange = (event, newValue) => {
        setDuration(newValue)
    }

    // Handle quality change
    const handleQualityChange = (event) => {
        setQuality(event.target.value)
    }

    // Use an example prompt
    const useExamplePrompt = (examplePrompt) => {
        setPrompt(examplePrompt)
    }

    // Generate video
    const handleGenerateVideo = async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt')
            return
        }

        setError(null)
        setIsGenerating(true)
        setGenerationStatus({ status: 'starting', progress: 0, message: 'Starting video generation...' })

        try {
            // Call API to start video generation
            const response = await generateVideoFromText({
                prompt,
                style: selectedStyle,
                duration,
                quality,
                userId: user?.id
            })

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
                        style: selectedStyle,
                        duration,
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
                            Text to Video
                        </Typography>

                        <Typography variant='body1' color='textSecondary' paragraph>
                            Describe the video you want to create, and our AI will generate it for you.
                        </Typography>

                        {/* Prompt input */}
                        <PromptTextField
                            label='Describe your video'
                            multiline
                            rows={4}
                            fullWidth
                            value={prompt}
                            onChange={handlePromptChange}
                            placeholder='Enter a detailed description of the video you want to generate...'
                            variant='outlined'
                            margin='normal'
                            error={!!error}
                            helperText={error}
                            disabled={isGenerating}
                        />

                        {/* Example prompts */}
                        <Box sx={{ mt: 2, mb: 3 }}>
                            <Typography variant='subtitle2' sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <TipsAndUpdatesIcon sx={{ mr: 1, fontSize: '1rem' }} />
                                Need inspiration? Try one of these:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {examplePrompts.map((examplePrompt, index) => (
                                    <Button
                                        key={index}
                                        size='small'
                                        variant='outlined'
                                        onClick={() => useExamplePrompt(examplePrompt)}
                                        sx={{
                                            textTransform: 'none',
                                            borderRadius: '16px'
                                        }}
                                        disabled={isGenerating}
                                    >
                                        {examplePrompt.substring(0, 30)}...
                                    </Button>
                                ))}
                            </Box>
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        {/* Style selection */}
                        <Typography variant='h4' gutterBottom>
                            Video Style
                        </Typography>

                        <Grid container spacing={2}>
                            {videoStyles.map((style) => (
                                <Grid item xs={6} sm={4} key={style.id}>
                                    <StyleCard selected={selectedStyle === style.id} onClick={() => handleStyleSelect(style.id)}>
                                        <CardContent>
                                            <Typography variant='h5' gutterBottom>
                                                {style.name}
                                            </Typography>
                                            <Typography variant='body2' color='textSecondary'>
                                                {style.description}
                                            </Typography>
                                        </CardContent>
                                    </StyleCard>
                                </Grid>
                            ))}
                        </Grid>

                        <Divider sx={{ my: 3 }} />

                        {/* Duration slider */}
                        <Typography variant='h4' gutterBottom>
                            Duration
                        </Typography>

                        <Box sx={{ px: 2 }}>
                            <Slider
                                value={duration}
                                onChange={handleDurationChange}
                                aria-labelledby='duration-slider'
                                valueLabelDisplay='auto'
                                step={1}
                                marks
                                min={3}
                                max={6}
                                disabled={isGenerating}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant='body2' color='textSecondary'>
                                    3 seconds
                                </Typography>
                                <Typography variant='body2' color='textSecondary'>
                                    {duration} seconds
                                </Typography>
                                <Typography variant='body2' color='textSecondary'>
                                    6 seconds
                                </Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        {/* Quality selection */}
                        <Typography variant='h4' gutterBottom>
                            Quality
                        </Typography>

                        <FormControl fullWidth variant='outlined' sx={{ mb: 3 }}>
                            <InputLabel id='quality-select-label'>Quality</InputLabel>
                            <Select
                                labelId='quality-select-label'
                                id='quality-select'
                                value={quality}
                                onChange={handleQualityChange}
                                label='Quality'
                                disabled={isGenerating}
                            >
                                <MenuItem value='low'>Low (Faster generation)</MenuItem>
                                <MenuItem value='medium'>Medium</MenuItem>
                                <MenuItem value='high'>High (Better quality)</MenuItem>
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
                            disabled={isGenerating || !prompt.trim()}
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
                    <VideoPreview videoUrl={generatedVideoUrl} prompt={prompt} style={selectedStyle} duration={duration} />
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
                                Fill out the form on the left and click "Generate Video" to create your AI video
                            </Typography>
                        </CardContent>
                    </Card>
                )}
            </Grid>
        </Grid>
    )
}

export default TextToVideoGenerator
