# Roles Module - TalentLoop API

Este módulo implementa o sistema de RBAC (Role-Based Access Control) para o TalentLoop, permitindo gerenciamento de papéis (roles), permissões e controle de acesso baseado em tenant.

## Visão Geral

O sistema de roles permite:

- **Multi-tenancy**: Cada tenant pode ter sua própria estrutura de usuários e roles
- **Hierarquia de Roles**: OWNER > ADMIN > MANAGER > MEMBER > VIEWER
- **Permissões Granulares**: Controle fino sobre o que cada role pode fazer
- **Guards e Decorators**: Proteção de rotas de forma declarativa

## Arquitetura

```
src/roles/
├── roles.module.ts           # Módulo NestJS
├── roles.controller.ts       # Endpoints REST
├── dto/
│   ├── index.ts
│   └── roles.dto.ts         # DTOs para validação
├── repositories/
│   ├── index.ts
│   └── roles.repository.ts  # Acesso ao banco
└── services/
    ├── index.ts
    ├── roles.service.ts     # Lógica de negócio
    └── roles.service.spec.ts # Testes
```

## Roles

| Role    | Nível | Descrição                                               |
| ------- | ----- | ------------------------------------------------------- |
| OWNER   | 5     | Acesso total, incluindo billing e exclusão de conta     |
| ADMIN   | 4     | Gerencia usuários e configurações, sem acesso a billing |
| MANAGER | 3     | Acesso a relatórios e configurações limitadas           |
| MEMBER  | 2     | Acesso básico às funcionalidades                        |
| VIEWER  | 1     | Apenas visualização                                     |

## Permissões

### Módulos

- **jobs**: Gerenciamento de vagas
- **applications**: Candidaturas
- **profile**: Perfil do usuário
- **users**: Gerenciamento de usuários do time
- **settings**: Configurações do sistema
- **billing**: Faturamento e assinatura
- **autoapply**: Configurações de AutoApply
- **recruiter**: CRM de recrutadores
- **reports**: Relatórios

### Ações

- `read`: Visualizar
- `write`: Criar e editar
- `delete`: Excluir
- `manage`: Gerenciar (ações especiais)
- `export`: Exportar dados

### Formato

Permissões seguem o formato `module:action`, ex: `jobs:read`, `users:manage`.

## API Endpoints

### Listar Roles

```http
GET /roles
Authorization: Bearer <token>
```

**Resposta:**

```json
[
  { "id": "uuid", "name": "OWNER", "description": "..." },
  { "id": "uuid", "name": "ADMIN", "description": "..." },
  ...
]
```

### Listar Permissões

```http
GET /roles/permissions
Authorization: Bearer <token>
```

**Resposta:**

```json
[
  { "id": "uuid", "name": "jobs:read", "description": "..." },
  ...
]
```

### Listar Membros do Tenant

```http
GET /roles/team
Authorization: Bearer <token>
```

**Requer:** Role ADMIN ou superior

**Resposta:**

```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "tenantId": "uuid",
    "roleId": "uuid",
    "user": { "id": "uuid", "email": "...", "name": "..." },
    "role": { "id": "uuid", "name": "ADMIN" }
  },
  ...
]
```

### Obter Minha Role

```http
GET /roles/my-role
Authorization: Bearer <token>
```

**Resposta:**

```json
{
  "id": "uuid",
  "userId": "uuid",
  "tenantId": "uuid",
  "roleId": "uuid",
  "role": { "id": "uuid", "name": "MEMBER" }
}
```

### Obter Minhas Permissões

```http
GET /roles/my-permissions
Authorization: Bearer <token>
```

**Resposta:**

```json
{
  "role": "MEMBER",
  "permissions": ["jobs:read", "jobs:write", "applications:read", ...]
}
```

### Atribuir Role a Usuário

```http
POST /roles/assign
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "uuid",
  "roleType": "MEMBER"
}
```

**Requer:** Role ADMIN ou superior

### Alterar Role de Usuário

```http
PATCH /roles/change
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "uuid",
  "newRoleType": "MANAGER"
}
```

**Requer:** Role superior à role atual do usuário

### Definir Permissões Custom (Opcional)

```http
PATCH /roles/permissions
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "uuid",
  "permissions": ["jobs:read", "jobs:write"]
}
```

**Requer:** Role OWNER

### Remover Usuário do Tenant

```http
DELETE /roles/remove
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "uuid"
}
```

**Requer:** Role ADMIN ou superior

## Uso com Guards e Decorators

### RolesGuard - Proteger por Role

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../libs/common/guards/roles.guard';
import { Roles } from '../libs/common/decorators/roles.decorator';
import { RoleType } from '@prisma/client';

@Controller('admin')
@UseGuards(RolesGuard)
export class AdminController {
  // Apenas ADMIN e OWNER podem acessar
  @Get('users')
  @Roles(RoleType.ADMIN)
  getUsers() {
    return this.usersService.findAll();
  }

  // Apenas OWNER pode acessar
  @Get('billing')
  @Roles(RoleType.OWNER)
  getBilling() {
    return this.billingService.get();
  }
}
```

### PermissionsGuard - Proteger por Permissão

```typescript
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { PermissionsGuard } from '../libs/common/guards/permissions.guard';
import { Permissions } from '../libs/common/decorators/permissions.decorator';

@Controller('jobs')
@UseGuards(PermissionsGuard)
export class JobsController {
  // Requer permissão jobs:read
  @Get()
  @Permissions('jobs:read')
  findAll() {
    return this.jobsService.findAll();
  }

  // Requer permissão jobs:write
  @Post()
  @Permissions('jobs:write')
  create(@Body() dto: CreateJobDto) {
    return this.jobsService.create(dto);
  }

  // Requer múltiplas permissões
  @Delete(':id')
  @Permissions('jobs:delete', 'jobs:write')
  remove(@Param('id') id: string) {
    return this.jobsService.remove(id);
  }
}
```

### Combinando Guards

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../libs/common/guards/roles.guard';
import { PermissionsGuard } from '../libs/common/guards/permissions.guard';
import { Roles } from '../libs/common/decorators/roles.decorator';
import { Permissions } from '../libs/common/decorators/permissions.decorator';

@Controller('reports')
@UseGuards(RolesGuard, PermissionsGuard)
export class ReportsController {
  // Requer role MANAGER E permissão reports:export
  @Get('export')
  @Roles(RoleType.MANAGER)
  @Permissions('reports:export')
  exportReports() {
    return this.reportsService.export();
  }
}
```

## Integrando com JWT Strategy

O `JwtStrategy` já inclui role e permissões no payload do usuário:

```typescript
// src/auth/jwt.strategy.ts
async validate(payload: JwtPayload) {
  // ... validação

  // Busca role do usuário
  const userRole = await this.prisma.userRole.findFirst({
    where: { userId: user.id, tenantId: user.tenantId },
    include: {
      role: {
        include: {
          rolePermissions: {
            include: { permission: true },
          },
        },
      },
    },
  });

  return {
    id: user.id,
    email: user.email,
    tenantId: user.tenantId,
    role: userRole?.role?.name || null,
    permissions: userRole?.role?.rolePermissions?.map(
      (rp) => rp.permission.name,
    ) || [],
  };
}
```

## Seed de Roles e Permissões

O arquivo `prisma/seed.ts` cria automaticamente:

1. **5 Roles**: OWNER, ADMIN, MANAGER, MEMBER, VIEWER
2. **22 Permissões**: Distribuídas nos 9 módulos
3. **RolePermissions**: Mapeamento padrão de permissões por role
4. **UserRoles**: Atribuição de roles aos usuários existentes

```bash
# Executar seed
pnpm run db:seed

# Ou via Prisma
npx prisma db seed
```

## Usando o Pacote Compartilhado

Para evitar duplicação, use o pacote `@talentloop/roles`:

```typescript
// Em qualquer lugar do backend
import {
  RoleType,
  isRoleAtLeast,
  hasPermission,
  ROLE_HIERARCHY,
} from '@talentloop/roles';

// Verificar hierarquia
if (isRoleAtLeast(user.role, RoleType.ADMIN)) {
  // Usuário é ADMIN ou superior
}

// Verificar permissão
if (hasPermission(user.permissions, 'users:manage')) {
  // Usuário pode gerenciar outros usuários
}
```

## Testes

```bash
# Rodar todos os testes
pnpm test

# Rodar apenas testes do módulo roles
pnpm test roles

# Rodar com coverage
pnpm test:cov
```

### Cobertura de Testes

O módulo possui 25 testes unitários cobrindo:

- Listagem de roles e permissões
- Atribuição e alteração de roles
- Validações de hierarquia
- Remoção de usuários
- Permissões customizadas

## Diagrama de Relacionamentos

```
┌─────────────────────────────────────────────────────────────────────┐
│                              TENANT                                  │
│  ┌─────────┐    ┌──────────┐    ┌────────┐    ┌──────────────────┐ │
│  │  User   │───>│ UserRole │<───│  Role  │<───│ RolePermission   │ │
│  │         │    │          │    │        │    │                  │ │
│  │ id      │    │ userId   │    │ id     │    │ roleId           │ │
│  │ email   │    │ tenantId │    │ name   │    │ permissionId     │ │
│  │ name    │    │ roleId   │    │ type   │    │                  │ │
│  └─────────┘    └──────────┘    └────────┘    └──────────────────┘ │
│                                      │                 │            │
│                                      │                 │            │
│                                      │           ┌─────▼──────┐     │
│                                      │           │ Permission │     │
│                                      │           │            │     │
│                                      │           │ id         │     │
│                                      │           │ name       │     │
│                                      │           │ description│     │
│                                      │           └────────────┘     │
│                                      │                              │
│                              ┌───────┴───────┐                      │
│                              │ Default Roles │                      │
│                              │               │                      │
│                              │ OWNER (5)     │                      │
│                              │ ADMIN (4)     │                      │
│                              │ MANAGER (3)   │                      │
│                              │ MEMBER (2)    │                      │
│                              │ VIEWER (1)    │                      │
│                              └───────────────┘                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Boas Práticas

1. **Use Guards em Controllers, não em Services**: Mantenha a lógica de autorização na camada de apresentação.

2. **Prefira Permissões a Roles**: Quando possível, use `@Permissions()` ao invés de `@Roles()` para maior flexibilidade.

3. **Hierarquia para Ações de Gerenciamento**: Use verificação de hierarquia quando um usuário precisa gerenciar outro.

4. **Não Hardcode Roles**: Use o enum `RoleType` e constantes do pacote `@talentloop/roles`.

5. **Teste os Guards**: Crie testes E2E para verificar que rotas estão realmente protegidas.

## Troubleshooting

### "Acesso negado" mesmo com role correta

1. Verifique se o JWT está incluindo role e permissions
2. Verifique se o UserRole existe para o tenant atual
3. Verifique se o Guard está aplicado na rota

### Permissões não atualizando

1. O usuário precisa fazer logout e login novamente
2. Ou implementar refresh de permissões via endpoint `/roles/my-permissions`

### Role não encontrada

1. Execute o seed: `pnpm run db:seed`
2. Verifique se as migrations foram aplicadas: `npx prisma migrate deploy`

## Licença

MIT © TalentLoop
