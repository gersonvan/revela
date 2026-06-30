# Modelo de Dados

Este documento descreve um modelo inicial de dados para o EventoOn. Os nomes sao conceituais e podem ser ajustados durante a implementacao.

## Entidades

## Admin

Representa o usuario que gerencia eventos.

Campos:

- id
- nome
- email
- google_id
- imagem_perfil_url
- criado_em
- atualizado_em

Regras:

- email deve ser unico.
- google_id deve ser unico quando informado.
- admin autentica via Google no MVP.

## Evento

Representa um evento configuravel.

Campos:

- id
- admin_id
- nome
- data_evento
- slug_publico
- status
- imagem_convite_url
- cor_principal
- cor_secundaria
- texto_autorizacao
- criado_em
- atualizado_em
- encerrado_em

Status permitidos:

- rascunho
- ativo
- encerrado

Regras:

- slug_publico deve ser unico.
- apenas evento ativo aceita uploads.
- evento encerrado preserva historico e bloqueia novos envios.

## Foto

Representa uma foto enviada por convidado.

Campos:

- id
- evento_id
- nome_convidado
- mensagem
- arquivo_original_url
- arquivo_otimizado_url
- mime_type
- tamanho_bytes
- largura
- altura
- status
- enviada_em
- atualizada_em

Status permitidos:

- pendente
- aprovada
- rejeitada

Regras:

- toda foto nova entra como pendente.
- apenas fotos aprovadas aparecem no telao.
- fotos rejeitadas permanecem armazenadas.
- mensagem deve ter no maximo 120 caracteres.
- tamanho maximo por arquivo: 20 MB.

## Moderador

Representa uma permissao individual para moderar um evento.

Campos:

- id
- evento_id
- nome
- token_hash
- status
- ativado_em
- ultimo_acesso_em
- dispositivo_id
- criado_em
- revogado_em

Status permitidos:

- criado
- usado
- revogado

Regras:

- token deve ser armazenado como hash, nao em texto puro.
- link de uso unico ativa em um unico dispositivo.
- moderador so acessa o evento ao qual esta vinculado.

## DecisaoModeracao

Representa uma acao de moderacao sobre uma foto.

Campos:

- id
- foto_id
- moderador_id
- acao
- status_anterior
- novo_status
- criada_em

Acoes permitidas:

- aprovou
- rejeitou
- restaurou

Regras:

- toda mudanca de status feita por moderador deve gerar registro.
- remover uma foto aprovada do telao gera novo status rejeitada.

## Relacionamentos

- Admin possui muitos Eventos.
- Evento possui muitas Fotos.
- Evento possui muitos Moderadores.
- Foto possui muitas DecisoesModeracao.
- Moderador possui muitas DecisoesModeracao.

## Indices Recomendados

- admins.email
- eventos.slug_publico
- eventos.admin_id
- eventos.status
- fotos.evento_id
- fotos.status
- fotos.enviada_em
- moderadores.evento_id
- moderadores.status
- decisoes_moderacao.foto_id
- decisoes_moderacao.moderador_id

## Consultas Criticas

### Fila de Pendentes

Buscar fotos de um evento com status pendente, ordenadas por enviada_em.

### Feed do Telao

Buscar fotos aprovadas de um evento, usando arquivo otimizado, nome_convidado e mensagem.

### Dashboard

Contar fotos por status e moderadores por status em um evento.

### Historico de Foto

Buscar decisoes de moderacao de uma foto em ordem cronologica.

## Retencao de Dados

No MVP:

- fotos aprovadas, pendentes e rejeitadas permanecem armazenadas;
- historico de moderacao permanece armazenado;
- nao ha exclusao automatica.

Evolucao futura:

- prazo de retencao configuravel por evento;
- exportacao antes da exclusao;
- exclusao manual por admin;
- politica de privacidade formal.
