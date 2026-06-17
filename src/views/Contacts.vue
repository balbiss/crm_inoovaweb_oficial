<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Plus, Search, Filter, Mail, Phone, ChevronDown, ChevronUp, ArrowDownUp, MoreVertical } from '@lucide/vue'
import api from '../api' // Uses our configured axios instance with interceptor
import Swal from 'sweetalert2'
import { useContactsStore } from '../store/contacts'
import { storeToRefs } from 'pinia'

const contactsStore = useContactsStore()
const { contacts, isLoading } = storeToRefs(contactsStore)
const expandedContactId = ref(null)

const fetchContacts = () => {
  contactsStore.fetchContacts()
}

const closeDropdown = () => {
  if (showCountryDropdown.value) {
    showCountryDropdown.value = false
  }
}

onMounted(() => {
  fetchContacts()
  document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})

// Code removed as form is moved to ContactDetails.vue

const getInitials = (name) => {
  if (!name) return '?'
  return name.substring(0, 2).toUpperCase()
}

const colors = [
  { bg: '#dbeafe', color: '#1e40af' }, // Blue
  { bg: '#d1fae5', color: '#065f46' }, // Green
  { bg: '#fee2e2', color: '#991b1b' }, // Red
  { bg: '#fef3c7', color: '#92400e' }, // Yellow
  { bg: '#f3e8ff', color: '#6b21a8' }  // Purple
]

const getAvatarStyle = (name) => {
  if (!name) return { backgroundColor: '#e5e7eb', color: '#4b5563' }
  const index = name.charCodeAt(0) % colors.length
  return {
    backgroundColor: colors[index].bg,
    color: colors[index].color
  }
}

// Country Selector Logic
const showCountryDropdown = ref(false)
const searchCountryQuery = ref('')

const countriesList = [
  { code: 'AF', name: 'Afghanistan' },
  { code: 'AX', name: 'Aland Islands' },
  { code: 'AL', name: 'Albania' },
  { code: 'DZ', name: 'Algeria' },
  { code: 'AD', name: 'Andorra' },
  { code: 'AO', name: 'Angola' },
  { code: 'AI', name: 'Anguilla' },
  { code: 'AQ', name: 'Antarctica' },
  { code: 'AG', name: 'Antigua and Barbuda' },
  { code: 'AR', name: 'Argentina' },
  { code: 'AM', name: 'Armenia' },
  { code: 'AW', name: 'Aruba' },
  { code: 'AU', name: 'Australia' },
  { code: 'AT', name: 'Austria' },
  { code: 'AZ', name: 'Azerbaijan' },
  { code: 'BS', name: 'Bahamas' },
  { code: 'BR', name: 'Brazil' },
  { code: 'CA', name: 'Canada' },
  { code: 'PT', name: 'Portugal' },
  { code: 'US', name: 'United States' }
]

const filteredCountries = computed(() => {
  if (!searchCountryQuery.value) return countriesList
  return countriesList.filter(c => 
    c.name.toLowerCase().includes(searchCountryQuery.value.toLowerCase()) || 
    c.code.toLowerCase().includes(searchCountryQuery.value.toLowerCase())
  )
})

const selectCountry = (contact, country) => {
  contact.country_code = country.code
  showCountryDropdown.value = false
  searchCountryQuery.value = ''
}
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-left">
        <h1>Contatos</h1>
      </div>
      <div class="header-actions">
        <div class="search-box">
          <Search class="icon-sm search-icon" />
          <input type="text" placeholder="Pesquisar..." />
        </div>
        <button class="icon-btn"><Filter class="icon-sm" /></button>
        <button class="icon-btn"><ArrowDownUp class="icon-sm" /></button>
        <button class="icon-btn"><MoreVertical class="icon-sm" /></button>
        <button class="btn-primary">Enviar Mensagem</button>
      </div>
    </div>

    <div class="contacts-list">
      <div v-if="isLoading" class="skeleton-list">
        <div class="skeleton-card" v-for="i in 5" :key="i">
          <div class="skeleton-avatar"></div>
          <div class="skeleton-text">
            <div class="skeleton-line title"></div>
            <div class="skeleton-line subtitle"></div>
          </div>
          <div class="skeleton-action"></div>
        </div>
      </div>

      <template v-else>
        <div 
          class="contact-card" 
          v-for="contact in contacts" 
          :key="contact.id"
        >
          <div class="card-header" @click="$router.push(`/contatos/${contact.id}`)">
            <div class="contact-info-summary">
              <div class="avatar" :style="getAvatarStyle(contact.first_name || contact.name)">
                {{ getInitials(contact.first_name || contact.name) }}
              </div>
              <div class="contact-text">
                <h3 class="contact-name">{{ contact.first_name || contact.name }} {{ contact.last_name || '' }}</h3>
                <div class="contact-subtext">
                  <span class="phone">{{ contact.phone || 'Sem telefone' }}</span>
                  <span class="separator">|</span>
                  <a href="#" class="details-link" @click.stop.prevent="$router.push(`/contatos/${contact.id}`)">Ver detalhes</a>
                </div>
              </div>
            </div>
            <div class="card-actions">
              <ChevronDown class="icon-sm" />
            </div>
          </div>
        </div>
        
        <div class="pagination" v-if="contacts.length > 0">
          <span class="showing-text">Exibindo 1 - {{ contacts.length }} de {{ contacts.length }} contatos</span>
        </div>
        
        <div v-if="contacts.length === 0" class="empty-state">
          Nenhum contato encontrado.
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1.5rem 2rem;
  background: #f8f9fa; /* Matches Chatwoot light gray bg */
  overflow-y: auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  .header-left {
    h1 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1f2937;
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
    color: #9ca3af;
  }
  
  input {
    padding: 0.5rem 1rem 0.5rem 2.2rem;
    background: #f3f4f6;
    border: none;
    border-radius: 6px;
    outline: none;
    font-size: 0.85rem;
    color: #1f2937;
    width: 250px;
    
    &::placeholder {
      color: #9ca3af;
    }
    
    &:focus { 
      box-shadow: 0 0 0 2px #bfdbfe; 
    }
  }
}

.icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  
  &:hover { color: #374151; }
}

.btn-primary {
  background: #2563eb;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  font-weight: 500;
  font-size: 0.85rem;
  cursor: pointer;
  margin-left: 1rem;
  
  &:hover { background: #1d4ed8; }
}

.contacts-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.contact-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: none;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  cursor: pointer;
  background: transparent;
}

.contact-info-summary {
  display: flex;
  align-items: center;
  gap: 1.25rem;

  .avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    font-weight: 500;
  }

  .contact-text {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .contact-name {
    font-size: 0.95rem;
    font-weight: 500;
    color: #1f2937;
    margin: 0;
  }

  .contact-subtext {
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    .phone {
      color: #6b7280;
    }
    
    .separator {
      color: #e5e7eb;
    }

    .details-link {
      color: #2563eb;
      text-decoration: none;
      font-size: 0.8rem;
      font-weight: 500;
      
      &:hover { text-decoration: underline; }
    }
  }
}

/* Skeleton Loader */
.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.skeleton-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: white;
  border-bottom: 1px solid #f3f4f6;
  animation: pulse-skeleton 1.5s infinite;
  
  .skeleton-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #e5e7eb;
    margin-right: 1rem;
  }
  
  .skeleton-text {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .skeleton-line {
    height: 10px;
    background: #e5e7eb;
    border-radius: 4px;
    
    &.title { width: 120px; height: 14px; }
    &.subtitle { width: 200px; }
  }
  
  .skeleton-action {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    background: #e5e7eb;
  }
}

@keyframes pulse-skeleton {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

.empty-state {
  padding: 3rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.9rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  margin-top: 1rem;
}

.card-actions {
  color: #9ca3af;
}

.card-body {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.form-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.9rem;
  color: var(--text-main);
  outline: none;

  &::placeholder {
    color: var(--text-muted);
  }

  &:focus {
    border-color: var(--primary);
  }
}

.phone-input-group {
  display: flex;
  gap: 0.5rem;
  
  .country-selector-wrapper {
    position: relative;
    width: 100px;
  }

  .country-selector {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    font-size: 0.9rem;
    color: var(--text-main);
    cursor: pointer;
    user-select: none;
    
    &:hover { background: var(--bg-hover); }
  }

  .country-dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 4px;
    width: 250px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    box-shadow: 0 4px 6px -1px var(--shadow-sm), 0 2px 4px -1px var(--shadow-sm);
    z-index: 10;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .country-search-wrapper {
    display: flex;
    align-items: center;
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid var(--border-color);
    background: var(--bg-secondary);

    .search-icon-sm {
      color: var(--text-muted);
      margin-right: 0.5rem;
    }

    input {
      border: none;
      background: transparent;
      outline: none;
      font-size: 0.85rem;
      color: var(--text-main);
      width: 100%;
      &::placeholder { color: var(--text-muted); }
    }
  }

  .country-list {
    max-height: 200px;
    overflow-y: auto;
    
    .country-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 0.75rem;
      cursor: pointer;
      font-size: 0.85rem;
      
      &:hover { background: var(--bg-hover); }
      
      .c-code {
        font-weight: 600;
        color: var(--text-main);
        min-width: 20px;
      }
      
      .c-name {
        color: var(--text-muted);
      }
    }
  }
  
  .phone-input {
    flex: 1;
  }
}

.form-actions {
  display: flex;
  justify-content: flex-start;
}

.btn-update {
  background: var(--primary);
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  border: none;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  
  &:hover { background: var(--primary-hover); }
}

.pagination {
  margin-top: 1rem;
  padding: 1rem 0;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.loading-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-muted);
}
</style>
