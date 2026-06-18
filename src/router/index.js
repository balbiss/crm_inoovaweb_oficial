import { createRouter, createWebHistory } from 'vue-router'
import DashboardLayout from '../views/DashboardLayout.vue'

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
      component: () => import('../views/Login.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/Register.vue')
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
          component: () => import('../views/Dashboard.vue')
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
          component: () => import('../views/Properties.vue')
        },
        {
          path: 'imoveis/novo',
          name: 'imoveis_novo',
          component: () => import('../views/PropertyForm.vue')
        },
        {
          path: 'imoveis/:id/editar',
          name: 'imoveis_editar',
          component: () => import('../views/PropertyForm.vue')
        },
        {
          path: 'condominios',
          name: 'condominios',
          component: () => import('../views/Condominiums.vue')
        },
        {
          path: 'condominios/novo',
          name: 'condominios_novo',
          component: () => import('../views/CondominiumForm.vue')
        },
        {
          path: 'condominios/:id/editar',
          name: 'condominios_editar',
          component: () => import('../views/CondominiumForm.vue')
        },
        {
          path: 'agendamentos',
          name: 'agendamentos',
          component: () => import('../views/Appointments.vue')
        },
        {
          path: 'agentes',
          name: 'agentes',
          component: () => import('../views/Agents.vue')
        },
        {
          path: 'agentes/novo',
          name: 'agentes_novo',
          component: () => import('../views/AgentForm.vue')
        },
        {
          path: 'agentes/:id/editar',
          name: 'agentes_editar',
          component: () => import('../views/AgentForm.vue')
        },
        {
          path: 'agendamentos/novo',
          name: 'agendamentos_novo',
          component: () => import('../views/AppointmentForm.vue')
        },
        {
          path: 'agendamentos/:id/editar',
          name: 'agendamentos_editar',
          component: () => import('../views/AppointmentForm.vue')
        },
        {
          path: 'funil',
          name: 'funil',
          component: () => import('../views/Kanban.vue')
        },
        {
          path: 'settings/inboxes',
          name: 'SettingsInboxes',
          component: () => import('../views/SettingsInboxes.vue')
        },
        {
          path: 'settings/inboxes/:id',
          name: 'settings_inbox_detail',
          component: () => import('../views/SettingsInboxDetail.vue')
        },
        {
          path: 'settings/account',
          name: 'SettingsAccount',
          component: () => import('../views/settings/Account.vue')
        },
        {
          path: 'settings/tags',
          name: 'SettingsTags',
          component: () => import('../views/settings/Tags.vue')
        },
        {
          path: 'settings/inboxes/new',
          name: 'settings_inboxes_new',
          component: () => import('../views/NewInbox.vue')
        },
        {
          path: 'suporte',
          name: 'suporte',
          component: () => import('../views/Support.vue')
        },
        {
          path: 'relatorios',
          name: 'relatorios',
          component: () => import('../views/Reports.vue')
        }
      ]
    },
    {
      path: '/admin',
      component: () => import('../views/admin/AdminLayout.vue'),
      children: [
        {
          path: '',
          redirect: '/admin/dashboard'
        },
        {
          path: 'dashboard',
          name: 'admin_dashboard',
          component: () => import('../views/admin/AdminDashboard.vue')
        },
        {
          path: 'empresas',
          name: 'admin_empresas',
          component: () => import('../views/admin/AdminCompanies.vue')
        },
        {
          path: 'integracoes',
          name: 'admin_integracoes',
          component: () => import('../views/admin/AdminIntegrations.vue')
        },
        {
          path: 'suporte',
          name: 'admin_suporte',
          component: () => import('../views/admin/AdminSupport.vue')
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('auth_token')
  let user = null
  try {
    user = JSON.parse(localStorage.getItem('user'))
  } catch (e) {}

  if (to.name !== 'login' && to.name !== 'register' && to.name !== 'forgot-password' && to.name !== 'reset-password' && !isAuthenticated) {
    next({ name: 'login' })
  } else if (to.path.startsWith('/admin') && (!user || user.role !== 'admin')) {
    next({ name: 'dashboard' }) // Redireciona usuários não-admin para o painel normal
  } else {
    next()
  }
})

export default router
