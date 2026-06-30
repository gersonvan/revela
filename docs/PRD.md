# PRD - Revela

## Visao

Revela e um sistema online para eventos privados onde convidados enviam fotos por QR Code, moderadores aprovam manualmente, e um telao exibe em tempo real um feed com as fotos aprovadas.

O primeiro uso sera em uma festa de aniversario, mas o MVP deve nascer reutilizavel para varios eventos.

## Objetivos do MVP

- Permitir que um admin crie e configure eventos.
- Permitir que convidados enviem fotos pelo celular sem criar conta.
- Garantir moderacao manual antes de qualquer foto aparecer no telao.
- Exibir um feed ao vivo no projetor/notebook com fotos aprovadas.
- Manter fotos e historico armazenados apos o evento.
- Bloquear novos uploads quando o evento for encerrado.

## Personas

### Admin

Pessoa responsavel por configurar o evento, gerar QR Code, convidar moderadores, acompanhar a operacao e encerrar o evento.

### Convidado

Pessoa presente no evento que envia fotos pelo celular. Nao deve precisar instalar aplicativo nem criar login.

### Moderador

Pessoa convidada pelo admin para aprovar ou rejeitar fotos durante o evento, normalmente usando celular.

### Telao

Pagina publica de exibicao aberta em notebook ligado a projetor ou TV. Nao executa acoes administrativas.

## Jornadas Principais

1. Admin faz login com Google.
2. Admin cria um evento.
3. Admin configura nome, data, convite, tema visual e termo de autorizacao.
4. Sistema gera QR Code do evento.
5. Admin cria links individuais para moderadores.
6. Convidado acessa QR Code, informa nome/apelido, aceita termo e envia fotos.
7. Fotos entram como pendentes.
8. Moderadores aprovam ou rejeitam.
9. Telao exibe automaticamente o feed com fotos aprovadas.
10. Admin encerra o evento ao final.

## Requisitos Funcionais

### Admin

- Fazer login com Google.
- Criar eventos.
- Editar configuracoes do evento.
- Subir imagem do convite.
- Definir tema visual basico.
- Definir texto de autorizacao.
- Gerar e visualizar QR Code do evento.
- Criar links secretos individuais para moderadores.
- Revogar links de moderadores.
- Ver dashboard operacional com:
  - total de fotos enviadas;
  - fotos pendentes;
  - fotos aprovadas;
  - fotos rejeitadas;
  - moderadores criados, usados e revogados.
- Encerrar evento.
- Acessar historico apos encerramento.

### Convidado

- Acessar evento por QR Code unico.
- Informar nome/apelido.
- Salvar nome/apelido localmente para proximos envios.
- Aceitar termo antes do primeiro envio.
- Enviar de 1 a 15 fotos por lote.
- Enviar fotos de ate 20 MB cada.
- Adicionar mensagem opcional por foto.
- Limitar mensagem a 120 caracteres.
- Ver confirmacao apos envio.
- Fazer envios recorrentes durante o evento.

### Moderador

- Acessar por link secreto individual.
- Ativar link uma unica vez, vinculando acesso ao dispositivo.
- Ver abas:
  - Pendentes;
  - Aprovadas;
  - Rejeitadas.
- Ver foto, nome/apelido, mensagem e horario de envio.
- Receber alerta visual quando chegarem novas fotos.
- Aprovar foto pendente.
- Rejeitar foto pendente.
- Aprovar foto rejeitada por engano.
- Remover foto aprovada do telao, movendo para rejeitada.

### Telao

- Abrir pagina propria de projecao.
- Exibir somente fotos aprovadas.
- Mostrar feed ao vivo misturando fotos recentes e antigas.
- Mostrar foto, nome/apelido e mensagem.
- Exibir QR Code durante o feed.
- Ter modo tela cheia.
- Usar imagem do convite quando nao houver fotos aprovadas.
- Continuar exibindo fotos ja carregadas se a internet oscilar.

## Regras de Negocio

- Evento em rascunho nao aceita uploads publicos.
- Evento ativo aceita uploads e moderacao.
- Evento encerrado bloqueia novos uploads.
- Toda foto nova entra como pendente.
- Apenas fotos aprovadas aparecem no telao.
- Fotos rejeitadas permanecem armazenadas.
- Remover uma foto aprovada do telao muda seu status para rejeitada.
- Convidado nao acessa galeria de fotos.
- Moderadores e admin veem fotos pendentes e rejeitadas.
- Cada foto pertence a um unico evento.
- Cada moderador pertence a um unico evento no MVP.
- Moderadores acessam por link secreto individual, sem login Google obrigatorio no MVP.

## Privacidade e Consentimento

Como o evento pode ter criancas nas fotos, privacidade e consentimento devem ser tratados como requisitos do produto.

Texto inicial sugerido para o termo:

> Ao enviar, você autoriza que esta foto apareça no telão da festa após moderação. Envie apenas fotos que você se sente confortável em compartilhar neste evento.

Regras de privacidade no MVP:

- Nao existe galeria publica para convidados.
- Fotos pendentes e rejeitadas sao visiveis apenas para admin e moderadores.
- Telao exibe somente fotos aprovadas.
- Decisoes de moderacao ficam registradas.
- Fotos rejeitadas nao sao apagadas automaticamente.

## Fora do MVP

- Galeria publica pos-evento.
- Download em lote.
- Cobranca e planos.
- QR Code por mesa.
- Login de convidados.
- Integracao com WhatsApp.
- Filtros automaticos por IA.
- Reconhecimento facial.
- Aplicativo mobile nativo.
- Multiplos administradores por evento.
- Produto comercial completo.

## Riscos

- Internet ruim no local do evento.
- Volume alto de fotos afetar upload ou feed.
- Moderacao nao acompanhar o ritmo dos envios.
- Telao ficar visualmente poluido.
- Links de moderacao serem compartilhados indevidamente.
- Fotos com criancas exigirem maior cuidado operacional e juridico.

## Criterios de Aceite do MVP

- Admin consegue criar um evento e gerar QR Code.
- Convidado consegue enviar fotos pelo celular.
- Fotos enviadas aparecem como pendentes.
- Moderador consegue aprovar e rejeitar fotos pelo celular.
- Foto aprovada aparece no telao sem recarregar manualmente.
- Foto rejeitada nunca aparece no telao.
- Telao mostra convite quando nao ha fotos aprovadas.
- Evento encerrado bloqueia novos uploads.
- Dados e fotos continuam salvos apos o evento.
