<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import Swal from 'sweetalert2'
import { brand } from '../config/brand'

const router = useRouter()
const companyName = ref('')
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const isLoading = ref(false)

const handleRegister = async () => {
  if (password.value !== passwordConfirmation.value) {
    Swal.fire({
      icon: 'error',
      title: 'Ops...',
      text: 'As senhas não coincidem. Verifique e tente novamente.',
      confirmButtonColor: '#2563eb',
      customClass: { icon: 'swal-icon-pulse-slow' }
    })
    return
  }
  
  isLoading.value = true
  try {
    const response = await axios.post(`${brand.apiUrl}/users`, {
      user: {
        company_name: companyName.value,
        first_name: firstName.value,
        last_name: lastName.value,
        email: email.value,
        password: password.value,
        password_confirmation: passwordConfirmation.value
      }
    })
    
    await Swal.fire({
      icon: 'success',
      title: 'Bem-vindo(a)!',
      text: 'Conta criada com sucesso. Você já pode acessar o sistema.',
      confirmButtonColor: '#2563eb'
    })
    router.push('/login')
  } catch (error) {
    console.error("Registration error", error)
    let errorMessage = 'Erro ao criar conta. Verifique os dados e tente novamente.'
    
    if (error.response && error.response.data && error.response.data.errors) {
      const rawError = error.response.data.errors.join(', ')
      
      if (rawError.includes('Email has already been taken')) {
        errorMessage = 'Este e-mail já está cadastrado em nosso sistema. Faça o login ou use outro e-mail.'
      } else if (rawError.includes('Password is too short')) {
        errorMessage = 'A senha escolhida é muito curta. Use no mínimo 6 caracteres.'
      } else if (rawError.includes("Email can't be blank")) {
        errorMessage = 'O campo de e-mail não pode ficar em branco.'
      } else {
        errorMessage = rawError.replace('Validation failed: ', '')
      }
    }
    
    Swal.fire({
      icon: 'error',
      title: 'Não foi possível criar',
      text: errorMessage,
      confirmButtonColor: '#2563eb',
      customClass: { icon: 'swal-icon-pulse-slow' }
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h1 class="logo">Innova<span>web</span></h1>
        <h2>Crie sua conta</h2>
        <p>Comece a gerenciar sua imobiliária de forma inteligente.</p>
      </div>

      <form @submit.prevent="handleRegister" class="auth-form">

        <div class="form-group">
          <label for="companyName">Nome da Imobiliária</label>
          <input type="text" id="companyName" v-model="companyName" placeholder="Minha Imobiliária" required />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="firstName">Nome</label>
            <input type="text" id="firstName" v-model="firstName" placeholder="João" required />
          </div>
          <div class="form-group">
            <label for="lastName">Sobrenome</label>
            <input type="text" id="lastName" v-model="lastName" placeholder="Silva" required />
          </div>
        </div>

        <div class="form-group">
          <label for="email">E-mail Corporativo</label>
          <input type="email" id="email" v-model="email" placeholder="joao@imobiliaria.com" required />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="password">Senha</label>
            <input type="password" id="password" v-model="password" placeholder="Mín. 8 caracteres" required />
          </div>
          <div class="form-group">
            <label for="passwordConfirmation">Confirme a Senha</label>
            <input type="password" id="passwordConfirmation" v-model="passwordConfirmation" placeholder="Repita" required />
          </div>
        </div>

        <button type="submit" class="btn-primary" :disabled="isLoading">
          {{ isLoading ? 'Criando Conta...' : 'Criar Conta' }}
        </button>
      </form>

      <div class="auth-footer">
        <p>Já possui uma conta? <router-link to="/login">Fazer login</router-link></p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.auth-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 1rem;
  background: var(--bg-color);
}

.auth-card {
  background: var(--card-bg);
  width: 100%;
  max-width: 480px; /* Slightly wider to accommodate side-by-side fields */
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  padding: 2rem;
  margin: auto;
}

.auth-header {
  text-align: center;
  margin-bottom: 1.5rem;

  .logo {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text-main);
    margin-bottom: 1rem;
    
    span {
      color: var(--primary);
    }
  }

  h2 {
    font-size: 1.4rem;
    font-weight: 600;
    margin-bottom: 0.3rem;
  }

  p {
    color: var(--text-muted);
    font-size: 0.9rem;
  }
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem; /* Reduced gap */
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  label {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-main);
  }

  input {
    width: 100%;
    box-sizing: border-box;
    padding: 0.75rem 1rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: 0.95rem;
    outline: none;
    transition: all 0.2s;

    &:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--input-focus);
    }
  }
}

.btn-primary {
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.8rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  margin-top: 1rem;
  transition: background 0.2s;

  &:hover {
    background: var(--primary-hover);
  }
}

.auth-footer {
  text-align: center;
  margin-top: 2rem;
  font-size: 0.9rem;
  color: var(--text-muted);

  a {
    font-weight: 500;
  }
}

/* SweetAlert2 Custom Animations */
@keyframes slowPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05) translateY(-3px); }
  100% { transform: scale(1); }
}

:deep(.swal-icon-pulse-slow) {
  animation: slowPulse 2.5s ease-in-out infinite !important;
}
</style>
