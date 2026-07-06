# Relatório de Prontidão - Fase 2

Data: 06/07/2026

Evento-alvo: 11/07/2026

## Decisão Operacional

O caminho crítico recomendado para o evento é somente web:

```text
QR Code -> upload web -> moderação web -> telão -> exportação ZIP
```

O app nativo de moderadores e a prova de vídeo não devem ser tratados como dependência operacional do evento de 11/07/2026.

## Status de Produção

Domínio de produção: `https://revela.gersonvan.com.br`

Status de deploy: nenhum deploy foi realizado para este relatório; a checagem usou a produção já publicada.

Último smoke sem sessão registrado em `docs/QA-2026-07-06-smoke-final-producao.md`:

- Home pública: `HTTP 200`.
- Upload público do evento de ensaio: `HTTP 200`.
- Telão público: `HTTP 200`.
- Atalho curto do telão: `HTTP 307` para `/screen/ensaio-producao-kkh7uc`.
- Feed de fotos aprovadas: `HTTP 200`, com chave `photos`.
- Login admin: `HTTP 200`.
- Admin, exportação JSON, exportação ZIP e QR protegidos: `HTTP 307` para login sem sessão.
- Página base de moderação: `HTTP 200`.

Validações locais recentes:

- `pnpm typecheck`: passou.
- `pnpm build`: passou.
- `pnpm --filter @eventoon/moderator-app typecheck`: passou.
- `pnpm lint`: passou com 2 warnings conhecidos no app moderador.

## Completo Para Uso no Evento

- Upload web por QR Code para convidados.
- Formulário público de envio de fotos.
- Limite de até 15 fotos por envio.
- Telão web com rota `/screen/[slug]` e atalho `/t/[slug]`.
- Moderação web por link de moderador.
- Ações de aprovar, rejeitar e remover foto aprovada do telão.
- Exportação ZIP protegida por login admin.
- Proteção de rotas admin/export/QR por login.
- Runbook operacional do evento em `docs/OPERACAO_EVENTO.md`.

## Parcial

### Modos de Moderação

O código suporta:

- **Com moderação:** fotos entram como `PENDING`.
- **Sem moderação:** fotos entram como `APPROVED` e registram histórico `AUTO_APPROVED`.

Status: implementado e documentado, mas o smoke de banco `pnpm smoke:moderation-mode` não rodou nesta checagem final porque o Postgres local estava indisponível.

Recomendação: usar **Com moderação** como padrão seguro. Se optar por **Sem moderação**, fazer ensaio autenticado antes de liberar o QR Code aos convidados.

### Moderação Mobile Web

O fallback web está disponível e a página base `/moderate` respondeu `HTTP 200`.

Status: o fluxo autenticado com token real de moderador ainda precisa de ensaio em celular físico.

## Bloqueado Por Ambiente ou Acesso Externo

- Smokes com banco local:
  - `pnpm smoke:moderation-mode`;
  - `pnpm smoke:moderator-app`.
- Motivo: Docker/Postgres não estavam disponíveis no ambiente de validação; erro observado `ECONNREFUSED 127.0.0.1:5432`.
- Validação autenticada de admin:
  - criar ou revisar evento real;
  - baixar exportação ZIP real;
  - gerar QR real via painel.
- Validação de moderador real:
  - abrir link privado em celular;
  - aprovar/rejeitar;
  - remover uma foto aprovada.
- Validação física:
  - QR Code em celular real;
  - telão em notebook, TV ou projetor;
  - modo tela cheia;
  - rede do local do evento.

## Adiado ou Fora do Caminho Crítico

### App Nativo de Moderadores

Status honesto:

- Protótipo existe em `apps/moderator`.
- Typecheck do app passou.
- Backend possui APIs `/api/moderator-app/*`.
- App não é obrigatório para o evento de 11/07/2026.
- Publicação em App Store ou Google Play não está garantida.

Bloqueios externos:

- `eas.json` e projeto EAS ainda precisam ser configurados na linha usada para distribuição.
- Contas Apple Developer e Google Play Developer dependem de configuração externa.
- Assinatura, credenciais, aparelhos físicos e revisão das lojas não são controlados pelo código.

Decisão para o evento: usar moderação web como fallback obrigatório e caminho principal.

### Vídeo

Status honesto:

- Existe prova controlada documentada.
- Vídeo não entra no upload público de convidados.
- Vídeo não entra na moderação do evento.
- Vídeo não aparece no telão.
- Vídeo não entra na exportação ZIP do evento de 11/07/2026.

Decisão para o evento: convidados enviam apenas fotos.

## Ações Obrigatórias Antes do Evento

1. Entrar no admin em `https://revela.gersonvan.com.br/admin`.
2. Conferir evento correto, nome, data, convite, tema e texto de autorização.
3. Confirmar o modo de moderação escolhido.
4. Ativar o evento somente quando estiver pronto para receber fotos.
5. Gerar ou conferir o QR Code de upload.
6. Abrir o QR Code em celular físico.
7. Enviar uma foto de teste.
8. Se o evento estiver **Com moderação**, aprovar a foto pelo link de moderador.
9. Se o evento estiver **Sem moderação**, confirmar que a foto aparece automaticamente no telão.
10. Remover ou rejeitar uma foto aprovada por engano e confirmar que ela sai do telão.
11. Abrir o telão no notebook, TV ou projetor do evento.
12. Ativar tela cheia.
13. Baixar exportação ZIP com sessão admin.
14. Conferir que o ZIP foi baixado corretamente.
15. Manter links de moderadores e acesso admin disponíveis durante a festa.

## Riscos Restantes

- Falta de ensaio autenticado com admin real.
- Falta de ensaio com link real de moderador em celular físico.
- Falta de teste no equipamento e rede do local.
- Uso de **Sem moderação** sem equipe monitorando a aba de aprovadas.
- Dependência indevida do app nativo ou da prova de vídeo.

## Recomendação Final

A Fase 2 está pronta para operar o evento se o ensaio real pré-evento passar no fluxo web.

Não liberar o QR Code aos convidados antes de validar, no mesmo ambiente operacional do evento:

- upload por celular;
- moderação web;
- telão em tela cheia;
- remoção de foto aprovada por engano;
- exportação ZIP.

Para o evento de 11/07/2026, manter app nativo e vídeo como itens fora do caminho crítico.
