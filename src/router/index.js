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
      component: () =>
        import(/* webpackChunkName: "about" */ "../views/About.vue"),
    },
    {
      path: "/land",
      name: "Land",
      component: () =>
        import(/* webpackChunkName: "land" */ "../views/Land.vue"),
      children: [
        {
          path: "",
          name: "MyLand",
          component: () =>
            import(/* webpackChunkName: "myland" */ "../views/MyLand.vue"),
        },
        {
          path: "import",
          name: "ImportLand",
          component: () =>
            import(
              /* webpackChunkName: "importland" */ "../views/ImportLand.vue"
            ),
        },
        {
          path: ":xCoord",
          name: "Parcel",
          component: () =>
            import(/* webpackChunkName: "parcel" */ "../views/Parcel.vue"),
          children: [
            {
              path: ":yCoord",
              name: "Parcel",
              component: () =>
                import(/* webpackChunkName: "parcel" */ "../views/Parcel.vue"),
            },
          ],
        },
      ],
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  if (!store.state.login.account) {
    await store.dispatch("restoreLogin");
  }
  if (store.state.login.account) {
    if (to.fullPath === "/") {
      next("/land");
    }
  } else if (to.fullPath.includes("/land")) {
    next("/");
  }

  next();
});

export default router;
