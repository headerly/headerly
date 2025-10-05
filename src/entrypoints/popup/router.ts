import { createRouter, createWebHashHistory } from "vue-router";
import { handleHotUpdate, routes } from "vue-router/auto-routes";
import { useProfilesStore } from "./stores/useProfilesStore";

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    ...routes,
    {
      path: "/",
      redirect: "/profiles/",
    },
  ],
});

router.beforeEach(async (to, _, next) => {
  // Prevent obvious FOUC when entering the profiles page.
  if (to.name === "/profiles/") {
    const profilesStore = useProfilesStore();
    await profilesStore.ready;
  }
  next();
});

// This will update routes at runtime without reloading the page
if (import.meta.hot) {
  handleHotUpdate(router);
}
