# Revela

Revela é um sistema online de mural de fotos ao vivo para eventos privados.

O produto permite que convidados enviem fotos pelo celular via QR Code, que a organização controle o que aparece, e que um telão/projetor exiba em tempo real um feed apenas com fotos aprovadas.

## Objetivo do MVP

Criar um MVP reutilizável para vários eventos, com o primeiro caso real sendo uma festa de aniversário.

O MVP deve permitir:

- admin com login Google;
- criacao e configuracao de eventos;
- QR Code unico por evento;
- envio de fotos por convidados sem login;
- moderação web;
- feed ao vivo para telao;
- armazenamento das fotos e histórico de moderação;
- encerramento de evento para bloquear novos uploads;
- exportação protegida das fotos e metadados do evento.

Na Fase 2, o produto deve continuar preservando o fluxo web de produção e evoluir com modo de moderação por evento, melhorias mobile para moderadores, direção de aplicativo nativo para moderadores e prova isolada de vídeo.

## Documentacao

- [PRD](docs/PRD.md)
- [Backlog do MVP](docs/BACKLOG.md)
- [Arquitetura funcional](docs/ARQUITETURA_FUNCIONAL.md)
- [Fluxos de UX](docs/FLUXOS_UX.md)
- [Modelo de dados](docs/MODELO_DADOS.md)
- [Decisoes tecnicas](docs/DECISOES_TECNICAS.md)
- [Stack recomendada](docs/STACK_RECOMENDADA.md)
- [Plano de implementacao](docs/PLANO_IMPLEMENTACAO.md)
- [Status de implementacao](docs/STATUS_IMPLEMENTACAO.md)
- [Configuracao Google OAuth](docs/GOOGLE_OAUTH.md)
- [Deploy e Vercel](docs/DEPLOY_VERCEL.md)
- [Dominio de midias R2](docs/DOMINIO_MIDIAS_R2.md)
- [Envio de e-mail com Resend](docs/RESEND_EMAIL.md)
- [Roteiro de releases](docs/ROADMAP.md)
- [Operacao no dia do evento](docs/OPERACAO_EVENTO.md)

## Fluxos Principais

### Convidado

O convidado acessa o QR Code do evento, informa nome ou apelido, aceita um termo simples e envia uma ou mais fotos. Cada foto pode ter uma mensagem opcional.

### Moderador

O moderador acessa um link secreto individual, revisa fotos pendentes quando o evento está com moderação, aprova ou rejeita fotos e remove do telão qualquer foto inadequada.

### Admin

O admin cria e configura eventos, ativa ou encerra uploads, acompanha contadores, cria links de moderadores e exporta fotos/metadados.

### Telao

O telão exibe somente fotos aprovadas, com nome ou apelido e mensagem. Enquanto não houver fotos aprovadas, usa a imagem do convite como estado inicial.

## Desenvolvimento

Comandos principais:

```bash
pnpm install
pnpm dev
pnpm validate
pnpm build
```

O arquivo `.env.example` lista variaveis necessarias para banco, NextAuth, Google OAuth, allowlist de administradores e storage.

Em desenvolvimento local, o storage pode usar `STORAGE_PROVIDER="local"` e salvar arquivos no diretorio ignorado `storage/`. No deploy recomendado, use `STORAGE_PROVIDER="cloudflare-r2"` com variaveis `R2_*` configuradas no Vercel.
