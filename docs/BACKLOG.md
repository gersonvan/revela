# Backlog do MVP

## Epico 1 - Administracao e Eventos

### Historia 1.1 - Login do admin

Como admin, quero acessar o sistema com Google para gerenciar meus eventos.

**Criterios de aceite**

- Admin consegue fazer login com Google.
- Admin nao logado nao acessa painel.
- Sessao permanece ativa por periodo razoavel.
- Admin consegue sair da conta.

### Historia 1.2 - Criar evento

Como admin, quero criar um evento para gerar um ambiente separado de uploads, moderacao e telao.

**Criterios de aceite**

- Admin informa nome do evento.
- Admin informa data.
- Evento nasce como rascunho.
- Evento aparece na lista de eventos do admin.

### Historia 1.3 - Configurar evento

Como admin, quero configurar convite, tema e termo para personalizar a experiencia.

**Criterios de aceite**

- Admin consegue subir imagem do convite.
- Admin define cores principais.
- Admin edita texto de autorizacao.
- Configuracoes refletem na pagina do convidado e no telao.

### Historia 1.4 - Ativar evento

Como admin, quero ativar o evento quando ele estiver pronto para receber fotos.

**Criterios de aceite**

- Evento rascunho pode virar ativo.
- Apenas evento ativo aceita uploads.
- QR Code aponta para a pagina publica de upload.

### Historia 1.5 - Encerrar evento

Como admin, quero encerrar o evento para bloquear novos envios apos a festa.

**Criterios de aceite**

- Evento ativo pode virar encerrado.
- Evento encerrado nao aceita novos uploads.
- Fotos e historico continuam acessiveis ao admin.

## Epico 2 - QR Code e Pagina do Convidado

### Historia 2.1 - Gerar QR Code do evento

Como admin, quero ver e baixar ou imprimir o QR Code do evento.

**Criterios de aceite**

- Sistema gera QR Code unico por evento.
- QR Code abre a pagina publica de upload.
- QR Code continua valido enquanto o evento existir.
- Se o evento estiver encerrado, a pagina informa que uploads foram encerrados.

### Historia 2.2 - Identificacao do convidado

Como convidado, quero informar meu nome/apelido uma vez para nao repetir a cada envio.

**Criterios de aceite**

- Nome/apelido e obrigatorio.
- Nome fica salvo no navegador.
- Convidado pode editar o nome antes de enviar novas fotos.

### Historia 2.3 - Aceite do termo

Como convidado, quero ver um termo simples antes de enviar fotos.

**Criterios de aceite**

- Termo aparece antes do primeiro envio.
- Aceite e obrigatorio.
- Aceite fica salvo no navegador.
- Texto do termo vem da configuracao do evento.

### Historia 2.4 - Enviar fotos

Como convidado, quero enviar uma ou varias fotos pelo celular.

**Criterios de aceite**

- Pode enviar de 1 a 15 fotos por lote.
- Cada foto tem limite de 20 MB.
- Sistema bloqueia arquivos nao suportados.
- Fotos enviadas entram como pendente.
- Convidado ve confirmacao de envio.

### Historia 2.5 - Mensagem por foto

Como convidado, quero escrever uma mensagem opcional em cada foto.

**Criterios de aceite**

- Cada foto tem campo de mensagem proprio.
- Mensagem e opcional.
- Limite de 120 caracteres.
- Mensagem aparece para moderador e no telao se aprovada.

## Epico 3 - Moderacao

### Historia 3.1 - Criar links de moderador

Como admin, quero criar links individuais para moderadores.

**Criterios de aceite**

- Admin informa nome do moderador.
- Sistema gera link secreto individual.
- Link tem status criado, usado ou revogado.
- Admin consegue revogar link.

### Historia 3.2 - Ativar link de moderador

Como moderador, quero abrir meu link uma vez e ficar autorizado no dispositivo.

**Criterios de aceite**

- Link nao usado ativa acesso no dispositivo.
- Link usado nao pode ser ativado em outro dispositivo.
- Moderador acessa apenas o evento vinculado.
- Link revogado nao permite acesso.

### Historia 3.3 - Ver fila de pendentes

Como moderador, quero ver fotos pendentes para revisar rapidamente.

**Criterios de aceite**

- Aba Pendentes lista fotos novas.
- Cada item mostra foto, nome, mensagem e horario.
- Novas fotos aparecem sem recarregar a pagina.
- Ha alerta visual quando chegam novas fotos.

### Historia 3.4 - Aprovar ou rejeitar foto

Como moderador, quero decidir se uma foto pode aparecer no telao.

**Criterios de aceite**

- Moderador pode aprovar foto pendente.
- Moderador pode rejeitar foto pendente.
- Decisao registra moderador e horario.
- Foto aprovada entra no feed do telao.
- Foto rejeitada nunca aparece no telao.

### Historia 3.5 - Revisar aprovadas e rejeitadas

Como moderador, quero corrigir decisoes se necessario.

**Criterios de aceite**

- Aba Aprovadas mostra fotos aprovadas.
- Aba Rejeitadas mostra fotos rejeitadas.
- Foto aprovada pode ser movida para rejeitada.
- Foto rejeitada pode ser aprovada.

### História 3.6 - Aprovar ou reprovar todas as fotos pendentes

Como moderador, quero aprovar ou reprovar todas as fotos pendentes de uma vez para acelerar a operação durante a festa.

**Critérios de aceite**

- Tela de moderação oferece ações explícitas para aprovar todas e reprovar todas as fotos pendentes.
- Antes de executar uma ação em lote, o sistema pede confirmação clara.
- A ação em lote registra moderador, horário e decisão em cada foto afetada.
- Fotos já aprovadas ou rejeitadas não são alteradas por engano.

### História 3.7 - Moderação otimizada para mobile

Como moderador usando celular, quero revisar fotos com uma interface própria para mobile durante a festa.

**Critérios de aceite**

- Lista de pendentes é confortável em telas pequenas.
- Botões de aprovar e reprovar são grandes o suficiente para uso rápido com o polegar.
- A foto pode ser vista em tamanho maior antes da decisão.
- A interface evita cliques acidentais em ações destrutivas.
- Novas fotos continuam aparecendo sem exigir atualização manual.

## Épico 3A - Aplicativo nativo de moderação e envio

### História 3A.1 - Aplicativo Android/iOS para moderação

Como moderador, quero usar um aplicativo Android/iOS para receber alertas e moderar fotos com mais agilidade durante a festa.

**Critérios de aceite**

- Moderador consegue vincular o aplicativo ao evento usando convite, token ou login seguro.
- Aplicativo exibe fila de fotos pendentes do evento.
- Moderador consegue aprovar e reprovar fotos pelo aplicativo.
- Aplicativo envia notificação push quando novas fotos chegam para moderação.
- Notificações respeitam permissões do dispositivo e podem ser desativadas.
- Histórico de decisões continua registrado no backend com moderador, horário e decisão.
- O uso no aplicativo não quebra o acesso atual via navegador.

### História 3A.2 - Aplicativo Android/iOS para envio de fotos

Como convidado, quero enviar fotos pelo aplicativo para ter uma experiência mais integrada durante a festa.

**Critérios de aceite**

- Convidado consegue entrar no evento por QR Code, link ou código curto.
- Convidado consegue selecionar fotos da galeria ou câmera.
- Envio mantém regras atuais de nome, autorização, limite de fotos e limite de tamanho.
- Fotos enviadas pelo aplicativo entram como pendentes para moderação.
- Aplicativo mostra estado de envio, falha e confirmação.

### História 3A.3 - Estratégia de notificações push

Como organizador, quero que moderadores recebam notificações de novas fotos para reduzir o risco de a fila ficar parada.

**Critérios de aceite**

- Backend registra dispositivos autorizados para receber notificações por evento.
- Notificação é enviada quando novas fotos entram em moderação.
- Sistema evita excesso de notificações em rajadas grandes de envio.
- Push não expõe fotos ou dados sensíveis na tela bloqueada.
- Há fallback claro para web quando o app não está instalado.

## Epico 4 - Telao

### Historia 4.1 - Abrir tela do telao

Como admin, quero abrir uma URL de projecao do evento.

**Criterios de aceite**

- Telao usa pagina separada da moderacao.
- Pagina nao mostra controles administrativos.
- Pagina pode ser aberta no navegador do notebook.
- Pagina exibe identidade visual do evento.

### Historia 4.2 - Estado sem fotos

Como publico do evento, quero ver uma tela bonita antes das fotos aparecerem.

**Criterios de aceite**

- Quando nao ha fotos aprovadas, telao mostra imagem do convite.
- Telao mostra QR Code do evento.
- Telao mostra chamada curta para envio.

### Historia 4.3 - Feed ao vivo

Como publico da festa, quero ver fotos aprovadas surgindo no telao.

**Criterios de aceite**

- Telao mostra apenas fotos aprovadas.
- Feed atualiza sem recarregar manualmente.
- Exibe foto, nome/apelido e mensagem.
- Mistura fotos recentes e antigas.
- QR Code aparece durante o feed.

### Historia 4.4 - Modo tela cheia

Como operador do telao, quero colocar a projecao em tela cheia.

**Criterios de aceite**

- Ha controle visivel para entrar em tela cheia.
- Depois de ativado, a interface fica limpa.
- Feed continua atualizando em tela cheia.

## Epico 5 - Armazenamento e Historico

### Historia 5.1 - Armazenar fotos

Como sistema, preciso guardar fotos enviadas para manter historico do evento.

**Criterios de aceite**

- Foto original ou versao de boa qualidade e preservada.
- Versao otimizada e usada no telao.
- Foto fica associada ao evento.
- Metadados sao salvos: nome, mensagem, status e horario.

### Historia 5.2 - Historico de moderacao

Como admin, quero saber quem aprovou ou rejeitou cada foto.

**Criterios de aceite**

- Cada decisao registra acao, moderador e horario.
- Historico fica disponivel apos o evento.
- Mudancas posteriores tambem sao registradas.

### Historia 5.3 - Dashboard operacional

Como admin, quero acompanhar o andamento do evento.

**Criterios de aceite**

- Mostra total de fotos.
- Mostra pendentes, aprovadas e rejeitadas.
- Mostra moderadores criados, usados e revogados.
- Atualiza durante o evento.

## Priorizacao Recomendada

### Essencial para funcionar na festa

1. Login do admin.
2. Criar e configurar evento.
3. QR Code do evento.
4. Upload de fotos por convidado.
5. Moderacao pendente, aprovar e rejeitar.
6. Telao com fotos aprovadas.
7. Estado sem fotos com convite.
8. Encerrar evento.

### Reducao de risco operacional

1. Links individuais de moderador.
2. Abas aprovadas e rejeitadas.
3. Alerta visual de novas fotos.
4. Dashboard operacional.
5. Versoes otimizadas das imagens.
6. Historico de decisoes.

### Depois do MVP

1. Download em lote.
2. Galeria pos-evento.
3. Controle avancado do feed.
4. Multiplos admins.
5. Templates visuais.
6. Produto comercial com planos.
