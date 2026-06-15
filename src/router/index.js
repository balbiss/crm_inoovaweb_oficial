import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import DashboardLayout from '../views/DashboardLayout.vue'
import Dashboard from '../views/Dashboard.vue'
import Properties from '../views/Properties.vue'
import SettingsInboxes from '../views/SettingsInboxes.vue'
import SettingsAccount from '../views/settings/Account.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/register',
      name: 'register',
      component: Register
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('../views/ForgotPassword.vue')
    },
    {
      path: '/users/password/edit',
      name: 'reset-password',
      component: () => import('../views/ResetPassword.vue')
    },
    {
      path: '/',
      component: DashboardLayout,
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: Dashboard
        },
        {
          path: 'conversas',
          name: 'conversas',
          component: () => import('../views/Conversas.vue')
        },
        {
          path: 'conversas/inbox/:inboxId',
          name: 'conversas_inbox',
          component: () => import('../views/Conversas.vue')
        },
        {
          path: 'conversas/:filter',
          name: 'conversas_filter',
          component: () => import('../views/Conversas.vue')
        },
        {
          path: 'contatos',
          name: 'contatos',
          component: () => import('../views/Contacts.vue')
        },
        {
          path: 'contatos/:id',
          name: 'contact_details',
          component: () => import('../views/ContactDetails.vue')
        },
        {
          path: 'imoveis',
          name: 'imoveis',
          component: Properties
        },
        {
          path: 'funil',
          name: 'funil',
          component: () => import('../views/Kanban.vue')
        },
        {
          path: 'settings/inboxes',
          name: 'SettingsInboxes',
          component: SettingsInboxes
        },
        {
          path: 'settings/account',
          name: 'SettingsAccount',
          component: SettingsAccount
        },
        {
          path: 'settings/inboxes/new',
          name: 'settings_inboxes_new',
          component: () => import('../views/NewInbox.vue')
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('auth_token')
  if (to.name !== 'login' && to.name !== 'register' && to.name !== 'forgot-password' && to.name !== 'reset-password' && !isAuthenticated) {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router
