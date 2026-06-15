<script setup>
import { ref, computed } from 'vue'
import { CheckCircle, Clock, CircleDashed, ChevronDown } from 'lucide-vue-next'
import { useConversationsStore } from '../store/conversations'

const props = defineProps({
  conversationId: {
    type: [Number, String],
    required: true
  },
  currentStatus: {
    type: String,
    default: 'open'
  }
})

const store = useConversationsStore()
const isOpen = ref(false)

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const closeDropdown = () => {
  isOpen.value = false
}

const updateStatus = async (status) => {
  await store.updateConversationStatus(props.conversationId, status)
  closeDropdown()
}

// Click outside directive logic handled in parent or here
</script>

<template>
  <div class="status-dropdown-wrapper" v-click-outside="closeDropdown">
    <div class="split-btn-group">
      <!-- Main Action Button -->
      <button 
        v-if="currentStatus !== 'resolved'"
        class="btn-main-action" 
        @click="updateStatus('resolved')"
      >
        Resolver
      </button>
      <button 
        v-else-if="currentStatus === 'resolved'"
        class="btn-main-action resolved" 
        @click="updateStatus('open')"
      >
        Resolvido
      </button>

      <!-- Chevron Dropdown Toggle -->
      <button class="btn-chevron" @click.stop="toggleDropdown">
        <ChevronDown class="icon-sm" />
      </button>
    </div>

    <!-- Dropdown Menu -->
    <div v-if="isOpen" class="dropdown-menu">
      <button 
        v-if="currentStatus !== 'resolved'"
        class="dropdown-item" 
        @click="updateStatus('resolved')"
      >
        <CheckCircle class="icon-sm" />
        <span>Resolver</span>
      </button>
      
      <button 
        v-if="currentStatus !== 'snoozed'"
        class="dropdown-item" 
        @click="updateStatus('snoozed')"
      >
        <Clock class="icon-sm" />
        <span>Adiar</span>
      </button>

      <button 
        v-if="currentStatus !== 'open'"
        class="dropdown-item" 
        @click="updateStatus('open')"
      >
        <CircleDashed class="icon-sm" />
        <span>Deixar pendente</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.status-dropdown-wrapper {
  position: relative;
  display: inline-block;
}

.split-btn-group {
  display: flex;
  align-items: center;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: white;
  overflow: hidden;
}

.btn-main-action {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.75rem;
  background: white;
  border: none;
  border-right: 1px solid var(--border-color);
  color: var(--text-main);
  font-weight: 500;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-main-action:hover {
  background: rgba(0, 0, 0, 0.03);
}

.btn-main-action.resolved {
  color: #28a745;
}
.btn-main-action.resolved:hover {
  background: rgba(40, 167, 69, 0.05);
}

.btn-chevron {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.35rem 0.4rem;
  background: white;
  border: none;
  color: var(--text-main);
  cursor: pointer;
  transition: background 0.2s;
}

.btn-chevron:hover {
  background: rgba(0,0,0,0.05);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  min-width: 180px;
  z-index: 100;
  padding: 0.25rem 0;
  display: flex;
  flex-direction: column;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: none;
  color: var(--text-main);
  font-size: 0.9rem;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background: rgba(0,0,0,0.05);
}
</style>
