import { createRouter, createWebHistory } from 'vue-router'

// Layouts
import websiteLayout from '@/application/layout/websiteLayout'
import adminPanelLayout from '@/application/layout/AdminPanelLayout'
import journalistLayout from '@/application/layout/JournalistLayout'

const routes = [
    {
        path: '/',
        name: 'LandingPage',
        component: () => import('@/application/website/landing_page/frontPage'),
        meta: { layout: websiteLayout, isAuthenticated: true }
    },
    {
        path: '/:slug',
        name: 'CategoryPage',
        component: () => import('@/application/website/category_page/CategoryPage'),
        meta: { layout: websiteLayout, isAuthenticated: true }
    },
    { 
        path: "/tag/:slug", 
        component: () => import("@/application/website/tag_page/TagPage.vue"),
        meta: { layout: websiteLayout, isAuthenticated: true }
    },
    {
        path: '/news/:slug',
        name: 'NewsDetailsPage',
        component: () => import('@/application/website/news_details/NewsDetailsPage'),
        meta: { layout: websiteLayout, isAuthenticated: true }
    },
    {
        path: '/search',
        name: 'SearchPage',
        component: () => import('@/application/website/search_page/SearchPage'),
        meta: { layout: websiteLayout, isAuthenticated: true }
    },
    {
        path: '/login',
        name: 'AdminLoginPage',
        component: () => import('@/application/dashboard/auth/loginPage'),
        meta: { layout: websiteLayout, isAuthenticated: true }
    },
    {
        path: '/area',
        name: 'DivisionPage',
        component: () => import('@/application/website/divisionPage'),
        meta: { layout: websiteLayout, isAuthenticated: true }
    },
    {
        path: '/area/constituency',
        name: 'DivisionAreaPage',
        component: () => import('@/application/website/divisionAreaPage'),
        meta: { layout: websiteLayout, isAuthenticated: true }
    },
    {
        path: '/:pathmatch(.*)*',
        name: 'notFound',
        component: () => import('@/application/notFound/notFound'),
        meta: { layout: websiteLayout }
    },
    {
        path: '/dashboard',
        name: 'dashboardPage',
        component: () => import('@/application/dashboard/dashboardPage'),
        meta: { layout: adminPanelLayout, requiresAuth: false }
    },

    //Journalists 

    { 
        path: "/join", 
        component: () => import("@/application/website/journalist/JoinPage.vue"),
        meta: { layout: websiteLayout, isAuthenticated: true } 
    },
    { 
        path: "/journalist/login", 
        component: () => import("@/application/website/journalist/JournalistLogin.vue"),
        meta: { layout: websiteLayout, isAuthenticated: true } 
    },
    { 
        path: "/journalist", 
        component: () => import("@/application/website/journalist/JournalistDashboard.vue"),
        meta: { layout: journalistLayout, isAuthenticated: true } 
    },
    { 
        path: "/journalist/profile", 
        component: () => import("@/application/website/journalist/JournalistProfile.vue"),
        meta: { layout: journalistLayout, isAuthenticated: true } 
    },
    { 
        path: "/journalist/articles/new", 
        component: () => import("@/application/website/journalist/JournalistArticleForm.vue"),
        meta: { layout: journalistLayout, isAuthenticated: true } 
    },
    { 
        path: "/journalist/articles/:id/edit", 
        component: () => import("@/application/website/journalist/JournalistArticleForm.vue"),
        meta: { layout: journalistLayout, isAuthenticated: true } 
    },
    { 
        path: "/journalist/settings", 
        component: () => import("@/application/website/journalist/JournalistSettings.vue"),
        meta: { layout: journalistLayout, isAuthenticated: true } 
    },
    { 
        path: "/journalist/terms", 
        component: () => import("@/application/website/journalist/JournalistTerms.vue"),
        meta: { layout: journalistLayout, isAuthenticated: true } 
    },
    { 
        path: "/admin/journalist-applications", 
        component: () => import("@/application/website/journalist/AdminJournalistApplications.vue"),
        meta: { layout: websiteLayout, isAuthenticated: true } 
    },
    { 
        path: "/journalist/verify", 
        component: () => import("@/application/website/journalist/JournalistVerify.vue"),
        meta: { layout: websiteLayout, isAuthenticated: true } 
    },
    { 
        path: "/journalist/terms-conditions", 
        component: () => import("@/application/website/TermsPage.vue"),
        meta: { layout: websiteLayout, isAuthenticated: true } 
    },

    // Cases
    {
        path: '/case-list',
        name: 'CaseList',
        component: () => import('@/application/dashboard/cases/ListPage'),
        meta: { layout: adminPanelLayout, requiresAuth: false }
    },
    {
        path: '/create-case',
        name: 'CreateCase',
        component: () => import('@/application/dashboard/cases/CreatePage'),
        meta: { layout: adminPanelLayout, requiresAuth: false }
    },

    //Users
    {
        path: '/dashboard/user-list',
        name: 'UserList',
        component: () => import('@/application/dashboard/users/ListPage'),
        meta: { layout: adminPanelLayout, requiresAuth: false }
    },
    {
        path: '/create-user',
        name: 'CreateUser',
        component: () => import('@/application/dashboard/users/CreatePage'),
        meta: { layout: adminPanelLayout, requiresAuth: false }
    },
]

var router = createRouter({
    history: createWebHistory('/'),
    routes
})

// function authenticated() {
//     return true
// }
// router.beforeEach(async (to, from, next) => {
//     const isAuthenticated = to.matched.some(record => record.meta.isAuthenticated)

//     if (isAuthenticated) {
//         if (authenticated()) {
//             return next({ name: 'AdminLoginPage' });
//         }
//     }
    
//     next();
// });



export default router