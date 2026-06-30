# Fluxos de UX

Este documento descreve os fluxos principais do Revela do ponto de vista de uso.

## Principios de Experiencia

- Convidado nao deve precisar instalar aplicativo.
- Convidado nao deve precisar criar conta.
- Upload precisa ser rapido em celular.
- Moderacao precisa ser eficiente em tela pequena.
- Telao deve funcionar sem interacao constante.
- Admin deve conseguir preparar um evento sem depender de edicao tecnica.

## Fluxo do Admin

### Criar Evento

1. Admin acessa o sistema.
2. Admin faz login.
3. Admin clica em criar evento.
4. Admin informa:
   - nome do evento;
   - data;
   - imagem do convite;
   - cores principais;
   - texto de autorizacao.
5. Sistema cria evento em rascunho.
6. Admin revisa as configuracoes.
7. Admin ativa o evento.

### Preparar Evento

1. Admin acessa dashboard do evento.
2. Admin copia ou baixa o QR Code.
3. Admin cria links individuais de moderador.
4. Admin envia cada link para a pessoa correspondente.
5. Admin abre a URL do telao para testar.
6. Admin faz um upload de teste como convidado.
7. Admin aprova a foto de teste como moderador.
8. Admin confirma que a foto aparece no telao.

### Encerrar Evento

1. Admin acessa dashboard.
2. Admin clica em encerrar evento.
3. Sistema pede confirmacao.
4. Admin confirma.
5. Sistema bloqueia novos uploads.
6. Historico e fotos continuam acessiveis.

## Fluxo do Convidado

### Primeiro Acesso

1. Convidado aponta camera do celular para o QR Code.
2. Navegador abre a pagina publica do evento.
3. Sistema mostra nome do evento e identidade visual.
4. Convidado informa nome/apelido.
5. Convidado aceita o termo simples.
6. Sistema salva nome/apelido e aceite no navegador.

### Enviar Fotos

1. Convidado escolhe uma ou mais fotos.
2. Sistema valida quantidade maxima de 15 fotos.
3. Sistema valida limite de 20 MB por foto.
4. Sistema mostra pre-visualizacao das fotos.
5. Convidado pode escrever mensagem opcional por foto.
6. Sistema limita cada mensagem a 120 caracteres.
7. Convidado envia.
8. Sistema mostra confirmacao:
   - fotos enviadas;
   - fotos em aprovacao;
   - opcao de enviar mais.

### Envios Recorrentes

1. Convidado volta ao QR Code ou pagina aberta.
2. Sistema recupera nome/apelido salvo.
3. Convidado pode editar nome se quiser.
4. Convidado envia novo lote ou foto individual.

## Fluxo do Moderador

### Ativar Link

1. Moderador recebe link individual.
2. Moderador abre o link no celular.
3. Sistema valida token.
4. Se token estiver criado, sistema vincula ao dispositivo.
5. Token passa para usado.
6. Moderador entra no painel.

### Revisar Pendentes

1. Moderador abre aba Pendentes.
2. Sistema lista fotos pendentes mais recentes.
3. Cada item mostra:
   - foto;
   - nome/apelido;
   - mensagem;
   - horario.
4. Moderador toca em aprovar ou rejeitar.
5. Sistema registra decisao e atualiza a fila.

### Corrigir Decisao

1. Moderador abre aba Aprovadas ou Rejeitadas.
2. Moderador localiza a foto.
3. Se foto aprovada estiver inadequada, move para Rejeitadas.
4. Se foto rejeitada estiver correta, aprova.
5. Sistema registra nova decisao.

## Fluxo do Telao

### Estado Inicial

1. Operador abre a URL do telao no notebook.
2. Sistema carrega configuracao publica do evento.
3. Se nao houver fotos aprovadas, exibe:
   - imagem do convite;
   - QR Code do evento;
   - chamada curta para envio.

### Feed Ao Vivo

1. Quando fotos sao aprovadas, sistema atualiza o feed.
2. Feed mostra foto, nome/apelido e mensagem.
3. Feed mistura fotos recentes e antigas.
4. QR Code permanece visivel de forma discreta.
5. Operador pode ativar modo tela cheia.

### Internet Oscilante

1. Se a conexao falhar, telao mantem fotos ja carregadas.
2. Feed tenta reconectar automaticamente.
3. Quando conexao volta, novas aprovacoes aparecem.

## Estados Vazios e Erros

### Evento em Rascunho

Mensagem para convidado:

> Este evento ainda nao esta aberto para envio de fotos.

### Evento Encerrado

Mensagem para convidado:

> O envio de fotos deste evento foi encerrado.

### Upload Invalido

Mensagens possiveis:

- O limite e de 15 fotos por envio.
- Uma ou mais fotos passam de 20 MB.
- Este tipo de arquivo nao e suportado.
- Nao foi possivel enviar agora. Tente novamente.

### Link de Moderador Invalido

Mensagens possiveis:

- Este link nao e valido.
- Este link ja foi usado em outro dispositivo.
- Este link foi revogado.
