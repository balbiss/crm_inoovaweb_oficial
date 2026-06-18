<script setup>
import { ref, onMounted } from 'vue'
import { Copy, Check, ChevronRight } from 'lucide-vue-next'
import api from '../../api'

const webhookUrls = ref({})
const copiedKey   = ref(null)
const isLoading   = ref(true)

onMounted(async () => {
  try {
    const res = await api.get('/account')
    webhookUrls.value = res.data.webhook_urls || {}
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
})

const copy = async (key, url) => {
  await navigator.clipboard.writeText(url)
  copiedKey.value = key
  setTimeout(() => { copiedKey.value = null }, 2500)
}

const portals = [
  {
    key:        'canal_pro',
    name:       'Canal Pro',
    domain:     'canalpro.com.br',
    color:      '#7B2FA2',
    colorLight: '#F3E8FF',
    gradient:   'linear-gradient(135deg, #7B2FA2 0%, #9333EA 100%)',
    description:'Cole a URL abaixo em Configurações → Leads → Receber leads no CRM',
    howto: [
      'Acesse seu painel do Canal Pro',
      'Vá em Configurações → Leads → Receber leads no CRM',
      'No campo "Nome do CRM" escreva: VisitaIA CRM',
      'Cole a URL no campo "URL de integração"',
      'Clique em Salvar alterações',
    ]
  },
  {
    key:        'zap',
    name:       'ZAP Imóveis',
    domain:     'zapimoveis.com.br',
    color:      '#E8590C',
    colorLight: '#FFF3ED',
    gradient:   'linear-gradient(135deg, #E8590C 0%, #F97316 100%)',
    description:'Cole a URL abaixo no painel do Programa de Parceiros ZAP',
    howto: [
      'Acesse o Programa de Parceiros do ZAP Imóveis',
      'Vá em Integrações → Webhook de Leads',
      'Cole a URL no campo de endpoint',
      'Salve e clique em Enviar lead de teste',
    ]
  },
  {
    key:        'viva_real',
    name:       'Viva Real',
    domain:     'vivareal.com.br',
    color:      '#0062CC',
    colorLight: '#EFF6FF',
    gradient:   'linear-gradient(135deg, #0062CC 0%, #2563EB 100%)',
    description:'Cole a URL abaixo no painel de integrações do Viva Real',
    howto: [
      'Acesse o painel do Viva Real (mesmo login do ZAP)',
      'Vá em Integrações → Webhook de Leads',
      'Cole a URL no campo de endpoint',
      'Salve e clique em Enviar lead de teste',
    ]
  }
]

const logoError = (e) => {
  e.target.style.display = 'none'
  e.target.nextElementSibling.style.display = 'flex'
}
</script>

<template>
  <div class="portals-page">
    <div class="page-header">
      <h2>Portais Imobiliários</h2>
      <p>Receba leads do Canal Pro, ZAP e Viva Real direto no CRM. Quando um lead chega, a IA já responde no WhatsApp em segundos.</p>
    </div>

    <div v-if="isLoading" class="loading">
      <div class="loading-spinner"></div>
      <span>Carregando URLs...</span>
    </div>

    <div v-else class="portals-list">
      <div v-for="portal in portals" :key="portal.key" class="portal-card">

        <!-- Card Header com logo real -->
        <div class="card-top" :style="{ borderTopColor: portal.color }">
          <div class="logo-area">
            <img
              :src="`https://logo.clearbit.com/${portal.domain}`"
              :alt="portal.name"
              class="brand-logo"
              @error="logoError"
            />
            <!-- Fallback caso o logo não carregue -->
            <div class="logo-fallback" :style="{ background: portal.gradient }" style="display:none">
              <span>{{ portal.name[0] }}</span>
            </div>
          </div>
          <div class="portal-info">
            <h3>{{ portal.name }}</h3>
            <p>{{ portal.description }}</p>
          </div>
          <div class="status-badge active">
            <span class="dot"></span>
            Pronto para usar
          </div>
        </div>

        <!-- Webhook URL -->
        <div class="webhook-section">
          <label>URL de integração (webhook)</label>
          <div class="url-row">
            <div class="url-display">
              <span class="url-protocol">https://</span>
              <span class="url-path">{{ (webhookUrls[portal.key] || '').replace('https://', '') }}</span>
            </div>
            <button
              class="btn-copy"
              :class="{ copied: copiedKey === portal.key }"
              :style="copiedKey !== portal.key ? { background: portal.color } : {}"
              @click="copy(portal.key, webhookUrls[portal.key])"
            >
              <Check v-if="copiedKey === portal.key" :size="14" />
              <Copy v-else :size="14" />
              {{ copiedKey === portal.key ? 'Copiado!' : 'Copiar URL' }}
            </button>
          </div>
        </div>

        <!-- Steps + Flow -->
        <div class="card-bottom">
          <div class="howto-section">
            <p class="section-title">Como configurar</p>
            <div class="steps">
              <div v-for="(step, i) in portal.howto" :key="i" class="step">
                <div class="step-num" :style="{ background: portal.colorLight, color: portal.color }">{{ i + 1 }}</div>
                <span>{{ step }}</span>
              </div>
            </div>
          </div>

          <div class="flow-section">
            <p class="section-title">O que acontece</p>
            <div class="flow">
              <div class="flow-step">
                <div class="flow-icon" :style="{ background: portal.colorLight }">
                  <img :src="`https://logo.clearbit.com/${portal.domain}`" class="flow-logo" />
                </div>
                <span>Lead no {{ portal.name }}</span>
              </div>
              <ChevronRight :size="16" class="flow-arrow" />
              <div class="flow-step">
                <div class="flow-icon" style="background: #F0FDF4">
                  <span style="font-size:1.1rem">👤</span>
                </div>
                <span>Contato criado</span>
              </div>
              <ChevronRight :size="16" class="flow-arrow" />
              <div class="flow-step">
                <div class="flow-icon" style="background: #ECFDF5">
                  <span style="font-size:1.1rem">⚡</span>
                </div>
                <span>IA responde no WhatsApp</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <div class="tip-box">
      <div class="tip-icon">💡</div>
      <div>
        <strong>Dica:</strong> A IA só responde no WhatsApp se o lead informar o número de telefone.
        ZAP e Viva Real às vezes ocultam o telefone — nesses casos o lead aparece no painel para follow-up manual.
      </div>
    </div>
  </div>
</template>

<style scoped>
.portals-page {
  max-width: 860px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.page-header {
  margin-bottom: 2rem;
}
.page-header h2 {
  font-size: 1.4rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.4rem;
}
.page-header p {
  color: #6b7280;
  font-size: 0.92rem;
  margin: 0;
  max-width: 600px;
  line-height: 1.6;
}

/* Loading */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 4rem;
  color: #6b7280;
  font-size: 0.9rem;
}
.loading-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid #e5e7eb;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Portal Cards */
.portals-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.portal-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  transition: box-shadow 0.2s;
}
.portal-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

/* Top section */
.card-top {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-top: 3px solid transparent;
  border-bottom: 1px solid #f3f4f6;
}

.logo-area {
  flex-shrink: 0;
}

.brand-logo {
  width: 56px;
  height: 56px;
  object-fit: contain;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: white;
  padding: 4px;
}

.logo-fallback {
  width: 56px;
  height: 56px;
  border-radius: 10px;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  font-weight: 900;
  color: white;
  letter-spacing: -1px;
}

.portal-info {
  flex: 1;
}
.portal-info h3 {
  margin: 0 0 0.2rem;
  font-size: 1.05rem;
  font-weight: 700;
  color: #111827;
}
.portal-info p {
  margin: 0;
  font-size: 0.82rem;
  color: #6b7280;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.75rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #15803d;
  white-space: nowrap;
}
.status-badge .dot {
  width: 7px;
  height: 7px;
  background: #22c55e;
  border-radius: 50%;
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* Webhook section */
.webhook-section {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
}
.webhook-section label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.5rem;
}

.url-row {
  display: flex;
  gap: 0.5rem;
  align-items: stretch;
}

.url-display {
  flex: 1;
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.55rem 0.75rem;
  overflow: hidden;
  cursor: text;
  user-select: all;
}

.url-protocol {
  color: #94a3b8;
  font-size: 0.8rem;
  font-family: 'Courier New', monospace;
  flex-shrink: 0;
}

.url-path {
  font-size: 0.8rem;
  font-family: 'Courier New', monospace;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-copy {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0 1.1rem;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  min-height: 40px;
}
.btn-copy:hover { filter: brightness(0.92); }
.btn-copy.copied { background: #10b981 !important; }

/* Bottom section */
.card-bottom {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding: 1rem 1.5rem 1.25rem;
  background: #fafafa;
}

.section-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 0.6rem;
}

/* Steps */
.steps {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.step {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
}

.step-num {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
}

.step span {
  font-size: 0.81rem;
  color: #374151;
  line-height: 1.45;
}

/* Flow */
.flow {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.flow-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
}

.flow-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(0,0,0,0.06);
}

.flow-logo {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.flow-step span {
  font-size: 0.72rem;
  color: #6b7280;
  text-align: center;
  font-weight: 500;
  max-width: 70px;
  line-height: 1.3;
}

.flow-arrow {
  color: #9ca3af;
  flex-shrink: 0;
  margin-bottom: 16px;
}

/* Tip box */
.tip-box {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 10px;
  padding: 1rem 1.25rem;
  font-size: 0.86rem;
  color: #92400e;
  line-height: 1.6;
}

.tip-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .card-bottom { grid-template-columns: 1fr; }
  .card-top { flex-wrap: wrap; }
  .status-badge { display: none; }
}
</style>
