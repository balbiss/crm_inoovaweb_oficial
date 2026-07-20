<script setup>
import { useRouter } from 'vue-router'
import { brand } from '../config/brand'

const router = useRouter()
</script>

<template>
  <div class="legal-page">
    <div class="legal-container">
      <button class="btn-back" @click="router.back()">← Voltar</button>
      <h1>Política de Privacidade</h1>
      <p class="updated">Última atualização: julho de 2026</p>

      <p>Esta Política de Privacidade descreve como o <strong>{{ brand.name }}</strong> coleta, usa, armazena e protege os dados pessoais tratados através da nossa plataforma de CRM para imobiliárias, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).</p>

      <h2>1. Quem somos</h2>
      <p>{{ brand.name }} é uma plataforma de CRM (gestão de relacionamento com clientes) voltada para imobiliárias, que centraliza o atendimento a leads e clientes via WhatsApp, Instagram e portais imobiliários, incluindo o uso de inteligência artificial para auxiliar no atendimento.</p>

      <h2>2. Quais dados coletamos</h2>
      <p><strong>Dos usuários da plataforma</strong> (corretores, gestores e donos de imobiliárias que usam o {{ brand.name }}): nome, e-mail, telefone e dados de acesso à conta.</p>
      <p><strong>Dos leads e clientes das imobiliárias</strong> (contatos que interagem via WhatsApp, Instagram ou portais imobiliários integrados): nome, telefone, e-mail, mensagens trocadas, preferências de imóveis e demais informações fornecidas voluntariamente durante o atendimento.</p>

      <h2>3. Como usamos os dados</h2>
      <ul>
        <li>Gerenciar e organizar o relacionamento entre a imobiliária e seus leads/clientes;</li>
        <li>Permitir o atendimento automatizado por inteligência artificial (respostas, qualificação de leads, agendamento de visitas);</li>
        <li>Enviar comunicações relacionadas ao atendimento solicitado pelo próprio contato;</li>
        <li>Gerar relatórios e métricas de uso para a imobiliária cliente;</li>
        <li>Cumprir obrigações legais e regulatórias.</li>
      </ul>

      <h2>4. Compartilhamento de dados</h2>
      <p>Não vendemos dados pessoais a terceiros. Os dados podem ser compartilhados apenas com prestadores de serviço estritamente necessários para o funcionamento da plataforma, como:</p>
      <ul>
        <li>Provedores de infraestrutura e hospedagem;</li>
        <li>Provedor de inteligência artificial (OpenAI), para processar mensagens e gerar respostas automatizadas;</li>
        <li>Meta/WhatsApp e Instagram, como canais de mensageria utilizados pela imobiliária para se comunicar com seus leads;</li>
        <li>Portais imobiliários integrados (ex: Canal Pro, ZAP Imóveis, Viva Real), quando a imobiliária opta por essa integração.</li>
      </ul>

      <h2>5. Armazenamento e segurança</h2>
      <p>Os dados são armazenados em servidores com controles de acesso restritos e criptografia em trânsito. Adotamos medidas técnicas e administrativas razoáveis para proteger os dados contra acesso não autorizado, perda ou alteração indevida.</p>

      <h2>6. Seus direitos (LGPD)</h2>
      <p>Você pode solicitar a qualquer momento: confirmação da existência de tratamento, acesso aos dados, correção de dados incompletos ou desatualizados, anonimização ou exclusão de dados desnecessários, portabilidade dos dados e informações sobre compartilhamento. Para exercer esses direitos, entre em contato conforme a seção 8.

      </p>

      <h2>7. Retenção dos dados</h2>
      <p>Os dados são mantidos pelo tempo necessário para cumprir as finalidades descritas nesta política, ou conforme exigido por obrigações legais, sendo excluídos ou anonimizados após esse período.</p>

      <h2>8. Contato</h2>
      <p>Em caso de dúvidas sobre esta Política de Privacidade ou para exercer seus direitos como titular de dados, entre em contato pelo e-mail: <a :href="`mailto:${brand.supportEmail || 'contato@visitaia.com.br'}`">{{ brand.supportEmail || 'contato@visitaia.com.br' }}</a></p>

      <h2>9. Alterações nesta política</h2>
      <p>Esta política pode ser atualizada periodicamente. A data da última atualização está indicada no topo desta página.</p>
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
