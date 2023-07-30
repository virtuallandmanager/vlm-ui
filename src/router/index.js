import Vue from "vue";
import Router from "vue-router";
import store from "../store";
import Home from "../views/Home.vue";

Vue.use(Router);

const router = new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "",
      name: "Home",
      component: Home,
    },
    {
      path: "/about",
      name: "About",
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ "../views/About.vue"),
    },
    {
      path: "/join",
      name: "Registration",
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "join" */ "../views/Registration.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/privacy",
      name: "PrivacySettings",
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "privacy" */ "../views/PrivacySettings.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/welcome",
      name: "Welcome",
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "triage" */ "../views/Welcome.vue"),
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
      path: "/media",
      name: "Media Library",
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ "../views/MediaLibrary.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/event/:eventId",
      name: "Event",
      component: () => import(/* webpackChunkName: "event" */ "../views/Event.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/events",
      name: "Events",
      component: () => import(/* webpackChunkName: "events" */ "../views/Events.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/giveaway/:giveawayId",
      name: "Giveaway",
      component: () => import(/* webpackChunkName: "giveaway" */ "../views/Giveaway.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/giveaways",
      name: "Giveaways",
      component: () => import(/* webpackChunkName: "giveaways" */ "../views/Giveaways.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/admin",
      name: "Admin Panel",
      component: () => import(/* webpackChunkName: "events" */ "../views/AdminPanel.vue"),
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
      },
    },
    {
      path: "/scenes",
      name: "Scenes",
      component: () => import(/* webpackChunkName: "scenes" */ "../views/Scenes.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/scene/:sceneId",
      name: "Scene",
      component: () => import(/* webpackChunkName: "scene" */ "../views/Scene.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/demo",
      name: "Demo Mode",
      component: () => import(/* webpackChunkName: "demo" */ "../views/Demo.vue"),
      meta: {
        requiresAuth: true,
      },
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  try {
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
    const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin);
    const isAuthenticated = store.getters["auth/authenticated"];
    const attemptedRestore = store.getters["auth/attemptedRestore"];
    const isAdmin = store.getters["admin/isVLMAdmin"];
    // Implement your own authentication check

    if (!isAuthenticated && !attemptedRestore) {
      return await store.dispatch("auth/attemptRestoreSession");
    }

    if (requiresAuth && !isAuthenticated) {
      // next("/"); // Redirect to the login page if the route requires authentication and the user is not authenticated
    } else if (requiresAdmin && !isAdmin) {
      // next("/"); // Redirect to the login page if the route requires admin authentication and the user is not an admin
    } else {
      next(); // Continue to the next route
    }
  } catch (error) {
    console.log(error);
  }
});

export default router;
