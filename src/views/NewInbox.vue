<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, Check, X } from '@lucide/vue'
import { useConversationsStore } from '../store/conversations'

import api from '../api'
import Swal from 'sweetalert2'

const router = useRouter()
const conversationsStore = useConversationsStore()

const steps = ref([
  { id: 1, title: 'Escolha o Canal', desc: 'Escolha o provedor que você deseja integrar com o Innovaweb.', active: true, completed: false },
  { id: 2, title: 'Criar Caixa de Entrada', desc: 'Autenticar sua conta e criar uma caixa de entrada.', active: false, completed: false },
  { id: 3, title: 'Adicionar Agentes', desc: 'Adicionar agentes à caixa de entrada criada.', active: false, completed: false },
  { id: 4, title: 'Então!', desc: 'Está tudo pronto para começar!', active: false, completed: false },
])

const currentStep = ref(1)
const selectedChannel = ref(null)
const selectedProviderId = ref(null)

const showQrModal = ref(false)
const newInbox = ref({
  name: '',
  phone_number: ''
})

const channels = [
  { id: 'site', name: 'Site', desc: 'Criar um widget de chat ao vivo', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>' },
  { id: 'facebook', name: 'Facebook', desc: 'Conectar sua página do Facebook', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1877f2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>' },
  { id: 'whatsapp', name: 'WhatsApp', desc: 'Atenda seus clientes no WhatsApp', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#25d366" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>' },
  { id: 'sms', name: 'SMS', desc: 'Integrar o canal SMS', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' },
  { id: 'email', name: 'E-Mail', desc: 'Conectar com provedores', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>' },
  { id: 'api', name: 'API', desc: 'Crie um canal personalizado', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>' },
  { id: 'telegram', name: 'Telegram', desc: 'Conectar via Telegram', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#229ED9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>' },
  { id: 'line', name: 'Line', desc: 'Conectar via Line', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00B900" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>' },
  { id: 'instagram', name: 'Instagram', desc: 'Conectar com Instagram', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E1306C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>' },
]

const whatsappProviders = [
  { id: 'meta', name: 'Cloud Do WhatsApp', desc: 'Configuração rápida via Meta', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#25d366" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>' },
  { id: 'baileys', name: 'Baileys', desc: 'Conectar via API não-oficial Baileys', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#25d366" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>' }
]

const selectChannel = (channelId) => {
  if (channelId === 'whatsapp') {
    selectedChannel.value = 'whatsapp'
  } else {
    selectedChannel.value = channelId
    selectedProviderId.value = 'none'
    goToStep(2)
  }
}

const selectProvider = (providerId) => {
  selectedProviderId.value = providerId
  goToStep(2)
}

const goToStep = (stepNumber) => {
  currentStep.value = stepNumber
  steps.value.forEach(s => {
    s.active = s.id === stepNumber
    s.completed = s.id < stepNumber
  })
}

const createdInboxId = ref(null)
const qrCodeData = ref(null)
const qrLoading = ref(false)
const qrConnected = ref(false)
let qrPollInterval = null

const createInbox = async () => {
  if (selectedProviderId.value === 'baileys') {
    try {
      const res = await api.post('/inboxes', { 
        inbox: {
          name: newInbox.value.name,
          phone_number: newInbox.value.phone_number,
          provider: 'baileys'
        }
      })
      createdInboxId.value = res.data.id
      goToStep(3)
    } catch (e) {
      Swal.fire('Erro', 'Não foi possível salvar a caixa de entrada.', 'error')
    }
  } else {
    goToStep(3)
  }
}

const openQrModal = async () => {
  showQrModal.value = true
  qrCodeData.value = null
  qrConnected.value = false
  qrLoading.value = true

  // Abre conexão do WS se ainda não estiver aberta
  conversationsStore.setupWebSocket()

  const fetchQr = async () => {
    try {
      const res = await api.get(`/inboxes/${createdInboxId.value}/qr_code`)
      if (res.data.qr_code) {
        qrCodeData.value = res.data.qr_code
        qrLoading.value = false
      }
    } catch (e) {
      console.warn('Erro ao buscar QR Code:', e.message)
    }
  }

  try {
    await fetchQr()
  } catch (e) {
    console.warn('Baileys API não acessível:', e.message)
  }

  qrPollInterval = setInterval(async () => {
    try {
      const statusRes = await api.get(`/inboxes/${createdInboxId.value}/status`)
      if (statusRes.data.connected) {
        qrConnected.value = true
        qrCodeData.value = null
        if (qrPollInterval) {
          clearInterval(qrPollInterval)
          qrPollInterval = null
        }
        return
      }

      await fetchQr()
    } catch (_) {}
  }, 4000)
}

const closeQrModal = () => {
  showQrModal.value = false
  if (qrPollInterval) {
    clearInterval(qrPollInterval)
    qrPollInterval = null
  }
}

const handleInboxUpdated = (e) => {
  const data = e.detail
  if (data.inbox_id === createdInboxId.value) {
    if (data.connection_status === 'open') {
      qrConnected.value = true
      qrCodeData.value = null
      if (qrPollInterval) {
        clearInterval(qrPollInterval)
        qrPollInterval = null
      }
    } else {
      qrConnected.value = false
      if (data.qr_code) {
        qrCodeData.value = data.qr_code
        qrLoading.value = false
      }
    }
  }
}

onMounted(() => {
  window.addEventListener('inbox-updated', handleInboxUpdated)
  conversationsStore.setupWebSocket()
})

onUnmounted(() => {
  window.removeEventListener('inbox-updated', handleInboxUpdated)
  if (qrPollInterval) {
    clearInterval(qrPollInterval)
    qrPollInterval = null
  }
})

const goBack = () => {
  if (currentStep.value === 1 && selectedChannel.value === 'whatsapp') {
    selectedChannel.value = null
  } else if (currentStep.value > 1) {
    goToStep(currentStep.value - 1)
  } else {
    router.push('/settings/inboxes')
  }
}
</script>

<template>
  <div class="page-container">
    <div class="top-nav">
      <button class="back-btn" @click="goBack">
        <ChevronLeft class="icon-sm" />
        Anterior
      </button>
      <h2>Caixas de Entrada</h2>
    </div>

    <div class="wizard-container">
      <div class="stepper-sidebar">
        <div class="step-item" v-for="step in steps" :key="step.id" :class="{ 'active': step.active, 'completed': step.completed }">
          <div class="step-indicator">
            <div class="circle" v-if="!step.completed">{{ step.id }}</div>
            <div class="circle check" v-else><Check class="icon-xs" /></div>
            <div class="line" v-if="step.id !== 4"></div>
          </div>
          <div class="step-content">
            <h4 class="step-title">{{ step.title }}</h4>
            <p class="step-desc" v-if="step.active">{{ step.desc }}</p>
          </div>
        </div>
      </div>

      <div class="wizard-content">
        <!-- Passo 1: Escolha Geral -->
        <div class="step-pane" v-if="currentStep === 1 && selectedChannel !== 'whatsapp'">
          <div class="channel-grid">
            <div class="channel-card" v-for="channel in channels" :key="channel.id" @click="selectChannel(channel.id)">
              <div class="icon-circle" v-html="channel.svg"></div>
              <h3 class="channel-name">{{ channel.name }}</h3>
              <p class="channel-desc">{{ channel.desc }}</p>
            </div>
          </div>
        </div>

        <!-- Passo 1.1: Escolha do WhatsApp -->
        <div class="step-pane" v-if="currentStep === 1 && selectedChannel === 'whatsapp'">
          <div class="provider-header">
            <h3>Selecione seu provedor de API</h3>
            <p>Escolha seu provedor do WhatsApp. Você pode se conectar diretamente através da Meta (oficial), ou se conectar pela API não-oficial Baileys.</p>
          </div>
          <div class="channel-grid provider-grid">
            <div class="channel-card" v-for="provider in whatsappProviders" :key="provider.id" @click="selectProvider(provider.id)">
              <div class="icon-circle" v-html="provider.svg"></div>
              <h3 class="channel-name">{{ provider.name }}</h3>
              <p class="channel-desc">{{ provider.desc }}</p>
            </div>
          </div>
        </div>

        <!-- Passo 2: Criar Caixa de Entrada -->
        <div class="step-pane" v-if="currentStep === 2">
          <div class="form-mockup">
            <template v-if="selectedProviderId === 'baileys'">
              <div class="input-group">
                <label>Nome da Caixa de Entrada</label>
                <input type="text" v-model="newInbox.name" placeholder="Por favor, digite um nome para caixa de entrada" />
              </div>
              <div class="input-group" style="margin-top: 1rem;">
                <label>Número de telefone</label>
                <input type="text" v-model="newInbox.phone_number" placeholder="Por favor, insira o número de telefone do qual a mensagem será enviada" />
              </div>
              
              <button class="btn-primary" style="margin-top: 1.5rem;" @click="createInbox">Criar canal do WhatsApp</button>
            </template>
            <template v-else>
              <h3>Configurar Canal</h3>
              <p class="mockup-desc">Preencha os detalhes para configurar sua nova caixa de entrada.</p>
              <div class="input-group">
                <label>Nome do Canal</label>
                <input type="text" placeholder="Ex: Suporte Vendas" />
              </div>
              <button class="btn-primary" style="margin-top: 1rem;" @click="goToStep(3)">Criar Caixa de Entrada</button>
            </template>
          </div>
        </div>

        <!-- Passo 3: Adicionar Agentes -->
        <div class="step-pane" v-if="currentStep === 3">
          <div class="form-mockup step-agents">
            <h3>Agentes</h3>
            <p class="mockup-desc" style="line-height: 1.5;">Aqui você pode adicionar agentes para gerenciar sua caixa de entrada recém-criada. Somente esses agentes selecionados terão acesso à sua caixa de entrada. Os agentes que não fazem parte desta caixa de entrada não poderão ver ou responder a mensagens nessa caixa de entrada quando fizerem login.<br><br>PS: Como administrador, se você precisar acessar todas as caixas de entrada, adicione-se como agente a todas as caixas de entrada criadas.</p>
            <div class="input-group">
              <label>Agentes</label>
              <input type="text" placeholder="Escolha agentes para a caixa de entrada" />
            </div>
            <button class="btn-primary" style="margin-top: 1.5rem;" @click="goToStep(4)">Adicionar agentes</button>
          </div>
        </div>

        <!-- Passo 4: Fim -->
        <div class="step-pane" v-if="currentStep === 4">
          <div class="form-mockup success-pane">
            <h3>Sua caixa de entrada está pronta!</h3>
            <p class="mockup-desc" style="line-height: 1.5;">Agora você já pode oferecer uma excelente experiência no atendimento de seus clientes através do seu novo Canal. Clique abaixo para configurar o canal do WhatsApp.</p>
            <div class="actions-row">
              <button class="btn-primary" @click="openQrModal">Conectar dispositivo</button>
              <div class="secondary-actions">
                <button class="btn-cancel">Mais configurações</button>
                <button class="btn-green" @click="router.push('/settings/inboxes')">Leva-me lá</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Conexão (QR Code) -->
    <div v-if="showQrModal" class="modal-backdrop" @click.self="closeQrModal">
      <div class="qr-modal">
        <button class="close-btn" @click="closeQrModal"><X class="icon-sm" /></button>
        <div class="qr-content">
          <h3>Conecte o seu dispositivo</h3>
          <p class="qr-desc">Escaneie o QR code para conectar seu dispositivo. Certifique-se de que o número de telefone esteja correto antes de escanear.</p>
          
          <div class="phone-status">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="whatsapp-icon"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            <span class="phone-name">{{ newInbox.name }}</span>
            <span class="phone-number">{{ newInbox.phone_number }}</span>
            <div class="status-dot" :class="{ connected: qrConnected }"></div>
          </div>

          <!-- Conectado com sucesso -->
          <div v-if="qrConnected" class="connected-state">
            <div class="success-check">✓</div>
            <p>WhatsApp conectado com sucesso!</p>
          </div>

          <!-- Carregando QR -->
          <div v-else-if="qrLoading" class="qr-loading">
            <div class="spinner"></div>
            <p>Aguardando QR Code da API...</p>
          </div>

          <!-- QR Code real da API Baileys -->
          <div v-else-if="qrCodeData" class="qr-code-box">
            <img :src="qrCodeData" alt="QR Code WhatsApp" class="qr-image" />
          </div>

          <!-- API não configurada ou offline -->
          <div v-else class="qr-unavailable">
            <p>⚠️ A API Baileys não está acessível neste momento.</p>
            <p class="small-text">Verifique se a API está rodando e se a URL está correta nas configurações da caixa de entrada.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-primary);
}

.top-nav {
  display: flex;
  align-items: center;
  padding: 1.5rem 2rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);

  .back-btn {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    background: none;
    border: none;
    color: var(--text-muted);
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    margin-right: 1rem;

    &:hover {
      color: var(--text-main);
    }
  }

  h2 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-main);
  }
}

.wizard-container {
  display: flex;
  flex: 1;
  overflow: hidden;
  margin: 1.5rem 2rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.stepper-sidebar {
  width: 280px;
  border-right: 1px solid var(--border-color);
  padding: 2rem 1.5rem;
  background: var(--bg-tertiary);
}

.step-item {
  display: flex;
  gap: 1rem;
  position: relative;
  min-height: 80px;

  &.active {
    .circle {
      background: var(--input-focus);
      border-color: var(--primary);
      color: var(--primary);
      font-weight: 600;
    }
    .step-title {
      color: var(--primary);
    }
  }

  &.completed {
    .circle {
      background: var(--bg-hover);
      border-color: var(--border-color);
      color: var(--text-muted);
      &.check {
        color: #10b981;
      }
    }
    .step-title {
      color: var(--text-main);
    }
  }

  .step-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .circle {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 1px solid var(--border-color);
      background: var(--bg-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      color: var(--text-muted);
      z-index: 2;
    }

    .line {
      flex: 1;
      width: 1px;
      background: var(--border-color);
      margin: 0.25rem 0;
    }
  }

  .step-content {
    flex: 1;
    padding-bottom: 2rem;

    .step-title {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-muted);
      margin-bottom: 0.25rem;
      padding-top: 4px;
    }

    .step-desc {
      font-size: 0.8rem;
      color: var(--text-muted);
      line-height: 1.4;
    }
  }
}

.wizard-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.channel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}

.provider-grid {
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
}

.provider-header {
  margin-bottom: 2rem;
  
  h3 {
    font-size: 1.2rem;
    color: var(--text-main);
    margin-bottom: 0.5rem;
  }
  
  p {
    color: var(--text-muted);
    font-size: 0.95rem;
    line-height: 1.5;
  }
}

.channel-card {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--bg-secondary);

  &:hover {
    border-color: var(--primary);
    box-shadow: 0 4px 6px -1px var(--shadow-color);
    transform: translateY(-2px);
  }

  .icon-circle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--bg-hover);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    margin-bottom: 1rem;
  }

  .channel-name {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text-main);
    margin-bottom: 0.5rem;
  }

  .channel-desc {
    font-size: 0.85rem;
    color: var(--text-muted);
    line-height: 1.4;
  }
}

.form-mockup {
  max-width: 500px;
  
  h3 { margin-bottom: 0.5rem; font-size: 1.25rem; color: var(--text-main); }
  .mockup-desc { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.5rem; }
  
  .input-group {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    
    label { font-size: 0.85rem; font-weight: 500; color: var(--text-main); }
    input {
      padding: 0.6rem 1rem;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      background: var(--bg-tertiary);
      color: var(--text-main);
      outline: none;
      &:focus { border-color: var(--primary); }
    }
  }

  .agent-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    
    .agent-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      color: var(--text-main);
    }
  }

  &.success-pane {
    text-align: center;
    margin: 4rem auto;
    
    .success-icon {
      width: 64px;
      height: 64px;
      background: var(--input-focus);
      color: var(--primary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem auto;
      
      svg { width: 32px; height: 32px; }
    }
  }
}

.btn-primary {
  background: var(--primary);
  color: var(--text-inverse);
  padding: 0.6rem 1.25rem;
  border-radius: 6px;
  border: none;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover { background: var(--primary-hover); }
}



.icon-sm { width: 16px; height: 16px; }
.icon-xs { width: 12px; height: 12px; }

.actions-row {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1.5rem;
  margin-top: 1.5rem;
  
  .secondary-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
  }
}

.btn-green {
  background: #10b981;
  color: white;
  padding: 0.6rem 1.25rem;
  border-radius: 6px;
  border: none;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover { background: #059669; }
}

.btn-cancel {
  background: white;
  color: #4b5563;
  padding: 0.6rem 1.25rem;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  
  &:hover { background: #f3f4f6; }
}

/* Modal do QR Code */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.qr-modal {
  background: white;
  border-radius: 12px;
  padding: 1.75rem;
  width: 380px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  position: relative;
  text-align: center;
  
  .close-btn {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    background: transparent;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    
    &:hover { color: #4b5563; }
  }
  
  h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.15rem;
    color: #111827;
  }
  
  .qr-desc {
    color: #6b7280;
    font-size: 0.85rem;
    margin-bottom: 1rem;
    line-height: 1.4;
  }
  
  .phone-status {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 1.25rem;
    color: #374151;
    font-size: 0.85rem;
    
    .whatsapp-icon { color: #6b7280; }
    
    .status-dot {
      width: 10px;
      height: 10px;
      background: #9ca3af;
      border-radius: 50%;
      margin-left: 0.25rem;
      transition: background 0.3s;
      
      &.connected {
        background: #10b981;
      }
    }
  }
  
  .qr-code-box {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 0.5rem;
    
    .qr-image {
      width: 180px;
      height: 180px;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
      padding: 6px;
      background: white;
    }
  }

  .qr-loading {
    padding: 1.5rem 0;
    color: #6b7280;
    
    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid #e5e7eb;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 0.75rem;
    }
    
    p { font-size: 0.85rem; }
  }

  .connected-state {
    padding: 1.5rem 0;
    color: #059669;
    
    .success-check {
      width: 48px;
      height: 48px;
      background: #d1fae5;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      margin: 0 auto 0.75rem;
    }
    
    p { font-size: 0.95rem; font-weight: 500; }
  }

  .qr-unavailable {
    padding: 1.5rem 1rem;
    color: #6b7280;
    
    p { font-size: 0.85rem; margin-bottom: 0.5rem; }
    .small-text { font-size: 0.75rem; color: #9ca3af; }
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
