import { createRouter, createWebHashHistory } from "vue-router";
import { handleHotUpdate, routes } from "vue-router/auto-routes";

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    ...routes,
    {
      path: "/",
      component: () => import("./pages/profiles/index.vue"),
    },
  ],
});

// This will update routes at runtime without reloading the page
if (import.meta.hot) {
  handleHotUpdate(router);
}
