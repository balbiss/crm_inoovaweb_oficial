<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useInboxesStore } from '../store/inboxes'
import { 
  Search, 
  Inbox, 
  MessageCircle, 
  Hash, 
  Tag, 
  BarChart2, 
  Settings,
  ChevronDown,
  Users,
  Home,
  Kanban,
  Briefcase,
  User,
  Code,
  RefreshCw,
  Bot,
  Calendar,
  MessageSquareQuote,
  Blocks,
  Workflow,
  Keyboard,
  Palette,
  FileText,
  ScrollText,
  Power,
  ChevronUp,
  Sun,
  Moon,
  Monitor,
  CornerDownLeft,
  ArrowUp,
  ArrowDown
} from '@lucide/vue'

const router = useRouter()
const isSettingsOpen = ref(false)
const showUserMenu = ref(false)
const autoOffline = ref(false)
const isConversasOpen = ref(true)

const inboxesStore = useInboxesStore()

// Dados reais do usuário logado
const currentUser = ref({ first_name: '', last_name: '', email: '', account_name: '' })

const loadUser = () => {
  try {
    const stored = localStorage.getItem('user')
    if (stored) {
      const parsed = JSON.parse(stored)
      currentUser.value = parsed
    }
  } catch (e) {
    console.error('Erro ao carregar dados do usuário', e)
  }
}

const userInitials = () => {
  const fn = currentUser.value.first_name || ''
  const ln = currentUser.value.last_name || ''
  return (fn[0] || '') + (ln[0] || '') || '?'
}

const userDisplayName = () => {
  const fn = currentUser.value.first_name || ''
  const ln = currentUser.value.last_name || ''
  return (fn + ' ' + ln).trim() || currentUser.value.email || 'Usuário'
}

const accountName = () => {
  return currentUser.value.account_name || 'Innovaweb CRM'
}

// Theme Command Palette State
const isThemePaletteOpen = ref(false)
const selectedThemeIndex = ref(0)
const themeSearchQuery = ref('')

const themes = [
  { id: 'light', name: 'Claro', icon: Sun },
  { id: 'dark', name: 'Escuro', icon: Moon },
  { id: 'system', name: 'Sistema', icon: Monitor }
]

const toggleSettings = () => {
  isSettingsOpen.value = !isSettingsOpen.value
}

const toggleConversas = () => {
  isConversasOpen.value = !isConversasOpen.value
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const openThemePalette = () => {
  showUserMenu.value = false
  isThemePaletteOpen.value = true
  selectedThemeIndex.value = 0
}

const applyTheme = (themeId) => {
  if (themeId === 'dark') {
    document.body.classList.add('dark-theme')
  } else if (themeId === 'light') {
    document.body.classList.remove('dark-theme')
  } else {
    // System logic: check matchMedia
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.body.classList.add('dark-theme')
    } else {
      document.body.classList.remove('dark-theme')
    }
  }
  localStorage.setItem('theme', themeId)
  isThemePaletteOpen.value = false
}

const handlePaletteKeydown = (e) => {
  if (!isThemePaletteOpen.value) {
    // Global Cmd+K to open
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      openThemePalette()
    }
    return
  }

  if (e.key === 'Escape') {
    isThemePaletteOpen.value = false
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    selectedThemeIndex.value = (selectedThemeIndex.value + 1) % themes.length
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    selectedThemeIndex.value = (selectedThemeIndex.value - 1 + themes.length) % themes.length
  } else if (e.key === 'Enter') {
    e.preventDefault()
    applyTheme(themes[selectedThemeIndex.value].id)
  }
}

onMounted(() => {
  loadUser()
  inboxesStore.fetchInboxes()
  window.addEventListener('keydown', handlePaletteKeydown)
  const savedTheme = localStorage.getItem('theme') || 'system'
  applyTheme(savedTheme)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handlePaletteKeydown)
})

const handleLogout = () => {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<template>
  <div class="chatwoot-layout">
    <!-- Primary Sidebar -->
    <aside class="sidebar">
      <!-- Workspace Header -->
      <div class="workspace-header">
        <div class="workspace-info">
          <div class="workspace-avatar">{{ (accountName()[0] || 'I').toUpperCase() }}</div>
          <span class="workspace-name">{{ accountName() }}</span>
        </div>
        <ChevronDown class="icon-sm" />
      </div>

      <!-- Search -->
      <div class="search-container">
        <div class="search-box">
          <Search class="icon-sm search-icon" />
          <input type="text" placeholder="Pesquisar..." />
          <span class="shortcut">/</span>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="nav-menu">
        <router-link to="/dashboard" class="nav-item">
          <BarChart2 class="icon" />
          <span>Dashboard</span>
        </router-link>

        <div class="settings-section">
          <div class="settings-header" @click="toggleConversas">
            <div class="left">
              <MessageCircle class="icon-sm" />
              <span>Conversas</span>
            </div>
            <ChevronDown class="icon-xs chevron-icon" :class="{ 'rotate': isConversasOpen }" />
          </div>
          <div class="settings-menu" v-show="isConversasOpen">
            <router-link to="/conversas" class="nav-item sub-item" exact-active-class="active">Todas as conversas</router-link>
            <router-link to="/conversas/mencoes" class="nav-item sub-item" exact-active-class="active">Menções</router-link>
            <router-link to="/conversas/participantes" class="nav-item sub-item" exact-active-class="active">Participantes</router-link>
            <router-link to="/conversas/nao-atendidas" class="nav-item sub-item" exact-active-class="active">Não atendidas</router-link>
          </div>
        </div>

        <router-link to="/contatos" class="nav-item">
          <Users class="icon" />
          <span>Contatos</span>
        </router-link>

        <router-link to="/imoveis" class="nav-item">
          <Home class="icon" />
          <span>Imóveis</span>
        </router-link>

        <router-link to="/funil" class="nav-item">
          <Kanban class="icon" />
          <span>Funil de Vendas</span>
        </router-link>

        <div class="nav-section">
          <h3 class="section-title">Canais</h3>
          <router-link 
            v-for="inbox in inboxesStore.inboxes" 
            :key="inbox.id"
            :to="'/conversas/inbox/' + inbox.id"
            class="nav-item sub-item"
            exact-active-class="active"
          >
            <img v-if="inbox.provider === 'whatsapp'" src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WA" class="icon-img" />
            <Hash v-else class="icon" />
            <span>{{ inbox.name }}</span>
          </router-link>
          
          <router-link to="/conversas/inbox/internal" class="nav-item sub-item" exact-active-class="active">
            <Hash class="icon" />
            <span>Chat Interno</span>
          </router-link>
        </div>

        <div class="nav-section">
          <h3 class="section-title">Etiquetas</h3>
          <a href="#" class="nav-item sub-item">
            <span class="tag-color" style="background: #8b5cf6"></span>
            <span>Alta Prioridade</span>
          </a>
          <a href="#" class="nav-item sub-item">
            <span class="tag-color" style="background: #ef4444"></span>
            <span>Fechamento</span>
          </a>
        </div>

        <div class="nav-section settings-section">
          <div class="settings-header" @click="toggleSettings">
            <div class="left">
              <Settings class="icon-sm" />
              <span>Configurações</span>
            </div>
            <ChevronDown class="icon-xs chevron-icon" :class="{ 'rotate': isSettingsOpen }" />
          </div>
          <div class="settings-menu" v-show="isSettingsOpen">
            <a href="#" class="nav-item sub-item active"><Briefcase class="icon-sm" /> Conta</a>
            <a href="#" class="nav-item sub-item"><User class="icon-sm" /> Agentes</a>
            <a href="#" class="nav-item sub-item"><Users class="icon-sm" /> Times</a>
            <router-link to="/settings/inboxes" class="nav-item sub-item"><Inbox class="icon-sm" /> Caixas de Entrada</router-link>
            <a href="#" class="nav-item sub-item"><Tag class="icon-sm" /> Etiquetas</a>
            <a href="#" class="nav-item sub-item"><Code class="icon-sm" /> Atributos Personalizados</a>
            <a href="#" class="nav-item sub-item"><RefreshCw class="icon-sm" /> Automação</a>
            <a href="#" class="nav-item sub-item"><Bot class="icon-sm" /> Robôs</a>
            <a href="#" class="nav-item sub-item"><Calendar class="icon-sm" /> Macros</a>
            <a href="#" class="nav-item sub-item"><MessageSquareQuote class="icon-sm" /> Respostas Prontas</a>
            <a href="#" class="nav-item sub-item"><Blocks class="icon-sm" /> Integrações</a>
            <a href="#" class="nav-item sub-item"><Workflow class="icon-sm" /> Fluxo de Conversa</a>
          </div>
        </div>
      </nav>

      <!-- Bottom Profile -->
      <div class="sidebar-bottom">
        
        <!-- User Popup Menu -->
        <div class="user-popup-menu" v-if="showUserMenu">
          <div class="menu-row">
            <span>Disponibilidade</span>
            <div class="status-selector">
              <div class="status-dot online"></div>
              <span>Online</span>
              <ChevronDown class="icon-xs" />
            </div>
          </div>
          
          <div class="menu-row">
            <span>Marcar offline automaticamente</span>
            <label class="toggle-switch">
              <input type="checkbox" v-model="autoOffline" />
              <span class="slider"></span>
            </label>
          </div>
          
          <div class="menu-divider"></div>
          
          <a href="#" class="menu-item"><Keyboard class="icon-sm" /> Atalhos do teclado</a>
          <a href="#" class="menu-item"><User class="icon-sm" /> Configurações do Perfil</a>
          <a href="#" class="menu-item" @click.prevent="openThemePalette"><Palette class="icon-sm" /> Alterar Tema</a>
          <a href="#" class="menu-item"><FileText class="icon-sm" /> Ler documentação</a>
          <a href="#" class="menu-item"><ScrollText class="icon-sm" /> Notas de versão</a>
          <a href="#" class="menu-item logout" @click="handleLogout"><Power class="icon-sm" /> Encerrar sessão</a>
        </div>

        <div class="user-profile" @click="toggleUserMenu" :class="{ 'active': showUserMenu }">
          <div class="avatar-wrapper">
            <div class="avatar">{{ userInitials() }}</div>
            <div class="status-indicator online"></div>
          </div>
          <div class="user-info">
            <span class="name">{{ userDisplayName() }}</span>
            <span class="email">{{ currentUser.email }}</span>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="main-content">
      <router-view></router-view>
    </main>

    <!-- Theme Command Palette -->
    <div class="palette-overlay" v-if="isThemePaletteOpen" @click.self="isThemePaletteOpen = false">
      <div class="palette-modal">
        <div class="palette-header">
          <input type="text" v-model="themeSearchQuery" placeholder="Pesquisar ou pular para" autofocus>
        </div>
        <div class="palette-body">
          <div class="palette-group">Tema</div>
          <div 
            class="palette-item" 
            v-for="(theme, index) in themes" 
            :key="theme.id"
            :class="{ 'active': index === selectedThemeIndex }"
            @click="applyTheme(theme.id)"
            @mouseover="selectedThemeIndex = index"
          >
            <component :is="theme.icon" class="icon-sm" />
            <span>{{ theme.name }}</span>
          </div>
        </div>
        <div class="palette-footer">
          <div class="shortcut-group">
            <kbd><CornerDownLeft class="icon-xs" /></kbd>
            <span>to select</span>
          </div>
          <div class="shortcut-group">
            <kbd><ArrowDown class="icon-xs" /></kbd>
            <kbd><ArrowUp class="icon-xs" /></kbd>
            <span>to navigate</span>
          </div>
          <div class="shortcut-group">
            <kbd>esc</kbd>
            <span>to close</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chatwoot-layout {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  background-color: var(--bg-primary);
}

.sidebar {
  width: 256px;
  background-color: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.workspace-header {
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  
  &:hover {
    background-color: var(--bg-hover);
  }

  .workspace-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .workspace-avatar {
    width: 24px;
    height: 24px;
    background: var(--primary);
    color: var(--text-inverse);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: bold;
  }

  .workspace-name {
    font-weight: 600;
    font-size: 0.95rem;
    color: var(--text-main);
  }
}

.icon-sm {
  width: 16px;
  height: 16px;
  color: #6b7280;
}
.icon-xs {
  width: 14px;
  height: 14px;
  color: #6b7280;
}

.search-container {
  padding: 0 1rem 1rem 1rem;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;

  .search-icon {
    position: absolute;
    left: 10px;
  }

  input {
    width: 100%;
    padding: 0.5rem 0.5rem 0.5rem 2.2rem;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    font-size: 0.85rem;
    color: var(--text-main);
    outline: none;
    
    &:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 2px var(--input-focus);
    }
  }

  .shortcut {
    position: absolute;
    right: 10px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 0 4px;
    font-size: 0.7rem;
    color: var(--text-muted);
  }
}

.nav-menu {
  flex: 1;
  overflow-y: auto;
  padding: 0 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  color: var(--text-main);
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 2px;
  text-decoration: none;
  transition: background-color 0.1s;

  .icon {
    width: 18px;
    height: 18px;
    color: var(--text-muted);
  }

  .icon-img {
    width: 18px;
    height: 18px;
  }

  &:hover {
    background-color: var(--bg-hover);
  }

  &.router-link-active {
    background-color: var(--input-focus);
    color: var(--primary);
    
    .icon {
      color: var(--primary);
    }
  }
}

.nav-section {
  margin-top: 1.5rem;

  .section-title {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #9ca3af;
    font-weight: 600;
    padding: 0 0.75rem;
    margin-bottom: 0.5rem;
  }

  .sub-item {
    font-weight: 400;
    font-size: 0.85rem;
  }

  .tag-color {
    width: 10px;
    height: 10px;
    border-radius: 3px;
    display: inline-block;
  }
}

.settings-section {
  .settings-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0.75rem;
    color: var(--text-main);
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    
    .left {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .chevron-icon {
      transition: transform 0.2s ease;
      &.rotate {
        transform: rotate(180deg);
      }
    }
  }

  .settings-menu {
    margin-top: 0.25rem;
    padding-left: 0.5rem;
    border-left: 1px solid var(--border-color);
    margin-left: 1rem;
    display: flex;
    flex-direction: column;
    gap: 2px;
    
    .sub-item {
      padding: 0.4rem 0.75rem;
      font-size: 0.85rem;
      color: var(--text-main);
      opacity: 0.8;
      
      &.active {
        background-color: var(--bg-hover);
        color: var(--text-main);
        opacity: 1;
        font-weight: 500;
      }
    }
  }
}

.sidebar-bottom {
  margin-top: auto;
  position: relative;
}

.user-popup-menu {
  position: absolute;
  bottom: calc(100% + 0.5rem);
  left: 0.5rem;
  right: 0.5rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px var(--shadow-color), 0 4px 6px -2px var(--shadow-sm);
  padding: 0.5rem 0;
  z-index: 50;
}

.menu-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  font-size: 0.85rem;
  color: var(--text-main);

  .status-selector {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--bg-tertiary);
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      &.online { background: #10b981; }
    }
  }
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;

  input {
    opacity: 0;
    width: 0;
    height: 0;

    &:checked + .slider {
      background-color: #1f93ff;
    }

    &:checked + .slider:before {
      transform: translateX(16px);
    }
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: #ccc;
    transition: .4s;
    border-radius: 34px;

    &:before {
      position: absolute;
      content: "";
      height: 16px;
      width: 16px;
      left: 2px;
      bottom: 2px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }
  }
}

.menu-divider {
  height: 1px;
  background: var(--border-color);
  margin: 0.5rem 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  color: var(--text-main);
  text-decoration: none;
  font-size: 0.85rem;
  transition: background 0.2s;

  &:hover {
    background: var(--bg-hover);
  }

  .icon-sm {
    color: var(--text-main);
    opacity: 0.8;
  }

  &.logout {
    margin-top: 0.5rem;
    color: #ef4444;
  }
}

.user-profile {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-top: 1px solid var(--border-color);
  cursor: pointer;
  transition: background 0.2s;
  gap: 0.75rem;

  &:hover, &.active {
    background: var(--bg-hover);
  }

  .avatar-wrapper {
    position: relative;
  }

  .avatar {
    width: 32px;
    height: 32px;
    background: var(--input-focus);
    color: var(--primary);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .status-indicator {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 2px solid var(--bg-secondary);
    &.online { background: #10b981; }
  }

  .user-info {
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .name {
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--text-main);
    }

    .email {
      font-size: 0.75rem;
      color: var(--text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  height: 100%;
}

.content-area {
  flex: 1;
  background: var(--bg-primary);
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.palette-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 10vh;
}

.palette-modal {
  width: 100%;
  max-width: 600px;
  background: var(--bg-secondary);
  border-radius: 8px;
  box-shadow: 0 20px 25px -5px var(--shadow-color), 0 10px 10px -5px var(--shadow-sm);
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .palette-header {
    padding: 1rem;
    border-bottom: 1px solid var(--border-color);

    input {
      width: 100%;
      background: transparent;
      border: none;
      outline: none;
      font-size: 1.1rem;
      color: var(--text-main);
      &::placeholder {
        color: var(--text-muted);
      }
    }
  }

  .palette-body {
    padding: 0.5rem 0;

    .palette-group {
      padding: 0.5rem 1rem;
      font-size: 0.75rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .palette-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
      cursor: pointer;
      color: var(--text-main);
      font-size: 0.9rem;

      &.active {
        background: var(--primary);
        color: var(--text-inverse);
        
        .icon-sm {
          color: var(--text-inverse);
        }
      }

      .icon-sm {
        color: var(--text-muted);
      }
    }
  }

  .palette-footer {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1rem;
    border-top: 1px solid var(--border-color);
    background: var(--bg-tertiary);
    font-size: 0.75rem;
    color: var(--text-muted);

    .shortcut-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      kbd {
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        padding: 0.1rem 0.4rem;
        border-radius: 4px;
        box-shadow: 0 1px 0 var(--border-color);
        font-family: inherit;
        display: flex;
        align-items: center;
      }
    }
  }
}
</style>
