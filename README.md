# Revela

Revela e um sistema online de mural de fotos ao vivo para eventos privados.

O produto permite que convidados enviem fotos pelo celular via QR Code, que moderadores aprovem manualmente o conteudo, e que um telao/projetor exiba em tempo real um feed apenas com fotos aprovadas.

## Objetivo do MVP

Criar um MVP reutilizavel para varios eventos, com o primeiro caso real sendo uma festa de aniversario.

O MVP deve permitir:

- admin com login Google;
- criacao e configuracao de eventos;
- QR Code unico por evento;
- envio de fotos por convidados sem login;
- moderacao manual;
- feed ao vivo para telao;
- armazenamento das fotos e historico de moderacao;
- encerramento de evento para bloquear novos uploads.

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
- [Roteiro de releases](docs/ROADMAP.md)
- [Operacao no dia do evento](docs/OPERACAO_EVENTO.md)

## Escopo resumido

### Convidado

O convidado acessa o QR Code do evento, informa nome/apelido, aceita um termo simples e envia uma ou mais fotos. Cada foto pode ter uma mensagem opcional.

### Moderador

O moderador acessa um link secreto individual, revisa fotos pendentes e aprova ou rejeita o que pode aparecer no telao.

### Admin

O admin entra com Google, cria eventos, configura identidade visual, gera QR Code, cria links de moderadores, acompanha dashboard e encerra eventos.

### Telao

O telao exibe somente fotos aprovadas, com nome/apelido e mensagem. Enquanto nao houver fotos aprovadas, usa a imagem do convite como estado inicial.

## Desenvolvimento

Comandos principais:

```bash
pnpm install
pnpm dev
pnpm validate
pnpm build
```

O arquivo `.env.example` lista as variaveis necessarias para banco, NextAuth, Google OAuth e allowlist de administradores.

Em desenvolvimento local, o storage usa `STORAGE_PROVIDER="local"` e salva arquivos no diretorio ignorado `storage/`. No deploy recomendado, use `STORAGE_PROVIDER="cloudflare-r2"` com as variaveis `R2_*` configuradas no Vercel.
