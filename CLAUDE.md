# CRM VisitaIA — Frontend (Vue 3)

## Visão Geral
CRM SaaS para imobiliárias. Produto do usuário Guilherme Balbis (balbis2050@gmail.com).
URL de produção: `crmchat.visitaia.com.br`
Deploy via: Docker Swarm + Portainer

## Stack Frontend
- Vue 3 + `<script setup>` (Composition API)
- Pinia (store/estado global)
- Vue Router 4
- Lucide Vue Next (ícones)
- SweetAlert2 (toasts e alertas)
- Axios via `src/api.js`
- SCSS scoped em cada componente

## Estrutura de Pastas Importantes
```
src/
  views/           → páginas principais
  components/      → componentes reutilizáveis
  store/           → Pinia stores (conversations.js, contacts.js, agents.js, etc.)
  router/index.js  → rotas + guards de autenticação
  api.js           → instância Axios configurada
  config/brand.js  → nome/marca do produto
  composables/     → usePushNotifications.js
```

## Rotas Principais
- `/login` → Login.vue
- `/dashboard` → DashboardLayout.vue (wrapper com sidebar)
  - `/conversas` → Conversas.vue (chat + painel direito)
  - `/contatos` → Contacts.vue
  - `/imoveis` → Properties.vue
  - `/condominios` → Condominiums.vue
  - `/agendamentos` → Appointments.vue
  - `/agentes` → Agents.vue / AgentForm.vue
  - `/funil` → Funnel.vue
  - `/relatorios` → Reports.vue
  - `/manual` → Manual.vue (manual do sistema para usuários)
  - `/settings/inboxes` → NewInbox.vue (configurar WhatsApp Baileys)
  - `/settings/account` → AccountSettings.vue
- `/admin` → AdminLayout.vue (super admin do SaaS)
  - `/admin/dashboard` → AdminDashboard.vue
  - `/admin/empresas` → AdminCompanies.vue
  - `/admin/suporte` → AdminSupport.vue

## Autenticação
- JWT via Devise-JWT (backend)
- Token salvo em `localStorage('auth_token')`
- Usuário em `localStorage('user')` (JSON: id, email, first_name, last_name, role, account_id)
- Roles: `atendente`, `empresa`, `admin`
- Super admin: role `admin` → acessa `/admin`

## Funcionalidades Implementadas
- Chat em tempo real (ActionCable WebSocket)
- WhatsApp via Baileys (somente, Cloud API removida)
- Matching automático lead ↔ imóvel via OpenAI GPT-4o-mini (botão ⚡ em Properties.vue)
- Transferência de conversa com nota (TransferModal.vue → cria mensagem privada)
- Funil de Kanban de negociações
- Agendamentos com calendário
- Relatórios com gráficos
- Notificações push (VAPID)
- Manual do sistema (Manual.vue, 16 seções)
- Exportação de contatos CSV (UTF-8 BOM)
- Cobrança via Asaas (billing_controller.rb no backend)

## Componentes Chave
- `TransferModal.vue` — modal para transferir conversa entre agentes com nota obrigatória
- `DashboardLayout.vue` — layout principal com sidebar, notificações, tema claro/escuro
- `Conversas.vue` — lista de conversas + painel de chat + painel direito (tags, agente, etc.)
- `AgentForm.vue` — cadastro/edição de agentes com permissões granulares
- `Contacts.vue` — lista com filtro, ordenação, busca e exportação CSV

## Padrões de Código
- Sempre usar `<script setup>` com `ref()` e `computed()`
- Ícones: importar individualmente de `lucide-vue-next`
- Toasts: `Swal.fire({ toast: true, position: 'top-end', ... })`
- API calls: `import api from '../api'` → `api.get/post/put/delete`
- SCSS scoped: variáveis CSS como `var(--primary)`, `var(--bg-secondary)`, `var(--text-main)`
- Sem comentários desnecessários no código

## Variáveis CSS Globais (tema)
```css
--primary: #4338ca
--bg-primary, --bg-secondary, --bg-tertiary, --bg-hover
--text-main, --text-muted, --text-inverse
--border-color
--shadow-color, --shadow-sm
--input-focus
```

## Deploy
1. Fazer alterações nos arquivos locais em `crm_frontend_check/`
2. `git add` + `git commit` + `git push` para o repositório GitHub
3. No Portainer: atualizar o serviço frontend (pull + redeploy)
4. Backend em `crm_backend_check/` → mesmo fluxo, serviço separado
5. Migrations: `bundle exec rails db:migrate` no container backend após deploy

## Repositório
GitHub: `https://github.com/balbiss/crm_inoovaweb_oficial`
Branch principal: `main`
