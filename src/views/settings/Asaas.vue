<script setup>
import { ref, onMounted } from 'vue'
import api from '../../api'
import Swal from 'sweetalert2'
import { Eye, EyeOff, CheckCircle, XCircle, Loader2 } from 'lucide-vue-next'

const apiKey       = ref('')
const showKey      = ref(false)
const isConfigured = ref(false)
const isSandbox    = ref(false)
const isSaving     = ref(false)
const isTesting    = ref(false)
const testResult   = ref(null) // { ok, message }

onMounted(async () => {
  try {
    const res = await api.get('/account')
    isConfigured.value = res.data.asaas_configured
    isSandbox.value    = res.data.asaas_sandbox ?? false
    if (res.data.asaas_api_key) {
      apiKey.value = res.data.asaas_api_key
    }
  } catch (e) { console.error(e) }
})

const saveKey = async () => {
  if (!apiKey.value.trim()) {
    return Swal.fire({ icon: 'warning', title: 'API Key vazia', text: 'Digite a chave antes de salvar.', confirmButtonColor: '#4338ca' })
  }
  isSaving.value = true
  try {
    await api.put('/account', { account: { asaas_api_key: apiKey.value.trim(), asaas_sandbox: isSandbox.value } })
    isConfigured.value = true
    testResult.value = null
    Swal.fire({ icon: 'success', title: 'Salvo!', text: 'Configuração do Asaas salva com sucesso.', timer: 1800, showConfirmButton: false })
  } catch (e) {
    Swal.fire({ icon: 'error', title: 'Erro', text: 'Não foi possível salvar a configuração.', confirmButtonColor: '#4338ca' })
  } finally {
    isSaving.value = false
  }
}

const testConnection = async () => {
  isTesting.value  = true
  testResult.value = null
  try {
    const res = await api.get('/account/test_asaas')
    testResult.value = res.data
  } catch (e) {
    testResult.value = { ok: false, message: 'Erro ao testar conexão.' }
  } finally {
    isTesting.value = false
  }
}

const saveSandboxMode = async () => {
  try {
    await api.put('/account', { account: { asaas_sandbox: isSandbox.value } })
    testResult.value = null
  } catch (e) { console.error(e) }
}

const removeKey = async () => {
  const { isConfirmed } = await Swal.fire({
    title: 'Remover integração?',
    text: 'A cobrança via Asaas será desativada.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonText: 'Cancelar',
    confirmButtonText: 'Sim, remover'
  })
  if (!isConfirmed) return

  try {
    await api.put('/account', { account: { asaas_api_key: '' } })
    apiKey.value = ''
    isConfigured.value = false
    testResult.value   = null
    Swal.fire({ icon: 'success', title: 'Removido', timer: 1500, showConfirmButton: false })
  } catch (e) { console.error(e) }
}
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Cobrança — Asaas</h1>
      <p>Integre com o Asaas para gerar boletos e PIX direto pelo CRM e enviar ao cliente pelo WhatsApp.</p>
    </div>

    <!-- Status badge -->
    <div class="status-bar" :class="isConfigured ? 'status-ok' : 'status-pending'">
      <component :is="isConfigured ? CheckCircle : XCircle" :size="16" />
      {{ isConfigured ? 'Integração ativa' : 'Não configurado' }}
    </div>

    <div class="card">
      <h2 class="card-title">API Key do Asaas</h2>
      <p class="card-desc">
        Encontre sua chave em
        <strong>Asaas → Configurações → Integrações → API</strong>.
        Ela começa com <code>$aact_</code>.
      </p>

      <div class="key-row">
        <div class="input-eye">
          <input
            :type="showKey ? 'text' : 'password'"
            v-model="apiKey"
            placeholder="$aact_..."
            class="key-input"
            autocomplete="off"
          />
          <button class="eye-btn" type="button" @click="showKey = !showKey" tabindex="-1">
            <EyeOff v-if="showKey" :size="16" />
            <Eye v-else :size="16" />
          </button>
        </div>

        <button class="btn-primary" :disabled="isSaving" @click="saveKey">
          <Loader2 v-if="isSaving" :size="15" class="spin" />
          {{ isSaving ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>

      <!-- Ambiente -->
      <div class="env-row">
        <span class="env-label">Ambiente:</span>
        <label class="env-option" :class="{ active: !isSandbox }">
          <input type="radio" :value="false" v-model="isSandbox" @change="saveSandboxMode" />
          🟢 Produção
        </label>
        <label class="env-option" :class="{ active: isSandbox }">
          <input type="radio" :value="true" v-model="isSandbox" @change="saveSandboxMode" />
          🧪 Sandbox (testes)
        </label>
      </div>

      <div class="btn-row">
        <button class="btn-secondary" :disabled="!isConfigured || isTesting" @click="testConnection">
          <Loader2 v-if="isTesting" :size="14" class="spin" />
          {{ isTesting ? 'Testando...' : 'Testar conexão' }}
        </button>
        <button class="btn-danger" :disabled="!isConfigured" @click="removeKey">
          Remover integração
        </button>
      </div>

      <!-- Test result -->
      <div v-if="testResult" :class="['test-result', testResult.ok ? 'result-ok' : 'result-error']">
        <component :is="testResult.ok ? CheckCircle : XCircle" :size="15" />
        {{ testResult.message }}
      </div>
    </div>

    <!-- Info box -->
    <div class="info-box">
      <h3>Quem pode gerar cobranças?</h3>
      <div class="dept-list">
        <span class="dept-chip chip-ok">✅ Financeiro</span>
        <span class="dept-chip chip-ok">✅ Suporte</span>
        <span class="dept-chip chip-ok">✅ Manutenção</span>
        <span class="dept-chip chip-ok">✅ Dono / Admin</span>
        <span class="dept-chip chip-no">❌ Corretor</span>
      </div>
      <p class="info-text">
        O boleto é enviado como <strong>arquivo PDF</strong> pelo WhatsApp da empresa ao cliente.
        O PIX é enviado como <strong>imagem do QR Code</strong> + código Copia e Cola.
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page-container { padding: 2rem; max-width: 720px; }

.page-header {
  margin-bottom: 1.5rem;
  h1 { font-size: 1.3rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.3rem; }
  p  { color: var(--text-muted); font-size: 0.9rem; }
}

.status-bar {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 600;
  margin-bottom: 1.5rem;

  &.status-ok      { background: rgba(16,185,129,0.12); color: #065f46; }
  &.status-pending { background: rgba(245,158,11,0.12); color: #92400e; }
}

.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 1.25rem;
}

.card-title { font-size: 1rem; font-weight: 600; color: var(--text-main); margin-bottom: 0.3rem; }
.card-desc  { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem; code { background: var(--bg-hover); padding: 0.1rem 0.35rem; border-radius: 4px; } }

.key-row {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 0.75rem;
}

.input-eye {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;

  .key-input {
    width: 100%;
    padding: 0.65rem 2.5rem 0.65rem 0.9rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: 0.9rem;
    background: var(--bg-primary);
    color: var(--text-main);
    outline: none;
    font-family: monospace;
    &:focus { border-color: #4338ca; box-shadow: 0 0 0 3px rgba(67,56,202,0.1); }
  }

  .eye-btn {
    position: absolute;
    right: 0.75rem;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-muted);
    display: flex;
    padding: 0;
    &:hover { color: #4338ca; }
  }
}

.env-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.env-label {
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--text-muted);
}

.env-option {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.9rem;
  border-radius: 20px;
  border: 1.5px solid var(--border-color);
  font-size: 0.83rem;
  font-weight: 500;
  cursor: pointer;
  color: var(--text-muted);
  transition: border-color 0.15s, color 0.15s, background 0.15s;

  input[type="radio"] { display: none; }

  &.active {
    border-color: #4338ca;
    background: rgba(67,56,202,0.07);
    color: #4338ca;
    font-weight: 600;
  }
}

.btn-row {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.btn-primary {
  background: #4338ca;
  color: white;
  border: none;
  border-radius: 7px;
  padding: 0.65rem 1.25rem;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  white-space: nowrap;
  &:disabled { opacity: 0.6; cursor: not-allowed; }
}

.btn-secondary {
  background: var(--bg-primary);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  border-radius: 7px;
  padding: 0.6rem 1.1rem;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.btn-danger {
  background: rgba(220,38,38,0.08);
  color: #dc2626;
  border: 1px solid rgba(220,38,38,0.2);
  border-radius: 7px;
  padding: 0.6rem 1.1rem;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  &:disabled { opacity: 0.4; cursor: not-allowed; }
}

.test-result {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.75rem;
  font-size: 0.85rem;
  font-weight: 500;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;

  &.result-ok    { background: rgba(16,185,129,0.1); color: #065f46; }
  &.result-error { background: rgba(220,38,38,0.08); color: #dc2626; }
}

.info-box {
  background: rgba(67,56,202,0.04);
  border: 1px solid rgba(67,56,202,0.15);
  border-radius: 10px;
  padding: 1.25rem 1.5rem;

  h3 { font-size: 0.9rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.75rem; }
}

.dept-list { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.9rem; }

.dept-chip {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 600;
  &.chip-ok { background: rgba(16,185,129,0.12); color: #065f46; }
  &.chip-no { background: rgba(220,38,38,0.1);   color: #dc2626; }
}

.info-text { font-size: 0.85rem; color: var(--text-muted); line-height: 1.6; }

.spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
