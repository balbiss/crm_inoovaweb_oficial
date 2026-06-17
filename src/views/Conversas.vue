<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useConversationsStore } from '../store/conversations'
import ConversationFilterPopover from '../components/ConversationFilterPopover.vue'
import ConversationSortPopover from '../components/ConversationSortPopover.vue'
import ConversationStatusDropdown from '../components/ConversationStatusDropdown.vue'
import ConversationMoreOptionsDropdown from '../components/ConversationMoreOptionsDropdown.vue'
import { 
  Filter, 
  ArrowDownUp, 
  CheckCircle,
  MoreVertical,
  Paperclip,
  Smile,
  CheckCheck,
  Send,
  Info,
  X,
  ExternalLink,
  Mail,
  Phone,
  Copy,
  Users,
  Building,
  MessageCircle,
  Edit2,
  GitMerge,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  ChevronDown,
  BotOff,
  Bot
} from '@lucide/vue'

import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'

import EditContactModal from '../components/EditContactModal.vue'
import MergeContactModal from '../components/MergeContactModal.vue'
import DeleteContactModal from '../components/DeleteContactModal.vue'
import api from '../api'

const store = useConversationsStore()
const route = useRoute()
const newMessageText = ref('')
const isPrivateMessage = ref(false)
const isEmojiPickerOpen = ref(false)

const toggleEmojiPicker = () => {
  isEmojiPickerOpen.value = !isEmojiPickerOpen.value
}

const onSelectEmoji = (emoji) => {
  newMessageText.value += emoji.i
}

const closeEmojiPicker = () => {
  isEmojiPickerOpen.value = false
}

const formatMessageTime = (isoString) => {
  if (!isoString || !isoString.includes('T')) return isoString
  const date = new Date(isoString)
  const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const dayStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')
  return `${dayStr}, ${timeStr}`
}

const isEditModalOpen = ref(false)
const isMergeModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isFilterPopoverOpen = ref(false)
const isSortPopoverOpen = ref(false)

const toggleFilterPopover = () => {
  isFilterPopoverOpen.value = !isFilterPopoverOpen.value
  isSortPopoverOpen.value = false
}

const toggleSortPopover = () => {
  isSortPopoverOpen.value = !isSortPopoverOpen.value
  isFilterPopoverOpen.value = false
}

const applyAdvancedFilters = (filters) => {
  store.setAdvancedFilters(filters)
}

const openEditModal = () => {
  if (store.activeConversation?.contact) {
    isEditModalOpen.value = true
  }
}

const openMergeModal = () => {
  if (store.activeConversation?.contact) {
    isMergeModalOpen.value = true
  }
}

const openDeleteModal = () => {
  if (store.activeConversation?.contact) {
    isDeleteModalOpen.value = true
  }
}

const handleContactDeleted = () => {
  // Conversas store will automatically set activeConversationId to null
  // No extra action needed here unless we want to show a toast
}

const focusMessageInput = () => {
  const input = document.querySelector('.chat-input-area textarea')
  if (input) {
    input.focus()
  }
}

const messagesContainerRef = ref(null)

const scrollToBottom = async () => {
  await nextTick()
  const doScroll = () => {
    if (messagesContainerRef.value) {
      messagesContainerRef.value.scrollTop = messagesContainerRef.value.scrollHeight
    } else {
      const container = document.querySelector('.chat-messages')
      if (container) container.scrollTop = container.scrollHeight
    }
  }
  
  doScroll()
  setTimeout(doScroll, 50)
  setTimeout(doScroll, 300)
  setTimeout(doScroll, 800)
}

watch(() => store.activeConversationId, (newVal) => {
  if (newVal) {
    scrollToBottom()
  }
})

watch(() => store.activeConversation?.messages?.length, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    scrollToBottom()
  }
})

const handleNewMessage = (e) => {
  if (e.detail && e.detail.conversationId === store.activeConversationId) {
    scrollToBottom()
  }
}

const closeFilterPopover = () => {
  isFilterPopoverOpen.value = false
  isSortPopoverOpen.value = false
}

onMounted(() => {
  store.fetchConversations()
  if (route.params.inboxId) {
    store.setSidebarInboxId(route.params.inboxId)
  } else {
    store.setSidebarFilter(route.params.filter || 'all')
  }
  window.addEventListener('new-message', handleNewMessage)
  document.addEventListener('click', closeEmojiPicker)
  document.addEventListener('click', closeFilterPopover)
  store.setupWebSocket()
  scrollToBottom()
})

onUnmounted(() => {
  window.removeEventListener('new-message', handleNewMessage)
  document.removeEventListener('click', closeEmojiPicker)
  document.removeEventListener('click', closeFilterPopover)
})

watch(() => route.params.filter, (newFilter) => {
  if (newFilter) {
    store.setSidebarFilter(newFilter)
  } else if (!route.params.inboxId) {
    store.setSidebarFilter('all')
  }
})

watch(() => route.params.inboxId, (newInboxId) => {
  if (newInboxId) {
    store.setSidebarInboxId(newInboxId)
  }
})

const fileInput = ref(null)
const selectedFile = ref(null)
const selectedFilePreview = ref(null)

const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
    if (file.type.startsWith('image/')) {
      selectedFilePreview.value = URL.createObjectURL(file)
    } else {
      selectedFilePreview.value = null
    }
  }
}

const clearSelectedFile = () => {
  if (selectedFilePreview.value) {
    URL.revokeObjectURL(selectedFilePreview.value)
    selectedFilePreview.value = null
  }
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const handleSendMessage = () => {
  if (newMessageText.value.trim() || selectedFile.value) {
    store.sendMessage(newMessageText.value, isPrivateMessage.value, selectedFile.value)
    newMessageText.value = ''
    clearSelectedFile()
    scrollToBottom()
  }
}

// IA pause status
const aiPauseStatus = ref({ paused: false, remaining_seconds: 0 })
const aiStatusInterval = ref(null)

const fetchAiStatus = async () => {
  const convId = store.activeConversationId
  if (!convId) return
  try {
    const res = await api.get(`/conversations/${convId}/ai_status`)
    aiPauseStatus.value = res.data
  } catch (e) {
    aiPauseStatus.value = { paused: false, remaining_seconds: 0 }
  }
}

const resumeAi = async () => {
  const convId = store.activeConversationId
  if (!convId) return
  try {
    await api.post(`/conversations/${convId}/resume_ai`)
    aiPauseStatus.value = { paused: false, remaining_seconds: 0 }
  } catch (e) {
    console.error('Erro ao reativar IA:', e)
  }
}

const formatAiRemaining = (seconds) => {
  if (!seconds || seconds <= 0) return '0 min'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m} min${s > 0 ? ` ${s}s` : ''}` : `${s}s`
}

watch(() => store.activeConversationId, (newId) => {
  clearInterval(aiStatusInterval.value)
  aiPauseStatus.value = { paused: false, remaining_seconds: 0 }
  if (newId) {
    fetchAiStatus()
    aiStatusInterval.value = setInterval(fetchAiStatus, 15000)
  }
})

onUnmounted(() => {
  clearInterval(aiStatusInterval.value)
})
</script>

<template>
  <div class="conversations-container">
    <!-- Middle Pane: Conversation List -->
    <div class="conv-list-pane">
      <div class="list-header">
        <div class="header-top">
          <h2 style="text-transform: capitalize;">{{ route.params.filter ? route.params.filter.replace('-', ' ') : 'Todas as conversas' }} <span class="badge">Abertas</span></h2>
          <div class="actions" style="position: relative; display: flex; gap: 0.5rem;">
            <div style="position: relative;">
              <button class="icon-btn" @click.stop="toggleFilterPopover"><Filter class="icon" /></button>
              <ConversationFilterPopover 
                :is-open="isFilterPopoverOpen" 
                :initial-filters="store.advancedFilters"
                @close="isFilterPopoverOpen = false" 
                @apply="applyAdvancedFilters" 
              />
            </div>
            
            <div style="position: relative;">
              <button class="icon-btn" @click.stop="toggleSortPopover"><ArrowDownUp class="icon" /></button>
              <ConversationSortPopover
                :is-open="isSortPopoverOpen"
                @close="isSortPopoverOpen = false"
              />
            </div>
          </div>
        </div>
        
        <div class="tabs">
          <button 
            :class="['tab', { active: store.currentFilter === 'minhas' }]"
            @click="store.setFilter('minhas')"
          >
            Minhas <span class="count">{{ store.sidebarFilteredConversations.filter(c => c.assignee === store.currentUser.name).length }}</span>
          </button>
          <button 
            :class="['tab', { active: store.currentFilter === 'nao-atribuidos' }]"
            @click="store.setFilter('nao-atribuidos')"
          >
            Não atribuídas <span class="count">{{ store.sidebarFilteredConversations.filter(c => !c.assignee).length }}</span>
          </button>
          <button 
            :class="['tab', { active: store.currentFilter === 'all' }]"
            @click="store.setFilter('all')"
          >
            Todos <span class="count">{{ store.sidebarFilteredConversations.length }}</span>
          </button>
        </div>
      </div>

      <div class="conv-list">
        <div 
          v-for="conv in store.filteredConversations" 
          :key="conv.id" 
          :class="['conv-item', { unread: conv.unread > 0, active: conv.id === store.activeConversationId }]"
          @click="store.setActiveConversation(conv.id)"
        >
          <div class="conv-avatar" :style="{ backgroundColor: conv.contact.avatarBg, color: 'white', overflow: 'hidden' }">
            <img v-if="conv.contact.avatar_url" :src="conv.contact.avatar_url" alt="avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />
            <span v-else class="avatar-text">{{ conv.contact.avatarInitials }}</span>
          </div>
          <div class="conv-info">
            <div class="conv-title-row">
              <span class="conv-name">{{ conv.contact.name }}</span>
              <span class="conv-time">{{ formatMessageTime(conv.timestamp) }}</span>
            </div>
            <div class="conv-preview">
              <span v-if="conv.unread > 0" class="unread-badge"></span> 
              <span>{{ conv.preview }}</span>
            </div>
          </div>
        </div>
        
        <div class="all-loaded" v-if="store.filteredConversations.length > 0">
          Todas as conversas carregadas 🎉
        </div>
        
        <div class="all-loaded" v-else style="margin-top: 2rem;">
          Não há conversas ativas neste grupo.
        </div>
      </div>
    </div>

    <!-- Main Chat Pane -->
    <div class="chat-pane">
      <div class="chat-header" v-if="store.activeConversation">
        <div class="chat-title">
          <div class="conv-avatar" :style="{ backgroundColor: store.activeConversation.contact.avatarBg, color: 'white', overflow: 'hidden' }">
            <img v-if="store.activeConversation.contact.avatar_url" :src="store.activeConversation.contact.avatar_url" alt="avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />
            <span v-else>{{ store.activeConversation.contact.avatarInitials }}</span>
          </div>
          <div class="title-info">
            <h3>{{ store.activeConversation.contact.name }}</h3>
            <span class="ticket-id">#{{ store.activeConversation.id }}</span>
          </div>
        </div>
        <div class="chat-actions">
          <ConversationStatusDropdown
            :conversation-id="store.activeConversation.id"
            :current-status="store.activeConversation.status"
          />
          <ConversationMoreOptionsDropdown />
        </div>
      </div>

      <div class="chat-messages" ref="messagesContainerRef" v-if="store.activeConversation">
        
        <div class="message-wrapper" v-for="msg in store.activeConversation.messages" :key="msg.id" :class="msg.senderType">
          
          <div class="msg-avatar" v-if="msg.senderType === 'contact'">
            <img v-if="store.activeConversation.contact.avatar_url" :src="store.activeConversation.contact.avatar_url" />
            <span v-else>{{ store.activeConversation.contact.avatarInitials }}</span>
          </div>

          <div class="message-content">
            <div class="bubble" :class="{ private: msg.isPrivate }">
              <div v-if="msg.attachmentUrl" class="attachment-preview">
                <a v-if="msg.attachmentType && msg.attachmentType.startsWith('image/')" :href="msg.attachmentUrl" target="_blank" title="Clique para ampliar" class="image-link">
                  <img :src="msg.attachmentUrl" class="msg-image" @load="scrollToBottom" />
                </a>
                <audio v-else-if="msg.attachmentType && msg.attachmentType.startsWith('audio/')" :src="msg.attachmentUrl" controls class="msg-audio"></audio>
                <div v-else-if="msg.attachmentType && msg.attachmentType.startsWith('video/')" class="video-wrapper">
                  <video :src="msg.attachmentUrl" controls class="msg-video" @loadeddata="scrollToBottom"></video>
                  <a :href="msg.attachmentUrl" target="_blank" download class="media-download-link">Baixar Vídeo</a>
                </div>
                <a v-else :href="msg.attachmentUrl" target="_blank" class="msg-doc">📎 Ver Anexo</a>
              </div>
              <div v-if="msg.text" class="msg-text">{{ msg.text }}</div>
              
              <div class="bubble-meta">
                <span class="time">{{ formatMessageTime(msg.timestamp) }}</span>
                <CheckCheck v-if="msg.senderType === 'agent'" class="icon-xxs" />
              </div>
            </div>
          </div>

          <div class="msg-avatar agent-avatar" v-if="msg.senderType === 'agent'">
            <span v-if="msg.agentName">{{ msg.agentName.charAt(0).toUpperCase() }}</span>
            <span v-else>A</span>
          </div>

        </div>

        <div class="empty-state" v-if="store.activeConversation.messages.length === 0">
          <div class="icon-circle">
            <MessageCircle class="icon-lg" />
          </div>
          <p>Não há mensagens nesta conversa ainda.</p>
        </div>
      </div>

      <!-- Banner IA pausada -->
      <div v-if="store.activeConversation && aiPauseStatus.paused" class="ai-paused-banner">
        <BotOff class="banner-icon" />
        <span>IA pausada — <strong>{{ formatAiRemaining(aiPauseStatus.remaining_seconds) }}</strong> para voltar automaticamente</span>
        <button class="btn-resume-ai" @click="resumeAi">
          <Bot class="icon-xs" />
          Reativar agora
        </button>
      </div>

      <div class="chat-input-area" v-if="store.activeConversation">
        <div class="input-tabs">
          <button :class="['input-tab', { active: !isPrivateMessage }]" @click="isPrivateMessage = false">Responder</button>
          <button :class="['input-tab', { active: isPrivateMessage }]" @click="isPrivateMessage = true">Mensagem Privada</button>
        </div>
        <div class="input-box">
          <div v-if="selectedFile" class="file-preview-area">
            <div class="file-preview-content">
              <img v-if="selectedFilePreview" :src="selectedFilePreview" class="preview-img" />
              <div v-else class="file-icon">📄</div>
              <span class="file-name">{{ selectedFile.name }}</span>
            </div>
            <button class="clear-file-btn" @click="clearSelectedFile">&times;</button>
          </div>
          <textarea 
            v-model="newMessageText" 
            @keydown.enter.prevent="handleSendMessage"
            :placeholder="isPrivateMessage ? 'Digite uma nota privada...' : 'Digite sua mensagem aqui...'"
          ></textarea>
          <div class="input-actions">
            <div class="left-actions">
              <input type="file" ref="fileInput" @change="handleFileChange" hidden />
              <button class="icon-btn" @click="triggerFileInput" title="Anexar arquivo"><Paperclip class="icon-sm" /></button>
              <div class="emoji-wrapper">
                <button class="icon-btn" @click.stop="toggleEmojiPicker"><Smile class="icon-sm" /></button>
                <div v-if="isEmojiPickerOpen" class="emoji-picker-container" @click.stop>
                  <EmojiPicker :native="true" @select="onSelectEmoji" />
                </div>
              </div>
            </div>
            <button class="btn-send" @click="handleSendMessage">Enviar (↵)</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Sidebar Pane (Contact Details) -->
    <div class="details-pane" v-if="store.activeConversation">
      <div class="details-header-top">
        <h3>Contatos</h3>
        <button class="icon-btn"><X class="icon-sm" /></button>
      </div>

      <div class="contact-profile">
        <div class="contact-avatar" :style="{ backgroundColor: store.activeConversation.contact.avatarBg, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', overflow: 'hidden' }">
          <img v-if="store.activeConversation.contact.avatar_url" :src="store.activeConversation.contact.avatar_url" alt="avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />
          <span v-else>{{ store.activeConversation.contact.avatarInitials }}</span>
        </div>
        <div class="contact-name-row">
          <h4>{{ store.activeConversation.contact.name }}</h4>
          <Info class="icon-xs" />
          <ExternalLink class="icon-xs" />
        </div>

        <div class="contact-attributes">
          <div class="attr-row">
            <Mail class="icon-xs" />
            <span>{{ store.activeConversation.contact.email || 'Indisponível' }}</span>
          </div>
          <div class="attr-row">
            <Phone class="icon-xs" />
            <span>{{ store.activeConversation.contact.phone || 'Indisponível' }}</span>
            <Copy class="icon-xs action-icon" v-if="store.activeConversation.contact.phone" />
          </div>
          <div class="attr-row">
            <Users class="icon-xs" />
            <span>{{ store.activeConversation.contact.jid || store.activeConversation.contact.socialProfile || 'Indisponível' }}</span>
          </div>
          <div class="attr-row">
            <Building class="icon-xs" />
            <span>{{ store.activeConversation.contact.location || 'Indisponível' }}</span>
          </div>
        </div>

        <div class="contact-actions-row">
          <button class="action-btn" title="Focar Mensagem" @click="focusMessageInput"><MessageCircle class="icon-sm" /></button>
          <button class="action-btn" title="Editar Contato" @click="openEditModal"><Edit2 class="icon-sm" /></button>
          <button class="action-btn" title="Mesclar Contato" @click="openMergeModal"><GitMerge class="icon-sm" /></button>
          <button class="action-btn danger" title="Apagar Contato" @click="openDeleteModal"><Trash2 class="icon-sm" /></button>
        </div>
      </div>

      <div class="accordion-card">
        <div class="card-header">
          <h3>Mensagens agendadas</h3>
          <Minus class="icon-sm" />
        </div>
        <div class="card-body">
          <button class="btn-text-blue"><Plus class="icon-xs" /> Agendar mensagem</button>
          <p class="empty-text">Ainda não há mensagens agendadas.</p>
        </div>
      </div>

      <div class="accordion-card">
        <div class="card-header">
          <h3>Ações da conversa</h3>
          <Plus class="icon-sm" />
        </div>
      </div>

      <div class="accordion-card">
        <div class="card-header">
          <h3>Macros</h3>
          <Plus class="icon-sm" />
        </div>
      </div>

      <div class="accordion-card">
        <div class="card-header">
          <h3>Informação da conversa</h3>
          <Plus class="icon-sm" />
        </div>
      </div>

      <div class="accordion-card">
        <div class="card-header">
          <h3>Atributos do contato</h3>
          <Plus class="icon-sm" />
        </div>
      </div>

      <div class="accordion-card">
        <div class="card-header">
          <h3>Notas do contato</h3>
          <Plus class="icon-sm" />
        </div>
      </div>

      <div class="accordion-card">
        <div class="card-header">
          <h3>Anexos</h3>
          <Plus class="icon-sm" />
        </div>
      </div>

      <div class="accordion-card">
        <div class="card-header">
          <h3>Conversas anteriores</h3>
          <Plus class="icon-sm" />
        </div>
      </div>

      <div class="accordion-card">
        <div class="card-header">
          <h3>Participantes da conversa</h3>
          <Plus class="icon-sm" />
        </div>
      </div>
    </div>
    
    <!-- Modals -->
    <EditContactModal 
      :is-open="isEditModalOpen" 
      :contact="store.activeConversation?.contact" 
      @close="isEditModalOpen = false" 
    />
    <MergeContactModal 
      :is-open="isMergeModalOpen" 
      :contact="store.activeConversation?.contact" 
      @close="isMergeModalOpen = false" 
    />
    <DeleteContactModal
      :is-open="isDeleteModalOpen"
      :contact="store.activeConversation?.contact"
      @close="isDeleteModalOpen = false"
      @deleted="handleContactDeleted"
    />
  </div>
</template>

<style lang="scss" scoped>
.conversations-container {
  display: flex;
  flex: 1;
  min-height: 0;
  width: 100%;
  background: var(--bg-primary);
  overflow: hidden;
}

/* Common */
.icon { width: 18px; height: 18px; color: var(--text-muted); }
.icon-sm { width: 16px; height: 16px; }
.icon-xs { width: 14px; height: 14px; }
.icon-lg { width: 32px; height: 32px; color: var(--text-muted); }
.icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  
  &:hover { background: var(--bg-hover); color: var(--text-main); }
}
.mr-1 { margin-right: 0.25rem; }

/* Left Pane: Conversation List */
.conv-list-pane {
  width: 360px;
  border-right: 1px solid var(--border-color);
  background: var(--bg-secondary);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.list-header {
  padding: 1rem 1rem 0;
  border-bottom: 1px solid var(--border-color);
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

  h2 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-main);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .badge {
    background: var(--bg-tertiary);
    color: var(--text-muted);
    font-size: 0.7rem;
    padding: 2px 6px;
    border-radius: 10px;
    font-weight: 500;
  }

  .actions {
    display: flex;
    gap: 0.25rem;
  }
}

.tabs {
  display: flex;
  gap: 1rem;

  .tab {
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    padding: 0.5rem 0;
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--text-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.4rem;

    &.active {
      color: var(--primary);
      border-bottom-color: var(--primary);
      
      .count {
        background: var(--input-focus);
        color: var(--primary);
      }
    }

    .count {
      background: var(--bg-tertiary);
      padding: 1px 6px;
      border-radius: 10px;
      font-size: 0.7rem;
      color: var(--text-muted);
    }
  }
}

.conv-list {
  flex: 1;
  overflow-y: auto;
}

.conv-item {
  display: flex;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  gap: 0.75rem;
  cursor: pointer;
  transition: background-color 0.1s;

  &:hover { background: var(--bg-hover); }
  &.active { background: var(--input-focus); }

  .conv-avatar {
    width: 36px;
    height: 36px;
    background: var(--bg-tertiary);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-main);
    flex-shrink: 0;
  }

  .conv-info {
    flex: 1;
    min-width: 0;
  }

  .conv-title-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.25rem;
  }

  .conv-name {
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--text-main);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .conv-time {
    font-size: 0.75rem;
    color: var(--text-muted);
  }


  .conv-preview {
    font-size: 0.8rem;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  &.unread .conv-preview {
    color: var(--primary-color, #20B2AA);
    font-weight: 500;
  }

  .unread-badge {
    display: inline-block;
    width: 8px;
    height: 8px;
    background-color: var(--primary-color, #20B2AA);
    border-radius: 50%;
    margin-right: 6px;
    box-shadow: 0 0 5px var(--primary-color, #20B2AA);
    animation: unread-pulse 2s infinite ease-in-out;
  }
}

@keyframes unread-pulse {
  0% {
    transform: scale(0.9);
    opacity: 0.6;
    box-shadow: 0 0 0 0 rgba(32, 178, 170, 0.4);
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
    box-shadow: 0 0 0 4px rgba(32, 178, 170, 0);
  }
  100% {
    transform: scale(0.9);
    opacity: 0.6;
    box-shadow: 0 0 0 0 rgba(32, 178, 170, 0);
  }
}

.all-loaded {
  text-align: center;
  padding: 2rem;
  font-size: 0.8rem;
  color: var(--text-muted);
}

/* Middle Pane: Chat Area */
.chat-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  min-width: 300px;
  overflow: hidden;
}

.chat-header {
  height: 64px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  flex-shrink: 0;
  min-width: 0;

  .chat-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    
    .conv-avatar {
      width: 28px;
      height: 28px;
      background: var(--bg-tertiary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: bold;
      color: var(--text-main);
    }

    .title-info {
      min-width: 0;
      flex: 1;
    }

    h3 {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-main);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ticket-id {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
  }

  .chat-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .btn-resolve {
    display: flex;
    align-items: center;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    padding: 0.4rem 0.75rem;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--text-main);
    cursor: pointer;

    &:hover { background: var(--bg-hover); }
  }
}

.chat-messages {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background-color: #f4f6f8; /* Slightly darker background like Chatwoot */
}

.message-wrapper {
  display: flex;
  flex-direction: row;
  max-width: 85%;
  gap: 0.5rem;

  &.contact {
    align-self: flex-start;
    
    .bubble {
      background: #e5e7eb;
      color: #1f2937;
      border: none;
      border-radius: 0 8px 8px 8px;
    }
  }

  &.agent {
    align-self: flex-end;
    justify-content: flex-end;
    
    .message-content {
      display: flex;
      justify-content: flex-end;
    }

    .bubble {
      background: #e3f2fd; /* light blue */
      color: #1f2937; /* dark text */
      border: none;
      border-radius: 8px 0 8px 8px;

      &.private {
        background: #fef08a; /* yellow note */
        color: #854d0e;
      }
    }
  }

  .msg-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 600;
    color: #4b5563;
    flex-shrink: 0;
    overflow: hidden;
    margin-top: auto; /* align to bottom like chatwoot */

    &.agent-avatar {
      background: #ede9fe; /* light purple */
      color: #5b21b6;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .message-content {
    display: flex;
    flex-direction: column;
    max-width: calc(100% - 36px);
  }

  .bubble {
    padding: 0.5rem 0.75rem 0.25rem 0.75rem;
    font-size: 0.95rem;
    line-height: 1.4;
    word-break: break-word;
    display: flex;
    flex-direction: column;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    
    .attachment-preview {
      margin-bottom: 0.5rem;
      max-width: 100%;
      border-radius: 6px;
      overflow: hidden;
      
      .image-link {
        display: block;
        cursor: zoom-in;
      }

      .msg-image, .msg-video {
        width: 100%;
        max-height: 300px;
        object-fit: cover;
        display: block;
      }
      
      .msg-audio {
        width: 100%;
        max-width: 250px;
      }

      .video-wrapper {
        display: flex;
        flex-direction: column;
      }

      .media-download-link {
        display: block;
        font-size: 0.75rem;
        text-align: center;
        padding: 0.4rem;
        background: rgba(0,0,0,0.05);
        color: inherit;
        text-decoration: none;
        font-weight: 500;
        transition: background 0.2s;
      }
      .media-download-link:hover {
        background: rgba(0,0,0,0.1);
      }
    }

    .msg-doc {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      background: rgba(128, 128, 128, 0.2);
      border-radius: 6px;
      color: inherit;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.85rem;
      transition: background 0.2s;
      
      &:hover {
        background: rgba(128, 128, 128, 0.3);
      }
    }

    .bubble-meta {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 0.25rem;
      margin-top: 0.25rem;
      font-size: 0.65rem;
      color: rgba(0,0,0,0.4);

      .icon-xxs {
        width: 14px;
        height: 14px;
      }
    }
  }
}

.system-message {
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  
  &.warning {
    background: #451a25; /* Dark mode adaptation */
    color: #fca5a5;
    border: 1px solid #7f1d1d;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .btn-text {
      background: none;
      border: none;
      color: #fca5a5;
      font-weight: 600;
      cursor: pointer;
      text-decoration: underline;
    }
  }

  &.info-box {
    background: #3b2f15; /* Dark mode adaptation */
    border: 1px solid #854d0e;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;

    .info-content {
      min-width: 0;
      flex: 1;
    }

    h4 { color: #fde047; margin-bottom: 0.25rem; }
    p { color: #fef08a; margin-bottom: 0.25rem; }
    .subtext { color: #fef08a; font-size: 0.75rem; font-style: italic; opacity: 0.8; }
    
    .learn-more {
      color: #fde047;
      font-weight: 500;
      white-space: nowrap;
      flex-shrink: 0;
    }
  }
}

/* Fix light mode for system messages if not in dark-theme */
:global(body:not(.dark-theme)) .system-message.warning {
  background: #fef2f2;
  color: #b91c1c;
  border: none;
  .btn-text { color: #b91c1c; }
}
:global(body:not(.dark-theme)) .system-message.info-box {
  background: #fefce8;
  border: 1px solid #fef08a;
  h4 { color: #854d0e; }
  p { color: #a16207; }
  .subtext { color: #ca8a04; opacity: 1; }
  .learn-more { color: #854d0e; }
}


.empty-state {
  margin: auto;
  text-align: center;
  color: var(--text-muted);
  
  .icon-circle {
    width: 64px;
    height: 64px;
    background: var(--bg-tertiary);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
  }
}

.ai-paused-banner {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 1.5rem;
  background: #1e3a5f;
  border-top: 1px solid #2563eb;
  color: #93c5fd;
  font-size: 0.82rem;

  .banner-icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    color: #60a5fa;
  }

  span {
    flex: 1;
    strong { color: #bfdbfe; }
  }

  .btn-resume-ai {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.3rem 0.75rem;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.78rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.15s;

    &:hover { background: #1d4ed8; }

    .icon-xs {
      width: 13px;
      height: 13px;
    }
  }
}

.chat-input-area {
  padding: 1rem 1.5rem;
  background: var(--bg-secondary);
}

.input-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: -1px;
  padding-left: 1rem;

  .input-tab {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-bottom: none;
    padding: 0.5rem 1rem;
    border-radius: 8px 8px 0 0;
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--text-muted);
    cursor: pointer;

    &.active {
      color: var(--text-main);
      border-bottom: 2px solid var(--bg-secondary);
      z-index: 1;
    }
  }
}

.input-box {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 1px 2px var(--shadow-sm);
  
  textarea {
    width: 100%;
    border: none;
    padding: 1rem;
    min-height: 100px;
    resize: none;
    outline: none;
    font-size: 0.9rem;
    background: var(--bg-secondary);
    color: var(--text-main);
    &::placeholder {
      color: var(--text-muted);
    }
  }

  .input-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 1rem;
    background: var(--bg-secondary);
    border-top: 1px solid var(--border-color);
    border-radius: 0 0 8px 8px;

    .left-actions { display: flex; gap: 0.5rem; }
    
    .btn-send {
      background: var(--primary);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;

      &:hover { background: var(--primary-hover); }
    }
    
    .emoji-wrapper {
      position: relative;
    }
    
    .emoji-picker-container {
      position: absolute;
      bottom: 40px;
      left: 0;
      z-index: 50;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      border-radius: 8px;
    }
  }
}

/* Right Pane: Contact Details */
.details-pane {
  width: 360px;
  background: var(--bg-secondary); /* White in light mode */
  border-left: 1px solid var(--border-color);
  flex-shrink: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.details-header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;

  h3 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-main);
  }
}

.contact-profile {
  display: flex;
  flex-direction: column;
  padding: 0 1.25rem 1.25rem;
  border-bottom: 1px solid var(--border-color);

  .contact-avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    overflow: hidden;
    margin-bottom: 0.75rem;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .contact-name-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-main);
    margin-bottom: 0.75rem;

    h4 {
      font-size: 1rem;
      font-weight: 600;
    }
    
    .icon-xs { color: var(--text-muted); cursor: pointer; }
  }

  .contact-attributes {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    .attr-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: var(--text-muted);
      font-size: 0.85rem;

      span {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .action-icon {
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.2s;
      }

      &:hover .action-icon {
        opacity: 1;
        color: var(--text-main);
      }
    }
  }

  .contact-actions-row {
    display: flex;
    gap: 0.5rem;
    margin-top: 1.25rem;

    .action-btn {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: var(--bg-primary); /* Slightly different from bg-secondary */
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--text-muted);
      transition: background 0.2s, color 0.2s;

      &:hover {
        background: var(--bg-hover);
        color: var(--text-main);
      }

      &.danger {
        color: #ef4444;
        background: rgba(239, 68, 68, 0.1);
        
        &:hover {
          background: rgba(239, 68, 68, 0.2);
        }
      }
    }
  }
}

.accordion-card {
  background: transparent;
  border-bottom: 1px solid var(--border-color);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.25rem;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: var(--bg-hover);
    }

    h3 {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-main);
    }
    
    .icon-sm {
      color: var(--primary); /* In Chatwoot, these icons are blueish */
      opacity: 0.8;
    }
  }

  .card-body {
    padding: 0 1.25rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;

    .btn-text-blue {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: none;
      border: none;
      color: var(--primary);
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      padding: 0;

      &:hover {
        text-decoration: underline;
      }
    }

    .empty-text {
      text-align: center;
      color: var(--text-muted);
      font-size: 0.85rem;
      padding: 1rem 0;
    }

    .action-label-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .label {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--text-main);
      }
    }

    .select-wrapper {
      position: relative;
      
      select {
        width: 100%;
        appearance: none;
        background: var(--bg-primary);
        border: 1px solid var(--border-color);
        border-radius: 6px;
        padding: 0.6rem 2rem 0.6rem 0.75rem;
        color: var(--text-main);
        font-size: 0.9rem;
        outline: none;
        cursor: pointer;
        
        &:focus {
          border-color: var(--primary);
        }
      }

      .select-icon {
        position: absolute;
        right: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        pointer-events: none;
      }
    }
  }
}

/* File Preview before send */
.file-preview-area {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  background: #f9fafb;
  padding: 12px;
  border-radius: 8px 8px 0 0;
  border-bottom: 1px solid #e5e7eb;
}

.file-preview-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.preview-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.file-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e5e7eb;
  border-radius: 6px;
}

.file-name {
  font-size: 0.9rem;
  color: #374151;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 250px;
}

.clear-file-btn {
  background: #f3f4f6;
  border: none;
  font-size: 1.2rem;
  color: #4b5563;
  cursor: pointer;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.clear-file-btn:hover {
  background: #e5e7eb;
  color: #1f2937;
}
</style>
