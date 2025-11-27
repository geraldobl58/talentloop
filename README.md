# talenntloop API

API backend multi-tenant SaaS construída com NestJS, Prisma e PostgreSQL.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Executando](#executando)
- [Testes](#testes)
- [Módulos](#módulos)
- [API Endpoints](#api-endpoints)
- [Estrutura do Projeto](#estrutura-do-projeto)

## 🎯 Visão Geral

talenntloop é uma plataforma SaaS multi-tenant para gestão de propriedades e contatos. O sistema oferece:

- **Multi-tenancy**: Isolamento completo de dados por empresa
- **Planos de Assinatura**: TRIAL (7 dias), STARTER, PROFESSIONAL, ENTERPRISE
- **Autenticação Segura**: JWT + Two-Factor Authentication (2FA)
- **Integração Stripe**: Pagamentos, assinaturas e webhooks
- **Sistema de Emails**: Templates Pug com monitoramento de limites
- **Rate Limiting**: Por plano de assinatura

## 🛠 Tecnologias

| Categoria              | Tecnologia              |
| ---------------------- | ----------------------- |
| **Framework**          | NestJS 11.x             |
| **Linguagem**          | TypeScript 5.x          |
| **ORM**                | Prisma 6.x              |
| **Banco de Dados**     | PostgreSQL              |
| **Autenticação**       | JWT + Passport          |
| **2FA**                | TOTP (otplib) + QR Code |
| **Pagamentos**         | Stripe                  |
| **Emails**             | Nodemailer              |
| **Templates**          | Pug                     |
| **Upload de Arquivos** | Cloudinary              |
| **Logging**            | Pino                    |
| **Testes**             | Vitest                  |
| **Documentação API**   | Swagger/OpenAPI         |

## 🏗 Arquitetura

### Padrão de Camadas

```
┌─────────────────────────────────────────┐
│              Controllers                │  ← Rotas HTTP, validação
├─────────────────────────────────────────┤
│           Services (Orchestrators)      │  ← Lógica de negócio
├─────────────────────────────────────────┤
│          Services (Specialized)         │  ← Responsabilidades específicas
├─────────────────────────────────────────┤
│              Repositories               │  ← Acesso a dados (Prisma)
├─────────────────────────────────────────┤
│                 Prisma                  │  ← ORM / Database
└─────────────────────────────────────────┘
```

### Princípios

- **Single Responsibility**: Cada serviço tem uma única responsabilidade
- **Facade Pattern**: Orchestrators delegam para serviços especializados
- **Repository Pattern**: Abstração do acesso a dados
- **Dependency Injection**: IoC container do NestJS

## 📦 Instalação

```bash
# Clone o repositório
git clone <repository-url>
cd talenntloop/apps/api

# Instale as dependências
pnpm install

# Configure o banco de dados
pnpm prisma generate
pnpm prisma migrate dev

# Seed do banco (planos, usuário de teste)
pnpm prisma db seed
```

## ⚙️ Configuração

Crie um arquivo `.env` na raiz do projeto:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/talenntloop"

# JWT
JWT_SECRET="your-super-secret-key-min-32-chars"
JWT_EXPIRES="7d"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_STARTER="price_..."
STRIPE_PRICE_PROFESSIONAL="price_..."
STRIPE_PRICE_ENTERPRISE="price_..."

# Email (SMTP)
MAIL_HOST="smtp.mailtrap.io"
MAIL_PORT=587
MAIL_USER="your-user"
MAIL_PASS="your-pass"
MAIL_FROM="noreply@talenntloop.com"

# Cloudinary (Upload de Avatar)
CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"

# Environment
NODE_ENV="development"
PORT=3333
```

## 🚀 Executando

```bash
# Desenvolvimento (watch mode)
pnpm run start:dev

# Produção
pnpm run build
pnpm run start:prod

# Debug
pnpm run start:debug
```

A API estará disponível em `http://localhost:3333`

### Swagger Documentation

Acesse `http://localhost:3333/docs` para a documentação interativa da API.

## 🧪 Testes

```bash
# Testes unitários
pnpm run test

# Testes unitários (watch)
pnpm run test:watch

# Testes E2E
pnpm run test:e2e

# Cobertura
pnpm run test:cov
```

### Cobertura de Testes

| Tipo       | Quantidade |
| ---------- | ---------- |
| Unit Tests | 71         |
| E2E Tests  | 35         |
| **Total**  | **106**    |

## 📁 Módulos

### Auth Module (`/auth`)

Autenticação e gestão de usuários.

| Serviço            | Responsabilidade             |
| ------------------ | ---------------------------- |
| `SignInService`    | Login, JWT, integração 2FA   |
| `SignupService`    | Cadastro de empresas/tenants |
| `PasswordService`  | Forgot/Reset/Change password |
| `ProfileService`   | Perfil, avatar, subscription |
| `TwoFactorService` | TOTP, QR Code, backup codes  |

**Repositories:**

- `AuthRepository` - Users, Tenants, Password Resets
- `TwoFactorRepository` - Dados de 2FA

### Plans Module (`/plans`)

Gestão de planos e assinaturas.

| Endpoint                          | Descrição                 |
| --------------------------------- | ------------------------- |
| `GET /plans`                      | Listar planos disponíveis |
| `GET /plans/my-plan`              | Plano atual do tenant     |
| `GET /plans/subscription-history` | Histórico de assinaturas  |
| `POST /plans/upgrade`             | Upgrade de plano          |
| `POST /plans/cancel`              | Cancelar assinatura       |

**Planos Disponíveis:**

| Plano        | Duração | Usuários | Propriedades | Contatos |
| ------------ | ------- | -------- | ------------ | -------- |
| TRIAL        | 7 dias  | 4        | 3            | 10       |
| STARTER      | 30 dias | 4        | 3            | 10       |
| PROFESSIONAL | 30 dias | 4        | 10           | 20       |
| ENTERPRISE   | 30 dias | 4        | 50           | 30       |

### Stripe Module (`/stripe`)

Integração com Stripe para pagamentos.

| Serviço                     | Responsabilidade            |
| --------------------------- | --------------------------- |
| `StripeCustomerService`     | Criar/buscar customers      |
| `StripeCheckoutService`     | Sessions de checkout        |
| `StripeSubscriptionService` | Gerenciar subscriptions     |
| `StripeWebhookService`      | Processar eventos Stripe    |
| `AutoUpgradeService`        | Auto-upgrade após pagamento |

### Email Module (`/email`)

Sistema de emails transacionais.

| Serviço                    | Tipo de Email            |
| -------------------------- | ------------------------ |
| `WelcomeEmailService`      | Boas-vindas              |
| `PasswordEmailService`     | Reset de senha           |
| `SubscriptionEmailService` | Confirmação/Cancelamento |
| `AlertEmailService`        | Alertas de limite        |
| `BillingEmailService`      | Faturas                  |
| `LimitMonitorService`      | Monitoramento de limites |

### Notifications Module (`/notifications`)

Templates de email com Pug.

**Templates Disponíveis:**

- `welcome.pug` - Boas-vindas
- `password-reset.pug` - Reset de senha
- `limit-alert.pug` - Alerta de limite
- `upgrade.pug` - Confirmação de upgrade
- `cancellation.pug` - Cancelamento

## 🔌 API Endpoints

### Authentication

| Método | Endpoint                | Descrição           | Auth |
| ------ | ----------------------- | ------------------- | ---- |
| POST   | `/auth/signup`          | Cadastro de empresa | ❌   |
| POST   | `/auth/signin`          | Login               | ❌   |
| GET    | `/auth/profile`         | Perfil do usuário   | ✅   |
| POST   | `/auth/forgot-password` | Solicitar reset     | ❌   |
| POST   | `/auth/reset-password`  | Resetar senha       | ❌   |
| POST   | `/auth/change-password` | Alterar senha       | ✅   |
| POST   | `/auth/refresh`         | Refresh token       | ✅   |
| POST   | `/auth/upload-avatar`   | Upload de avatar    | ✅   |

### Two-Factor Authentication

| Método | Endpoint                            | Descrição          | Auth |
| ------ | ----------------------------------- | ------------------ | ---- |
| GET    | `/auth/2fa/generate`                | Gerar QR Code      | ✅   |
| POST   | `/auth/2fa/enable`                  | Ativar 2FA         | ✅   |
| DELETE | `/auth/2fa/disable`                 | Desativar 2FA      | ✅   |
| POST   | `/auth/2fa/regenerate-backup-codes` | Novos backup codes | ✅   |
| GET    | `/auth/2fa/status`                  | Status do 2FA      | ✅   |

### Plans & Subscriptions

| Método | Endpoint                      | Descrição            | Auth |
| ------ | ----------------------------- | -------------------- | ---- |
| GET    | `/plans`                      | Listar planos        | ❌   |
| GET    | `/plans/my-plan`              | Meu plano            | ✅   |
| GET    | `/plans/subscription-history` | Histórico            | ✅   |
| POST   | `/plans/upgrade`              | Fazer upgrade        | ✅   |
| POST   | `/plans/cancel`               | Cancelar             | ✅   |
| GET    | `/plans/validate`             | Validar subscription | ✅   |

### Stripe

| Método | Endpoint                          | Descrição           | Auth |
| ------ | --------------------------------- | ------------------- | ---- |
| POST   | `/stripe/create-checkout-session` | Checkout            | ✅   |
| POST   | `/stripe/create-billing-portal`   | Portal Stripe       | ✅   |
| GET    | `/stripe/subscription-status`     | Status subscription | ✅   |
| POST   | `/stripe/webhook`                 | Webhook Stripe      | ❌   |

### Email

| Método | Endpoint              | Descrição         | Auth |
| ------ | --------------------- | ----------------- | ---- |
| POST   | `/email/check-limits` | Verificar limites | ✅   |

## 📂 Estrutura do Projeto

```
src/
├── app.module.ts              # Módulo principal
├── main.ts                    # Bootstrap da aplicação
├── auth/                      # Módulo de autenticação
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   ├── jwt.strategy.ts
│   ├── dto/
│   ├── repositories/
│   ├── services/
│   └── two-factor/
├── email/                     # Módulo de emails
│   ├── email.controller.ts
│   ├── email.module.ts
│   ├── limit-monitor.service.ts
│   ├── repositories/
│   └── services/
├── libs/                      # Bibliotecas compartilhadas
│   ├── common/
│   │   ├── constants.ts
│   │   ├── decorators/
│   │   ├── enums.ts
│   │   ├── guards/
│   │   └── interfaces/
│   ├── logger/
│   └── prisma/
├── notifications/             # Templates de email
│   ├── notifications.module.ts
│   ├── pug.service.ts
│   ├── repositories/
│   ├── services/
│   └── templates/
├── plans/                     # Módulo de planos
│   ├── plans.controller.ts
│   ├── plans.module.ts
│   ├── plans.service.ts
│   ├── dto/
│   └── repositories/
└── stripe/                    # Módulo Stripe
    ├── stripe.controller.ts
    ├── stripe.module.ts
    ├── auto-upgrade.service.ts
    ├── dto/
    ├── repositories/
    └── services/
```

## 🔒 Segurança

- **JWT**: Tokens assinados com expiração configurável
- **2FA**: TOTP compatível com Google Authenticator
- **Backup Codes**: 8 códigos de recuperação por usuário
- **Password Hashing**: bcrypt com salt rounds
- **Rate Limiting**: Por tenant e por plano
- **CORS**: Configurável por ambiente
- **Helmet**: Headers de segurança

## 📝 Convenções

### Nomenclatura

- **Controllers**: `*.controller.ts`
- **Services**: `*.service.ts`
- **Repositories**: `*.repository.ts`
- **DTOs**: `*.dto.ts`
- **Testes**: `*.spec.ts` (unit), `*.e2e-spec.ts` (e2e)

### Commits

Seguir [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: adiciona autenticação 2FA
fix: corrige validação de email
docs: atualiza README
test: adiciona testes de auth
refactor: reorganiza módulo de auth
```

## 🐳 Docker

```bash
# Desenvolvimento
docker-compose up -d

# Produção
docker-compose -f docker-compose.prod.yml up -d
```

## 📄 Licença

Este projeto é privado e proprietário.

---

**Desenvolvido com ❤️ usando NestJS**
