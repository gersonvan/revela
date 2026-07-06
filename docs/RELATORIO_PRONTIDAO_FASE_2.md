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

## Completo Para o Caminho Crítico Web

- Página pública de upload por QR Code.
- Upload web de fotos.
- Limite operacional de lote de até 15 fotos.
- Telão em `/screen/[slug]` e atalho `/t/[slug]`.
- Feed público de fotos aprovadas.
- Admin protegido por login.
- Exportação JSON e ZIP protegidas por login.
- Runbook operacional em `docs/OPERACAO_EVENTO.md`.

## Parcial ou Dependente de Ensaio Real

### Modos de Moderação

- **Com moderação:** fotos entram como `PENDING`.
- **Sem moderação:** fotos entram como `APPROVED` e registram histórico `AUTO_APPROVED`.

Status: implementado e documentado, mas o smoke de banco `pnpm smoke:moderation-mode` não rodou nesta checagem final porque o Postgres local estava indisponível.

Recomendação: usar **Com moderação** como padrão seguro. Se optar por **Sem moderação**, fazer ensaio autenticado antes de liberar o QR Code aos convidados.

### Moderação Mobile Web

O fallback web está disponível e a página base `/moderate` respondeu `HTTP 200`.

Status: o fluxo autenticado com token real de moderador ainda precisa de ensaio em celular físico.

### Exportação ZIP

As rotas protegidas redirecionam corretamente para login sem sessão.

Status: o download real do ZIP ainda precisa ser testado com sessão admin válida antes do evento.

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

- Existe protótipo em `apps/moderator`.
- Backend de apoio existe em `/api/moderator-app/*`.
- O app não é obrigatório para o evento de 11/07/2026.
- App Store e Google Play não estão garantidos.
- Ainda faltam `eas.json`, projeto EAS, contas, credenciais, builds, testes em aparelhos físicos e revisão externa.

Decisão para o evento: usar moderação web como caminho operacional seguro.

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

- Falta de ensaio autenticado completo antes do evento.
- Falta de validação física no local, com celular real, rede real e tela real.
- Falha de internet no local pode afetar upload, moderação e atualização do telão.
- Uso de **Sem moderação** aumenta o risco de foto inadequada aparecer diretamente no telão.
- App nativo e vídeo não devem ser usados como plano principal.

## Recomendação Final

Para o evento de 11/07/2026, considerar a Fase 2 pronta para operação apenas se o ensaio real pré-evento confirmar:

- login admin;
- QR Code em celular físico;
- envio de foto;
- aprovação ou remoção por moderador;
- telão em tela cheia;
- exportação ZIP.

Sem esse ensaio, a base técnica está encaminhada e os checks públicos estão saudáveis, mas a operação ainda tem risco prático de sessão, dispositivo, rede ou exportação.
