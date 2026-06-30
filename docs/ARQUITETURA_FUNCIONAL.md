# Arquitetura Funcional

Este documento descreve os modulos, telas, permissoes, dados e eventos em tempo real do Revela em nivel funcional.

## Modulos

### Autenticacao Admin

- Login de admin com Google.
- Sessao autenticada.
- Protecao do painel administrativo.

### Gestao de Eventos

- Criar evento.
- Editar configuracoes.
- Ativar evento.
- Encerrar evento.
- Ver dashboard.

### Upload Publico

- Pagina acessada via QR Code.
- Identificacao do convidado.
- Aceite do termo.
- Upload de fotos.
- Mensagem por foto.
- Confirmacao de envio.

### Moderacao

- Acesso por link secreto individual.
- Fila de pendentes.
- Abas de aprovadas e rejeitadas.
- Acoes de moderacao.
- Alerta visual de novas fotos.

### Telao

- Pagina publica de projecao.
- Estado inicial com convite.
- Feed ao vivo.
- QR Code visivel durante o evento.
- Modo tela cheia.

### Armazenamento de Midia

- Upload de imagem do convite.
- Upload de fotos dos convidados.
- Geracao de versao otimizada para telao.
- Preservacao da foto original ou de uma versao em boa qualidade.

### Tempo Real

- Notificar moderadores quando chegam fotos.
- Atualizar telao quando fotos sao aprovadas.
- Atualizar dashboard do admin.

## Telas do MVP

### Admin

1. Login.
2. Lista de eventos.
3. Criar/editar evento.
4. Dashboard do evento.
5. Moderadores do evento.
6. QR Code do evento.
7. Visualizacao e historico das fotos.

### Convidado

1. Pagina inicial do evento.
2. Formulario de nome/apelido.
3. Termo de autorizacao.
4. Selecao de fotos.
5. Mensagem por foto.
6. Confirmacao de envio.

### Moderador

1. Ativacao do link secreto.
2. Pendentes.
3. Aprovadas.
4. Rejeitadas.
5. Visualizacao ampliada da foto.

### Telao

1. Estado sem fotos.
2. Feed ao vivo.
3. Modo tela cheia.

## Permissoes

### Admin

Pode:

- fazer login;
- criar evento;
- editar evento;
- ativar e encerrar evento;
- criar e revogar moderadores;
- ver todas as fotos;
- ver dashboard;
- abrir links de QR Code e telao.

### Moderador

Pode:

- ver fotos do evento ao qual foi convidado;
- aprovar fotos;
- rejeitar fotos;
- rever aprovadas e rejeitadas.

Nao pode:

- editar evento;
- criar moderadores;
- acessar outros eventos.

### Convidado

Pode:

- enviar fotos para evento ativo;
- ver confirmacao dos proprios envios.

Nao pode:

- ver fotos de outros convidados;
- ver galeria;
- acessar status detalhado individual no MVP.

### Telao

Pode:

- ler fotos aprovadas do evento;
- ler configuracao visual publica.

Nao pode:

- ver pendentes ou rejeitadas;
- executar acoes administrativas.

## Dados Principais

### Admin

- id
- nome
- email
- google_id
- imagem_perfil
- criado_em

### Evento

- id
- admin_id
- nome
- data
- slug_publico
- status: rascunho, ativo, encerrado
- imagem_convite
- cor_principal
- cor_secundaria
- texto_autorizacao
- criado_em
- atualizado_em

### Foto

- id
- evento_id
- nome_convidado
- mensagem
- arquivo_original
- arquivo_otimizado
- status: pendente, aprovada, rejeitada
- enviada_em
- atualizada_em

### Moderador

- id
- evento_id
- nome
- token_link_secreto
- status: criado, usado, revogado
- ativado_em
- ultimo_acesso

### Decisao de Moderacao

- id
- foto_id
- moderador_id
- acao: aprovou, rejeitou
- status_anterior
- novo_status
- criada_em

## Eventos em Tempo Real

### photo_uploaded

Disparado quando convidado envia foto.

Atualiza:

- fila dos moderadores;
- contadores do admin.

### photo_approved

Disparado quando moderador aprova foto.

Atualiza:

- telao;
- dashboard;
- aba de aprovadas.

### photo_rejected

Disparado quando moderador rejeita foto.

Atualiza:

- telao, caso a foto estivesse aprovada;
- dashboard;
- aba de rejeitadas.

### event_closed

Disparado quando admin encerra evento.

Atualiza:

- paginas de upload abertas;
- dashboard;
- estado operacional do evento.

## Consideracoes Tecnicas Futuras

A tecnologia escolhida deve suportar:

- upload de arquivos;
- processamento e otimizacao de imagem;
- armazenamento de midia;
- autenticacao;
- links secretos;
- atualizacao em tempo real;
- paginas publicas por evento;
- boa experiencia mobile.
