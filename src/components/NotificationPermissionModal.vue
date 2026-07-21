<script setup>
import { ref } from 'vue'
import { Bell, X } from 'lucide-vue-next'
import { usePushNotifications } from '../composables/usePushNotifications'

const emit = defineEmits(['close'])

const { subscribe } = usePushNotifications()
const isLoading = ref(false)

const activate = async () => {
  isLoading.value = true
  try {
    // Precisa ser chamado direto no clique (gesto do usuário) -- no Safari do
    // iPhone, pedir permissão de notificação fora de um clique real não
    // mostra nada pro usuário, é ignorado silenciosamente.
    await subscribe()
  } finally {
    isLoading.value = false
    dismiss()
  }
}

const dismiss = () => {
  localStorage.setItem('notification_modal_dismissed', 'true')
  emit('close')
}
</script>

<template>
  <div class="modal-overlay" @click.self="dismiss">
    <div class="modal-box">
      <button class="btn-close" @click="dismiss"><X :size="16" /></button>

      <div class="icon-circle"><Bell :size="28" /></div>

      <h3>Ativar notificações</h3>
      <p>Receba um aviso na hora em que um lead novo chegar ou uma conversa for atribuída a você — sem precisar ficar checando o app o tempo todo.</p>

      <button class="btn-primary" :disabled="isLoading" @click="activate">
        {{ isLoading ? 'Ativando...' : 'Ativar Notificações' }}
      </button>
      <button class="btn-skip" @click="dismiss">Agora não</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-box {
  position: relative;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  width: 100%;
  max-width: 360px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  padding: 1.75rem 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.btn-close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  display: flex;
  padding: 0.25rem;
  border-radius: 4px;
  &:hover { background: var(--bg-hover); }
}

.icon-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--input-focus);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

h3 {
  font-size: 1.05rem;
  color: var(--text-main);
  margin-bottom: 0.5rem;
}

p {
  font-size: 0.88rem;
  color: var(--text-muted);
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

.btn-primary {
  width: 100%;
  background: var(--primary);
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  margin-bottom: 0.6rem;
  &:hover { opacity: 0.9; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
}

.btn-skip {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0.4rem;
  &:hover { color: var(--text-main); }
}
</style>
