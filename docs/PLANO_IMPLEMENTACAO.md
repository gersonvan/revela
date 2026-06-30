# Plano de Implementacao

Este documento organiza a construcao tecnica do EventoOn em etapas executaveis.

## Objetivo

Construir um MVP online, reutilizavel para varios eventos, com:

- login Google para admin;
- eventos configuraveis;
- upload por QR Code;
- moderacao manual;
- feed ao vivo para telao;
- armazenamento de fotos;
- encerramento de evento.

## Fase 0 - Bootstrap do Projeto

Objetivo: criar a base tecnica.

Tarefas:

- inicializar aplicacao Next.js com TypeScript;
- configurar lint e formatacao;
- configurar Tailwind CSS;
- configurar Prisma;
- configurar banco local;
- criar arquivo de variaveis de ambiente;
- criar estrutura de pastas inicial;
- criar layout base.

Criterios de aceite:

- app roda localmente;
- typecheck passa;
- lint passa;
- banco local conecta;
- Prisma executa migration inicial.

## Fase 1 - Modelo de Dados e Admin

Objetivo: permitir login Google e criacao de eventos.

Tarefas:

- criar models Admin, Evento, Foto, Moderador e DecisaoModeracao;
- implementar login Google para admin;
- proteger rotas admin;
- criar tela de lista de eventos;
- criar tela de novo evento;
- criar tela de edicao de evento;
- implementar status rascunho, ativo e encerrado.

Criterios de aceite:

- admin faz login com Google;
- admin cria evento;
- admin edita evento;
- admin ativa evento;
- admin encerra evento.

## Fase 2 - QR Code e Upload Publico

Objetivo: permitir que convidados enviem fotos.

Tarefas:

- criar rota publica de evento por slug;
- gerar URL publica do evento;
- gerar QR Code;
- criar tela mobile de upload;
- salvar nome/apelido no navegador;
- exibir e registrar aceite do termo no navegador;
- permitir selecao de ate 15 fotos;
- validar limite de 20 MB por foto;
- permitir mensagem opcional por foto;
- criar endpoint de upload;
- salvar fotos como pendentes;
- gerar versao otimizada.

Criterios de aceite:

- QR Code abre pagina publica;
- convidado envia fotos pelo celular;
- fotos entram como pendentes;
- mensagens ficam associadas a cada foto.

## Fase 3 - Moderacao

Objetivo: revisar fotos antes da exibicao.

Tarefas:

- criar links secretos individuais;
- armazenar hash do token;
- ativar link no primeiro uso;
- vincular acesso ao dispositivo/sessao;
- criar painel mobile de moderacao;
- criar aba Pendentes;
- criar aba Aprovadas;
- criar aba Rejeitadas;
- implementar aprovar;
- implementar rejeitar;
- implementar restaurar/aprovar rejeitada;
- registrar DecisaoModeracao;
- adicionar alerta visual de novas fotos.

Criterios de aceite:

- moderador acessa por link proprio;
- moderador aprova ou rejeita fotos;
- foto aprovada muda de status;
- foto rejeitada nao aparece no telao;
- historico registra moderador e horario.

## Fase 4 - Telao

Objetivo: exibir feed ao vivo de fotos aprovadas.

Tarefas:

- criar rota publica de telao por evento;
- criar estado sem fotos usando imagem do convite;
- exibir QR Code no telao;
- criar feed de fotos aprovadas;
- exibir nome/apelido e mensagem;
- misturar fotos recentes e antigas;
- implementar atualizacao automatica;
- implementar modo tela cheia;
- manter fotos ja carregadas em caso de oscilacao.

Criterios de aceite:

- telao abre no navegador do notebook;
- foto aprovada aparece sem recarregar manualmente;
- telao nunca mostra foto pendente ou rejeitada;
- estado sem fotos usa imagem do convite.

## Fase 5 - Dashboard e Operacao

Objetivo: dar controle operacional ao admin.

Tarefas:

- criar dashboard do evento;
- exibir total de fotos;
- exibir contadores por status;
- exibir moderadores por status;
- listar fotos no admin;
- permitir acesso ao historico;
- bloquear upload de evento encerrado;
- revisar mensagens de erro e estados vazios.

Criterios de aceite:

- admin acompanha status do evento;
- encerramento bloqueia novos uploads;
- fotos e historico seguem acessiveis.

## Fase 6 - Preparacao para Uso Real

Objetivo: reduzir risco antes da festa.

Tarefas:

- testar em celular real;
- testar no notebook ligado a tela externa;
- testar upload de fotos grandes;
- testar lote com 15 fotos;
- testar varios moderadores;
- testar internet instavel;
- revisar texto de autorizacao;
- criar checklist operacional;
- configurar deploy;
- executar ensaio completo.

Criterios de aceite:

- fluxo completo funciona em ambiente online;
- tempo de upload e moderacao e aceitavel;
- telao permanece estavel;
- admin consegue operar sem intervencao tecnica constante.

## Ordem Recomendada de Implementacao

1. Bootstrap tecnico.
2. Modelos de dados.
3. Login admin.
4. Criacao/configuracao de evento.
5. Upload publico.
6. Moderacao basica.
7. Telao basico.
8. QR Code e identidade visual.
9. Links secretos de moderador.
10. Dashboard.
11. Otimizacao de imagens.
12. Ajustes de estabilidade e operacao.

## Primeiro Marco de Validacao

O primeiro marco util deve provar o fluxo central:

1. Admin cria evento.
2. Convidado envia foto.
3. Foto aparece como pendente.
4. Moderador aprova.
5. Telao mostra a foto.

Todo o restante melhora operacao, seguranca e qualidade visual.

## Nao Fazer no Primeiro Build

- pagamento;
- planos;
- galeria publica;
- app mobile;
- reconhecimento facial;
- IA de moderacao;
- QR Code por mesa;
- multiplos administradores;
- templates sofisticados de design.
