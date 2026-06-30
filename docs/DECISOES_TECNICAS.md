# Decisoes Tecnicas

Este documento registra decisoes tecnicas recomendadas e pontos ainda em aberto para o Revela.

## Premissas

- O sistema sera online.
- O MVP sera reutilizavel para varios eventos.
- Convidados acessam por celular.
- Telao roda em navegador no notebook ligado ao projetor.
- Moderacao deve ser manual antes da exibicao.
- Fotos podem envolver criancas, entao o sistema deve minimizar exposicao publica.

## Recomendacoes de Arquitetura

### Aplicacao Web Responsiva

Recomendacao:

- construir como aplicacao web responsiva;
- priorizar experiencia mobile para upload e moderacao;
- priorizar experiencia desktop/tela cheia para telao e admin.

Motivo:

- evita app nativo;
- funciona via QR Code;
- reduz friccao para convidados.

### Backend Online

Recomendacao:

- backend com API para eventos, uploads, moderacao e feed;
- armazenamento persistente de metadados;
- armazenamento externo de imagens.

Motivo:

- celulares dos convidados precisam enviar pela internet;
- moderadores e telao precisam receber atualizacoes em tempo real;
- o sistema precisa sobreviver ao fechamento do navegador do admin.

### Armazenamento de Imagens

Recomendacao:

- armazenar imagem original ou boa qualidade;
- gerar versao otimizada para telao;
- servir imagens otimizadas no feed.

Motivo:

- fotos de celular podem ser grandes;
- arquivos de 20 MB nao devem ser usados diretamente no telao;
- feed precisa ser leve e estavel.

### Tempo Real

Recomendacao:

- usar mecanismo de tempo real para moderacao, dashboard e telao;
- alternativas possiveis:
  - WebSocket;
  - Server-Sent Events;
  - polling curto como fallback.

Motivo:

- moderadores precisam ver novas fotos sem recarregar;
- telao precisa receber fotos aprovadas automaticamente.

### Links Secretos de Moderador

Recomendacao:

- gerar token longo e aleatorio;
- armazenar hash do token;
- depois do primeiro uso, vincular a um identificador de dispositivo/sessao;
- permitir revogacao pelo admin.

Motivo:

- link de uso unico reduz compartilhamento indevido;
- hash evita exposicao do token em caso de vazamento do banco.

## Decisoes de Produto com Impacto Tecnico

### UI Provisoria ate o Design System

Decisao:

- enquanto o design system oficial esta sendo definido em paralelo, a implementacao seguira com UI provisoria funcional;
- a prioridade sera arquitetura, regras de negocio e fluxos;
- o refinamento visual sera feito depois, substituindo componentes provisorios pelos componentes do design system.

Impacto:

- evitar investimento excessivo em polimento visual nesta fase;
- manter componentes e telas simples o suficiente para substituicao posterior;
- nao bloquear backend, fluxos publicos, moderacao e telao por causa da identidade visual final;
- evitar CSS altamente especifico ou acoplado a layouts definitivos.

### Evento Multiuso

Decisao:

- sistema deve ter entidade Evento desde o inicio.

Impacto:

- todas as fotos, moderadores, configuracoes e URLs precisam estar vinculadas a um evento.

### Sem Galeria Publica no MVP

Decisao:

- convidados nao veem fotos enviadas por outras pessoas.

Impacto:

- superficie publica fica menor;
- reduz risco de privacidade;
- simplifica MVP.

### Rejeitadas Sao Mantidas

Decisao:

- fotos rejeitadas nao sao apagadas automaticamente.

Impacto:

- precisa existir controle de acesso rigoroso;
- admin/moderadores podem auditar ou corrigir decisoes.

### Mensagem por Foto

Decisao:

- cada foto pode ter uma mensagem opcional de ate 120 caracteres.

Impacto:

- upload multiplo precisa ter interface de pre-visualizacao;
- cada arquivo enviado deve carregar metadados proprios.

## Pontos em Aberto

### Stack de Implementacao

Ainda nao definido.

Opcoes comuns:

- Next.js para frontend/backend full-stack;
- banco relacional para metadados;
- storage de objetos para imagens;
- servico de tempo real ou WebSocket proprio.

### Estrategia de Upload

Ainda nao definido.

Opcoes:

- upload direto para backend;
- upload direto para storage com URL assinada;
- compressao no cliente antes do envio;
- compressao no servidor apos o upload.

Recomendacao inicial:

- para MVP simples, comecar com upload controlado pelo backend;
- se o volume crescer, migrar para URL assinada e processamento assicrono.

### Processamento de Imagem

Ainda nao definido.

Necessidades:

- validar tipo de arquivo;
- gerar versao otimizada;
- preservar orientacao correta;
- limitar dimensoes para feed.

### Autenticacao Admin

Ainda nao definido.

Decisao para o MVP:

- admin autentica com Google.
- moderador acessa por link secreto individual.
- convidado nao tem login.

Necessidades:

- login Google para admin;
- sessao segura;
- protecao de rotas administrativas.

### Politica de Retencao

Ainda nao definido.

Para MVP:

- manter tudo.

Para produto:

- definir prazo de retencao;
- permitir exclusao/exportacao;
- documentar politica de privacidade.

## Riscos Tecnicos

- Upload lento em 5G com fotos grandes.
- Picos de envio gerando fila grande.
- Telao travar se usar imagens originais.
- Moderadores perderem link ou abrirem em dispositivo errado.
- QR Code circular fora do evento.
- Falta de internet no notebook do telao.

## Mitigacoes Recomendadas

- Gerar imagens otimizadas para feed.
- Manter cache local no telao das fotos ja carregadas.
- Ter teste operacional antes do evento.
- Permitir revogar e recriar link de moderador.
- Manter evento com status rascunho/ativo/encerrado.
- Exibir mensagens claras quando upload estiver indisponivel.
