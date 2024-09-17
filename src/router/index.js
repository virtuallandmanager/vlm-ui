import Vue from 'vue'
import Router from 'vue-router'
import store from '@/store' // Make sure this import path is correct
import Home from '../views/Home.vue'
import Scenes from '../views/Scenes.vue'
import Scene from '../views/Scene.vue'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '',
      name: 'Home',
      component: Home,
    },
    {
      path: '/about',
      name: 'About',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ '../views/About.vue'),
    },
    {
      path: '/join',
      name: 'Registration',
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
      name: 'Privacy Settings',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "privacy" */ '../views/PrivacySettings.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    // {
    //   path: "/events",
    //   name: "Events",
    //   // route level code-splitting
    //   // this generates a separate chunk (about.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import(/* webpackChunkName: "events" */ "../views/Events.vue"),
    // },
    {
      path: '/media',
      name: 'Media Library',
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
      name: 'Video Streams',
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
      name: 'Video Stream Rental',
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
      name: 'Event',
      component: () => import(/* webpackChunkName: "event" */ '../views/Event.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/events',
      name: 'Events',
      component: () => import(/* webpackChunkName: "events" */ '../views/Events.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/giveaway/:giveawayId',
      name: 'Giveaway',
      component: () => import(/* webpackChunkName: "giveaway" */ '../views/Giveaway.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/giveaways',
      name: 'Giveaways',
      component: () => import(/* webpackChunkName: "giveaways" */ '../views/Giveaways.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/admin',
      name: 'AdminPanel',
      component: () => import(/* webpackChunkName: "admin" */ '../views/AdminPanel.vue'),
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
      },
    },
    {
      path: '/scenes',
      name: 'Scenes',
      component: Scenes,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/status',
      name: 'Status',
      component: () => import(/* webpackChunkName: "status" */ '../views/Status.vue'),
    },
    {
      path: '/scene/:sceneId',
      name: 'Scene',
      component: Scene,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/scene/demo',
      name: 'Demo Scene',
      component: () => import(/* webpackChunkName: "demo" */ '../views/Demo.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/docs',
      name: 'Docs',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "docshome" */ '../docs/Home.vue'),
    },
    {
      path: '/docs/getting-started',
      name: 'Getting Started',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "docshome" */ '../docs/GettingStarted.vue'),
      props: (route) => ({ sceneId: route.query.sceneId, world: route.query.world }),
    },
    {
      path: '/profile',
      name: 'User Profile',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "docshome" */ '../views/UserProfile.vue'),
      meta: {
        requiresAuth: true,
      },
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  try {
    if (to.path !== '/' && to.path === from.path) {
      console.log('Navigating to the same route: ', to.path)
      return
    }
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
    const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin)
    const isAuthenticated = () => {
      return store.getters['auth/authenticated']
    }
    const unregistered = () => {
      return store.getters['user/unregistered']
    }
    const isAdmin = store.getters['user/isVLMAdmin']

    if (requiresAuth && !isAuthenticated()) {
      await store.dispatch('auth/refreshSession')
    }

    if (isAuthenticated() && unregistered() && to.path !== '/join') {
      next('/join')
      return
    } else if (isAuthenticated() && !unregistered() && to.path === '/join') {
      next('/scenes')
      return
    } else if (!isAuthenticated() && to.path === '/join') {
      next('/')
      return
    } else if (isAuthenticated() && to.path === '/') {
      next('/scenes')
      return
    }

    if (requiresAuth && !isAuthenticated()) {
      next('/') // Redirect to the login page if the route requires authentication and the user is not authenticated
      return
    } else if (requiresAdmin && !isAdmin) {
      next('/') // Redirect to the login page if the route requires admin authentication and the user is not an admin
      return
    } else {
      next() // Continue to the next route
    }
  } catch (error) {
    console.log(error)
  }
})

export default router
