<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import Swal from 'sweetalert2'

const router = useRouter()
const email = ref('')
const password = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  isLoading.value = true
  
  try {
    const response = await axios.post('http://localhost:3000/users/sign_in', {
      user: {
        email: email.value,
        password: password.value
      }
    })
    
    // Devise-JWT returns the token in the Authorization header
    const token = response.headers.authorization
    if (token) {
      localStorage.setItem('auth_token', token)
    }
    
    // Save user info just in case
    if (response.data && response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    
    await Swal.fire({
      icon: 'success',
      title: 'Login realizado!',
      text: 'Bem-vindo de volta ao Innovaweb.',
      confirmButtonColor: '#2563eb',
      timer: 1500,
      showConfirmButton: false
    })
    
    if (response.data && response.data.user && response.data.user.role === 'admin') {
      router.push('/admin')
    } else {
      router.push('/dashboard')
    }
  } catch (error) {
    console.error("Login error", error)
    Swal.fire({
      icon: 'error',
      title: 'Acesso Negado',
      text: 'E-mail ou senha incorretos. Verifique e tente novamente.',
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
        <h2>Bem-vindo de volta</h2>
        <p>Acesse sua conta para gerenciar seus imóveis e leads.</p>
      </div>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label for="email">E-mail</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            placeholder="seu@email.com" 
            required 
          />
        </div>

        <div class="form-group">
          <label for="password">Senha</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            placeholder="••••••••" 
            required 
          />
        </div>

        <div class="form-actions">
          <label class="remember-me">
            <input type="checkbox" />
            Lembrar de mim
          </label>
          <router-link to="/forgot-password" class="forgot-password">Esqueceu a senha?</router-link>
        </div>

        <button type="submit" class="btn-primary" :disabled="isLoading">
          {{ isLoading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>

      <div class="auth-footer">
        <p>Ainda não tem uma conta? <router-link to="/register">Crie uma agora</router-link></p>
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
}

.auth-card {
  background: var(--card-bg);
  width: 100%;
  max-width: 420px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  padding: 2.5rem;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;

  .logo {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text-main);
    margin-bottom: 1.5rem;
    
    span {
      color: var(--primary);
    }
  }

  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  p {
    color: var(--text-muted);
    font-size: 0.95rem;
  }
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
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

.form-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.85rem;

  .remember-me {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    cursor: pointer;
    color: var(--text-muted);
  }

  .forgot-password {
    font-weight: 500;
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
  margin-top: 0.5rem;
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
</style>
