import { createRouter, createWebHistory, Router, RouteRecordRaw } from 'vue-router';
const Layout = () => import('../layout/Layout.vue');
const Home = () => import('@/views/Home.vue');
// 路由白名单
// 基本路由
const base: string = import.meta.env.VITE_APP_BASE_PATH
// 路由菜单
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/index',
  },
  {
    path: '/',
    name: 'Home',
    component: Layout,
    children: [
      { 
        path: '/index', 
        name: 'index', 
        component: Home,
      },
      {
        path: 'detail',
        name: 'Detail',
        component: () => import('@/views/Detail.vue'),
        children: [
          {
            path: 'dataset',
            name: 'dataset',
            component: () => import('@/views/Dataset.vue'),
          }
        ]
      }
    ]
  }
]

const router: Router = createRouter({
  history: createWebHistory(base),
  routes,
})

router.beforeEach((to, from, next) => {
  // if (to.meta.hasAuthority) {
  //   ElMessage.warning(`无访问权限，请检查是否登录`)
  //   return {
  //     path: '/login',
  //     query: { redirect: to.fullPath },
  //   }
  // }
  next()
})

export default router 