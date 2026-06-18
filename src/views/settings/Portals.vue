<script setup>
import { ref, onMounted } from 'vue'
import { Copy, Check, ExternalLink, Zap, Building2, Globe } from 'lucide-vue-next'
import api from '../../api'

const webhookUrls  = ref({})
const copiedKey    = ref(null)
const isLoading    = ref(true)

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
  setTimeout(() => { copiedKey.value = null }, 2000)
}

const portals = [
  {
    key:         'canal_pro',
    name:        'Canal Pro',
    color:       '#7c3aed',
    bg:          '#f5f3ff',
    description: 'Cole a URL abaixo em Configurações → Leads → Receber leads no CRM',
    docsUrl:     'https://canalpro.com.br',
    icon:        Zap,
    howto: [
      'Acesse seu painel do Canal Pro',
      'Vá em Configurações → Leads → Receber leads no CRM',
      'No campo "Nome do CRM" escreva: VisitaIA CRM',
      'Cole a URL abaixo no campo "URL de integração"',
      'Clique em Salvar alterações',
    ]
  },
  {
    key:         'zap',
    name:        'ZAP Imóveis',
    color:       '#d97706',
    bg:          '#fffbeb',
    description: 'Cole a URL abaixo na configuração de webhook do ZAP Imóveis',
    docsUrl:     'https://zapimoveis.com.br',
    icon:        Building2,
    howto: [
      'Acesse o painel do ZAP Imóveis (Programa de Parceiros)',
      'Vá em Integrações → Webhook de Leads',
      'Cole a URL abaixo no campo de endpoint',
      'Salve e envie um lead de teste',
    ]
  },
  {
    key:         'viva_real',
    name:        'Viva Real',
    color:       '#0284c7',
    bg:          '#f0f9ff',
    description: 'Cole a URL abaixo na configuração de webhook do Viva Real',
    docsUrl:     'https://vivareal.com.br',
    icon:        Globe,
    howto: [
      'Acesse o painel do Viva Real (mesmo login do ZAP)',
      'Vá em Integrações → Webhook de Leads',
      'Cole a URL abaixo no campo de endpoint',
      'Salve e envie um lead de teste',
    ]
  }
]
</script>

<template>
  <div class="portals-page">
    <div class="page-header">
      <h2>Portais Imobiliários</h2>
      <p>Receba leads do Canal Pro, ZAP e Viva Real diretamente no CRM. A IA responde no WhatsApp automaticamente.</p>
    </div>

    <div v-if="isLoading" class="loading">Carregando...</div>

    <div v-else class="portals-grid">
      <div
        v-for="portal in portals"
        :key="portal.key"
        class="portal-card"
        :style="{ '--accent': portal.color, '--accent-bg': portal.bg }"
      >
        <div class="card-header">
          <div class="portal-badge" :style="{ background: portal.bg }">
            <component :is="portal.icon" :size="20" :style="{ color: portal.color }" />
          </div>
          <div>
            <h3>{{ portal.name }}</h3>
            <p class="card-desc">{{ portal.description }}</p>
          </div>
        </div>

        <!-- URL de webhook -->
        <div class="webhook-box">
          <label>URL de integração (webhook)</label>
          <div class="url-row">
            <input
              readonly
              :value="webhookUrls[portal.key] || 'Carregando...'"
              class="url-input"
              @click="$event.target.select()"
            />
            <button
              class="btn-copy"
              :class="{ copied: copiedKey === portal.key }"
              @click="copy(portal.key, webhookUrls[portal.key])"
            >
              <Check v-if="copiedKey === portal.key" :size="15" />
              <Copy v-else :size="15" />
              {{ copiedKey === portal.key ? 'Copiado!' : 'Copiar' }}
            </button>
          </div>
        </div>

        <!-- Passo a passo -->
        <div class="howto">
          <p class="howto-title">Como configurar:</p>
          <ol>
            <li v-for="(step, i) in portal.howto" :key="i">{{ step }}</li>
          </ol>
        </div>

        <!-- Flow visual -->
        <div class="flow-badge">
          <span>Lead no {{ portal.name }}</span>
          <span class="arrow">→</span>
          <span>CRM cria contato</span>
          <span class="arrow">→</span>
          <span>IA responde no WhatsApp ⚡</span>
        </div>
      </div>
    </div>

    <div class="info-box">
      <strong>💡 Como funciona:</strong> Quando um lead preenche o formulário de interesse no portal,
      ele é enviado automaticamente para o CRM via webhook. O contato é criado, a conversa aparece
      no painel e — se o lead informou telefone — a IA envia uma mensagem no WhatsApp em segundos.
    </div>
  </div>
</template>

<style scoped>
.portals-page {
  max-width: 900px;
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
  margin: 0 0 0.4rem 0;
}

.page-header p {
  color: #6b7280;
  font-size: 0.95rem;
  margin: 0;
}

.loading {
  text-align: center;
  color: #6b7280;
  padding: 3rem;
}

.portals-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.portal-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  border-left: 4px solid var(--accent);
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.portal-badge {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-header h3 {
  margin: 0 0 0.2rem 0;
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
}

.card-desc {
  margin: 0;
  font-size: 0.82rem;
  color: #6b7280;
}

.webhook-box {
  margin-bottom: 1.25rem;
}

.webhook-box label {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 0.4rem;
}

.url-row {
  display: flex;
  gap: 0.5rem;
}

.url-input {
  flex: 1;
  padding: 0.55rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 7px;
  font-size: 0.82rem;
  font-family: 'Courier New', monospace;
  color: #374151;
  background: #f9fafb;
  outline: none;
  cursor: pointer;
}

.btn-copy {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.55rem 1rem;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 7px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.15s;
}
.btn-copy:hover { opacity: 0.88; }
.btn-copy.copied { background: #10b981; }

.howto {
  background: var(--accent-bg);
  border-radius: 8px;
  padding: 0.9rem 1rem;
  margin-bottom: 1rem;
}

.howto-title {
  font-size: 0.82rem;
  font-weight: 700;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.howto ol {
  margin: 0;
  padding-left: 1.25rem;
}

.howto li {
  font-size: 0.83rem;
  color: #4b5563;
  margin-bottom: 0.25rem;
  line-height: 1.5;
}

.flow-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  font-size: 0.8rem;
  color: #6b7280;
  background: #f9fafb;
  border-radius: 8px;
  padding: 0.6rem 0.9rem;
}

.flow-badge span:not(.arrow) {
  background: white;
  border: 1px solid #e5e7eb;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-weight: 500;
  color: #374151;
}

.arrow { color: #9ca3af; font-weight: bold; }

.info-box {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 10px;
  padding: 1rem 1.25rem;
  font-size: 0.88rem;
  color: #1e40af;
  line-height: 1.6;
}
</style>
