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
      component: () => import(/* webpackChunkName: "about" */ "../views/Registration.vue"),
    },
    {
      path: "/events",
      name: "Events",
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ "../views/About.vue"),
    },
    {
      path: "/scenes",
      name: "Scenes",
      component: () => import(/* webpackChunkName: "land" */ "../views/MyScenes.vue"),
    },
    {
      path: "/scene/:sceneId",
      name: "Scene",
      component: () => import(/* webpackChunkName: "land" */ "../views/Scene.vue"),
    },
    {
      path: "/welcome",
      name: "Welcome",
      component: () => import(/* webpackChunkName: "land" */ "../views/Welcome.vue"),
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  const connected = store.state.auth.connectedWallet && store.state.auth.sessionToken,
    loggingIn = store.state.auth.loggingIn,
    userInfo = store.state.user.userInfo;

  if (!connected && !loggingIn) {
    await store.dispatch("auth/restoreSession");
  }
  if ((!connected || userInfo?.roles?.length) && to.fullPath === "/join") {
    return next("/");
  } else if (connected && (to.fullPath === "" || to.fullPath === "/")) {
    return next("/welcome");
  } else if (!connected && to.fullPath.includes("/scene")) {
    return next("/");
  }

  next();
});

export default router;
