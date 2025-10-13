import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Results from '../views/Results.vue'
import AdminLogin from '../views/admin/Login.vue'
import AdminDashboard from '../views/admin/Dashboard.vue'
import AdminCandidates from '../views/admin/Candidates.vue'
import AdminVotingCodes from '../views/admin/VotingCodes.vue'
import AdminResults from '../views/admin/Results.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/results',
    name: 'Results',
    component: Results
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: AdminLogin
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/candidates',
    name: 'AdminCandidates',
    component: AdminCandidates,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/voting-codes',
    name: 'AdminVotingCodes',
    component: AdminVotingCodes,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/results',
    name: 'AdminResults',
    component: AdminResults,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard for admin routes
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      next('/admin/login')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router