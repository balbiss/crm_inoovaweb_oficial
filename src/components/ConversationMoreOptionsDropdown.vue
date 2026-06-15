<script setup>
import { ref } from 'vue'
import { MoreVertical, VolumeX, Share } from 'lucide-vue-next'

const isOpen = ref(false)

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const closeDropdown = () => {
  isOpen.value = false
}

const handleAction = (action) => {
  if (action === 'block') {
    alert('Funcionalidade de bloquear contato em desenvolvimento.')
  } else if (action === 'transcript') {
    alert('Funcionalidade de enviar transcrição em desenvolvimento.')
  }
  closeDropdown()
}
</script>

<template>
  <div class="more-options-wrapper" v-click-outside="closeDropdown">
    <button class="icon-btn" @click.stop="toggleDropdown">
      <MoreVertical class="icon" />
    </button>

    <div v-if="isOpen" class="dropdown-menu">
      <button class="dropdown-item" @click="handleAction('block')">
        <VolumeX class="icon-sm" />
        <span>Bloquear Contato</span>
      </button>
      
      <button class="dropdown-item" @click="handleAction('transcript')">
        <Share class="icon-sm" />
        <span>Enviar Transcrição</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.more-options-wrapper {
  position: relative;
  display: inline-block;
  margin-left: 0.5rem;
}

.icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  transition: all 0.2s;
}

.icon-btn:hover {
  background: rgba(0,0,0,0.05);
  color: var(--text-main);
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
  min-width: 200px;
  z-index: 100;
  padding: 0.25rem 0;
  display: flex;
  flex-direction: column;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 1rem;
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
