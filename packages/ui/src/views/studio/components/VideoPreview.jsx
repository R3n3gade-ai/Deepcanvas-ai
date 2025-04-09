import React, { useState } from 'react'
import { Box, Button, Card, CardContent, CardMedia, Chip, Divider, IconButton, Typography, Tooltip } from '@mui/material'
import { styled } from '@mui/material/styles'
import DownloadIcon from '@mui/icons-material/Download'
import ShareIcon from '@mui/icons-material/Share'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen'
import ReplayIcon from '@mui/icons-material/Replay'
import MovieIcon from '@mui/icons-material/Movie'
import ImageIcon from '@mui/icons-material/Image'

// Styled components
const VideoContainer = styled(Box)(({ theme, fullscreen }) => ({
    position: 'relative',
    width: '100%',
    borderRadius: fullscreen ? 0 : theme.shape.borderRadius,
    overflow: 'hidden',
    boxShadow: fullscreen ? 'none' : theme.shadows[3],
    transition: 'all 0.3s ease',
    ...(fullscreen && {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        backgroundColor: 'black'
    })
}))

const VideoControls = styled(Box)(({ theme, fullscreen }) => ({
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing(1, 2),
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'opacity 0.3s ease',
    opacity: 0
}))

const VideoWrapper = styled(Box)(({ theme }) => ({
    position: 'relative',
    '&:hover .video-controls': {
        opacity: 1
    }
}))

const VideoPreview = ({ videoUrl, prompt, style, duration, sourceImage }) => {
    const [fullscreen, setFullscreen] = useState(false)
    const [isPlaying, setIsPlaying] = useState(true)

    // Toggle fullscreen
    const toggleFullscreen = () => {
        setFullscreen(!fullscreen)
    }

    // Handle video download
    const handleDownload = () => {
        const link = document.createElement('a')
        link.href = videoUrl
        link.download = `generated-video-${Date.now()}.mp4`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    // Handle video replay
    const handleReplay = () => {
        const videoElement = document.getElementById('preview-video')
        if (videoElement) {
            videoElement.currentTime = 0
            videoElement.play()
            setIsPlaying(true)
        }
    }

    // Handle video play/pause
    const handleVideoEnded = () => {
        setIsPlaying(false)
    }

    // Get style display name
    const getStyleDisplayName = (styleId) => {
        const styleMap = {
            realistic: 'Realistic',
            cinematic: 'Cinematic',
            '3d_animation': '3D Animation',
            anime: 'Anime',
            artistic: 'Artistic',
            live2d: 'Live2D'
        }

        return styleMap[styleId] || styleId
    }

    return (
        <Card sx={{ overflow: 'visible' }}>
            <VideoWrapper>
                <VideoContainer fullscreen={fullscreen}>
                    <CardMedia
                        component='video'
                        id='preview-video'
                        src={videoUrl}
                        controls={fullscreen}
                        autoPlay
                        loop={false}
                        onEnded={handleVideoEnded}
                        sx={{
                            width: '100%',
                            height: fullscreen ? '100vh' : 'auto',
                            maxHeight: fullscreen ? '100vh' : '400px',
                            objectFit: 'contain',
                            backgroundColor: 'black'
                        }}
                    />

                    <VideoControls className='video-controls' fullscreen={fullscreen}>
                        {!isPlaying && (
                            <IconButton color='inherit' onClick={handleReplay} size='small'>
                                <ReplayIcon />
                            </IconButton>
                        )}

                        <Box sx={{ flexGrow: 1 }} />

                        <IconButton color='inherit' onClick={toggleFullscreen} size='small'>
                            {fullscreen ? <CloseFullscreenIcon /> : <FullscreenIcon />}
                        </IconButton>
                    </VideoControls>
                </VideoContainer>
            </VideoWrapper>

            {!fullscreen && (
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant='h4'>Generated Video</Typography>

                        <Box>
                            <Tooltip title='Download Video'>
                                <IconButton onClick={handleDownload} color='primary'>
                                    <DownloadIcon />
                                </IconButton>
                            </Tooltip>

                            <Tooltip title='Share Video'>
                                <IconButton color='primary'>
                                    <ShareIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <Box sx={{ mb: 2 }}>
                        <Typography variant='subtitle1' gutterBottom>
                            Generation Details
                        </Typography>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                            <Chip icon={<MovieIcon />} label={`Style: ${getStyleDisplayName(style)}`} variant='outlined' />

                            {duration && <Chip label={`Duration: ${duration}s`} variant='outlined' />}

                            {sourceImage && <Chip icon={<ImageIcon />} label='Image to Video' variant='outlined' />}
                        </Box>
                    </Box>

                    {prompt && (
                        <Box sx={{ mb: 2 }}>
                            <Typography variant='subtitle1' gutterBottom>
                                Prompt
                            </Typography>
                            <Typography variant='body2' color='textSecondary'>
                                {prompt}
                            </Typography>
                        </Box>
                    )}

                    {sourceImage && (
                        <Box sx={{ mb: 2 }}>
                            <Typography variant='subtitle1' gutterBottom>
                                Source Image
                            </Typography>
                            <Box
                                sx={{
                                    width: '100%',
                                    maxHeight: '150px',
                                    overflow: 'hidden',
                                    borderRadius: 1,
                                    border: '1px solid',
                                    borderColor: 'divider'
                                }}
                            >
                                <img
                                    src={sourceImage}
                                    alt='Source'
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain'
                                    }}
                                />
                            </Box>
                        </Box>
                    )}

                    <Button variant='outlined' fullWidth onClick={handleReplay} startIcon={<ReplayIcon />}>
                        Replay Video
                    </Button>
                </CardContent>
            )}
        </Card>
    )
}

export default VideoPreview
