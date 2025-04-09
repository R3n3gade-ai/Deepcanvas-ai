import { useState } from 'react'
import { Grid, Typography, Box, Paper, Divider } from '@mui/material'
import MainCard from '@/ui-component/cards/MainCard'

// Import components
import { CalendarProvider } from './components/calendar/CalendarContext'
import Calendar from './components/calendar/Calendar'
import SocialConnections from './components/social/SocialConnections'
import MediaDesign from './components/media/MediaDesign'

// ==============================|| TASKS VIEW ||============================== //

const Tasks = () => {
    // State for media design dialog
    const [mediaDesignOpen, setMediaDesignOpen] = useState(false)

    // State for posts
    const [posts, setPosts] = useState([])

    // Open media design dialog
    const handleOpenMediaDesign = () => {
        setMediaDesignOpen(true)
    }

    // Close media design dialog
    const handleCloseMediaDesign = () => {
        setMediaDesignOpen(false)
    }

    // Save post
    const handleSavePost = (post) => {
        setPosts([...posts, post])
    }

    return (
        <CalendarProvider>
            <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <MainCard>
                            {/* Social Connections */}
                            <SocialConnections />

                            {/* Calendar */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)' }}>
                                <Calendar onNewPost={handleOpenMediaDesign} />
                            </Box>

                            {/* Media Design Dialog */}
                            <MediaDesign open={mediaDesignOpen} onClose={handleCloseMediaDesign} onSave={handleSavePost} />
                        </MainCard>
                    </Grid>
                </Grid>
            </Box>
        </CalendarProvider>
    )
}

export default Tasks
