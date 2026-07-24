<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { X } from 'lucide-vue-next'
import api from '../api'

const props = defineProps({
  inboxId: { type: [Number, String], required: true },
  inboxName: { type: String, default: '' }
})

const emit = defineEmits(['close', 'reconnected'])

const qrCodeData = ref(null)
const qrLoading = ref(true)
const qrConnected = ref(false)
let qrPollInterval = null

const fetchQr = async () => {
  try {
    const res = await api.get(`/inboxes/${props.inboxId}/qr_code`)
    if (res.data.qr_code) {
      qrCodeData.value = res.data.qr_code
      qrLoading.value = false
    }
  } catch (e) {
    console.warn('Erro ao buscar QR Code:', e.message)
  }
}

const checkConnected = async () => {
  try {
    const res = await api.get(`/inboxes/${props.inboxId}/status`)
    if (res.data.connected) {
      qrConnected.value = true
      qrCodeData.value = null
      stopPolling()
      emit('reconnected')
      return true
    }
  } catch (_) { /* ignora, tenta de novo no próximo ciclo */ }
  return false
}

const stopPolling = () => {
  if (qrPollInterval) {
    clearInterval(qrPollInterval)
    qrPollInterval = null
  }
}

const handleInboxUpdated = (e) => {
  const data = e.detail
  if (Number(data.inbox_id) !== Number(props.inboxId)) return

  if (data.connection_status === 'open') {
    qrConnected.value = true
    qrCodeData.value = null
    stopPolling()
    emit('reconnected')
  } else {
    qrConnected.value = false
    if (data.qr_code) {
      qrCodeData.value = data.qr_code
      qrLoading.value = false
    }
  }
}

onMounted(async () => {
  window.addEventListener('inbox-updated', handleInboxUpdated)

  const already = await checkConnected()
  if (already) return

  await fetchQr()

  qrPollInterval = setInterval(async () => {
    const done = await checkConnected()
    if (!done) await fetchQr()
  }, 4000)
})

onUnmounted(() => {
  window.removeEventListener('inbox-updated', handleInboxUpdated)
  stopPolling()
})
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Reconectar WhatsApp</h2>
        <button class="close-btn" @click="emit('close')"><X class="icon-sm" /></button>
      </div>

      <p class="qr-desc">
        Escaneie o QR code com o WhatsApp de <strong>{{ inboxName }}</strong> pra reconectar. O histórico de conversas dessa caixa de entrada é preservado — não é preciso criar uma nova.
      </p>

      <div class="qr-box">
        <div v-if="qrConnected" class="connected-state">
          <div class="check-circle">✓</div>
          <p>Conectado com sucesso!</p>
        </div>
        <div v-else-if="qrLoading" class="qr-loading">
          <div class="spinner"></div>
          <p>Aguardando QR Code...</p>
        </div>
        <img v-else :src="qrCodeData" alt="QR Code WhatsApp" class="qr-image" />
      </div>

      <div class="modal-actions">
        <button class="btn-cancel" @click="emit('close')">Fechar</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.75rem;
  width: 420px;
  max-width: 92vw;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;

  h2 {
    margin: 0;
    font-size: 1.15rem;
    color: var(--text-main);
  }

  .close-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-muted);
    display: flex;
    align-items: center;
  }
}

.qr-desc {
  font-size: 0.85rem;
  color: var(--text-muted);
  line-height: 1.5;
  margin-bottom: 1.25rem;
}

.qr-box {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 240px;
  border: 1px dashed var(--border-color);
  border-radius: 8px;
  padding: 1rem;
}

.qr-image {
  width: 220px;
  height: 220px;
}

.qr-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-muted);
  font-size: 0.85rem;

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--border-color);
    border-top-color: #25d366;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.connected-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: #059669;
  font-weight: 500;

  .check-circle {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #d1fae5;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
  }
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.btn-cancel {
  background: transparent;
  color: var(--text-muted);
  border: 1px solid var(--border-color);
  padding: 0.55rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;

  &:hover {
    background: var(--bg-hover);
  }
}
</style>
