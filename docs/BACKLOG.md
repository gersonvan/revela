# Backlog do Revela

Este backlog separa o MVP web já validado, os ajustes da Fase 2 e ideias futuras. Itens marcados como Fase 2 não devem ser tratados como implementados até aparecerem no status de implementação.

## Épico 1 - Administração e eventos

### História 1.1 - Login do admin

Como admin, quero acessar o sistema com Google para gerenciar meus eventos.

**Critérios de aceite**

- Admin consegue fazer login com Google.
- Admin não logado não acessa o painel.
- Sessão permanece ativa por período razoável.
- Admin consegue sair da conta.

### História 1.2 - Criar evento

Como admin, quero criar um evento para gerar um ambiente separado de upload, moderação e telão.

**Critérios de aceite**

- Admin informa nome do evento.
- Admin informa data.
- Evento nasce como rascunho.
- Evento aparece na lista de eventos do admin.

### História 1.3 - Configurar evento

Como admin, quero configurar convite, tema, termo e regras operacionais para personalizar a experiência.

**Critérios de aceite**

- Admin consegue subir imagem do convite.
- Admin define cores principais.
- Admin edita texto de autorização.
- Admin escolhe se o evento usa moderação manual.
- Configurações refletem nas páginas públicas e operacionais.

### História 1.4 - Ativar evento

Como admin, quero ativar o evento quando ele estiver pronto para receber fotos.

**Critérios de aceite**

- Evento rascunho pode virar ativo.
- Apenas evento ativo aceita uploads.
- QR Code aponta para página pública de upload.

### História 1.5 - Encerrar evento

Como admin, quero encerrar o evento para bloquear novos envios após a festa.

**Critérios de aceite**

- Evento ativo pode virar encerrado.
- Evento encerrado não aceita novos uploads.
- Fotos e histórico continuam acessíveis ao admin.

## Épico 2 - Upload dos convidados

### História 2.1 - Acessar evento por QR Code

Como convidado, quero abrir o evento pelo QR Code para enviar fotos rapidamente.

**Critérios de aceite**

- QR Code abre a página pública correta do evento.
- Página funciona bem em celular.
- Evento inativo ou encerrado mostra mensagem clara.

### História 2.2 - Identificação simples

Como convidado, quero informar nome ou apelido uma vez para não repetir a cada envio.

**Critérios de aceite**

- Nome ou apelido é obrigatório.
- Nome fica salvo no navegador.
- Convidado pode editar o nome antes de enviar novas fotos.

### História 2.3 - Aceite do termo

Como convidado, quero ver um termo simples antes de enviar fotos.

**Critérios de aceite**

- Termo aparece antes do primeiro envio.
- Aceite é obrigatório.
- Aceite fica salvo no navegador.
- Texto do termo vem da configuração do evento.

### História 2.4 - Enviar fotos

Como convidado, quero enviar uma ou várias fotos pelo celular.

**Critérios de aceite**

- Pode enviar de 1 a 15 fotos por lote.
- Cada foto tem limite de 20 MB.
- Sistema bloqueia arquivos não suportados.
- Foto entra como pendente quando o evento está com moderação.
- Foto entra como aprovada automaticamente quando o evento está sem moderação.
- Convidado vê confirmação de envio.

### História 2.5 - Mensagem por foto

Como convidado, quero escrever uma mensagem opcional em cada foto.

**Critérios de aceite**

- Cada foto tem campo de mensagem próprio.
- Mensagem é opcional.
- Limite de 120 caracteres.
- Mensagem aparece para moderador e no telão se aprovada.

## Épico 3 - Moderação web

### História 3.1 - Criar links de moderador

Como admin, quero criar links individuais para moderadores.

**Critérios de aceite**

- Admin informa nome do moderador.
- Sistema gera link secreto individual.
- Link tem status criado, usado ou revogado.
- Admin consegue revogar link.

### História 3.2 - Ativar link de moderador

Como moderador, quero abrir meu link uma vez e vincular o acesso ao dispositivo.

**Critérios de aceite**

- Link válido abre a área de moderação.
- Link revogado não permite acesso.
- Ativação registra uso do link.
- Acesso fica limitado ao evento correto.

### História 3.3 - Revisar fotos pendentes

Como moderador, quero ver fotos pendentes para decidir o que pode aparecer no telão.

**Critérios de aceite**

- Aba Pendentes mostra foto, nome, mensagem e horário.
- Lista atualiza durante o evento.
- Interface funciona bem em celular.

### História 3.4 - Aprovar e rejeitar fotos

Como moderador, quero aprovar ou rejeitar fotos pendentes.

**Critérios de aceite**

- Moderador pode aprovar foto pendente.
- Moderador pode rejeitar foto pendente.
- Decisão registra moderador, ação e horário.
- Foto aprovada entra no feed do telão.
- Foto rejeitada não aparece no telão.

### História 3.5 - Revisar aprovadas e rejeitadas

Como moderador, quero corrigir decisões se necessário.

**Critérios de aceite**

- Aba Aprovadas mostra fotos aprovadas.
- Aba Rejeitadas mostra fotos rejeitadas.
- Foto aprovada pode ser movida para rejeitada.
- Foto rejeitada pode ser aprovada.

### História 3.6 - Ações em lote

Como moderador, quero aprovar ou rejeitar várias fotos pendentes de uma vez para acelerar a operação.

**Critérios de aceite**

- Tela oferece ações explícitas para aprovar todas e rejeitar todas pendentes.
- Antes da ação em lote, o sistema pede confirmação clara.
- Cada foto afetada recebe histórico de decisão.
- Fotos já aprovadas ou rejeitadas não são alteradas por engano.

### História 3.7 - Modo sem moderação

Como admin, quero desligar a moderação em eventos de baixo risco para reduzir trabalho operacional.

**Critérios de aceite**

- Evento permite alternar entre com moderação e sem moderação.
- Interface avisa que fotos podem aparecer diretamente no telão.
- Uploads em evento sem moderação entram como aprovados automaticamente.
- Histórico registra que a aprovação foi automática.
- Admin e moderadores ainda podem rejeitar ou remover fotos aprovadas.

### História 3.8 - Moderação otimizada para mobile

Como moderador usando celular, quero revisar fotos com uma interface rápida durante a festa.

**Critérios de aceite**

- Lista de pendentes é confortável em telas pequenas.
- Botões de aprovar e rejeitar têm área de toque adequada.
- Foto pode ser vista maior antes da decisão.
- Acesso web continua funcionando mesmo que o app nativo não esteja disponível.

## Épico 4 - Telão

### História 4.1 - Abrir tela do telão

Como admin, quero abrir uma URL de projeção do evento.

**Critérios de aceite**

- Telão usa página separada da moderação.
- Página não mostra controles administrativos.
- Página pode ser aberta no navegador do notebook.
- Página exibe identidade visual do evento.

### História 4.2 - Estado sem fotos

Como público do evento, quero ver uma tela bonita antes das fotos aparecerem.

**Critérios de aceite**

- Quando não há fotos aprovadas, telão mostra imagem do convite.
- Telão mostra QR Code do evento.
- Telão mostra chamada curta para envio.

### História 4.3 - Feed ao vivo

Como público da festa, quero ver fotos aprovadas surgindo no telão.

**Critérios de aceite**

- Telão mostra apenas fotos aprovadas.
- Feed atualiza sem recarregar manualmente.
- Exibe foto, nome ou apelido e mensagem.
- Mistura fotos recentes e antigas.
- QR Code aparece durante o feed.

### História 4.4 - Modo tela cheia

Como operador do telão, quero colocar a projeção em tela cheia.

**Critérios de aceite**

- Há controle visível para entrar em tela cheia.
- Depois de ativado, a interface fica limpa.
- Feed continua atualizando em tela cheia.

## Épico 5 - Armazenamento, histórico e exportação

### História 5.1 - Armazenar fotos

Como sistema, preciso guardar fotos enviadas para manter histórico do evento.

**Critérios de aceite**

- Foto original ou versão de boa qualidade é preservada.
- Versão otimizada é usada no telão.
- Foto fica associada ao evento.
- Metadados são salvos: nome, mensagem, status e horário.

### História 5.2 - Histórico de moderação

Como admin, quero saber como cada foto chegou ao estado atual.

**Critérios de aceite**

- Cada decisão registra ação, responsável e horário quando aplicável.
- Aprovação automática registra origem automática.
- Histórico fica disponível após o evento.
- Mudanças posteriores também são registradas.

### História 5.3 - Dashboard operacional

Como admin, quero acompanhar o andamento do evento.

**Critérios de aceite**

- Mostra total de fotos.
- Mostra pendentes, aprovadas e rejeitadas.
- Mostra moderadores criados, usados e revogados.
- Atualiza durante o evento.

### História 5.4 - Exportação protegida

Como admin, quero baixar fotos e metadados do evento depois da festa.

**Critérios de aceite**

- Exportação exige sessão admin.
- ZIP inclui metadados, originais e versões otimizadas disponíveis.
- JSON inclui fotos, moderadores e histórico.
- Exportação respeita escopo do evento.

## Épico 6 - Aplicativo nativo para moderadores

### História 6.1 - Base Expo/React Native

Como equipe do produto, quero uma base de aplicativo nativo para moderadores.

**Critérios de aceite**

- Projeto usa Expo/React Native.
- App separa configuração de ambiente.
- App não interfere no fluxo web de produção.

### História 6.2 - Acesso de moderador por convite

Como moderador, quero acessar o app por convite seguro do evento.

**Critérios de aceite**

- Convite pode ser enviado por e-mail.
- Acesso fica limitado ao evento correto.
- Dispositivo ou sessão fica registrado.
- Web continua sendo fallback.

### História 6.3 - Moderação no app

Como moderador, quero aprovar e rejeitar fotos pendentes no app.

**Critérios de aceite**

- App lista fotos pendentes do evento.
- App permite aprovar e rejeitar.
- Backend registra decisão com responsável e horário.
- Ações não quebram o histórico já usado pela web.

### História 6.4 - Notificações push

Como organizador, quero que moderadores recebam avisos de novas fotos.

**Critérios de aceite**

- Backend registra dispositivos autorizados por evento.
- Notificações são agrupadas ou limitadas em rajadas.
- Push não mostra foto nem dados sensíveis na tela bloqueada.
- Há fallback claro quando o app não está instalado.

## Épico 7 - Prova controlada de vídeo

### História 7.1 - Ensaio isolado com clipes curtos

Como equipe do produto, quero testar clipes de 5 a 10 segundos sem afetar o evento ao vivo.

**Critérios de aceite**

- Prova roda fora do fluxo público de upload do evento.
- Documento registra tamanho médio, custo estimado e processamento necessário.
- Estratégia de originais fica explícita: reter temporariamente, descartar ou reservar para opção paga futura.
- Resultado não é tratado como funcionalidade de produção.

## Priorização

### Essencial para a festa de 11/07/2026

1. Fluxo web atual estável.
2. QR Code de upload validado em celular real.
3. Moderação web mobile como fallback seguro.
4. Telão funcionando em notebook/projetor.
5. Exportação ZIP protegida testada.
6. Credenciais sensíveis rotacionadas antes do evento.

### Fase 2 com baixo risco

1. Modo de moderação por evento.
2. Aviso claro no admin quando a moderação estiver desligada.
3. Histórico de aprovação automática.
4. Melhorias mobile da moderação web.
5. Direção técnica do app de moderadores.
6. Estratégia de push.

### Pós-evento ou comercial

1. Aplicativo para convidados.
2. Galeria privada pós-evento.
3. Produto comercial com planos.
4. Cobrança e enforcement de pagamento.
5. Vídeo em produção.
6. IA de moderação.
7. Reconhecimento facial.
