# TalentLoop - Roadmap & Análise do Sistema 🚀

**Sistema Inteligente de Busca e Aplicação Automática de Vagas**

---

## 📋 Sumário

- [Visão Geral](#visão-geral)
- [Problema que Resolve](#problema-que-resolve)
- [Por que TalentLoop?](#por-que-talentloop)
- [Arquitetura](#arquitetura)
- [Requisitos Funcionais](#requisitos-funcionais)
- [Regras de Negócio](#regras-de-negócio)
- [Requisitos Não Funcionais](#requisitos-não-funcionais)
- [Roadmap Next.js (Dashboard Web)](#roadmap-nextjs-dashboard-web)
- [Roadmap React Native (App Mobile)](#roadmap-react-native-app-mobile)
- [Stack Tecnológica](#stack-tecnológica)

---

## 🎯 Visão Geral

O **TalentLoop** é uma plataforma completa de **automação de busca de emprego** que combina:

- **Scraping inteligente** de vagas de múltiplas fontes (LinkedIn, Indeed, Gupy, etc.)
- **Matching por IA** entre perfil do candidato e vagas
- **AutoApply** - candidatura automática em vagas compatíveis
- **CRM de Recrutadores** para gestão de networking
- **Dashboard analítico** para acompanhamento de candidaturas

---

## 🔴 Problema que Resolve

### A Dor do Candidato

1. **Tempo Perdido**: Candidatos gastam **15-20 horas/semana** buscando vagas manualmente
2. **Vagas Dispersas**: Informações espalhadas em dezenas de plataformas diferentes
3. **Aplicações Repetitivas**: Preencher os mesmos formulários centenas de vezes
4. **Falta de Tracking**: Dificuldade em acompanhar status de dezenas de candidaturas
5. **Matching Ineficiente**: Aplicar para vagas incompatíveis desperdiça tempo de todos
6. **Networking Desorganizado**: Contatos de recrutadores perdidos em diferentes canais

### Estatísticas do Mercado

- **72%** dos candidatos sentem que aplicar para vagas é extremamente tedioso
- **65%** das candidaturas são ignoradas por falta de fit com a vaga
- **85%** dos candidatos não fazem follow-up adequado
- Candidatos aplicam em média para **50-100 vagas** antes de conseguir uma entrevista

---

## ✅ Por que TalentLoop?

### Proposta de Valor

| Problema                         | Solução TalentLoop                                  |
| -------------------------------- | --------------------------------------------------- |
| Busca manual em múltiplos sites  | **Agregador único** com scraping automatizado       |
| Candidaturas repetitivas         | **AutoApply** - candidatura com 1 clique            |
| Não saber se vale aplicar        | **AI Matching** - score de compatibilidade          |
| Perder tracking de candidaturas  | **Dashboard centralizado** com status em tempo real |
| Networking desorganizado         | **CRM de Recrutadores** integrado                   |
| Não saber quando fazer follow-up | **Lembretes automáticos** de follow-up              |

### Diferenciais

1. **Multi-tenant**: Cada usuário/empresa tem ambiente isolado
2. **IA Generativa**: Matching inteligente e sugestões de melhoria de perfil
3. **AutoApply Configurável**: Define regras de quando aplicar automaticamente
4. **Mobile-First**: App nativo para acompanhamento em tempo real
5. **RBAC Completo**: Sistema de permissões granular para times de recrutamento

---

## 💰 Modelo de Negócio - Quem Pode Usar?

O TalentLoop funciona em um modelo **Freemium** com dois públicos distintos:

### 🎯 Público-Alvo

```
┌─────────────────────────────────────────────────────────────────────┐
│                        TalentLoop Users                             │
├────────────────────────────┬────────────────────────────────────────┤
│     👤 CANDIDATOS          │         🏢 EMPRESAS/RECRUTADORES       │
│     (Job Seekers)          │         (Recruiters/Companies)         │
├────────────────────────────┼────────────────────────────────────────┤
│ • Pessoas buscando emprego │ • Empresas buscando talentos           │
│ • Profissionais em         │ • Agências de recrutamento             │
│   transição de carreira    │ • Headhunters                          │
│ • Recém-formados           │ • RH interno de empresas               │
│ • Freelancers              │ • Startups contratando                 │
└────────────────────────────┴────────────────────────────────────────┘
```

### 💳 Planos para CANDIDATOS (B2C)

O foco é ter uma base grande de candidatos qualificados. Por isso, o **plano gratuito é generoso**.

| Feature                      | 🆓 FREE      | ⭐ PRO             | 💎 PREMIUM            |
| ---------------------------- | ------------ | ------------------ | --------------------- |
| **Preço**                    | R$ 0         | R$ 29/mês          | R$ 79/mês             |
| **Vagas visíveis/dia**       | 100          | Ilimitado          | Ilimitado             |
| **Candidaturas manuais/dia** | 10           | 50                 | Ilimitado             |
| **AutoApply/dia**            | ❌           | 10                 | 30                    |
| **AI Matching Score**        | Básico (%)   | Detalhado          | Detalhado + Sugestões |
| **Carta de apresentação IA** | 1/mês        | 20/mês             | Ilimitado             |
| **Adaptar CV por IA**        | ❌           | 5/mês              | Ilimitado             |
| **CRM de Recrutadores**      | ❌           | ✅ (50 contatos)   | ✅ (Ilimitado)        |
| **Notificações de vagas**    | Email diário | Push em tempo real | Push + WhatsApp       |
| **Relatórios e Analytics**   | Básico       | Completo           | Completo + Export     |
| **Suporte**                  | Comunidade   | Email              | Prioritário           |

#### 🎁 Por que o FREE é generoso?

1. **Candidatos são o produto para empresas** - quanto mais candidatos qualificados, mais valor para empresas
2. **Conversão natural** - usuários que amam o produto convertem para PRO sozinhos
3. **Viralidade** - candidatos felizes indicam para amigos
4. **Dados de mercado** - insights valiosos sobre tendências de emprego

### 💳 Planos para EMPRESAS (B2B)

Aqui está a **monetização principal**. Empresas pagam para acessar talentos qualificados.

| Feature                        | 🏠 STARTUP | 🏢 BUSINESS       | 🏛️ ENTERPRISE       |
| ------------------------------ | ---------- | ----------------- | ------------------- |
| **Preço**                      | R$ 299/mês | R$ 799/mês        | Sob consulta        |
| **Vagas ativas**               | 5          | 20                | Ilimitado           |
| **Usuários (recrutadores)**    | 2          | 10                | Ilimitado           |
| **Candidaturas recebidas/mês** | 100        | 500               | Ilimitado           |
| **Acesso ao banco de CVs**     | ❌         | ✅ (busca)        | ✅ (busca + export) |
| **Filtros avançados**          | Básico     | Completo          | Completo + IA       |
| **ATS integrado**              | Básico     | Completo          | Customizado         |
| **Analytics de vagas**         | ❌         | ✅                | ✅ + API            |
| **Employer Branding**          | ❌         | Página da empresa | Página + Destaques  |
| **API de integração**          | ❌         | ❌                | ✅                  |
| **Suporte**                    | Email      | Chat              | Dedicado            |
| **SLA**                        | -          | 99.5%             | 99.9%               |

#### 💡 Fontes de Receita para Empresas

1. **Assinatura mensal/anual** - planos recorrentes
2. **Vagas em destaque** - R$ 99/vaga para aparecer no topo
3. **Acesso ao banco de talentos** - busca ativa de candidatos
4. **Relatórios de mercado** - insights sobre salários e tendências

### 📊 Modelo de Receita Projetado

```
Receita = (Candidatos PRO × R$29) + (Candidatos PREMIUM × R$79) +
          (Empresas STARTUP × R$299) + (Empresas BUSINESS × R$799) +
          (Enterprise × Contratos) + (Vagas Destaque × R$99)

Exemplo com 100k candidatos e 500 empresas:
- 5% PRO = 5.000 × R$29 = R$ 145.000/mês
- 1% PREMIUM = 1.000 × R$79 = R$ 79.000/mês
- 200 STARTUP = 200 × R$299 = R$ 59.800/mês
- 250 BUSINESS = 250 × R$799 = R$ 199.750/mês
- 50 ENTERPRISE = 50 × R$2.000 = R$ 100.000/mês
- Vagas destaque = 1.000 × R$99 = R$ 99.000/mês

Total estimado: ~R$ 682.550/mês
```

### 🔄 Flywheel do Negócio

```
     ┌─────────────────────────────────────────────────────────┐
     │                                                         │
     ▼                                                         │
┌─────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────┴─────┐
│  Mais   │────▶│    Mais     │────▶│   Empresas  │────▶│   Mais    │
│Candidatos│     │Candidaturas │     │   Pagam     │     │  Vagas    │
│  FREE   │     │  de Valor   │     │  pelo Acesso│     │Publicadas │
└─────────┘     └─────────────┘     └─────────────┘     └───────────┘
     ▲                                                         │
     │                                                         │
     └─────────────────────────────────────────────────────────┘
```

### 🎯 Estratégia de Conversão

#### Para Candidatos (FREE → PRO)

1. **Limite atingido** - "Você aplicou para 10 vagas hoje. Upgrade para continuar!"
2. **Feature bloqueada** - "AutoApply está disponível no plano PRO"
3. **Sucesso de outros** - "Candidatos PRO têm 3x mais entrevistas"
4. **Trial de 7 dias** - Experimentar PRO gratuitamente

#### Para Empresas (Trial → Pago)

1. **Trial de 14 dias** - Todas as features do BUSINESS
2. **Candidatos qualificados** - Mostrar valor antes de cobrar
3. **ROI claro** - "Custo por contratação 40% menor"
4. **Case studies** - Histórias de sucesso de outras empresas

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────────────┐
│                         TalentLoop Platform                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────────┐ │
│  │   Next.js   │    │React Native │    │      NestJS API         │ │
│  │  Dashboard  │    │  Mobile App │    │    (Backend Core)       │ │
│  │             │    │             │    │                         │ │
│  │ • Profile   │    │ • Jobs Feed │    │ • Auth + RBAC           │ │
│  │ • Analytics │    │ • Quick     │    │ • Jobs Scraper          │ │
│  │ • Settings  │    │   Apply     │    │ • AI Matching           │ │
│  │ • CRM       │    │ • Notif.    │    │ • AutoApply Engine      │ │
│  │ • Reports   │    │ • Tracking  │    │ • Stripe Billing        │ │
│  └──────┬──────┘    └──────┬──────┘    └───────────┬─────────────┘ │
│         │                  │                       │               │
│         └──────────────────┴───────────────────────┘               │
│                            │                                       │
│                     ┌──────▼──────┐                                │
│                     │  PostgreSQL │                                │
│                     │   (Prisma)  │                                │
│                     └─────────────┘                                │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Serviços Externos                         │   │
│  │  • Stripe (Pagamentos)    • Resend (Emails)                 │   │
│  │  • OpenAI (AI Matching)   • LinkedIn/Indeed (Scraping)      │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📝 Requisitos Funcionais

### RF01 - Autenticação e Autorização

- [x] RF01.1 - Cadastro de usuário com email/senha
- [x] RF01.2 - Login com email/senha
- [x] RF01.2 - Instegração com Stripe
- [ ] RF01.3 - Autenticação de dois fatores (2FA)
- [ ] RF01.4 - Recuperação de senha por email
- [ ] RF01.5 - Refresh token automático
- [ ] RF01.6 - Logout com invalidação de token
- [ ] RF01.7 - Sistema de roles (OWNER, ADMIN, MANAGER, MEMBER, VIEWER)
- [ ] RF01.8 - Permissões granulares por módulo

### RF02 - Gestão de Perfil (Profile)

- [ ] RF02.1 - Criar/editar perfil profissional completo
- [ ] RF02.2 - Upload de foto de perfil
- [ ] RF02.3 - Adicionar/editar experiências profissionais (Experience)
- [ ] RF02.4 - Adicionar/editar formação acadêmica (Education)
- [ ] RF02.5 - Gerenciar skills e competências
- [ ] RF02.6 - Upload e versionamento de CV (PDF)
- [ ] RF02.7 - Links profissionais (GitHub, LinkedIn, Portfolio)
- [ ] RF02.8 - Status de disponibilidade (Open to Work)
- [ ] RF02.9 - Idiomas e certificações

### RF03 - Preferências de Busca (JobPreference)

- [ ] RF03.1 - Definir palavras-chave de busca
- [ ] RF03.2 - Configurar localizações desejadas
- [ ] RF03.3 - Filtrar por modalidade (remoto/híbrido/presencial)
- [ ] RF03.4 - Filtrar por senioridade
- [ ] RF03.5 - Definir faixa salarial mínima
- [ ] RF03.6 - Lista de empresas preferidas
- [ ] RF03.7 - Lista de empresas a evitar (blacklist)
- [ ] RF03.8 - Configurar tags de interesse
- [ ] RF03.9 - Configurar notificações por tipo

### RF04 - Vagas (Job)

- [ ] RF04.1 - Visualizar feed de vagas agregadas
- [ ] RF04.2 - Filtrar vagas por múltiplos critérios
- [ ] RF04.3 - Busca textual em vagas
- [ ] RF04.4 - Ver detalhes completos da vaga
- [ ] RF04.5 - Salvar vaga como favorita (SavedJob)
- [ ] RF04.6 - Adicionar notas em vagas
- [ ] RF04.7 - Ver score de match com a vaga (JobMatch)
- [ ] RF04.8 - Ver skills que fazem match
- [ ] RF04.9 - Ver gaps/pontos a melhorar

### RF05 - Candidaturas (Application)

- [ ] RF05.1 - Aplicar para vaga manualmente
- [ ] RF05.2 - Gerar carta de apresentação personalizada
- [ ] RF05.3 - Adaptar CV para a vaga
- [ ] RF05.4 - Acompanhar status da candidatura (ApplicationStatus)
- [ ] RF05.5 - Atualizar status manualmente
- [ ] RF05.6 - Adicionar notas na candidatura
- [ ] RF05.7 - Agendar follow-up
- [ ] RF05.8 - Registrar motivo de rejeição
- [ ] RF05.9 - Registrar proposta salarial recebida
- [ ] RF05.10 - Ver histórico/timeline da candidatura (ApplicationLog)

### RF06 - AutoApply

- [ ] RF06.1 - Ativar/desativar AutoApply
- [ ] RF06.2 - Configurar limite diário de aplicações
- [ ] RF06.3 - Definir horários permitidos para AutoApply
- [ ] RF06.4 - Definir score mínimo para AutoApply
- [ ] RF06.5 - Visualizar log de ações do AutoApply (ApplicationLog)
- [ ] RF06.6 - Pausar AutoApply temporariamente
- [ ] RF06.7 - Ver estatísticas de AutoApply

### RF07 - AI Matching (JobMatch)

- [ ] RF07.1 - Calcular score de compatibilidade (0-100)
- [ ] RF07.2 - Identificar pontos fortes do candidato para a vaga (strengths)
- [ ] RF07.3 - Identificar gaps/pontos a melhorar (weaknesses)
- [ ] RF07.4 - Sugerir melhorias no perfil (suggestions)
- [ ] RF07.5 - Extrair keywords relevantes
- [ ] RF07.6 - Match de skills automático (skillsMatch)
- [ ] RF07.7 - Match de experiência (experienceMatch)
- [ ] RF07.8 - Match de localização (locationMatch)

### RF08 - Scraper de Vagas (ScraperQueue)

- [ ] RF08.1 - Configurar fontes de scraping (source)
- [ ] RF08.2 - Executar scraping sob demanda
- [ ] RF08.3 - Agendar scraping automático
- [ ] RF08.4 - Ver status da fila de scraping (QueueStatus)
- [ ] RF08.5 - Ver histórico de scraping
- [ ] RF08.6 - Configurar filtros de scraping (filters)

### RF09 - CRM de Recrutadores (RecruiterContact)

- [ ] RF09.1 - Adicionar contato de recrutador
- [ ] RF09.2 - Editar informações do recrutador
- [ ] RF09.3 - Registrar histórico de interações
- [ ] RF09.4 - Agendar follow-up com recrutador (nextFollowUp)
- [ ] RF09.5 - Criar templates de mensagem (CoverLetterTemplate)
- [ ] RF09.6 - Enviar mensagem para recrutador (RecruiterMessage)
- [ ] RF09.7 - Rastrear abertura/resposta de mensagens (MessageStatus)
- [ ] RF09.8 - Tags para organizar contatos

### RF10 - Templates de Carta de Apresentação (CoverLetterTemplate)

- [ ] RF10.1 - Criar template de carta
- [ ] RF10.2 - Editar template existente
- [ ] RF10.3 - Definir template padrão (isDefault)
- [ ] RF10.4 - Usar placeholders dinâmicos
- [ ] RF10.5 - Gerar carta com IA baseada no template

### RF11 - Notificações (Notification)

- [ ] RF11.1 - Receber notificação de nova vaga compatível (NEW_JOB)
- [ ] RF11.2 - Receber notificação de atualização de candidatura (APPLICATION_UPDATE)
- [ ] RF11.3 - Receber lembrete de entrevista (INTERVIEW_REMINDER)
- [ ] RF11.4 - Receber lembrete de follow-up (FOLLOW_UP)
- [ ] RF11.5 - Marcar notificação como lida
- [ ] RF11.6 - Configurar preferências de notificação
- [ ] RF11.7 - Push notifications (mobile)

### RF12 - Planos e Assinatura (Plan, Subscription)

- [ ] RF12.1 - Visualizar planos disponíveis
- [ ] RF12.2 - Assinar plano via Stripe
- [ ] RF12.3 - Fazer upgrade de plano
- [ ] RF12.4 - Fazer downgrade de plano
- [ ] RF12.5 - Cancelar assinatura
- [ ] RF12.6 - Reativar assinatura cancelada
- [ ] RF12.7 - Ver histórico de transações (SubscriptionHistory)
- [ ] RF12.8 - Acessar portal de billing do Stripe
- [ ] RF12.9 - Ver uso vs limites do plano

### RF13 - Dashboard e Analytics (Candidatos)

- [ ] RF13.1 - Ver resumo de candidaturas por status
- [ ] RF13.2 - Ver taxa de conversão (aplicações → entrevistas)
- [ ] RF13.3 - Ver vagas mais compatíveis
- [ ] RF13.4 - Ver atividade recente
- [ ] RF13.5 - Ver gráfico de candidaturas ao longo do tempo
- [ ] RF13.6 - Exportar relatórios

---

## 🏢 Requisitos Funcionais - Empresas (B2B)

### RF14 - Portal da Empresa

- [ ] RF14.1 - Criar conta de empresa (CNPJ, razão social, segmento)
- [ ] RF14.2 - Personalizar página da empresa (logo, descrição, cultura)
- [ ] RF14.3 - Gerenciar recrutadores (convidar, remover, definir roles)
- [ ] RF14.4 - Ver plano atual e limites de uso
- [ ] RF14.5 - Configurar notificações da empresa
- [ ] RF14.6 - Gerenciar integrações (ATS, HRIS)

### RF15 - Publicação de Vagas

- [ ] RF15.1 - Criar vaga com descrição estruturada
- [ ] RF15.2 - Definir requisitos obrigatórios vs desejáveis
- [ ] RF15.3 - Configurar faixa salarial (opcional pública/privada)
- [ ] RF15.4 - Definir localização (remoto, híbrido, presencial)
- [ ] RF15.5 - Publicar em múltiplas plataformas simultaneamente
- [ ] RF15.6 - Duplicar vaga existente como template
- [ ] RF15.7 - Pausar/reativar vaga
- [ ] RF15.8 - Definir data de expiração automática

### RF16 - Gestão de Candidaturas (ATS)

- [ ] RF16.1 - Ver todas as candidaturas por vaga
- [ ] RF16.2 - Filtrar candidatos por score, experiência, skills
- [ ] RF16.3 - Mover candidatos entre etapas do funil
- [ ] RF16.4 - Adicionar notas internas sobre candidatos
- [ ] RF16.5 - Agendar entrevistas (integração calendário)
- [ ] RF16.6 - Enviar feedback ao candidato
- [ ] RF16.7 - Marcar candidato como favorito/rejeitado
- [ ] RF16.8 - Exportar lista de candidatos (CSV/PDF)
- [ ] RF16.9 - Compartilhar perfil com gestores (link privado)

### RF17 - Banco de Talentos

- [ ] RF17.1 - Buscar candidatos por skills, localização, experiência
- [ ] RF17.2 - Ver perfis completos de candidatos interessados
- [ ] RF17.3 - Salvar candidatos em pipelines personalizadas
- [ ] RF17.4 - Convidar candidatos a aplicar em vagas
- [ ] RF17.5 - Histórico de interações com candidatos
- [ ] RF17.6 - Match reverso: sugerir candidatos para vagas

### RF18 - Dashboard e Analytics (Empresas)

- [ ] RF18.1 - Ver métricas de vagas (visualizações, candidaturas)
- [ ] RF18.2 - Ver tempo médio de contratação por vaga
- [ ] RF18.3 - Ver funil de conversão completo
- [ ] RF18.4 - Comparar performance entre vagas
- [ ] RF18.5 - Ver custo por contratação (quando pago por resultado)
- [ ] RF18.6 - Exportar relatórios gerenciais

### RF19 - Comunicação

- [ ] RF19.1 - Enviar mensagem para candidato via plataforma
- [ ] RF19.2 - Templates de mensagem personalizáveis
- [ ] RF19.3 - Respostas automáticas configuráveis
- [ ] RF19.4 - Notificar candidato sobre mudança de status
- [ ] RF19.5 - Integração com email (envio/recebimento)

---

## 📐 Regras de Negócio

### RN01 - Autenticação

- RN01.1 - Senha deve ter mínimo 8 caracteres, 1 maiúscula, 1 número
- RN01.2 - Token de reset de senha expira em 1 hora
- RN01.3 - Backup codes de 2FA devem ser usados apenas uma vez
- RN01.4 - Usuário inativo não pode fazer login
- RN01.5 - Email deve ser único por tenant

### RN02 - Roles e Permissões (Role, Permission, UserRole)

- RN02.1 - OWNER tem acesso total, incluindo billing
- RN02.2 - ADMIN não pode acessar billing
- RN02.3 - Usuário só pode gerenciar roles de nível inferior ao seu
- RN02.4 - Apenas OWNER pode transferir ownership
- RN02.5 - Deve existir pelo menos um OWNER por tenant
- RN02.6 - UserRole é escopado por tenant (multi-tenancy)

### RN03 - Vagas (Job)

- RN03.1 - Vaga é única por tenant + externalId (evita duplicação)
- RN03.2 - Vagas expiradas (expiresAt < now) devem ser marcadas como inativas
- RN03.3 - Skills são extraídas automaticamente da descrição
- RN03.4 - Salário deve ser normalizado para mesma moeda ao comparar

### RN04 - Candidaturas (Application)

- RN04.1 - Usuário só pode ter uma candidatura por vaga (@@unique([jobId, userId]))
- RN04.2 - Candidatura não pode ser criada para vaga inativa
- RN04.3 - Status só pode avançar na ordem do funil (com exceções)
- RN04.4 - AutoApply só pode ser feito se matchScore >= limite configurado
- RN04.5 - Follow-up só pode ser agendado se status != REJECTED/HIRED/WITHDRAWN

### RN05 - AutoApply

- RN05.1 - AutoApply respeita limite diário do plano (maxAutoApplyPerDay)
- RN05.2 - AutoApply respeita horários configurados pelo usuário (autoApplyHours)
- RN05.3 - AutoApply só funciona se perfil estiver completo (>80%)
- RN05.4 - AutoApply só aplica para vagas com score >= mínimo configurado
- RN05.5 - AutoApply registra log de cada ação para auditoria (ApplicationLog)

### RN06 - AI Matching (JobMatch)

- RN06.1 - Score de 0-100 baseado em skills, experiência e localização
- RN06.2 - Match é recalculado quando perfil ou vaga é atualizado
- RN06.3 - Apenas um JobMatch por combinação job+user (@@unique([jobId, userId]))

### RN07 - Planos e Limites (Plan)

#### Planos para Candidatos (B2C)

| Plano   | Vagas/Dia | Candidaturas/Dia | AutoApply/Dia | AI Matching    | CRM         | Preço     |
| ------- | --------- | ---------------- | ------------- | -------------- | ----------- | --------- |
| FREE    | 100       | 10               | ❌            | Básico         | ❌          | R$ 0      |
| PRO     | ∞         | 50               | 10            | Detalhado      | 50 contatos | R$ 29/mês |
| PREMIUM | ∞         | ∞                | 30            | Detalhado + IA | ∞           | R$ 79/mês |

#### Planos para Empresas (B2B)

| Plano      | Vagas Ativas | Recrutadores | Candidaturas/Mês | Banco de CVs | Preço        |
| ---------- | ------------ | ------------ | ---------------- | ------------ | ------------ |
| STARTUP    | 5            | 2            | 100              | ❌           | R$ 299/mês   |
| BUSINESS   | 20           | 10           | 500              | ✅ Busca     | R$ 799/mês   |
| ENTERPRISE | ∞            | ∞            | ∞                | ✅ + Export  | Sob consulta |

#### Regras Gerais de Planos

- RN07.1 - Trial de 7 dias para candidatos com features do PRO
- RN07.2 - Trial de 14 dias para empresas com features do BUSINESS
- RN07.3 - Downgrade só é efetivado no próximo ciclo de billing
- RN07.4 - Cancelamento mantém acesso até fim do período pago
- RN07.5 - Candidatos FREE podem usar para sempre sem pagar
- RN07.6 - Empresas precisam de plano pago após trial

### RN08 - Scraper (ScraperQueue)

- RN08.1 - Scraping respeita rate limits de cada fonte
- RN08.2 - Scraping automático roda a cada 6 horas
- RN08.3 - Vagas duplicadas são ignoradas (merge de dados se necessário)
- RN08.4 - Fila de scraping tem prioridade por plano (Enterprise > Pro > Starter)

### RN09 - CRM de Recrutadores (RecruiterContact, RecruiterMessage)

- RN09.1 - Contato é único por email dentro do mesmo usuário
- RN09.2 - Mensagem só pode ser enviada se contato tiver email ou LinkedIn
- RN09.3 - Follow-up automático é sugerido 7 dias após última interação

### RN10 - Notificações (Notification)

- RN10.1 - Notificações push só são enviadas se usuário permitir
- RN10.2 - Digest de vagas é enviado no horário configurado pelo usuário
- RN10.3 - Notificações de alta prioridade (entrevista) sempre são enviadas

### RN11 - Portal da Empresa

- RN11.1 - CNPJ deve ser válido e único na plataforma
- RN11.2 - Empresa pode ter múltiplos recrutadores com roles diferentes
- RN11.3 - Owner da empresa pode transferir ownership
- RN11.4 - Remoção de recrutador não exclui ações feitas por ele (audit trail)
- RN11.5 - Empresa inativa (sem plano) tem acesso somente leitura

### RN12 - Publicação de Vagas (Empresa)

- RN12.1 - Vaga deve ter no mínimo: título, descrição, tipo de contrato
- RN12.2 - Skills são extraídas automaticamente da descrição
- RN12.3 - Vaga expirada não aceita novas candidaturas
- RN12.4 - Limite de vagas ativas conforme plano da empresa
- RN12.5 - Vaga pode ser promovida (destaque) mediante pagamento extra

### RN13 - ATS e Funil de Contratação

- RN13.1 - Funil padrão: Novo → Triagem → Entrevista → Proposta → Contratado/Rejeitado
- RN13.2 - Empresa pode customizar etapas do funil
- RN13.3 - Candidato rejeitado pode ser movido para banco de talentos
- RN13.4 - Feedback ao candidato é obrigatório ao rejeitar (configurável)
- RN13.5 - Notas internas não são visíveis para candidatos
- RN13.6 - Histórico de movimentação é registrado para auditoria

### RN14 - Banco de Talentos

- RN14.1 - Candidato precisa consentir ser encontrado por empresas (opt-in)
- RN14.2 - Busca limitada conforme plano da empresa
- RN14.3 - Convite para aplicar expira em 7 dias
- RN14.4 - Candidato pode bloquear empresas específicas
- RN14.5 - Dados sensíveis (salário atual) só visíveis após match mútuo

### RN15 - Faturamento Empresarial

- RN15.1 - Emissão de NF obrigatória para planos empresariais
- RN15.2 - Suporta pagamento via boleto, PIX e cartão
- RN15.3 - Desconto para pagamento anual (2 meses grátis)
- RN15.4 - Fatura disponível no portal até 5 anos
- RN15.5 - Bloqueio de acesso após 15 dias de inadimplência

---

## ⚙️ Requisitos Não Funcionais

### RNF01 - Performance

- RNF01.1 - API deve responder em < 200ms para 95% das requests
- RNF01.2 - Dashboard deve carregar em < 3 segundos
- RNF01.3 - Feed de vagas deve suportar paginação infinita
- RNF01.4 - Scraping não deve impactar performance da API principal
- RNF01.5 - Cache de vagas por 5 minutos

### RNF02 - Escalabilidade

- RNF02.1 - Suportar 10.000 usuários simultâneos
- RNF02.2 - Suportar 1 milhão de vagas no banco
- RNF02.3 - Filas de scraping distribuídas (Redis/BullMQ)
- RNF02.4 - Banco de dados com read replicas

### RNF03 - Segurança

- RNF03.1 - Todas as senhas hasheadas com bcrypt (cost 12)
- RNF03.2 - JWT com expiração de 15 minutos
- RNF03.3 - Refresh token com expiração de 7 dias
- RNF03.4 - HTTPS obrigatório em produção
- RNF03.5 - Rate limiting: 100 req/min por IP
- RNF03.6 - Dados sensíveis criptografados em repouso
- RNF03.7 - Multi-tenancy com isolamento de dados

### RNF04 - Disponibilidade

- RNF04.1 - SLA de 99.9% de uptime
- RNF04.2 - Deploy com zero downtime
- RNF04.3 - Backups diários com retenção de 30 dias
- RNF04.4 - Disaster recovery em < 4 horas

### RNF05 - Observabilidade

- RNF05.1 - Logs estruturados (JSON) com correlation ID
- RNF05.2 - Métricas de negócio expostas via Prometheus
- RNF05.3 - Tracing distribuído (OpenTelemetry)
- RNF05.4 - Alertas para erros críticos (PagerDuty/Slack)

### RNF06 - Usabilidade

- RNF06.1 - Interface responsiva (mobile-first)
- RNF06.2 - Suporte a dark mode
- RNF06.3 - Acessibilidade WCAG 2.1 AA
- RNF06.4 - Internacionalização (PT-BR, EN)
- RNF06.5 - Onboarding guiado para novos usuários

### RNF07 - Manutenibilidade

- RNF07.1 - Cobertura de testes > 80%
- RNF07.2 - CI/CD automatizado
- RNF07.3 - Documentação de API (OpenAPI/Swagger)
- RNF07.4 - Código seguindo padrões ESLint/Prettier

---

## 🖥️ Roadmap Next.js (Dashboard Web)

### Fase 1 - Core (MVP) 🎯

**Estimativa: 4-6 semanas**

#### 1.1 Autenticação (`/auth/*`)

| Feature            | Rota                    | Modelo Prisma    | Status |
| ------------------ | ----------------------- | ---------------- | ------ |
| Página de Login    | `/auth/signin`          | User             | ⬜     |
| Página de Cadastro | `/auth/signup`          | User, Tenant     | ⬜     |
| Forgot Password    | `/auth/forgot-password` | PasswordReset    | ⬜     |
| Reset Password     | `/auth/reset-password`  | PasswordReset    | ⬜     |
| Configuração 2FA   | `/settings/security`    | User.twoFactor\* | ⬜     |
| Logout             | -                       | -                | ⬜     |

#### 1.2 Layout Base

| Feature              | Componente            | Status |
| -------------------- | --------------------- | ------ |
| Sidebar responsiva   | `AppSidebar`          | ⬜     |
| Header com user menu | `HeaderContainer`     | ⬜     |
| Breadcrumbs          | `Breadcrumb`          | ⬜     |
| Dark mode toggle     | `ThemeToggle`         | ⬜     |
| Loading states       | `Loading`, `Skeleton` | ⬜     |
| Error boundaries     | `ErrorBoundary`       | ⬜     |

#### 1.3 Dashboard Home (`/dashboard`)

| Feature                             | Modelo Prisma              | Status |
| ----------------------------------- | -------------------------- | ------ |
| Cards de resumo                     | Application, Job, JobMatch | ⬜     |
| Gráfico de candidaturas por status  | Application                | ⬜     |
| Lista de vagas recentes compatíveis | Job, JobMatch              | ⬜     |
| Atividade recente                   | Application, Notification  | ⬜     |
| Quick actions                       | -                          | ⬜     |

#### 1.4 Perfil (`/profile/*`)

| Feature               | Rota                  | Modelo Prisma                 | Status |
| --------------------- | --------------------- | ----------------------------- | ------ |
| Dados básicos         | `/profile`            | Profile                       | ⬜     |
| Upload de avatar      | `/profile`            | User.avatar                   | ⬜     |
| Experiências (CRUD)   | `/profile/experience` | Experience                    | ⬜     |
| Educação (CRUD)       | `/profile/education`  | Education                     | ⬜     |
| Gerenciador de skills | `/profile`            | Profile.skills                | ⬜     |
| Upload de CV          | `/profile`            | Profile.cvUrl                 | ⬜     |
| Links profissionais   | `/profile`            | Profile.github, linkedin, etc | ⬜     |

---

### Fase 2 - Jobs & Applications 📋

**Estimativa: 3-4 semanas**

#### 2.1 Feed de Vagas (`/jobs`)

| Feature                    | Modelo Prisma  | Status |
| -------------------------- | -------------- | ------ |
| Lista de vagas com filtros | Job            | ⬜     |
| Card de vaga com preview   | Job            | ⬜     |
| Modal/página de detalhes   | Job            | ⬜     |
| Score de match visual      | JobMatch.score | ⬜     |
| Botão de aplicar           | Application    | ⬜     |
| Botão de salvar            | SavedJob       | ⬜     |
| Infinite scroll            | -              | ⬜     |

#### 2.2 Vagas Salvas (`/jobs/saved`)

| Feature                 | Modelo Prisma  | Status |
| ----------------------- | -------------- | ------ |
| Lista de vagas salvas   | SavedJob       | ⬜     |
| Adicionar/remover notas | SavedJob.notes | ⬜     |
| Ordenação e filtros     | -              | ⬜     |

#### 2.3 Minhas Candidaturas (`/applications`)

| Feature                 | Modelo Prisma          | Status |
| ----------------------- | ---------------------- | ------ |
| Lista/Kanban por status | Application            | ⬜     |
| Detalhes da candidatura | Application            | ⬜     |
| Atualizar status        | Application.status     | ⬜     |
| Timeline de eventos     | ApplicationLog         | ⬜     |
| Adicionar notas         | Application.notes      | ⬜     |
| Agendar follow-up       | Application.followUpAt | ⬜     |

---

### Fase 3 - Preferências & AutoApply ⚡

**Estimativa: 2-3 semanas**

#### 3.1 Preferências de Busca (`/settings/preferences`)

| Feature                       | Modelo Prisma                             | Status |
| ----------------------------- | ----------------------------------------- | ------ |
| Palavras-chave                | JobPreference.keywords                    | ⬜     |
| Localizações                  | JobPreference.locations                   | ⬜     |
| Modalidade                    | JobPreference.modalities                  | ⬜     |
| Senioridade                   | JobPreference.seniorities                 | ⬜     |
| Faixa salarial                | JobPreference.salaryMin                   | ⬜     |
| Empresas preferidas/blacklist | JobPreference.companies, excludeCompanies | ⬜     |

#### 3.2 AutoApply Dashboard (`/autoapply`)

| Feature                    | Modelo Prisma                  | Status |
| -------------------------- | ------------------------------ | ------ |
| Toggle de ativação         | JobPreference.autoApplyEnabled | ⬜     |
| Configuração de limites    | JobPreference.dailyLimit       | ⬜     |
| Configuração de horários   | JobPreference.autoApplyHours   | ⬜     |
| Log de ações em tempo real | ApplicationLog                 | ⬜     |
| Estatísticas               | Application (autoApplied=true) | ⬜     |

---

### Fase 4 - CRM & Templates ✉️

**Estimativa: 2-3 semanas**

#### 4.1 CRM de Recrutadores (`/crm`)

| Feature                  | Modelo Prisma                 | Status |
| ------------------------ | ----------------------------- | ------ |
| Lista de contatos        | RecruiterContact              | ⬜     |
| Formulário de contato    | RecruiterContact              | ⬜     |
| Histórico de interações  | RecruiterMessage              | ⬜     |
| Agendamento de follow-up | RecruiterContact.nextFollowUp | ⬜     |
| Tags para organização    | RecruiterContact.tags         | ⬜     |

#### 4.2 Templates de Carta (`/templates`)

| Feature                 | Modelo Prisma                 | Status |
| ----------------------- | ----------------------------- | ------ |
| Lista de templates      | CoverLetterTemplate           | ⬜     |
| Editor de template      | CoverLetterTemplate.content   | ⬜     |
| Preview com dados reais | -                             | ⬜     |
| Definir template padrão | CoverLetterTemplate.isDefault | ⬜     |

#### 4.3 Mensagens (`/crm/messages`)

| Feature                    | Modelo Prisma           | Status |
| -------------------------- | ----------------------- | ------ |
| Composer de mensagem       | RecruiterMessage        | ⬜     |
| Seletor de template        | CoverLetterTemplate     | ⬜     |
| Histórico de mensagens     | RecruiterMessage        | ⬜     |
| Status de entrega/abertura | RecruiterMessage.status | ⬜     |

---

### Fase 5 - Analytics & Settings ⚙️

**Estimativa: 2-3 semanas**

#### 5.1 Analytics (`/analytics`)

| Feature                  | Modelo Prisma         | Status |
| ------------------------ | --------------------- | ------ |
| Dashboard de métricas    | Application, JobMatch | ⬜     |
| Gráficos de conversão    | Application.status    | ⬜     |
| Relatório de performance | -                     | ⬜     |
| Exportação de dados      | -                     | ⬜     |

#### 5.2 Notificações (`/notifications`)

| Feature                       | Modelo Prisma          | Status |
| ----------------------------- | ---------------------- | ------ |
| Central de notificações       | Notification           | ⬜     |
| Configurações de preferências | JobPreference.notify\* | ⬜     |
| Histórico                     | Notification           | ⬜     |

#### 5.3 Configurações (`/settings/*`)

| Feature                      | Modelo Prisma | Status |
| ---------------------------- | ------------- | ------ |
| Dados da conta               | User          | ⬜     |
| Alteração de senha           | User.password | ⬜     |
| Configurações de privacidade | -             | ⬜     |
| Gerenciamento de sessões     | -             | ⬜     |

---

### Fase 6 - Billing & Admin 💳

**Estimativa: 2 semanas**

#### 6.1 Planos e Billing (`/billing`)

| Feature                    | Modelo Prisma                       | Status |
| -------------------------- | ----------------------------------- | ------ |
| Página de planos           | Plan                                | ⬜     |
| Checkout flow              | Subscription, StripeCheckoutSession | ⬜     |
| Portal de billing (Stripe) | Subscription.stripeCustomerId       | ⬜     |
| Histórico de pagamentos    | SubscriptionHistory                 | ⬜     |
| Uso vs Limites             | Plan.max\*, Subscription            | ⬜     |

#### 6.2 Team Management (`/team`)

| Feature                  | Modelo Prisma  | Status |
| ------------------------ | -------------- | ------ |
| Lista de membros         | UserRole, User | ⬜     |
| Convite de novos membros | User           | ⬜     |
| Gerenciamento de roles   | UserRole, Role | ⬜     |
| Remoção de membros       | UserRole       | ⬜     |

---

### Fase 7 - Portal de Empresas (B2B) 🏢

**Estimativa: 4-5 semanas**
_Módulo separado para empresas que publicam vagas_

#### 7.1 Autenticação Empresa (`/empresa/auth/*`)

| Feature             | Rota                  | Status |
| ------------------- | --------------------- | ------ |
| Cadastro de empresa | `/empresa/signup`     | ⬜     |
| Login empresa       | `/empresa/signin`     | ⬜     |
| Verificação CNPJ    | -                     | ⬜     |
| Onboarding empresa  | `/empresa/onboarding` | ⬜     |

#### 7.2 Dashboard Empresa (`/empresa/dashboard`)

| Feature                              | Status |
| ------------------------------------ | ------ |
| Resumo de vagas ativas               | ⬜     |
| Métricas de candidaturas             | ⬜     |
| Pipeline de contratações             | ⬜     |
| Alertas de vagas expirando           | ⬜     |
| Quick stats (tempo médio, conversão) | ⬜     |

#### 7.3 Gestão de Vagas (`/empresa/jobs/*`)

| Feature                                     | Status |
| ------------------------------------------- | ------ |
| Lista de vagas (ativas/pausadas/encerradas) | ⬜     |
| Criação de vaga (wizard)                    | ⬜     |
| Edição de vaga                              | ⬜     |
| Duplicar vaga como template                 | ⬜     |
| Pausar/reativar/encerrar vaga               | ⬜     |
| Preview da vaga                             | ⬜     |
| Analytics por vaga                          | ⬜     |

#### 7.4 ATS - Sistema de Rastreamento (`/empresa/jobs/[id]/candidates`)

| Feature                                        | Status |
| ---------------------------------------------- | ------ |
| Lista de candidatos por vaga                   | ⬜     |
| Visualização Kanban do funil                   | ⬜     |
| Filtros avançados (score, experiência, skills) | ⬜     |
| Visualização do perfil completo                | ⬜     |
| Drag & drop entre etapas                       | ⬜     |
| Notas internas por candidato                   | ⬜     |
| Avaliação com estrelas/rating                  | ⬜     |
| Agendamento de entrevistas                     | ⬜     |
| Envio de feedback                              | ⬜     |
| Rejeição em lote                               | ⬜     |

#### 7.5 Banco de Talentos (`/empresa/talents`)

| Feature                                    | Status |
| ------------------------------------------ | ------ |
| Busca avançada de candidatos               | ⬜     |
| Filtros (skills, experiência, localização) | ⬜     |
| Salvar candidatos em pools                 | ⬜     |
| Convidar para aplicar                      | ⬜     |
| Histórico de interações                    | ⬜     |
| Export de lista                            | ⬜     |

#### 7.6 Comunicação (`/empresa/messages`)

| Feature                     | Status |
| --------------------------- | ------ |
| Inbox de mensagens          | ⬜     |
| Enviar mensagem a candidato | ⬜     |
| Templates de mensagem       | ⬜     |
| Notificações de resposta    | ⬜     |
| Email integration           | ⬜     |

#### 7.7 Configurações Empresa (`/empresa/settings/*`)

| Feature                                      | Status |
| -------------------------------------------- | ------ |
| Perfil da empresa (logo, descrição, cultura) | ⬜     |
| Gerenciar recrutadores                       | ⬜     |
| Configurar etapas do funil                   | ⬜     |
| Integrações (ATS externo, calendário)        | ⬜     |
| Webhooks para integrações                    | ⬜     |

#### 7.8 Billing Empresa (`/empresa/billing`)

| Feature                        | Status |
| ------------------------------ | ------ |
| Seleção de plano empresarial   | ⬜     |
| Checkout (boleto, PIX, cartão) | ⬜     |
| Histórico de faturas           | ⬜     |
| Dados de faturamento (NF)      | ⬜     |
| Uso atual vs limites do plano  | ⬜     |

---

## 📱 Roadmap React Native (App Mobile)

### Fase 1 - Core Mobile 🎯

**Estimativa: 3-4 semanas**

#### 1.1 Autenticação

| Feature                  | Screen         | Modelo Prisma | Status |
| ------------------------ | -------------- | ------------- | ------ |
| Tela de Login            | `LoginScreen`  | User          | ⬜     |
| Tela de Cadastro         | `SignupScreen` | User, Tenant  | ⬜     |
| Biometric auth           | -              | -             | ⬜     |
| Push notifications setup | -              | -             | ⬜     |
| Deep linking             | -              | -             | ⬜     |

#### 1.2 Navigation

| Feature                                                | Status |
| ------------------------------------------------------ | ------ |
| Tab navigation (Jobs, Applications, Profile, Settings) | ⬜     |
| Stack navigation                                       | ⬜     |
| Splash screen                                          | ⬜     |
| Onboarding carousel                                    | ⬜     |

---

### Fase 2 - Jobs Feed 📋

**Estimativa: 2-3 semanas**

#### 2.1 Feed de Vagas

| Feature                         | Modelo Prisma          | Status |
| ------------------------------- | ---------------------- | ------ |
| Lista de vagas (FlatList)       | Job                    | ⬜     |
| Pull to refresh                 | -                      | ⬜     |
| Filtros rápidos (chips)         | Job.\*                 | ⬜     |
| Busca por texto                 | Job.title, description | ⬜     |
| Card de vaga compacto           | Job                    | ⬜     |
| Swipe actions (salvar, ignorar) | SavedJob               | ⬜     |

#### 2.2 Detalhes da Vaga

| Feature               | Modelo Prisma  | Status |
| --------------------- | -------------- | ------ |
| Tela de detalhes      | Job            | ⬜     |
| Score de match visual | JobMatch.score | ⬜     |
| Botão de aplicar      | Application    | ⬜     |
| Botão de salvar       | SavedJob       | ⬜     |
| Compartilhar vaga     | -              | ⬜     |
| Abrir no navegador    | Job.url        | ⬜     |

#### 2.3 Vagas Salvas

| Feature            | Modelo Prisma  | Status |
| ------------------ | -------------- | ------ |
| Lista de favoritos | SavedJob       | ⬜     |
| Swipe to remove    | SavedJob       | ⬜     |
| Notas rápidas      | SavedJob.notes | ⬜     |

---

### Fase 3 - Applications Tracking 📊

**Estimativa: 2-3 semanas**

#### 3.1 Lista de Candidaturas

| Feature                   | Modelo Prisma      | Status |
| ------------------------- | ------------------ | ------ |
| Lista agrupada por status | Application        | ⬜     |
| Filtro por status         | Application.status | ⬜     |
| Card com status visual    | Application        | ⬜     |
| Quick update de status    | Application.status | ⬜     |

#### 3.2 Detalhes da Candidatura

| Feature           | Modelo Prisma          | Status |
| ----------------- | ---------------------- | ------ |
| Timeline visual   | ApplicationLog         | ⬜     |
| Atualizar status  | Application.status     | ⬜     |
| Adicionar notas   | Application.notes      | ⬜     |
| Agendar follow-up | Application.followUpAt | ⬜     |
| Ver dados da vaga | Job                    | ⬜     |

---

### Fase 4 - Preferências & Profile 👤

**Estimativa: 2 semanas**

#### 4.1 JobPreference (Config de Busca)

| Feature                      | Modelo Prisma                  | Status |
| ---------------------------- | ------------------------------ | ------ |
| Keywords (multi-select/tags) | JobPreference.keywords         | ⬜     |
| Localizações                 | JobPreference.locations        | ⬜     |
| Modalidade (checkboxes)      | JobPreference.modalities       | ⬜     |
| Senioridade                  | JobPreference.seniorities      | ⬜     |
| Salário mínimo (slider)      | JobPreference.salaryMin        | ⬜     |
| AutoApply toggle             | JobPreference.autoApplyEnabled | ⬜     |
| Notificações toggle          | JobPreference.notify\*         | ⬜     |

#### 4.2 Profile

| Feature                | Modelo Prisma             | Status |
| ---------------------- | ------------------------- | ------ |
| Visualização do perfil | Profile                   | ⬜     |
| Edição básica          | Profile.headline, summary | ⬜     |
| Status Open to Work    | Profile.openToWork        | ⬜     |
| Link para edição web   | -                         | ⬜     |

---

### Fase 5 - Notifications & Polish ✨

**Estimativa: 2 semanas**

#### 5.1 Notificações

| Feature                | Modelo Prisma     | Status |
| ---------------------- | ----------------- | ------ |
| Centro de notificações | Notification      | ⬜     |
| Push notifications     | Notification      | ⬜     |
| Badge de não lidas     | Notification.read | ⬜     |
| Deep link para ação    | Notification.link | ⬜     |

#### 5.2 Settings

| Feature                      | Status |
| ---------------------------- | ------ |
| Configurações de notificação | ⬜     |
| Dark mode                    | ⬜     |
| Logout                       | ⬜     |
| Versão do app                | ⬜     |

#### 5.3 Polish

| Feature                | Status |
| ---------------------- | ------ |
| Animações e transições | ⬜     |
| Haptic feedback        | ⬜     |
| Offline support básico | ⬜     |
| Error handling UX      | ⬜     |
| Empty states           | ⬜     |

---

### Fase 6 - Premium Features 🌟

**Estimativa: 2-3 semanas**

#### 6.1 AutoApply Mobile

| Feature             | Modelo Prisma                  | Status |
| ------------------- | ------------------------------ | ------ |
| Status do AutoApply | JobPreference.autoApplyEnabled | ⬜     |
| Ativar/desativar    | JobPreference.autoApplyEnabled | ⬜     |
| Ver log de ações    | ApplicationLog                 | ⬜     |
| Configuração rápida | JobPreference.\*               | ⬜     |

#### 6.2 Widgets (iOS/Android)

| Feature                          | Status |
| -------------------------------- | ------ |
| Widget de vagas novas            | ⬜     |
| Widget de candidaturas pendentes | ⬜     |
| Widget de próximo follow-up      | ⬜     |

---

## 🛠️ Stack Tecnológica

### Backend

| Tecnologia | Uso                 |
| ---------- | ------------------- |
| NestJS     | Framework principal |
| Prisma     | ORM                 |
| PostgreSQL | Banco de dados      |
| Redis      | Cache e filas       |
| BullMQ     | Job queues          |
| Passport   | Autenticação        |
| OpenAI     | AI Matching         |

### Frontend Web (Next.js)

| Tecnologia      | Uso              |
| --------------- | ---------------- |
| Next.js 15      | Framework        |
| React 19        | UI Library       |
| TypeScript      | Type safety      |
| TailwindCSS     | Styling          |
| shadcn/ui       | Components       |
| React Query     | Data fetching    |
| Zustand         | State management |
| React Hook Form | Forms            |
| Zod             | Validation       |

### Mobile (React Native)

| Tecnologia         | Uso                  |
| ------------------ | -------------------- |
| Expo               | Development platform |
| React Native       | Core framework       |
| TypeScript         | Type safety          |
| NativeWind         | Styling (Tailwind)   |
| React Query        | Data fetching        |
| Zustand            | State management     |
| React Navigation   | Navigation           |
| Expo Notifications | Push notifications   |

### Infraestrutura

| Tecnologia     | Uso                |
| -------------- | ------------------ |
| Docker         | Containerização    |
| GitHub Actions | CI/CD              |
| Vercel         | Deploy Next.js     |
| Railway/Render | Deploy API         |
| Stripe         | Pagamentos         |
| Resend         | Email transacional |

---

## 📅 Resumo de Timeline

### Next.js (Dashboard Web) - Candidatos + Empresas

| Fase      | Descrição                                    | Estimativa        | Público    |
| --------- | -------------------------------------------- | ----------------- | ---------- |
| 1         | Core (MVP) - Auth, Layout, Dashboard, Perfil | 4-6 semanas       | Candidatos |
| 2         | Jobs & Applications - Feed, Candidaturas     | 3-4 semanas       | Candidatos |
| 3         | Preferências & AutoApply                     | 2-3 semanas       | Candidatos |
| 4         | CRM & Templates                              | 2-3 semanas       | Candidatos |
| 5         | Analytics & Settings                         | 2-3 semanas       | Candidatos |
| 6         | Billing & Team Management                    | 2 semanas         | Candidatos |
| 7         | **Portal de Empresas (B2B)**                 | 4-5 semanas       | Empresas   |
| **Total** |                                              | **19-26 semanas** |            |

### React Native (App Mobile) - Candidatos

| Fase      | Descrição                      | Estimativa        |
| --------- | ------------------------------ | ----------------- |
| 1         | Core Mobile - Auth, Navigation | 3-4 semanas       |
| 2         | Jobs Feed                      | 2-3 semanas       |
| 3         | Applications Tracking          | 2-3 semanas       |
| 4         | Preferências & Profile         | 2 semanas         |
| 5         | Notifications & Settings       | 2 semanas         |
| 6         | AutoApply & Analytics          | 2-3 semanas       |
| **Total** |                                | **13-18 semanas** |

### Priorização Sugerida

```
Mês 1-2: Next.js Fases 1-2 (MVP Candidatos)
Mês 3:   Next.js Fases 3-4 + RN Fase 1
Mês 4:   Next.js Fases 5-6 + RN Fases 2-3
Mês 5:   Next.js Fase 7 (Portal Empresas) + RN Fases 4-5
Mês 6:   Polimento + RN Fase 6 + Testes Beta

Lançamento MVP Candidatos: ~Mês 2
Lançamento Portal Empresas: ~Mês 5
Lançamento App Mobile: ~Mês 4-5
```

---

## 📊 Métricas de Sucesso

| Métrica                               | Meta         |
| ------------------------------------- | ------------ |
| Tempo médio para encontrar vaga       | < 5 segundos |
| Taxa de match correto (user feedback) | > 85%        |
| Candidaturas via AutoApply / manual   | 60% / 40%    |
| Retenção D7                           | > 40%        |
| Retenção D30                          | > 25%        |
| NPS                                   | > 50         |
| Conversão trial → pago                | > 10%        |

---

## 📁 Estrutura de Pastas Sugerida (Next.js)

```
apps/web/
├── app/
│   ├── (auth)/
│   │   ├── auth/
│   │   │   ├── signin/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   └── (dashboard)/
│   │       ├── dashboard/page.tsx
│   │       ├── jobs/
│   │       │   ├── page.tsx          # Feed de vagas
│   │       │   ├── [id]/page.tsx     # Detalhes da vaga
│   │       │   └── saved/page.tsx    # Vagas salvas
│   │       ├── applications/
│   │       │   ├── page.tsx          # Lista de candidaturas
│   │       │   └── [id]/page.tsx     # Detalhes da candidatura
│   │       ├── profile/
│   │       │   ├── page.tsx          # Perfil principal
│   │       │   ├── experience/page.tsx
│   │       │   └── education/page.tsx
│   │       ├── autoapply/page.tsx
│   │       ├── crm/
│   │       │   ├── page.tsx          # Lista de contatos
│   │       │   ├── [id]/page.tsx     # Detalhes do contato
│   │       │   └── messages/page.tsx
│   │       ├── templates/page.tsx
│   │       ├── analytics/page.tsx
│   │       ├── notifications/page.tsx
│   │       ├── billing/page.tsx
│   │       ├── team/page.tsx
│   │       └── settings/
│   │           ├── page.tsx
│   │           ├── preferences/page.tsx
│   │           └── security/page.tsx
│   ├── (empresa)/                    # 🏢 PORTAL DE EMPRESAS (B2B)
│   │   ├── empresa/
│   │   │   ├── auth/
│   │   │   │   ├── signin/page.tsx   # Login empresa
│   │   │   │   ├── signup/page.tsx   # Cadastro empresa
│   │   │   │   └── onboarding/page.tsx
│   │   │   ├── dashboard/page.tsx    # Dashboard empresa
│   │   │   ├── jobs/
│   │   │   │   ├── page.tsx          # Lista de vagas da empresa
│   │   │   │   ├── new/page.tsx      # Criar vaga
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # Detalhes/edição da vaga
│   │   │   │       └── candidates/page.tsx  # ATS - Candidatos
│   │   │   ├── talents/page.tsx      # Banco de talentos
│   │   │   ├── messages/page.tsx     # Comunicação
│   │   │   ├── analytics/page.tsx    # Analytics empresa
│   │   │   ├── billing/page.tsx      # Billing empresarial
│   │   │   ├── team/page.tsx         # Gerenciar recrutadores
│   │   │   └── settings/
│   │   │       ├── page.tsx          # Perfil da empresa
│   │   │       ├── funnel/page.tsx   # Customizar funil
│   │   │       └── integrations/page.tsx
│   └── (marketing)/
│       ├── page.tsx                  # Landing page
│       ├── pricing/page.tsx          # Preços candidatos
│       └── empresas/page.tsx         # Landing empresas
├── features/
│   ├── jobs/
│   │   ├── actions/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── http/
│   │   ├── schemas/
│   │   └── types/
│   ├── applications/
│   ├── profile/
│   ├── autoapply/
│   ├── crm/
│   ├── templates/
│   ├── analytics/
│   ├── billing/
│   ├── team/
│   └── empresa/                      # 🏢 Features do Portal Empresas
│       ├── actions/
│       ├── components/
│       ├── hooks/
│       ├── http/
│       ├── schemas/
│       └── types/
└── components/
    └── ui/
```

---

## 📁 Estrutura de Pastas Sugerida (React Native)

```
apps/mobile/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx           # Jobs Feed
│   │   ├── applications.tsx    # Candidaturas
│   │   ├── profile.tsx         # Perfil
│   │   └── settings.tsx        # Configurações
│   ├── job/[id].tsx            # Detalhes da vaga
│   ├── application/[id].tsx    # Detalhes da candidatura
│   ├── preferences.tsx         # JobPreference
│   ├── autoapply.tsx           # AutoApply config
│   ├── notifications.tsx       # Central de notificações
│   └── (auth)/
│       ├── login.tsx
│       └── signup.tsx
├── components/
│   ├── JobCard.tsx
│   ├── ApplicationCard.tsx
│   ├── MatchScore.tsx
│   └── ...
├── features/
│   ├── jobs/
│   ├── applications/
│   ├── profile/
│   └── preferences/
└── hooks/
    ├── useJobs.ts
    ├── useApplications.ts
    └── useProfile.ts
```

---

## 📝 Licença

MIT © TalentLoop

---

**Feito com ❤️ para ajudar pessoas a encontrarem o emprego dos sonhos.**
