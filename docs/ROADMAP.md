# Roteiro de Releases

Este roteiro organiza o MVP em etapas para reduzir risco antes do uso real em evento.

## Release 0 - Fundacao

Objetivo: preparar a base minima do produto reutilizavel.

Entregas:

- estrutura do projeto;
- autenticacao Google do admin;
- modelo de eventos;
- criacao e edicao basica de evento;
- status de evento: rascunho, ativo e encerrado;
- upload da imagem do convite;
- configuracao do texto de autorizacao;
- pagina publica por evento.

Criterio de pronto:

- admin consegue criar um evento e acessar sua pagina publica.

## Release 1 - Upload dos Convidados

Objetivo: permitir envio real de fotos pelo celular.

Entregas:

- QR Code unico por evento;
- pagina mobile de upload;
- nome/apelido obrigatorio;
- aceite do termo;
- envio de 1 a 15 fotos;
- limite de 20 MB por foto;
- mensagem opcional por foto;
- armazenamento das fotos como pendentes;
- confirmacao de envio.

Criterio de pronto:

- convidado consegue enviar fotos pelo celular e elas ficam registradas como pendentes.

## Release 2 - Moderacao

Objetivo: garantir que nenhuma foto apareca no telao sem aprovacao.

Entregas:

- criacao de links secretos individuais de moderador;
- ativacao de link de moderador;
- painel mobile-first de moderacao;
- aba Pendentes;
- acao de aprovar;
- acao de rejeitar;
- abas Aprovadas e Rejeitadas;
- alerta visual de novas fotos;
- historico de decisoes.

Criterio de pronto:

- moderador consegue revisar fotos no celular e as decisoes ficam registradas.

## Release 3 - Telao Ao Vivo

Objetivo: exibir fotos aprovadas em tempo real no projetor.

Entregas:

- pagina de telao por evento;
- estado sem fotos usando imagem do convite;
- QR Code visivel no estado inicial;
- feed ao vivo com fotos aprovadas;
- exibicao de nome/apelido e mensagem;
- mistura de fotos recentes e antigas;
- QR Code discreto durante o feed;
- modo tela cheia.

Criterio de pronto:

- foto aprovada aparece no telao sem recarregar manualmente.

## Release 4 - Operacao e Fechamento

Objetivo: dar controle operacional ao admin antes, durante e depois da festa.

Entregas:

- dashboard operacional;
- contadores de fotos por status;
- status dos moderadores;
- encerramento do evento;
- bloqueio de novos uploads apos encerramento;
- acesso ao historico apos encerramento;
- ajustes de estabilidade para internet oscilante.

Criterio de pronto:

- admin consegue acompanhar e encerrar o evento sem perder fotos ou historico.

## Release 5 - Pos-MVP

Ideias para evolucao depois do primeiro uso real:

- download em lote;
- galeria privada pos-evento;
- templates visuais para telao;
- controle manual do feed;
- multiplos admins;
- QR Code por mesa;
- produto comercial com planos;
- politicas de retencao e exclusao de dados.
