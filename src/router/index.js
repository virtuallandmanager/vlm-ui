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
      path: "/scenes",
      name: "Scenes",
      component: () => import(/* webpackChunkName: "scenes" */ "../views/MyScenes.vue"),
    },
    {
      path: "/scene/:sceneId",
      name: "Scene",
      component: () => import(/* webpackChunkName: "scene" */ "../views/Scene.vue"),
    },
    {
      path: "/welcome",
      name: "Welcome",
      component: () => import(/* webpackChunkName: "welcome" */ "../views/Welcome.vue"),
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  const connected = store.state.auth.connectedWallet,
    userInfo = store.state.user.userInfo;

  if (!connected) {
    // if not connected, always go to '/'
    if (to.fullPath !== "/") {
      return next("/");
    } else {
      await store.dispatch("auth/attemptRestoreSession");
    }
  } else if (to.fullPath === "/" && to.fullPath !== "/welcome" && userInfo?.registeredAt) {
    next("/welcome");
  } else if (to.fullPath === "/" && to.fullPath !== "/join" && !userInfo?.registeredAt) {
    // if connected and userInfo.registeredAt is not defined, go to '/join'
    next("/join");
  }
  next();
});

export default router;
