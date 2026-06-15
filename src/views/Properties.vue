<script setup>
import { ref, onMounted } from 'vue'
import { Plus, Search, Filter, MoreVertical, MapPin, Home, DollarSign, X } from '@lucide/vue'
import api from '../api'
import Swal from 'sweetalert2'

const properties = ref([])
const isLoading = ref(true)
const showModal = ref(false)

const newProperty = ref({
  title: '',
  description: '',
  price: '',
  bedrooms: 0,
  bathrooms: 0,
  status: 'Disponível'
})

const fetchProperties = async () => {
  isLoading.value = true
  try {
    const response = await api.get('/properties')
    properties.value = response.data
  } catch (error) {
    console.error('Error fetching properties:', error)
    // Fallback list to allow UI preview if offline
    properties.value = [
      { id: 1, title: 'Apartamento Duplex Vila Madalena', price: 'R$ 1.200.000', bedrooms: 3, bathrooms: 2, status: 'Disponível' },
      { id: 2, title: 'Casa Condomínio Fechado', price: 'R$ 2.500.000', bedrooms: 4, bathrooms: 4, status: 'Em Negociação' },
    ]
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchProperties()
})

const handleCreateProperty = async () => {
  if (!newProperty.value.title || !newProperty.value.price) {
    Swal.fire({
      icon: 'warning',
      title: 'Atenção',
      text: 'Título e Preço são obrigatórios!',
      confirmButtonColor: '#1f93ff'
    })
    return
  }

  try {
    const user = JSON.parse(localStorage.getItem('user'))
    const account_id = user ? user.account_id : null

    await api.post('/properties', {
      property: {
        title: newProperty.value.title,
        description: newProperty.value.description,
        price: newProperty.value.price,
        bedrooms: parseInt(newProperty.value.bedrooms) || 0,
        bathrooms: parseInt(newProperty.value.bathrooms) || 0,
        status: newProperty.value.status,
        account_id: account_id
      }
    })

    Swal.fire({
      icon: 'success',
      title: 'Imóvel Cadastrado',
      text: 'O imóvel foi adicionado com sucesso!',
      timer: 1500,
      showConfirmButton: false
    })

    showModal.value = false
    newProperty.value = {
      title: '',
      description: '',
      price: '',
      bedrooms: 0,
      bathrooms: 0,
      status: 'Disponível'
    }
    fetchProperties()
  } catch (error) {
    console.error('Error creating property:', error)
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Não foi possível cadastrar o imóvel.'
    })
  }
}
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-left">
        <h1>Imóveis</h1>
        <span class="badge">{{ properties.length }} totais</span>
      </div>
      <div class="header-actions">
        <div class="search-box">
          <Search class="icon-sm search-icon" />
          <input type="text" placeholder="Buscar imóvel..." />
        </div>
        <button class="btn-secondary"><Filter class="icon-sm" /> Filtros</button>
        <button class="btn-primary" @click="showModal = true"><Plus class="icon-sm" /> Novo Imóvel</button>
      </div>
    </div>

    <div class="table-container" v-if="!isLoading">
      <table class="data-table">
        <thead>
          <tr>
            <th>Título</th>
            <th>Preço</th>
            <th>Características</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="property in properties" :key="property.id">
            <td>
              <div class="property-title">
                <div class="avatar"><Home class="icon-sm" /></div>
                <span>{{ property.title }}</span>
              </div>
            </td>
            <td>
              <div class="info-cell"><DollarSign class="icon-xs" /> {{ property.price }}</div>
            </td>
            <td>
              <div class="info-cell">
                <span>{{ property.bedrooms }} Quartos</span>
                <span class="dot">•</span>
                <span>{{ property.bathrooms }} Banheiros</span>
              </div>
            </td>
            <td>
              <span class="status-badge" :class="{'bg-green': property.status === 'Disponível', 'bg-yellow': property.status === 'Em Negociação'}">
                {{ property.status }}
              </span>
            </td>
            <td>
              <button class="icon-btn"><MoreVertical class="icon-sm" /></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="loading-state">
      Carregando imóveis...
    </div>

    <!-- Modal de Criação de Imóvel -->
    <div v-if="showModal" class="modal-backdrop" @click.self="showModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>Cadastrar Novo Imóvel</h3>
          <button class="close-btn" @click="showModal = false"><X class="icon-sm" /></button>
        </div>
        <form @submit.prevent="handleCreateProperty" class="modal-form">
          <div class="form-group">
            <label for="title">Título do Imóvel</label>
            <input type="text" id="title" v-model="newProperty.title" placeholder="Ex: Apartamento na Vila Madalena" required />
          </div>
          <div class="form-group">
            <label for="description">Descrição</label>
            <textarea id="description" v-model="newProperty.description" placeholder="Ex: Excelente localização, próximo ao metrô..."></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="price">Preço</label>
              <input type="text" id="price" v-model="newProperty.price" placeholder="Ex: R$ 850.000" required />
            </div>
            <div class="form-group">
              <label for="status">Status</label>
              <select id="status" v-model="newProperty.status">
                <option value="Disponível">Disponível</option>
                <option value="Em Negociação">Em Negociação</option>
                <option value="Vendido">Vendido</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="bedrooms">Dormitórios</label>
              <input type="number" id="bedrooms" v-model="newProperty.bedrooms" min="0" />
            </div>
            <div class="form-group">
              <label for="bathrooms">Banheiros</label>
              <input type="number" id="bathrooms" v-model="newProperty.bathrooms" min="0" />
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="showModal = false">Cancelar</button>
            <button type="submit" class="btn-submit">Salvar Imóvel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1.5rem 2rem;
  background: var(--bg-primary);
  overflow-y: auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  .header-left {
    display: flex;
    align-items: center;
    gap: 1rem;
    
    h1 {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-main);
    }
    
    .badge {
      background: var(--bg-tertiary);
      color: var(--text-muted);
      padding: 0.2rem 0.6rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
    }
  }

  .header-actions {
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }
}

.search-box {
  position: relative;
  
  .search-icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
  }
  
  input {
    padding: 0.5rem 1rem 0.5rem 2.2rem;
    border: 1px solid var(--border-color);
    background: var(--bg-secondary);
    color: var(--text-main);
    border-radius: 6px;
    outline: none;
    font-size: 0.85rem;
    
    &:focus { border-color: var(--primary); }
  }
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: var(--primary);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  
  &:hover { background: var(--primary-hover); }
}

.btn-secondary {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: var(--bg-secondary);
  color: var(--text-main);
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover { background: var(--bg-hover); }
}

.table-container {
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  
  th {
    background: var(--bg-tertiary);
    padding: 0.75rem 1.5rem;
    text-align: left;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    border-bottom: 1px solid var(--border-color);
  }
  
  td {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--border-color);
    color: var(--text-main);
    font-size: 0.9rem;
  }
  
  tr:last-child td { border-bottom: none; }
  tr:hover { background: var(--bg-hover); }
}

.property-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
  
  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: var(--bg-tertiary);
    color: var(--text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.info-cell {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--text-muted);

  .dot {
    color: var(--border-color);
  }
}

.status-badge {
  background: var(--bg-tertiary);
  color: var(--text-muted);
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;

  &.bg-green {
    background: #dcfce7;
    color: #166534;
  }
  
  &.bg-yellow {
    background: #fef3c7;
    color: #92400e;
  }
}

.icon-sm { width: 16px; height: 16px; }
.icon-xs { width: 14px; height: 14px; color: var(--text-muted); }
.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  
  &:hover { color: var(--text-main); }
}

.loading-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-muted);
}

/* Modal Styling */
.modal-backdrop {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px var(--shadow-color), 0 10px 10px -5px var(--shadow-sm);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-tertiary);

  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-main);
  }

  .close-btn {
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    &:hover { color: var(--text-main); }
  }
}

.modal-form {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  label {
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--text-main);
  }

  input, textarea, select {
    padding: 0.65rem 0.75rem;
    border: 1px solid var(--border-color);
    background: var(--bg-primary);
    color: var(--text-main);
    border-radius: 6px;
    font-size: 0.9rem;
    outline: none;
    &:focus {
      border-color: var(--primary);
    }
  }

  textarea {
    min-height: 80px;
    resize: vertical;
  }
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;

  .btn-cancel {
    background: var(--bg-tertiary);
    color: var(--text-main);
    border: 1px solid var(--border-color);
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    &:hover { background: var(--bg-hover); }
  }

  .btn-submit {
    background: var(--primary);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    &:hover { background: var(--primary-hover); }
  }
}
</style>

