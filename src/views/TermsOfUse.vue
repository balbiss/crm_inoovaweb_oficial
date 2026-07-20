<script setup>
import { useRouter } from 'vue-router'
import { brand } from '../config/brand'

const router = useRouter()
</script>

<template>
  <div class="legal-page">
    <div class="legal-container">
      <button class="btn-back" @click="router.back()">← Voltar</button>
      <h1>Termos de Uso</h1>
      <p class="updated">Última atualização: julho de 2026</p>

      <p>Estes Termos de Uso regulam o acesso e a utilização da plataforma <strong>{{ brand.name }}</strong> por imobiliárias e seus usuários. Ao criar uma conta ou utilizar a plataforma, você concorda integralmente com estes termos.</p>

      <h2>1. Descrição do serviço</h2>
      <p>{{ brand.name }} é um CRM (gestão de relacionamento com clientes) para imobiliárias, que centraliza o atendimento a leads via WhatsApp, Instagram e portais imobiliários, com apoio de inteligência artificial para qualificação de leads, respostas automatizadas e agendamento de visitas.</p>

      <h2>2. Cadastro e conta</h2>
      <p>Para usar a plataforma, a imobiliária deve fornecer informações verdadeiras e completas no cadastro. Cada usuário é responsável por manter a confidencialidade de sua senha e por todas as atividades realizadas em sua conta.</p>

      <h2>3. Uso aceitável</h2>
      <p>Ao utilizar o {{ brand.name }}, você concorda em não:</p>
      <ul>
        <li>Utilizar a plataforma para enviar mensagens não solicitadas (spam) ou conteúdo ilegal, enganoso ou ofensivo;</li>
        <li>Violar os termos de uso do WhatsApp, Instagram ou de qualquer portal imobiliário integrado;</li>
        <li>Tentar acessar dados de outras contas/imobiliárias sem autorização;</li>
        <li>Utilizar a plataforma para fins diversos da gestão legítima de leads e clientes imobiliários.</li>
      </ul>

      <h2>4. Canais de mensageria (WhatsApp/Instagram)</h2>
      <p>A conexão com o WhatsApp é feita via integração não-oficial, sujeita a instabilidades da própria plataforma do WhatsApp, fora do nosso controle. A imobiliária é responsável por garantir que suas comunicações estejam de acordo com as políticas do WhatsApp e do Instagram, incluindo consentimento prévio dos contatos quando exigido.</p>

      <h2>5. Inteligência artificial</h2>
      <p>As respostas automatizadas geradas por inteligência artificial são fornecidas para auxiliar o atendimento, mas podem eventualmente conter imprecisões. A imobiliária é responsável por supervisionar e validar as interações realizadas com seus leads e clientes.</p>

      <h2>6. Propriedade intelectual</h2>
      <p>Todo o software, marca e design da plataforma {{ brand.name }} são de propriedade de seus desenvolvedores. O uso da plataforma não transfere qualquer direito de propriedade intelectual ao usuário.</p>

      <h2>7. Limitação de responsabilidade</h2>
      <p>O {{ brand.name }} é fornecido "como está". Não garantimos disponibilidade ininterrupta do serviço e não nos responsabilizamos por perdas decorrentes de indisponibilidade de canais de terceiros (WhatsApp, Instagram, portais imobiliários) ou uso indevido da plataforma pelo usuário.</p>

      <h2>8. Cancelamento</h2>
      <p>A imobiliária pode cancelar sua assinatura a qualquer momento. Reservamo-nos o direito de suspender contas que violem estes Termos de Uso.</p>

      <h2>9. Alterações nestes termos</h2>
      <p>Estes termos podem ser atualizados periodicamente. O uso continuado da plataforma após alterações implica concordância com os novos termos.</p>

      <h2>10. Lei aplicável</h2>
      <p>Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil.</p>

      <h2>11. Contato</h2>
      <p>Dúvidas sobre estes Termos de Uso podem ser enviadas para: <a :href="`mailto:${brand.supportEmail || 'contato@visitaia.com.br'}`">{{ brand.supportEmail || 'contato@visitaia.com.br' }}</a></p>
    </div>
  </div>
</template>

<style scoped>
.legal-page {
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--bg-primary);
  padding: 2rem 1rem;
  display: flex;
  justify-content: center;
}

.legal-container {
  max-width: 760px;
  width: 100%;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 2.5rem;
  color: var(--text-main);
  line-height: 1.65;
}

.btn-back {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0;
  margin-bottom: 1.5rem;
}
.btn-back:hover { color: var(--primary); }

h1 { font-size: 1.6rem; margin-bottom: 0.25rem; }
.updated { color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.75rem; }

h2 { font-size: 1.1rem; margin-top: 1.75rem; margin-bottom: 0.5rem; color: var(--text-main); }

p { margin-bottom: 0.75rem; color: var(--text-main); }

ul { margin: 0 0 0.75rem 1.25rem; }
li { margin-bottom: 0.4rem; }

a { color: var(--primary); }

@media (max-width: 600px) {
  .legal-container { padding: 1.5rem; }
}
</style>
