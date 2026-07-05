# Roteiro de Releases

Este roteiro organiza o Revela em entregas pequenas para preservar o fluxo de produção enquanto a Fase 2 avança.

## Release 0 - Fundação

**Objetivo:** preparar a base mínima do produto reutilizável.

**Entregas**

- estrutura do projeto;
- autenticação Google do admin;
- modelo de eventos;
- criação e edição básica de evento;
- status de evento: rascunho, ativo e encerrado;
- upload da imagem do convite;
- configuração do texto de autorização;
- página pública por evento.

**Critério de pronto**

- Admin consegue criar um evento e acessar sua página pública.

## Release 1 - Upload dos convidados

**Objetivo:** permitir envio real de fotos pelo celular.

**Entregas**

- QR Code único por evento;
- página mobile de upload;
- nome ou apelido obrigatório;
- aceite do termo;
- envio de 1 a 15 fotos;
- limite de 20 MB por foto;
- mensagem opcional por foto;
- armazenamento das fotos;
- confirmação de envio.

**Critério de pronto**

- Convidado consegue enviar fotos pelo celular e elas ficam registradas no evento.

## Release 2 - Moderação web

**Objetivo:** controlar o que aparece no telão sem depender de aplicativo nativo.

**Entregas**

- criação de links secretos individuais de moderador;
- ativação de link de moderador;
- painel mobile-first de moderação;
- aba Pendentes;
- ação de aprovar;
- ação de rejeitar;
- abas Aprovadas e Rejeitadas;
- alerta visual de novas fotos;
- histórico de decisões.

**Critério de pronto**

- Moderador consegue revisar fotos no celular e as decisões ficam registradas.

## Release 3 - Telão ao vivo

**Objetivo:** exibir fotos aprovadas em tempo real no projetor.

**Entregas**

- página de telão por evento;
- estado sem fotos usando imagem do convite;
- QR Code visível no estado inicial;
- feed ao vivo com fotos aprovadas;
- exibição de nome ou apelido e mensagem;
- mistura de fotos recentes e antigas;
- QR Code discreto durante o feed;
- modo tela cheia.

**Critério de pronto**

- Foto aprovada aparece no telão sem recarregamento manual.

## Release 4 - Operação e fechamento

**Objetivo:** dar controle operacional ao admin antes, durante e depois da festa.

**Entregas**

- dashboard operacional;
- contadores de fotos por status;
- status dos moderadores;
- encerramento do evento;
- bloqueio de novos uploads após encerramento;
- acesso ao histórico após encerramento;
- exportação protegida em JSON e ZIP;
- ajustes de estabilidade para internet oscilante.

**Critério de pronto**

- Admin consegue acompanhar, exportar e encerrar o evento sem perder fotos ou histórico.

## Release 5 - Fase 2: prontidão do evento

**Objetivo:** preparar o uso real de 11/07/2026 com mudanças de baixo risco.

**Entregas planejadas**

- ensaio físico com celular real via QR Code;
- revisão fina da moderação web em telas pequenas;
- modo de moderação por evento;
- aviso claro quando o evento estiver sem moderação;
- aprovação automática auditável;
- remoção/rejeição posterior de fotos aprovadas automaticamente;
- rotação de credenciais sensíveis antes do evento real.

**Critério de pronto**

- Fluxo web de produção continua validado e o operador sabe conduzir o evento com ou sem moderação.

## Release 6 - Aplicativo de moderadores

**Objetivo:** experimentar aplicativo nativo sem substituir a web como fallback.

**Entregas planejadas**

- base Expo/React Native;
- convite por e-mail para moderadores;
- acesso com escopo por evento;
- registro de dispositivo ou sessão;
- lista de fotos pendentes;
- aprovação e rejeição pelo app;
- notificações push agrupadas ou limitadas.

**Critério de pronto**

- Moderador consegue atuar em um evento pelo app, e a web segue funcionando como alternativa segura.

## Release 7 - Prova controlada de vídeo

**Objetivo:** avaliar clipes curtos sem afetar o evento ao vivo.

**Entregas planejadas**

- prova isolada com vídeos de 5 a 10 segundos;
- estimativa de armazenamento e processamento;
- decisão documentada sobre retenção ou descarte de originais;
- avaliação de custo antes de qualquer uso em produção.

**Critério de pronto**

- Existe evidência técnica e de custo suficiente para decidir se vídeo vira produto futuro.

## Pós-evento e produto comercial

Ideias para evolução posterior:

- galeria privada pós-evento;
- templates visuais para telão;
- controle manual do feed;
- múltiplos admins;
- QR Code por mesa;
- aplicativo para convidados;
- cobrança e planos;
- políticas de retenção e exclusão de dados;
- moderação por IA;
- reconhecimento facial.
