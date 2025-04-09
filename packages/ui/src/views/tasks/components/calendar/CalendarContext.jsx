import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react'
import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'

// Extend dayjs with plugins
dayjs.extend(isoWeek)
dayjs.extend(weekOfYear)
dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

// Create the calendar context
export const CalendarContext = createContext({
    currentDay: dayjs().day(),
    currentWeek: dayjs().week(),
    currentYear: dayjs().year(),
    currentMonth: dayjs().month(),
    integrations: [],
    posts: [],
    reloadCalendarView: () => {
        /** empty **/
    },
    display: 'month', // Default to month view
    setFilters: () => {
        /** empty **/
    },
    changeDate: () => {
        /** empty **/
    },
    addPost: () => {
        /** empty **/
    }
})

// Helper function to get the week number
function getWeekNumber(date) {
    // Copy date so don't modify original
    const targetDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    targetDate.setUTCDate(targetDate.getUTCDate() + 4 - (targetDate.getUTCDay() || 7))
    // Get first day of year
    const yearStart = new Date(Date.UTC(targetDate.getUTCFullYear(), 0, 1))
    // Calculate full weeks to nearest Thursday
    return Math.ceil(((targetDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

// Calendar provider component
export const CalendarProvider = ({ children }) => {
    // Data for integrations (social media platforms)
    const integrations = [
        {
            id: '1',
            name: 'Twitter',
            identifier: 'twitter',
            picture: '/icons/platforms/twitter.png',
            time: [{ time: 540 }, { time: 720 }], // 9:00 AM, 12:00 PM
            type: 'social',
            display: 'Twitter',
            inBetweenSteps: false,
            changeProfilePicture: false,
            additionalSettings: '',
            changeNickName: false
        },
        {
            id: '2',
            name: 'Facebook',
            identifier: 'facebook',
            picture: '/icons/platforms/facebook.png',
            time: [{ time: 600 }, { time: 780 }], // 10:00 AM, 1:00 PM
            type: 'social',
            display: 'Facebook',
            inBetweenSteps: false,
            changeProfilePicture: false,
            additionalSettings: '',
            changeNickName: false
        },
        {
            id: '3',
            name: 'Instagram',
            identifier: 'instagram',
            picture: '/icons/platforms/instagram.png',
            time: [{ time: 660 }, { time: 840 }], // 11:00 AM, 2:00 PM
            type: 'social',
            display: 'Instagram',
            inBetweenSteps: false,
            changeProfilePicture: false,
            additionalSettings: '',
            changeNickName: false
        },
        {
            id: '4',
            name: 'LinkedIn',
            identifier: 'linkedin',
            picture: '/icons/platforms/linkedin.png',
            time: [{ time: 480 }, { time: 900 }], // 8:00 AM, 3:00 PM
            type: 'social',
            display: 'LinkedIn',
            inBetweenSteps: false,
            changeProfilePicture: false,
            additionalSettings: '',
            changeNickName: false
        }
    ]

    // State for filters
    const [filters, setFilters] = useState({
        currentDay: dayjs().day(),
        currentWeek: getWeekNumber(new Date()),
        currentMonth: dayjs().month(),
        currentYear: dayjs().year(),
        display: 'month' // Default to month view
    })

    // State for posts
    const [posts, setPosts] = useState([])

    // Function to reload calendar view
    const reloadCalendarView = useCallback(() => {
        // In a real app, this would fetch data from an API
        console.log('Reloading calendar view')
    }, [])

    // Function to change date of a post
    const changeDate = useCallback((id, date) => {
        setPosts((prevPosts) =>
            prevPosts.map((post) => {
                if (post.id === id) {
                    return {
                        ...post,
                        publishDate: date.format()
                    }
                }
                return post
            })
        )
    }, [])

    // Function to set filters
    const setFiltersWrapper = useCallback((newFilters) => {
        setFilters(newFilters)
    }, [])

    // Function to add a new post
    const addPost = useCallback((post) => {
        setPosts((prevPosts) => [...prevPosts, post])
    }, [])

    return (
        <CalendarContext.Provider
            value={{
                ...filters,
                posts,
                integrations,
                reloadCalendarView,
                setFilters: setFiltersWrapper,
                changeDate,
                addPost
            }}
        >
            {children}
        </CalendarContext.Provider>
    )
}

// Hook to use calendar context
export const useCalendar = () => useContext(CalendarContext)
