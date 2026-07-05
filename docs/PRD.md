# PRD - Revela

## Visão

Revela é um sistema online para eventos privados em que convidados enviam fotos pelo celular via QR Code, a organização controla o que aparece, e um telão exibe em tempo real um feed com fotos aprovadas.

O primeiro uso real é uma festa de aniversário, com alvo operacional em 11/07/2026 e prontidão desejada até 10/07/2026. O produto deve continuar simples, reutilizável para outros eventos e estável em produção enquanto a Fase 2 evolui.

## Objetivos do MVP validado

- Permitir que um admin crie, configure, ative, acompanhe e encerre eventos.
- Permitir que convidados enviem fotos pelo celular sem criar conta.
- Gerar QR Code e links operacionais por evento.
- Manter fotos separadas por evento e status.
- Exibir no telão apenas fotos aprovadas.
- Permitir que moderadores aprovem, rejeitem e corrijam decisões.
- Preservar histórico de moderação e exportação protegida do evento.
- Bloquear novos uploads quando o evento for encerrado.

## Objetivos da Fase 2

- Preparar o uso do evento real de 11/07/2026 sem quebrar o fluxo web existente.
- Adicionar modo de moderação por evento: com moderação ou sem moderação.
- Melhorar a experiência mobile da moderação web como fallback seguro.
- Direcionar o aplicativo nativo primeiro para moderadores.
- Definir estratégia de notificações push sem expor dados sensíveis.
- Fazer prova controlada de vídeo curto, isolada do fluxo vivo do evento.

## Personas

### Admin

Pessoa responsável por configurar o evento, gerar QR Code, convidar moderadores, acompanhar a operação, exportar arquivos e encerrar o evento.

### Convidado

Pessoa presente no evento que envia fotos pelo celular. Não deve precisar instalar aplicativo nem criar login.

### Moderador

Pessoa convidada pelo admin para aprovar, rejeitar ou remover fotos durante o evento. Na Fase 2, pode usar a web mobile ou, futuramente, aplicativo nativo.

### Telão

Página pública de exibição aberta em notebook ligado a projetor ou TV. Não executa ações administrativas.

## Jornadas principais

### Admin

1. Faz login com Google.
2. Cria um evento.
3. Configura nome, data, imagem do convite, tema visual, termo de autorização e modo de moderação.
4. Ativa o evento.
5. Gera ou baixa QR Code de envio.
6. Cria links individuais para moderadores quando necessário.
7. Acompanha contadores de fotos, estados de moderação e links de moderadores.
8. Abre o telão.
9. Encerra o evento.
10. Exporta ZIP ou JSON protegido com fotos, metadados e histórico.

### Convidado

1. Acessa o evento pelo QR Code.
2. Informa nome ou apelido.
3. Aceita o termo antes do primeiro envio.
4. Envia uma ou mais fotos pelo celular.
5. Adiciona mensagem opcional por foto.
6. Recebe confirmação de envio.

### Moderador

1. Acessa link secreto individual.
2. Ativa o link em um dispositivo.
3. Revisa fotos pendentes quando o evento está com moderação.
4. Aprova ou rejeita fotos.
5. Revisa fotos aprovadas e rejeitadas.
6. Remove do telão uma foto aprovada por engano.

### Telão

1. Abre página própria de projeção.
2. Exibe estado inicial com convite e QR Code quando ainda não há fotos aprovadas.
3. Exibe somente fotos aprovadas.
4. Atualiza o feed sem recarregamento manual.
5. Permite modo tela cheia.

## Regras de negócio

- Evento em rascunho não aceita uploads públicos.
- Evento ativo aceita uploads públicos.
- Evento encerrado bloqueia novos uploads.
- Cada foto pertence a um evento.
- Fotos podem estar como pendentes, aprovadas ou rejeitadas.
- Telão nunca exibe fotos pendentes ou rejeitadas.
- Fotos rejeitadas não são apagadas automaticamente.
- Decisões de moderação devem registrar ação, horário e responsável quando houver.
- Admin e moderadores devem conseguir remover do telão uma foto aprovada por engano.
- Exportações protegidas devem respeitar escopo do evento.

## Modo de moderação por evento

Cada evento deve suportar configuração simples de moderação:

- **Com moderação:** fotos enviadas entram como pendentes e só aparecem no telão após aprovação.
- **Sem moderação:** fotos enviadas são aprovadas automaticamente e podem aparecer no telão sem revisão prévia.

Quando a moderação estiver desativada, a interface administrativa deve avisar claramente que novas fotos poderão aparecer diretamente no telão. Mesmo nesse modo, admin e moderadores precisam conseguir rejeitar ou remover fotos depois que elas aparecerem.

A aprovação automática deve preservar histórico útil, indicando que a foto chegou ao estado aprovado por regra automática do evento, não por decisão manual de um moderador.

## Privacidade e segurança

- Convidados não têm login.
- Não existe galeria pública pós-evento no MVP atual.
- Fotos pendentes e rejeitadas são visíveis apenas em áreas administrativas ou de moderação.
- Links de moderadores são individuais e podem ser revogados.
- O telão não deve expor controles administrativos.
- Logs e relatórios não devem expor segredos, tokens privados, e-mails sensíveis ou credenciais de storage.

Texto base do termo:

> Ao enviar, você autoriza que esta foto apareça no telão da festa conforme a configuração de moderação do evento. Envie apenas fotos que você se sente confortável em compartilhar neste evento.

## Aplicativo nativo

O aplicativo nativo da Fase 2 é direcionado primeiro a moderadores, não a convidados.

Escopo previsto:

- Expo/React Native.
- Convite por e-mail.
- Acesso com escopo por evento.
- Registro de dispositivo ou sessão.
- Lista de fotos pendentes.
- Aprovação e rejeição de fotos.
- Notificações push agrupadas ou limitadas para evitar excesso.
- Fallback seguro para moderação web.

Fora do escopo imediato:

- Upload de convidados pelo aplicativo.
- Garantia de publicação em App Store ou Google Play.
- Substituição obrigatória da moderação web no evento de 11/07/2026.

## Prova de vídeo

A Fase 2 pode incluir prova controlada com clipes de 5 a 10 segundos, mas isso não faz parte do fluxo vivo de upload dos convidados para o evento.

A prova deve documentar:

- impacto de armazenamento;
- custo de processamento;
- estratégia para originais: retenção temporária, descarte ou opção paga futura;
- isolamento em relação ao fluxo de fotos de produção.

## Fora do escopo atual

- Cobrança e planos com enforcement real.
- Aplicativo nativo para upload de convidados.
- Fluxo de vídeo em produção no evento.
- Galeria pública pós-evento.
- QR Code por mesa.
- Login de convidados.
- Integração com WhatsApp.
- Moderação por IA.
- Reconhecimento facial.
- Back office SaaS comercial completo.
- Garantia de publicação em lojas de aplicativos.

## Riscos

- Internet ruim no local do evento.
- Volume alto de fotos afetar upload, moderação ou feed.
- Moderação não acompanhar o ritmo dos envios.
- Modo sem moderação aumentar risco de foto inadequada no telão.
- Links de moderação serem compartilhados indevidamente.
- Conta de desenvolvedor, revisão de loja e notificações push exigirem dependências externas.
- Vídeo aumentar custo e complexidade de storage/processamento.

## Critérios de aceite

### MVP web

- Admin consegue criar, configurar, ativar e encerrar um evento.
- Convidado consegue enviar fotos pelo celular.
- Fotos enviadas respeitam status do evento e validações de arquivo.
- Moderador consegue aprovar e rejeitar fotos pelo celular.
- Foto aprovada aparece no telão sem recarregamento manual.
- Foto rejeitada não aparece no telão.
- Telão mostra convite e QR Code quando não há fotos aprovadas.
- Exportação protegida entrega fotos e metadados do evento.

### Fase 2

- Evento permite escolher entre moderação ativada e desativada.
- Modo sem moderação avisa o admin com clareza.
- Aprovações automáticas ficam auditáveis.
- Moderação web permanece fallback seguro para 11/07/2026.
- Direção do app nativo fica limitada a moderadores.
- Prova de vídeo permanece isolada e com custos documentados.
