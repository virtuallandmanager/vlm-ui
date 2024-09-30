import Vue from 'vue'
import Router from 'vue-router'
import store from '@/store' // Make sure this import path is correct
import Home from '../views/Home.vue'
import Scenes from '../views/Scenes.vue'
import Scene from '../views/Scene.vue'
import { getRefreshToken } from '@/utils/authUtils'

Vue.use(Router)
const localeText = (text) => store.getters['i18n/navigation'](text)
const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '',
      name: localeText('Home'),
      component: Home,
    },
    {
      path: '/join',
      name: localeText('Registration'),
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "join" */ '../views/Registration.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/privacy',
      name: localeText('Privacy Settings'),
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "privacy" */ '../views/PrivacySettings.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/media',
      name: localeText('Media Library'),
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "media" */ '../views/MediaLibrary.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/streams',
      name: localeText('Video Streams'),
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "streams" */ '../views/VideoStreams.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/rent-stream',
      name: localeText('Video Stream Rental'),
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "rent-stream" */ '../views/VideoStreamPurchase.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/event/:eventId',
      name: localeText('Event'),
      component: () => import(/* webpackChunkName: "event" */ '../views/Event.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/events',
      name: localeText('Events'),
      component: () => import(/* webpackChunkName: "events" */ '../views/Events.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/giveaway/:giveawayId',
      name: localeText('Giveaway'),
      component: () => import(/* webpackChunkName: "giveaway" */ '../views/Giveaway.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/giveaways',
      name: localeText('Giveaways'),
      component: () => import(/* webpackChunkName: "giveaways" */ '../views/Giveaways.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/admin',
      name: localeText('Admin Panel'),
      component: () => import(/* webpackChunkName: "admin" */ '../views/AdminPanel.vue'),
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
      },
    },
    {
      path: '/scenes',
      name: localeText('Scenes'),
      component: Scenes,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/status',
      name: localeText('Status'),
      component: () => import(/* webpackChunkName: "status" */ '../views/Status.vue'),
    },
    {
      path: '/scene/:sceneId',
      name: localeText('Scene'),
      component: Scene,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/docs',
      name: localeText('Docs'),
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "docshome" */ '../docs/Home.vue'),
    },
    {
      path: '/docs/getting-started',
      name: localeText('Getting Started'),
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "docshome" */ '../docs/GettingStarted.vue'),
      props: (route) => ({ sceneId: route.query.sceneId, world: route.query.world }),
    },
    {
      path: '/organization',
      name: localeText('Organization'),
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "organization" */ '../views/Organization.vue'),
      meta: {
        requiresOrgAdmin: true,
      },
    },
    {
      path: '/profile',
      name: localeText('User Profile'),
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "userprofile" */ '../views/UserProfile.vue'),
      meta: {
        requiresAuth: true,
      },
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  try {
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
    const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin)
    const requiresOrgAdmin = to.matched.some((record) => record.meta.requiresOrgAdmin)
    const isAuthenticated = store.getters['auth/authenticated']

    if (requiresAuth && !isAuthenticated) {
      const refreshToken = getRefreshToken() // Check if we have a refresh token in localStorage

      // If there is a token, attempt to refresh the session
      if (refreshToken) {
        const refreshed = await store.dispatch('auth/refreshSession')
        if (refreshed) {
          // If session refreshed, allow the user to continue
          return next()
        } else {
          // If session could not be refreshed, redirect to login
          return next('/')
        }
      } else {
        // If no token at all, redirect to login
        return next('/')
      }
    } else if (to.path === '/' && isAuthenticated) {
      // If the user is authenticated and trying to access the home page, redirect them to the scenes page
      return next('/scenes')
    } else if (to.path === '/' && !isAuthenticated) {
      const refreshed = await store.dispatch('auth/refreshSession')
      // If the user is not authenticated and trying to access the home page, allow them to continue
      return refreshed ? next('/scenes') : next()
    }

    // Prevent redirect loops: if the user is authenticated and trying to access '/', send them to '/scenes'
    if (isAuthenticated && to.path === '/') {
      return next('/scenes')
    } else if (!isAuthenticated && to.path === '/') {
      return next()
    } else if (requiresAdmin) {
      const isAdmin = store.getters['user/isVLMAdmin']
      if (!isAdmin) {
        return next('/')
      }
    } else if (requiresOrgAdmin) {
      const isOrgAdmin = store.getters['user/isOrgAdmin']
      if (!isOrgAdmin) {
        return next('/')
      }
    }

    // If all checks pass, allow navigation
    next()
  } catch (error) {
    console.error('Navigation Error:', error)
    next('/') // Redirect to safe route in case of error
  }
})

export default router
