import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'



const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/workflows',
      name: 'workflows.index',
      component: () => import("../views/Workflows/Index.vue"),

    },

    {
      path: "/workflows/create",  // Fixed with leading slash
      name: "workflows.create",
      component: () => import("../views/Workflows/Create.vue"),
    },
    ,

    {
      path: "/workflows/update/:id",  // Fixed with leading slash
      name: "workflows.Update",
      component: () => import("../views/Workflows/Update.vue"),
    },
    {
      path: "/workflows/:id",
      name: "workflows.show",
      component: () => import("../views/Workflows/Show.vue"),

    },
  ],
})

export default router
