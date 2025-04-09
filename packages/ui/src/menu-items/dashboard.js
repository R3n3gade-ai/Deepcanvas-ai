// assets
import {
    IconUsersGroup,
    IconHierarchy,
    IconBuildingStore,
    IconKey,
    IconTool,
    IconLock,
    IconRobot,
    IconVariable,
    IconFiles,
    IconDashboard,
    IconCode,
    IconAppWindow,
    IconListCheck
} from '@tabler/icons-react'

// constant
const icons = {
    IconUsersGroup,
    IconHierarchy,
    IconBuildingStore,
    IconKey,
    IconTool,
    IconLock,
    IconRobot,
    IconVariable,
    IconFiles,
    IconDashboard,
    IconCode,
    IconAppWindow,
    IconListCheck
}

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const dashboard = {
    id: 'dashboard',
    title: '',
    type: 'group',
    children: [
        {
            id: 'dashboard',
            title: 'Dashboard',
            type: 'item',
            url: '/dashboard',
            icon: icons.IconDashboard,
            breadcrumbs: true
        },
        {
            id: 'studio',
            title: 'Studio',
            type: 'item',
            url: '/studio',
            icon: icons.IconCode,
            breadcrumbs: true
        },
        {
            id: 'appbuilder',
            title: 'App Builder',
            type: 'item',
            url: '/appbuilder',
            icon: icons.IconAppWindow,
            breadcrumbs: true
        },
        {
            id: 'tasks',
            title: 'Tasks',
            type: 'item',
            url: '/tasks',
            icon: icons.IconListCheck,
            breadcrumbs: true
        },
        {
            id: 'chatflows',
            title: 'Chatflows',
            type: 'item',
            url: '/chatflows',
            icon: icons.IconHierarchy,
            breadcrumbs: true
        },
        {
            id: 'agentflows',
            title: 'Agentflows',
            type: 'item',
            url: '/agentflows',
            icon: icons.IconUsersGroup,
            breadcrumbs: true,
            isBeta: true
        },
        // Assistants menu item hidden
        // {
        //     id: 'assistants',
        //     title: 'Assistants',
        //     type: 'item',
        //     url: '/assistants',
        //     icon: icons.IconRobot,
        //     breadcrumbs: true
        // },
        {
            id: 'marketplaces',
            title: 'Marketplaces',
            type: 'item',
            url: '/marketplaces',
            icon: icons.IconBuildingStore,
            breadcrumbs: true
        },
        // Tools menu item hidden
        // {
        //     id: 'tools',
        //     title: 'Tools',
        //     type: 'item',
        //     url: '/tools',
        //     icon: icons.IconTool,
        //     breadcrumbs: true
        // },
        {
            id: 'credentials',
            title: 'Credentials',
            type: 'item',
            url: '/credentials',
            icon: icons.IconLock,
            breadcrumbs: true
        },
        // Variables menu item hidden
        // {
        //     id: 'variables',
        //     title: 'Variables',
        //     type: 'item',
        //     url: '/variables',
        //     icon: icons.IconVariable,
        //     breadcrumbs: true
        // },
        {
            id: 'apikey',
            title: 'API Keys',
            type: 'item',
            url: '/apikey',
            icon: icons.IconKey,
            breadcrumbs: true
        },
        {
            id: 'document-stores',
            title: 'Document Stores',
            type: 'item',
            url: '/document-stores',
            icon: icons.IconFiles,
            breadcrumbs: true
        }
    ]
}

export default dashboard
