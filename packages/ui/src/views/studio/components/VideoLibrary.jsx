import React, { useState, useEffect } from 'react'
import {
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    CircularProgress,
    Divider,
    Grid,
    IconButton,
    Menu,
    MenuItem,
    Typography,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@mui/material'
import { styled } from '@mui/material/styles'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import DeleteIcon from '@mui/icons-material/Delete'
import ShareIcon from '@mui/icons-material/Share'
import DownloadIcon from '@mui/icons-material/Download'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import AddIcon from '@mui/icons-material/Add'
import { getUserVideos, deleteVideo } from '../../../api/videoGenerationService.jsx'
import { useAuth } from '../../../hooks/useAuth'
import VideoPreview from './VideoPreview.jsx'

// Styled components
const VideoCard = styled(Card)(({ theme }) => ({
    position: 'relative',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: theme.shadows[10]
    }
}))

const VideoOverlay = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.3s ease',
    '&:hover': {
        opacity: 1
    }
}))

const EmptyState = styled(Box)(({ theme }) => ({
    textAlign: 'center',
    padding: theme.spacing(5),
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.grey[100],
    borderRadius: theme.shape.borderRadius,
    border: `1px dashed ${theme.palette.divider}`
}))

const VideoLibrary = ({ videos: propVideos, setVideos: setPropVideos }) => {
    const { user } = useAuth()
    const [videos, setVideos] = useState(propVideos || [])
    const [loading, setLoading] = useState(false)
    const [selectedVideo, setSelectedVideo] = useState(null)
    const [previewOpen, setPreviewOpen] = useState(false)
    const [menuAnchorEl, setMenuAnchorEl] = useState(null)
    const [activeVideoId, setActiveVideoId] = useState(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [videoToDelete, setVideoToDelete] = useState(null)

    // Fetch user videos on component mount
    useEffect(() => {
        if (propVideos && propVideos.length > 0) {
            // If videos are provided as props, use them
            setVideos(propVideos)
        } else {
            // Otherwise fetch from API
            fetchVideos()
        }
    }, [propVideos])

    // Fetch videos from API
    const fetchVideos = async () => {
        if (!user?.id) return

        setLoading(true)
        try {
            const fetchedVideos = await getUserVideos(user.id)
            setVideos(fetchedVideos)
            if (setPropVideos) {
                setPropVideos(fetchedVideos)
            }
        } catch (error) {
            console.error('Error fetching videos:', error)
        } finally {
            setLoading(false)
        }
    }

    // Handle menu open
    const handleMenuOpen = (event, videoId) => {
        setMenuAnchorEl(event.currentTarget)
        setActiveVideoId(videoId)
    }

    // Handle menu close
    const handleMenuClose = () => {
        setMenuAnchorEl(null)
        setActiveVideoId(null)
    }

    // Handle video preview
    const handlePreviewVideo = (video) => {
        setSelectedVideo(video)
        setPreviewOpen(true)
    }

    // Handle preview close
    const handlePreviewClose = () => {
        setPreviewOpen(false)
    }

    // Handle video download
    const handleDownload = (video) => {
        const link = document.createElement('a')
        link.href = video.url
        link.download = `generated-video-${video.id}.mp4`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        handleMenuClose()
    }

    // Handle delete dialog open
    const handleDeleteDialogOpen = (video) => {
        setVideoToDelete(video)
        setDeleteDialogOpen(true)
        handleMenuClose()
    }

    // Handle delete dialog close
    const handleDeleteDialogClose = () => {
        setDeleteDialogOpen(false)
        setVideoToDelete(null)
    }

    // Handle video delete
    const handleDeleteVideo = async () => {
        if (!videoToDelete) return

        try {
            await deleteVideo(videoToDelete.id)

            // Update local state
            const updatedVideos = videos.filter((v) => v.id !== videoToDelete.id)
            setVideos(updatedVideos)
            if (setPropVideos) {
                setPropVideos(updatedVideos)
            }

            handleDeleteDialogClose()
        } catch (error) {
            console.error('Error deleting video:', error)
        }
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

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant='h3'>Your Generated Videos</Typography>

                <Button variant='contained' color='primary' startIcon={<AddIcon />} onClick={() => (window.location.hash = '#/studio')}>
                    Create New Video
                </Button>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                    <CircularProgress />
                </Box>
            ) : videos.length > 0 ? (
                <Grid container spacing={3}>
                    {videos.map((video) => (
                        <Grid item xs={12} sm={6} md={4} key={video.id}>
                            <VideoCard>
                                <CardMedia
                                    component='video'
                                    src={video.url}
                                    sx={{ height: 180 }}
                                    muted
                                    onMouseOver={(e) => e.target.play()}
                                    onMouseOut={(e) => {
                                        e.target.pause()
                                        e.target.currentTime = 0
                                    }}
                                />

                                <VideoOverlay>
                                    <IconButton
                                        color='primary'
                                        sx={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                            '&:hover': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.9)'
                                            }
                                        }}
                                        onClick={() => handlePreviewVideo(video)}
                                    >
                                        <PlayArrowIcon fontSize='large' />
                                    </IconButton>
                                </VideoOverlay>

                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box>
                                            <Typography variant='h5' noWrap sx={{ maxWidth: '200px' }}>
                                                {video.prompt
                                                    ? video.prompt.substring(0, 20) + (video.prompt.length > 20 ? '...' : '')
                                                    : `Video ${video.id.substring(0, 8)}`}
                                            </Typography>
                                            <Typography variant='body2' color='textSecondary'>
                                                {formatDate(video.createdAt)}
                                            </Typography>
                                        </Box>

                                        <IconButton
                                            aria-label='video options'
                                            aria-controls={`video-menu-${video.id}`}
                                            aria-haspopup='true'
                                            onClick={(e) => handleMenuOpen(e, video.id)}
                                        >
                                            <MoreVertIcon />
                                        </IconButton>
                                    </Box>
                                </CardContent>
                            </VideoCard>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <EmptyState>
                    <Typography variant='h4' gutterBottom>
                        No Videos Yet
                    </Typography>
                    <Typography variant='body1' color='textSecondary' paragraph>
                        You haven't generated any videos yet. Create your first AI video now!
                    </Typography>
                    <Button variant='contained' color='primary' startIcon={<AddIcon />} onClick={() => (window.location.hash = '#/studio')}>
                        Create New Video
                    </Button>
                </EmptyState>
            )}

            {/* Video options menu */}
            <Menu
                id={`video-menu-${activeVideoId}`}
                anchorEl={menuAnchorEl}
                keepMounted
                open={Boolean(menuAnchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem
                    onClick={() => {
                        const video = videos.find((v) => v.id === activeVideoId)
                        if (video) handlePreviewVideo(video)
                    }}
                >
                    <PlayArrowIcon fontSize='small' sx={{ mr: 1 }} />
                    Play
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        const video = videos.find((v) => v.id === activeVideoId)
                        if (video) handleDownload(video)
                    }}
                >
                    <DownloadIcon fontSize='small' sx={{ mr: 1 }} />
                    Download
                </MenuItem>
                <MenuItem onClick={handleMenuClose}>
                    <ShareIcon fontSize='small' sx={{ mr: 1 }} />
                    Share
                </MenuItem>
                <Divider />
                <MenuItem
                    onClick={() => {
                        const video = videos.find((v) => v.id === activeVideoId)
                        if (video) handleDeleteDialogOpen(video)
                    }}
                    sx={{ color: 'error.main' }}
                >
                    <DeleteIcon fontSize='small' sx={{ mr: 1 }} />
                    Delete
                </MenuItem>
            </Menu>

            {/* Video preview dialog */}
            {selectedVideo && (
                <Dialog open={previewOpen} onClose={handlePreviewClose} maxWidth='md' fullWidth>
                    <DialogContent sx={{ p: 0 }}>
                        <VideoPreview
                            videoUrl={selectedVideo.url}
                            prompt={selectedVideo.prompt}
                            style={selectedVideo.style}
                            sourceImage={selectedVideo.imagePreview}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handlePreviewClose}>Close</Button>
                    </DialogActions>
                </Dialog>
            )}

            {/* Delete confirmation dialog */}
            <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
                <DialogTitle>Delete Video</DialogTitle>
                <DialogContent>
                    <DialogContentText>Are you sure you want to delete this video? This action cannot be undone.</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteDialogClose}>Cancel</Button>
                    <Button onClick={handleDeleteVideo} color='error' startIcon={<DeleteIcon />}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default VideoLibrary
