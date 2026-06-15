<script setup>
import { ref, onMounted } from 'vue'
import { Search, Settings2, Trash2, Plus } from '@lucide/vue'
import api from '../api'
import Swal from 'sweetalert2'

const inboxes = ref([])
const showAddModal = ref(false)

const fetchInboxes = async () => {
  try {
    const response = await api.get('/inboxes')
    inboxes.value = response.data
  } catch (error) {
    console.error('Failed to fetch inboxes:', error)
  }
}

onMounted(() => {
  fetchInboxes()
})

const deleteInbox = async (id) => {
  const result = await Swal.fire({
    title: 'Deletar?',
    text: 'A caixa de entrada será removida.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sim, deletar'
  })
  
  if (result.isConfirmed) {
    await api.delete(`/inboxes/${id}`)
    fetchInboxes()
  }
}

</script>

<template>
  <div class="page-container">
    <div class="page-content">
      <div class="header">
        <h1>Caixas de Entrada</h1>
        <p class="description">
          Conecte sua API do Baileys para enviar e receber mensagens reais via WhatsApp.
        </p>
      </div>

      <div class="actions-bar">
        <div class="search-wrapper">
          <Search class="icon-sm search-icon" />
          <input type="text" placeholder="Pesquisar caixas de entrada..." />
        </div>
        
        <div class="actions-right">
          <span class="count-text">{{ inboxes.length }} caixa(s) de entrada</span>
          <router-link to="/settings/inboxes/new" class="btn-primary">
            Adicionar Caixa de Entrada
          </router-link>
        </div>
      </div>

      <div class="inbox-list">
        <div class="inbox-card" v-for="inbox in inboxes" :key="inbox.id">
          <div class="inbox-info">
            <div class="icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#25d366" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-circle"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
            </div>
            <div class="inbox-details">
              <h3>{{ inbox.name }}</h3>
              <span class="provider">{{ inbox.provider.toUpperCase() }} ({{ inbox.phone_number }})</span>
            </div>
          </div>
          
          <div class="inbox-actions">
            <button class="icon-btn" @click="deleteInbox(inbox.id)"><Trash2 class="icon-sm" /></button>
          </div>
        </div>
        
        <div v-if="inboxes.length === 0" class="empty-state">
          Nenhuma caixa de entrada configurada.
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
  padding: 2.5rem 3rem;
  background: var(--bg-primary);
  overflow-y: auto;
}

.page-content {
  max-width: 1000px;
  width: 100%;
  margin: 0;
}

.header {
  margin-bottom: 2.5rem;

  h1 {
    font-size: 1.25rem;
    font-weight: 500;
    color: var(--text-main);
    margin-bottom: 1rem;
  }

  .description {
    color: var(--text-muted);
    font-size: 0.9rem;
    line-height: 1.6;
    margin-bottom: 0.75rem;
    max-width: 800px;
  }
}

.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.search-wrapper {
  position: relative;
  width: 260px;

  .search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
  }

  input {
    width: 100%;
    padding: 0.55rem 1rem 0.55rem 2.5rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-tertiary);
    font-size: 0.85rem;
    color: var(--text-main);
    outline: none;
    
    &:focus {
      border-color: var(--primary);
    }
  }
}

.actions-right {
  display: flex;
  align-items: center;
  gap: 1rem;

  .count-text {
    font-size: 0.85rem;
    color: var(--text-muted);
    border-right: 1px solid var(--border-color);
    padding-right: 1rem;
  }
}

.btn-primary {
  background: #1f93ff;
  color: white;
  padding: 0.55rem 1rem;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  
  &:hover {
    background: #007bf5;
  }
}

.btn-cancel {
  background: transparent;
  color: #666;
  border: 1px solid #ddd;
  padding: 0.55rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  
  &:hover {
    background: #f1f1f1;
  }
}

.inbox-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #999;
}

.inbox-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
}

.inbox-info {
  display: flex;
  align-items: center;
  gap: 1rem;

  .icon-wrapper {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-tertiary);
  }

  .inbox-details {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;

    h3 {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-main);
      margin: 0;
    }

    .provider {
      font-size: 0.85rem;
      color: var(--text-muted);
    }
  }
}

.inbox-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  .icon-btn {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    border: 1px solid var(--border-color);
    background: var(--bg-secondary);
    color: var(--text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    
    &:hover {
      background: #fee2e2;
      color: #ef4444;
      border-color: #fca5a5;
    }
  }
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  width: 450px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  
  h2 {
    margin: 0 0 1.5rem 0;
    font-size: 1.2rem;
  }
}

.form-group {
  margin-bottom: 1.25rem;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.85rem;
    color: #4b5563;
    font-weight: 500;
  }
  
  .form-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.95rem;
    
    &:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
  }
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}
</style>
