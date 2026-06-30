# Operacao no Dia do Evento

Este documento descreve como preparar e operar o Revela durante uma festa.

## Antes do Evento

## Ensaio Local

Para criar um evento demo local sem depender do login Google:

```bash
pnpm db:up
pnpm db:migrate
pnpm env:check
pnpm db:seed
pnpm dev
```

O seed cria:

- upload: `http://127.0.0.1:3000/e/evento-demo`;
- moderacao: `http://127.0.0.1:3000/moderate/moderador-demo-token`;
- telao: `http://127.0.0.1:3000/screen/evento-demo`.

Com o servidor local rodando, o smoke test automatizado pode ser executado com:

```bash
pnpm smoke:demo
```

Ele valida:

- paginas publicas do evento demo;
- upload via API;
- criacao da foto como pendente;
- aprovacao simulada no banco;
- disponibilidade da foto aprovada no endpoint do telao.

### Configuracao

1. Admin faz login com Google.
2. Admin cria o evento.
3. Admin configura:
   - nome do evento;
   - data;
   - imagem do convite;
   - cores/tema;
   - texto de autorizacao.
4. Admin ativa o evento.
5. Sistema gera QR Code do evento.
6. Admin cria links individuais para moderadores.

### Teste

Antes da festa, testar o fluxo completo:

1. Abrir QR Code no celular.
2. Enviar uma foto de teste.
3. Abrir painel de moderacao.
4. Aprovar a foto.
5. Abrir telao no notebook.
6. Confirmar que a foto aprovada aparece.
7. Rejeitar/remover uma foto aprovada e confirmar que ela sai do telao.
8. Confirmar estado inicial com imagem do convite.

### Materiais

Preparar:

- QR Code impresso ou exibido nas mesas;
- notebook para o projetor;
- carregador do notebook;
- acesso a internet;
- links de moderadores enviados para as pessoas certas;
- imagem do convite em boa resolucao.

## Inicio da Festa

1. Conectar notebook ao projetor ou TV.
2. Abrir pagina do telao.
3. Ativar modo tela cheia.
4. Conferir se o QR Code aparece no telao.
5. Moderadores abrem seus links nos celulares.
6. Deixar o QR Code visivel nas mesas, entrada ou bar.

## Durante a Festa

### Convidados

Convidados enviam fotos em fluxo continuo:

- uma foto individual;
- lotes de ate 15 fotos;
- mensagem opcional por foto.

### Moderadores

Moderadores devem:

- acompanhar aba Pendentes;
- aprovar fotos adequadas;
- rejeitar fotos inadequadas;
- revisar Aprovadas e Rejeitadas se necessario;
- remover do telao qualquer foto aprovada por engano.

### Admin

Admin pode acompanhar:

- total de fotos enviadas;
- pendentes;
- aprovadas;
- rejeitadas;
- moderadores ativos.

## Problemas Comuns

### Internet instavel

Comportamento esperado:

- novos uploads podem demorar;
- telao deve continuar mostrando fotos ja carregadas;
- moderadores podem ver atraso na fila.

Acao:

- manter notebook em rede mais estavel disponivel;
- evitar depender de Chromecast se o ambiente estiver instavel;
- preferir notebook conectado diretamente ao projetor.

### Fila de moderacao acumulada

Acao:

- chamar mais moderadores;
- priorizar aprovacao rapida de fotos claramente boas;
- rejeitar fotos duplicadas, borradas ou inadequadas.

### Foto indevida apareceu

Acao:

1. Abrir aba Aprovadas.
2. Localizar a foto.
3. Mover para Rejeitadas.
4. Confirmar que saiu do telao.

## Depois do Evento

1. Admin encerra o evento.
2. Sistema bloqueia novos uploads.
3. Fotos e historico permanecem armazenados.
4. Futuramente, admin podera baixar fotos ou criar galeria privada.
