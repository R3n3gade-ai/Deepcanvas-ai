import React, { useEffect, useState } from 'react'
import { Box, Card, CardContent, LinearProgress, Typography, Chip } from '@mui/material'
import { styled } from '@mui/material/styles'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import PendingIcon from '@mui/icons-material/Pending'
import LoopIcon from '@mui/icons-material/Loop'

// Styled components
const StatusCard = styled(Card)(({ theme, status }) => ({
    marginBottom: theme.spacing(3),
    borderLeft: '4px solid',
    borderLeftColor:
        status === 'completed' ? theme.palette.success.main : status === 'failed' ? theme.palette.error.main : theme.palette.primary.main
}))

const StatusChip = styled(Chip)(({ theme, status }) => ({
    backgroundColor:
        status === 'completed'
            ? theme.palette.success.light
            : status === 'failed'
            ? theme.palette.error.light
            : status === 'processing'
            ? theme.palette.primary.light
            : theme.palette.warning.light,
    color:
        status === 'completed'
            ? theme.palette.success.contrastText
            : status === 'failed'
            ? theme.palette.error.contrastText
            : status === 'processing'
            ? theme.palette.primary.contrastText
            : theme.palette.warning.contrastText
}))

const GenerationStatus = ({ status }) => {
    const [timeRemaining, setTimeRemaining] = useState(null)
    const [dots, setDots] = useState('')

    // Calculate time remaining
    useEffect(() => {
        if (status.estimatedTime && status.status !== 'completed' && status.status !== 'failed') {
            let seconds = parseInt(status.estimatedTime)
            if (isNaN(seconds)) seconds = 60 // Default to 60 seconds if invalid

            setTimeRemaining(seconds)

            const timer = setInterval(() => {
                setTimeRemaining((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)

            return () => clearInterval(timer)
        }
    }, [status.estimatedTime, status.status])

    // Animated dots for loading states
    useEffect(() => {
        if (status.status !== 'completed' && status.status !== 'failed') {
            const dotsInterval = setInterval(() => {
                setDots((prev) => {
                    if (prev.length >= 3) return ''
                    return prev + '.'
                })
            }, 500)

            return () => clearInterval(dotsInterval)
        }
    }, [status.status])

    // Format time remaining
    const formatTimeRemaining = (seconds) => {
        if (!seconds && seconds !== 0) return 'Calculating...'
        if (seconds <= 0) return 'Almost done...'

        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60

        if (minutes > 0) {
            return `${minutes}m ${remainingSeconds}s remaining`
        }

        return `${remainingSeconds}s remaining`
    }

    // Get status icon
    const getStatusIcon = () => {
        switch (status.status) {
            case 'completed':
                return <CheckCircleIcon />
            case 'failed':
                return <ErrorIcon />
            case 'processing':
                return <LoopIcon className='rotating-icon' />
            default:
                return <PendingIcon />
        }
    }

    // Get status display text
    const getStatusDisplay = () => {
        switch (status.status) {
            case 'completed':
                return 'Completed'
            case 'failed':
                return 'Failed'
            case 'processing':
                return 'Processing'
            case 'starting':
                return 'Starting'
            default:
                return status.status.charAt(0).toUpperCase() + status.status.slice(1)
        }
    }

    return (
        <StatusCard status={status.status}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant='h4'>Video Generation</Typography>

                    <StatusChip icon={getStatusIcon()} label={getStatusDisplay()} status={status.status} />
                </Box>

                <LinearProgress
                    variant='determinate'
                    value={status.progress}
                    sx={{ height: 8, borderRadius: 4, mb: 2 }}
                    color={status.status === 'completed' ? 'success' : status.status === 'failed' ? 'error' : 'primary'}
                />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant='body1'>{status.message || `${getStatusDisplay()}${dots}`}</Typography>

                    {timeRemaining !== null && status.status !== 'completed' && status.status !== 'failed' && (
                        <Chip icon={<AccessTimeIcon />} label={formatTimeRemaining(timeRemaining)} variant='outlined' size='small' />
                    )}
                </Box>

                {status.jobId && (
                    <Typography variant='caption' color='textSecondary' sx={{ mt: 1, display: 'block' }}>
                        Job ID: {status.jobId}
                    </Typography>
                )}
            </CardContent>
        </StatusCard>
    )
}

export default GenerationStatus
