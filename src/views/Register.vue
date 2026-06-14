<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')

const handleRegister = () => {
  console.log('Register attempt:', { name: name.value, email: email.value })
  // Logic for registration goes here
  // After success, redirect to login or dashboard
  // router.push('/login')
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
          <label for="name">Nome Completo</label>
          <input 
            type="text" 
            id="name" 
            v-model="name" 
            placeholder="João Silva" 
            required 
          />
        </div>

        <div class="form-group">
          <label for="email">E-mail Corporativo</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            placeholder="joao@imobiliaria.com" 
            required 
          />
        </div>

        <div class="form-group">
          <label for="password">Senha</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            placeholder="Mínimo de 8 caracteres" 
            required 
          />
        </div>

        <button type="submit" class="btn-primary">Criar Conta</button>
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
</style>
