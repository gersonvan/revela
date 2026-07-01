# Operacao no Dia do Evento

Este documento descreve como preparar e operar o Revela durante uma festa.

## Antes do Evento

### Ensaio Local

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

### Configuracao do Evento

1. Admin faz login com Google.
2. Admin cria o evento.
3. Admin configura nome, data, imagem do convite, cores/tema e texto de autorizacao.
4. Admin ativa o evento.
5. Sistema gera QR Code e links absolutos de upload/telao.
6. Admin cria links individuais para moderadores.
7. Admin envia os links aos moderadores por canal privado.

### Ensaio Antes da Festa

Antes da festa, testar o fluxo completo:

1. Abrir o QR Code no celular.
2. Enviar uma foto de teste.
3. Abrir painel de moderacao.
4. Aprovar a foto.
5. Confirmar que a foto aparece no telao.
6. Rejeitar ou remover uma foto aprovada por engano.
7. Baixar a exportacao ZIP pelo admin.
8. Conferir se o convite aparece no estado inicial do telao.

Tambem revisar:

- qualidade da internet no local;
- notebook que ficara conectado ao projetor ou TV;
- cabo HDMI/adaptador;
- fonte de energia;
- brilho e resolucao do projetor;
- imagem do convite em boa resolucao;
- quantidade de moderadores disponiveis.

## Inicio da Festa

1. Conectar notebook ao projetor ou TV.
2. Abrir pagina do telao. Para o evento de ensaio, usar `https://revela.gersonvan.com.br/t/ensaio-producao-kkh7uc`.
3. Ativar modo tela cheia.
4. Conferir se o QR Code aparece no telao.
5. Moderadores abrem seus links nos celulares.
6. Deixar o QR Code visivel nas mesas, entrada ou bar.
7. Fazer um upload de teste e aprovar a foto antes dos convidados comecarem a usar.

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
- rejeitar fotos duplicadas ou ruins;
- deixar fotos duvidosas pendentes ate alguem revisar com calma.

### Foto inadequada apareceu no telao

Acao:

1. Abrir painel de moderacao.
2. Entrar na aba Aprovadas.
3. Rejeitar/remover a foto.
4. Confirmar que ela saiu do feed do telao.

### QR Code nao abre

Acao:

- confirmar se o evento esta ativo;
- conferir se o dominio `revela.gersonvan.com.br` abre no celular;
- usar o link de upload diretamente se o leitor de QR do celular falhar;
- manter uma copia impressa do QR Code.

## Depois do Evento

1. Admin encerra o evento.
2. Sistema bloqueia novos uploads.
3. Admin baixa a exportacao ZIP protegida.
4. Fotos e historico permanecem armazenados.
5. Futuramente, admin podera criar galeria privada ou pacote de entrega.
