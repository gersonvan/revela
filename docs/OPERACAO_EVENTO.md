# Operação no Dia do Evento

Este documento descreve como preparar e operar o Revela durante uma festa. Ele deve ser compreensível para uma pessoa operadora sem conhecimento técnico.

## Antes do evento

### Ensaio local

Para criar um evento demo local sem depender do login Google:

```bash
pnpm db:up
pnpm db:migrate
pnpm env:check
pnpm db:seed
pnpm dev
```

O seed cria:

- upload: `http://127.0.0.1:3000/e/evento-demo`;
- moderação: `http://127.0.0.1:3000/moderate/moderador-demo-token`;
- telão: `http://127.0.0.1:3000/screen/evento-demo`.

Com o servidor local rodando, o smoke test automatizado pode ser executado com:

```bash
pnpm smoke:demo
```

Ele valida:

- páginas públicas do evento demo;
- upload via API;
- criação da foto como pendente;
- aprovação simulada no banco;
- disponibilidade da foto aprovada no endpoint do telão.

### Configuração do evento em produção

1. Admin faz login com Google.
2. Admin cria o evento.
3. Admin configura nome, data, imagem do convite, cores/tema e texto de autorização.
4. Admin escolhe o modo de moderação, quando essa opção estiver disponível:
   - **Com moderação:** fotos aguardam aprovação antes de aparecer no telão.
   - **Sem moderação:** fotos podem aparecer diretamente no telão.
5. Admin ativa o evento.
6. Sistema gera QR Code e links absolutos de upload/telão.
7. Admin cria links individuais para moderadores.
8. Admin envia os links aos moderadores por canal privado.

Se o evento estiver sem moderação, confirme com a equipe que todos entendem o risco: qualquer foto enviada pode aparecer no telão antes de revisão humana. Mesmo assim, mantenha pelo menos uma pessoa acompanhando o painel para remover fotos inadequadas rapidamente.

### Ensaio antes da festa

Antes da festa, testar o fluxo completo:

1. Abrir o QR Code no celular.
2. Enviar uma foto de teste.
3. Abrir painel de moderação.
4. Aprovar a foto, se o evento estiver com moderação.
5. Confirmar que a foto aparece no telão.
6. Rejeitar ou remover uma foto aprovada por engano.
7. Baixar a exportação ZIP pelo admin.
8. Conferir se o convite aparece no estado inicial do telão.

Também revisar:

- qualidade da internet no local;
- notebook que ficará conectado ao projetor ou TV;
- cabo HDMI/adaptador;
- fonte de energia;
- brilho e resolução do projetor;
- imagem do convite em boa resolução;
- quantidade de moderadores disponíveis;
- link ou QR Code impresso de reserva.

## Início da festa

1. Conectar notebook ao projetor ou TV.
2. Abrir página do telão. Para o evento de ensaio, usar `https://revela.gersonvan.com.br/t/ensaio-producao-kkh7uc`.
3. Ativar modo tela cheia.
4. Conferir se o QR Code aparece no telão.
5. Moderadores abrem seus links nos celulares.
6. Deixar o QR Code visível nas mesas, entrada ou bar.
7. Fazer um upload de teste antes dos convidados começarem a usar.
8. Confirmar se o comportamento está correto:
   - com moderação: foto fica pendente até aprovação;
   - sem moderação: foto aparece no telão automaticamente.

## Durante a festa

### Convidados

Convidados enviam fotos em fluxo contínuo:

- uma foto individual;
- lotes de até 15 fotos;
- mensagem opcional por foto.

### Moderadores

Com moderação ativada, moderadores devem:

- acompanhar a aba Pendentes;
- aprovar fotos adequadas;
- rejeitar fotos inadequadas;
- revisar Aprovadas e Rejeitadas se necessário;
- remover do telão qualquer foto aprovada por engano.

Sem moderação, moderadores devem:

- acompanhar a aba Aprovadas;
- remover rapidamente fotos inadequadas;
- usar a aba Rejeitadas para conferir correções;
- avisar o admin se o volume ou risco ficar alto demais.

### Admin

Admin pode acompanhar:

- total de fotos enviadas;
- pendentes;
- aprovadas;
- rejeitadas;
- moderadores ativos;
- estado do evento;
- exportações protegidas.

## Problemas comuns

### Internet instável

Comportamento esperado:

- novos uploads podem demorar;
- telão deve continuar mostrando fotos já carregadas;
- moderadores podem ver atraso na fila.

Ação:

- manter notebook na rede mais estável disponível;
- evitar depender de Chromecast se o ambiente estiver instável;
- preferir notebook conectado diretamente ao projetor;
- manter o link de upload disponível para envio direto se o QR Code demorar.

### Fila de moderação acumulada

Ação:

- chamar mais moderadores;
- priorizar aprovação rápida de fotos claramente boas;
- rejeitar fotos duplicadas ou ruins;
- deixar fotos duvidosas pendentes até alguém revisar com calma;
- considerar modo sem moderação apenas se o risco for aceitável e houver pessoa acompanhando aprovadas.

### Foto inadequada apareceu no telão

Ação:

1. Abrir painel de moderação.
2. Entrar na aba Aprovadas.
3. Rejeitar/remover a foto.
4. Confirmar que ela saiu do feed do telão.
5. Se o evento estiver sem moderação e isso se repetir, avaliar voltar para modo com moderação.

### QR Code não abre

Ação:

- confirmar se o evento está ativo;
- conferir se o domínio `revela.gersonvan.com.br` abre no celular;
- usar o link de upload diretamente se o leitor de QR do celular falhar;
- manter uma cópia impressa do QR Code.

### Moderador perdeu acesso

Ação:

- confirmar se o link não foi revogado;
- reenviar o link por canal privado;
- criar novo link se necessário;
- usar outro moderador enquanto o acesso é corrigido.

## Depois do evento

1. Admin encerra o evento.
2. Sistema bloqueia novos uploads.
3. Admin baixa a exportação ZIP protegida.
4. Admin confere se as fotos e metadados esperados estão no arquivo.
5. Fotos e histórico permanecem armazenados.
6. Futuramente, admin poderá criar galeria privada ou pacote de entrega, se essa funcionalidade for implementada.

## Cuidados de escopo

- Aplicativo nativo ainda não é obrigatório para operar o evento.
- Web mobile de moderação continua sendo o fallback seguro.
- Vídeo não deve ser usado no fluxo público de upload do evento enquanto for apenas prova controlada.
- Publicação em App Store ou Google Play depende de conta, revisão e prazos externos.
