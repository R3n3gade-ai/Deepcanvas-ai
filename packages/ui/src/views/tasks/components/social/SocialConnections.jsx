import { useState } from 'react'
import {
    Box,
    Typography,
    Button,
    Grid,
    Avatar,
    Chip,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControlLabel,
    Switch
} from '@mui/material'
import { styled } from '@mui/material/styles'

// Icons
import AddIcon from '@mui/icons-material/Add'
import TwitterIcon from '@mui/icons-material/Twitter'
import FacebookIcon from '@mui/icons-material/Facebook'
import InstagramIcon from '@mui/icons-material/Instagram'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import YouTubeIcon from '@mui/icons-material/YouTube'
import PinterestIcon from '@mui/icons-material/Pinterest'
import RedditIcon from '@mui/icons-material/Reddit'
import TelegramIcon from '@mui/icons-material/Telegram'

// Styled components
const ConnectionAvatar = styled(Avatar)(({ theme, platform, connected }) => {
    const colors = {
        twitter: '#1DA1F2',
        facebook: '#4267B2',
        instagram: '#C13584',
        linkedin: '#0077B5',
        youtube: '#FF0000',
        pinterest: '#E60023',
        reddit: '#FF4500',
        telegram: '#0088cc'
    }

    return {
        backgroundColor: colors[platform] || theme.palette.primary.main,
        width: 40,
        height: 40,
        opacity: connected ? 1 : 0.6,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
            transform: 'scale(1.1)',
            boxShadow: theme.shadows[3]
        }
    }
})

const PlatformIcon = ({ platform, ...props }) => {
    switch (platform) {
        case 'twitter':
            return <TwitterIcon {...props} />
        case 'facebook':
            return <FacebookIcon {...props} />
        case 'instagram':
            return <InstagramIcon {...props} />
        case 'linkedin':
            return <LinkedInIcon {...props} />
        case 'youtube':
            return <YouTubeIcon {...props} />
        case 'pinterest':
            return <PinterestIcon {...props} />
        case 'reddit':
            return <RedditIcon {...props} />
        case 'telegram':
            return <TelegramIcon {...props} />
        default:
            return null
    }
}

// Social Connections Component
const SocialConnections = () => {
    // State for social media connections
    const [connections, setConnections] = useState([
        { id: '1', platform: 'twitter', name: 'Twitter', connected: false, autoPost: false },
        { id: '2', platform: 'facebook', name: 'Facebook', connected: false, autoPost: false },
        { id: '3', platform: 'instagram', name: 'Instagram', connected: false, autoPost: false },
        { id: '4', platform: 'linkedin', name: 'LinkedIn', connected: false, autoPost: false },
        { id: '5', platform: 'youtube', name: 'YouTube', connected: false, autoPost: false },
        { id: '6', platform: 'pinterest', name: 'Pinterest', connected: false, autoPost: false },
        { id: '7', platform: 'reddit', name: 'Reddit', connected: false, autoPost: false },
        { id: '8', platform: 'telegram', name: 'Telegram', connected: false, autoPost: false }
    ])

    // State for connection dialog
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selectedConnection, setSelectedConnection] = useState(null)

    // Open connection dialog
    const openConnectionDialog = (connection) => {
        setSelectedConnection(connection)
        setDialogOpen(true)
    }

    // Close connection dialog
    const closeConnectionDialog = () => {
        setDialogOpen(false)
        setSelectedConnection(null)
    }

    // Connect to platform
    const connectToPlatform = () => {
        if (selectedConnection) {
            setConnections(connections.map((conn) => (conn.id === selectedConnection.id ? { ...conn, connected: true } : conn)))
            closeConnectionDialog()
        }
    }

    // Disconnect from platform
    const disconnectFromPlatform = (id) => {
        setConnections(connections.map((conn) => (conn.id === id ? { ...conn, connected: false, autoPost: false } : conn)))
    }

    // Toggle auto-post setting
    const toggleAutoPost = (id) => {
        setConnections(connections.map((conn) => (conn.id === id ? { ...conn, autoPost: !conn.autoPost } : conn)))
    }

    return (
        <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant='h6'>Social Connections</Typography>
                <Button
                    variant='text'
                    size='small'
                    startIcon={<AddIcon />}
                    onClick={() => openConnectionDialog(connections.find((c) => !c.connected))}
                >
                    Add Account
                </Button>
            </Box>
            <Grid container spacing={1} sx={{ mb: 1 }}>
                {connections.map((connection) => (
                    <Grid item key={connection.id}>
                        <Tooltip title={connection.connected ? `${connection.name} (Connected)` : `Connect to ${connection.name}`}>
                            <Box sx={{ textAlign: 'center' }}>
                                <ConnectionAvatar
                                    platform={connection.platform}
                                    connected={connection.connected}
                                    onClick={() => openConnectionDialog(connection)}
                                >
                                    <PlatformIcon platform={connection.platform} />
                                </ConnectionAvatar>
                                {connection.connected && (
                                    <Chip
                                        label={connection.autoPost ? 'Auto' : 'Manual'}
                                        color={connection.autoPost ? 'success' : 'default'}
                                        size='small'
                                        sx={{ mt: 0.5, height: 20, fontSize: '0.6rem' }}
                                        onClick={() => toggleAutoPost(connection.id)}
                                    />
                                )}
                            </Box>
                        </Tooltip>
                    </Grid>
                ))}
            </Grid>

            {/* Connection Dialog */}
            <Dialog open={dialogOpen} onClose={closeConnectionDialog} maxWidth='xs' fullWidth>
                {selectedConnection && (
                    <>
                        <DialogTitle>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <ConnectionAvatar
                                    platform={selectedConnection.platform}
                                    connected={true}
                                    sx={{ mr: 1, width: 30, height: 30 }}
                                >
                                    <PlatformIcon platform={selectedConnection.platform} fontSize='small' />
                                </ConnectionAvatar>
                                {selectedConnection.connected
                                    ? `${selectedConnection.name} Settings`
                                    : `Connect to ${selectedConnection.name}`}
                            </Box>
                        </DialogTitle>
                        <DialogContent>
                            {selectedConnection.connected ? (
                                <>
                                    <Typography variant='body2' sx={{ mb: 2 }}>
                                        Your {selectedConnection.name} account is connected.
                                    </Typography>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={selectedConnection.autoPost}
                                                onChange={() => toggleAutoPost(selectedConnection.id)}
                                            />
                                        }
                                        label='Auto-post to this platform'
                                    />
                                </>
                            ) : (
                                <>
                                    <Typography variant='body2' sx={{ mb: 2 }}>
                                        Connect your {selectedConnection.name} account to schedule and publish posts.
                                    </Typography>
                                    <TextField label='Username or Email' fullWidth margin='normal' size='small' />
                                    <TextField label='Password' type='password' fullWidth margin='normal' size='small' />
                                </>
                            )}
                        </DialogContent>
                        <DialogActions>
                            {selectedConnection.connected ? (
                                <>
                                    <Button onClick={closeConnectionDialog}>Cancel</Button>
                                    <Button
                                        color='error'
                                        onClick={() => {
                                            disconnectFromPlatform(selectedConnection.id)
                                            closeConnectionDialog()
                                        }}
                                    >
                                        Disconnect
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button onClick={closeConnectionDialog}>Cancel</Button>
                                    <Button variant='contained' color='primary' onClick={connectToPlatform}>
                                        Connect
                                    </Button>
                                </>
                            )}
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    )
}

export default SocialConnections
