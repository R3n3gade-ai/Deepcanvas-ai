import { useState, useCallback, useMemo, Fragment } from 'react'
import { Box, Typography, Button, IconButton, Tooltip, Paper, Avatar } from '@mui/material'
import { styled } from '@mui/material/styles'
import dayjs from 'dayjs'
import { useCalendar } from './CalendarContext'

// Icons
import CalendarViewDayIcon from '@mui/icons-material/CalendarViewDay'
import CalendarViewWeekIcon from '@mui/icons-material/CalendarViewWeek'
import CalendarViewMonthIcon from '@mui/icons-material/CalendarViewMonth'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import VisibilityIcon from '@mui/icons-material/Visibility'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

// Styled components
const CalendarContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 180px)',
    position: 'relative',
    flex: 1
}))

const CalendarHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2)
}))

const CalendarControls = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2)
}))

const ViewButton = styled(Button)(({ theme, active }) => ({
    backgroundColor: active ? theme.palette.primary.main : 'transparent',
    color: active ? theme.palette.primary.contrastText : theme.palette.text.primary,
    '&:hover': {
        backgroundColor: active ? theme.palette.primary.dark : theme.palette.action.hover
    }
}))

// Helper function to convert time format based on locality
const convertTimeFormat = (time) => {
    return `${time === 12 ? 12 : time % 12}:00 ${time >= 12 ? 'PM' : 'AM'}`
}

// Days of the week
export const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

// Hours of the day
export const hours = Array.from({ length: 24 }, (_, i) => i)

// Day View Component
export const DayView = () => {
    const calendar = useCalendar()
    const { integrations, posts, currentYear, currentDay, currentWeek } = calendar

    // Generate time slots for every hour
    const timeSlots = useMemo(() => {
        return hours.map((hour) => ({
            time: hour * 60, // Convert to minutes
            hour
        }))
    }, [])

    // Find posts for each time slot
    const slotsWithPosts = useMemo(() => {
        return timeSlots.map((slot) => {
            const slotPosts = posts.filter((post) => {
                const postTime = dayjs(post.publishDate)
                const slotStart = dayjs().hour(slot.hour).minute(0)
                const slotEnd = dayjs().hour(slot.hour).minute(59)
                return postTime.isAfter(slotStart) && postTime.isBefore(slotEnd)
            })
            return {
                ...slot,
                posts: slotPosts
            }
        })
    }, [timeSlots, posts])

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                height: '100%',
                overflow: 'auto',
                p: 2
            }}
        >
            {slotsWithPosts.map((slot) => (
                <Fragment key={slot.time}>
                    <Typography
                        variant='h6'
                        sx={{
                            textAlign: 'center',
                            color: 'white',
                            mt: 2
                        }}
                    >
                        {dayjs().hour(slot.hour).minute(0).format('hh:mm A')}
                    </Typography>
                    <Paper
                        sx={{
                            minHeight: 80,
                            p: 2,
                            mb: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            backgroundColor: '#111827',
                            border: '1px solid #2d3748',
                            borderRadius: '10px',
                            color: 'white'
                        }}
                    >
                        {slot.posts.length > 0 ? (
                            slot.posts.map((post) => (
                                <Box key={post.id} sx={{ mb: 1 }}>
                                    <CalendarItem date={dayjs(post.publishDate)} post={post} />
                                </Box>
                            ))
                        ) : (
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: '100%',
                                    color: 'text.secondary',
                                    minHeight: 40
                                }}
                            >
                                <Typography variant='body2' color='text.secondary'>
                                    No events scheduled
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Fragment>
            ))}
        </Box>
    )
}

// Week View Component
export const WeekView = () => {
    const { currentYear, currentWeek } = useCalendar()

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'auto repeat(7, 1fr)',
                    gridTemplateRows: 'auto 1fr',
                    gap: '1px',
                    height: '100%',
                    backgroundColor: '#2d3748',
                    borderRadius: '10px',
                    border: '1px solid #2d3748',
                    overflow: 'hidden'
                }}
            >
                {/* Header row */}
                <Box
                    sx={{
                        backgroundColor: '#1a202c',
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                ></Box>

                {days.map((day) => (
                    <Box
                        key={day}
                        sx={{
                            backgroundColor: '#1a202c',
                            p: 2,
                            textAlign: 'center',
                            color: 'white',
                            fontWeight: 'bold'
                        }}
                    >
                        {day}
                    </Box>
                ))}

                {/* Time slots */}
                {hours.map((hour) => (
                    <Fragment key={hour}>
                        <Box
                            sx={{
                                backgroundColor: '#1a202c',
                                p: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white'
                            }}
                        >
                            {convertTimeFormat(hour)}
                        </Box>

                        {days.map((day, index) => (
                            <Box
                                key={`${day}-${hour}`}
                                sx={{
                                    backgroundColor: '#111827',
                                    p: 1,
                                    position: 'relative',
                                    '&:hover': {
                                        backgroundColor: '#1e293b'
                                    }
                                }}
                            >
                                <CalendarItem
                                    date={dayjs()
                                        .year(currentYear)
                                        .week(currentWeek)
                                        .day(index + 1)
                                        .hour(hour)}
                                />
                            </Box>
                        ))}
                    </Fragment>
                ))}
            </Box>
        </Box>
    )
}

// Month View Component
export const MonthView = () => {
    const { currentYear, currentMonth } = useCalendar()

    const calendarDays = useMemo(() => {
        const startOfMonth = dayjs(new Date(currentYear, currentMonth, 1))

        // Calculate the day offset for Monday (isoWeekday() returns 1 for Monday)
        const startDayOfWeek = startOfMonth.day() || 7 // Convert Sunday (0) to 7
        const daysBeforeMonth = startDayOfWeek - 1 // Days to show from the previous month

        // Get the start date (Monday of the first week that includes this month)
        const startDate = startOfMonth.subtract(daysBeforeMonth, 'day')

        // Create an array to hold the calendar days (6 weeks * 7 days = 42 days max)
        const calendarDays = []
        let currentDay = startDate

        for (let i = 0; i < 42; i++) {
            let label = 'current-month'
            if (currentDay.month() < currentMonth) label = 'previous-month'
            if (currentDay.month() > currentMonth) label = 'next-month'

            calendarDays.push({
                day: currentDay,
                label
            })

            // Move to the next day
            currentDay = currentDay.add(1, 'day')
        }

        return calendarDays
    }, [currentYear, currentMonth])

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gridAutoRows: 'auto 1fr',
                    gap: '1px',
                    height: '100%',
                    backgroundColor: '#2d3748',
                    borderRadius: '10px',
                    border: '1px solid #2d3748',
                    overflow: 'hidden'
                }}
            >
                {/* Header row with days of week */}
                {days.map((day) => (
                    <Box
                        key={day}
                        sx={{
                            backgroundColor: '#1a202c',
                            p: 2,
                            textAlign: 'center',
                            color: 'white',
                            fontWeight: 'bold'
                        }}
                    >
                        {day}
                    </Box>
                ))}

                {/* Calendar days */}
                {calendarDays.map((date, index) => (
                    <Box
                        key={index}
                        sx={{
                            backgroundColor: date.label !== 'current-month' ? '#1e293b' : '#111827',
                            p: 1,
                            minHeight: '100px',
                            position: 'relative',
                            '&:hover': {
                                backgroundColor: '#1e293b'
                            }
                        }}
                    >
                        <Typography
                            variant='body2'
                            sx={{
                                position: 'absolute',
                                top: 5,
                                right: 8,
                                color: date.label !== 'current-month' ? 'text.disabled' : 'white',
                                fontSize: '0.85rem'
                            }}
                        >
                            {date.day.date()}
                        </Typography>
                        <Box sx={{ pt: 4, px: 1, height: '100%', overflow: 'auto' }}>
                            <CalendarItem date={date.day} />
                        </Box>
                    </Box>
                ))}
            </Box>
        </Box>
    )
}

// Calendar Item Component
const CalendarItem = ({ date, post }) => {
    const { posts } = useCalendar()

    // Find posts for this date
    const postsForDate = useMemo(() => {
        if (post) {
            return [post]
        }
        return posts.filter((p) => {
            const postDate = dayjs(p.publishDate)
            return postDate.format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
        })
    }, [posts, date, post])

    if (postsForDate.length === 0) {
        return null
    }

    return (
        <Box sx={{ width: '100%' }}>
            {postsForDate.map((post) => {
                // Generate a color based on the platform if no tag color is available
                const platformColors = {
                    twitter: '#1DA1F2',
                    facebook: '#4267B2',
                    instagram: '#C13584',
                    linkedin: '#0077B5',
                    youtube: '#FF0000',
                    pinterest: '#E60023',
                    reddit: '#FF4500',
                    telegram: '#0088cc'
                }

                const borderColor = post.tags?.[0]?.tag?.color || platformColors[post.integration.identifier?.toLowerCase()] || '#3f51b5'

                return (
                    <Paper
                        key={post.id}
                        sx={{
                            p: 1,
                            mb: 0.5,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            borderLeft: 4,
                            borderColor: borderColor,
                            backgroundColor: '#1e293b',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: '#2d3748'
                            }
                        }}
                    >
                        <Avatar
                            src={post.integration?.picture || '/icons/platforms/default.png'}
                            alt={post.integration?.name}
                            sx={{ width: 24, height: 24 }}
                        />
                        <Typography variant='body2' noWrap sx={{ flex: 1 }}>
                            {post.content?.substring(0, 30) || 'New post'}
                            {post.content?.length > 30 ? '...' : ''}
                        </Typography>
                        <Typography variant='caption' sx={{ color: 'text.secondary', mr: 1 }}>
                            {dayjs(post.publishDate).format('HH:mm')}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title='Edit'>
                                <IconButton size='small' sx={{ color: 'white' }}>
                                    <EditIcon fontSize='small' />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title='Duplicate'>
                                <IconButton size='small' sx={{ color: 'white' }}>
                                    <ContentCopyIcon fontSize='small' />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title='Preview'>
                                <IconButton size='small' sx={{ color: 'white' }}>
                                    <VisibilityIcon fontSize='small' />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Paper>
                )
            })}
        </Box>
    )
}

// Main Calendar Component
const Calendar = ({ onNewPost }) => {
    const { display, setFilters, currentYear, currentMonth, currentWeek, currentDay } = useCalendar()

    // Handle view change
    const handleViewChange = (newView) => {
        setFilters({
            currentDay,
            currentWeek,
            currentMonth,
            currentYear,
            display: newView
        })
    }

    // Handle month change
    const handleMonthChange = (increment) => {
        let newMonth = currentMonth + increment
        let newYear = currentYear

        if (newMonth > 11) {
            newMonth = 0
            newYear += 1
        } else if (newMonth < 0) {
            newMonth = 11
            newYear -= 1
        }

        setFilters({
            currentDay,
            currentWeek,
            currentMonth: newMonth,
            currentYear: newYear,
            display
        })
    }

    // Handle week change
    const handleWeekChange = (increment) => {
        const newDate = dayjs().year(currentYear).week(currentWeek).add(increment, 'week')

        setFilters({
            currentDay,
            currentWeek: newDate.week(),
            currentMonth,
            currentYear: newDate.year(),
            display
        })
    }

    // Handle day change
    const handleDayChange = (increment) => {
        const newDate = dayjs().year(currentYear).week(currentWeek).day(currentDay).add(increment, 'day')

        setFilters({
            currentDay: newDate.day(),
            currentWeek: newDate.week(),
            currentMonth,
            currentYear: newDate.year(),
            display
        })
    }

    // Get current date display
    const getDateDisplay = () => {
        if (display === 'month') {
            return dayjs().year(currentYear).month(currentMonth).format('MMMM YYYY')
        } else if (display === 'week') {
            const startOfWeek = dayjs().year(currentYear).week(currentWeek).day(1)
            const endOfWeek = startOfWeek.add(6, 'day')
            return `${startOfWeek.format('MMM D')} - ${endOfWeek.format('MMM D, YYYY')}`
        } else {
            return dayjs().year(currentYear).week(currentWeek).day(currentDay).format('dddd, MMMM D, YYYY')
        }
    }

    // Handle navigation
    const handleNavigation = (increment) => {
        if (display === 'month') {
            handleMonthChange(increment)
        } else if (display === 'week') {
            handleWeekChange(increment)
        } else {
            handleDayChange(increment)
        }
    }

    return (
        <CalendarContainer>
            <CalendarHeader>
                <CalendarControls>
                    <IconButton onClick={() => handleNavigation(-1)}>
                        <ChevronLeftIcon />
                    </IconButton>
                    <Typography variant='h6'>{getDateDisplay()}</Typography>
                    <IconButton onClick={() => handleNavigation(1)}>
                        <ChevronRightIcon />
                    </IconButton>
                </CalendarControls>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button variant='contained' startIcon={<AddIcon />} color='primary' onClick={onNewPost}>
                        New Post
                    </Button>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <ViewButton active={display === 'day'} onClick={() => handleViewChange('day')} startIcon={<CalendarViewDayIcon />}>
                            Day
                        </ViewButton>
                        <ViewButton
                            active={display === 'week'}
                            onClick={() => handleViewChange('week')}
                            startIcon={<CalendarViewWeekIcon />}
                        >
                            Week
                        </ViewButton>
                        <ViewButton
                            active={display === 'month'}
                            onClick={() => handleViewChange('month')}
                            startIcon={<CalendarViewMonthIcon />}
                        >
                            Month
                        </ViewButton>
                    </Box>
                </Box>
            </CalendarHeader>
            <Box sx={{ flexGrow: 1, overflow: 'auto', backgroundColor: '#0f172a', borderRadius: '10px' }}>
                {display === 'day' ? <DayView /> : display === 'week' ? <WeekView /> : <MonthView />}
            </Box>
        </CalendarContainer>
    )
}

export default Calendar
