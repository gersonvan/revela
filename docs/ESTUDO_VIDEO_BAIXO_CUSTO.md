# Estudo de Vídeo de Baixo Custo

Este documento avalia caminhos para uma prova controlada de vídeos curtos no Revela, sem alterar o fluxo de upload de fotos, moderação, telão ou exportação usado no evento de 2026-07-11.

## Objetivo

Estudar como transformar um vídeo enviado pelo usuário em um clipe curto de 5 a 10 segundos, com custo previsível e baixo risco operacional.

A prova não deve liberar vídeo para convidados em produção. Ela deve responder:

- qual pipeline consegue gerar um clipe otimizado de 5 a 10 segundos;
- quanto storage e leitura esse clipe tende a consumir;
- onde o processamento pode rodar sem pressionar o fluxo principal do evento;
- o que fazer com o vídeo original depois do processamento;
- qual menor experimento reproduzível reduz incerteza técnica e de custo.

## Estado Atual do Revela

O sistema atual é orientado a fotos:

- upload público por evento em `src/app/api/events/[slug]/photos/route.ts`;
- limite atual de até 15 imagens por envio e 20 MB por arquivo;
- validação por MIME de imagem em `src/lib/storage/shared.ts`;
- processamento de imagem com Sharp nos adapters local e R2;
- persistência em `Photo`, com `originalFileUrl`, `optimizedFileUrl`, `mimeType`, `sizeBytes`, `width` e `height`;
- telão e moderação exibem `optimizedFileUrl` quando existe, com fallback para `originalFileUrl`;
- storage configurável por `STORAGE_PROVIDER`, com adapters local, Vercel Blob e Cloudflare R2;
- R2 usa chaves no padrão `uploads/<eventId>/original/...` e `uploads/<eventId>/optimized/...`.

Essa base ajuda porque já existe separação entre original e versão otimizada. O ponto crítico é que vídeo exige transcodificação, corte, possível extração de poster e controle de duração. Isso não deve ser acoplado ao endpoint atual de fotos.

## Premissas Para Vídeo

- Duração alvo: clipe final de 5 a 10 segundos.
- Formato recomendado para a prova: MP4/H.264 com áudio removido ou normalizado, mais uma imagem poster WebP/JPEG.
- Resolução recomendada para a prova: 720p no máximo.
- Tamanho desejado por clipe otimizado: abaixo de 3 MB quando possível.
- Originais podem ser muito maiores que fotos e não devem ir para o telão diretamente.
- A prova deve ser isolada, com rota, pasta, script ou job separado do fluxo de fotos.

## Opções de Processamento

| Opção | Como funcionaria | Custo | Risco operacional | Ajuste ao Revela |
| --- | --- | --- | --- | --- |
| Local/dev-only com FFmpeg | Rodar um script local com arquivo de amostra e gravar saída em `storage/video-proof/` ou R2 de teste | Sem custo de compute em nuvem; custo só se subir para storage | Baixo, porque não toca produção | Melhor primeiro passo para provar duração, codec, tamanho e qualidade |
| Next.js/Vercel Function síncrona | Upload chega no backend, function corta/transcodifica e salva no storage | Pode consumir compute, memória e duração; aumenta risco em pico | Médio/alto para vídeo, especialmente com FFmpeg e arquivos grandes | Não recomendado como caminho inicial; o upload atual de fotos já usa backend e `maxDuration = 60`, mas vídeo é mais pesado |
| Job externo simples | Upload vai para R2, um worker/script separado processa e grava otimizado | Pode rodar em máquina local, VPS barata, GitHub Actions manual ou ambiente temporário | Médio, mas isolado do app principal | Bom segundo passo depois do script local; permite retry e não bloqueia o request web |
| Fila/background gerenciado | Upload registra pendência; queue aciona processamento assíncrono | Pode introduzir custo e complexidade recorrente | Médio; bom para produto, pesado para prova | Futuro, quando houver demanda real e métricas de volume |
| Serviço de vídeo gerenciado | Cloudflare Stream, Mux ou similar recebe, codifica e entrega | Mais previsível tecnicamente, mas com cobrança própria | Baixo em engenharia, maior em dependência/custo | Não deve ser o padrão de prova gratuita; considerar se qualidade/escala justificarem |

## Avaliação Por Caminho

### 1. Script local com FFmpeg

Recomendado para a primeira prova.

Fluxo:

1. Separar 3 a 5 vídeos reais de celular, sem dados sensíveis.
2. Rodar FFmpeg localmente para gerar clipes de 5, 8 e 10 segundos.
3. Salvar MP4 otimizado e poster.
4. Medir tamanho do original, tamanho do otimizado, tempo de processamento e qualidade visual.
5. Registrar as configurações vencedoras antes de qualquer integração web.

Exemplo de comando para investigar, sem transformar em feature:

```bash
ffmpeg -y -i input.mov -t 8 -vf "scale='min(1280,iw)':-2" -an -c:v libx264 -preset veryfast -crf 28 output-8s.mp4
ffmpeg -y -i output-8s.mp4 -ss 00:00:01 -frames:v 1 poster.jpg
```

Vantagens:

- custo de nuvem zero;
- reproduzível;
- não pressiona Vercel;
- permite comparar CRF, resolução e duração antes de modelar produto.

Limitações:

- não valida concorrência real;
- não resolve upload pelo convidado;
- não testa fila, retry ou moderação.

### 2. Processamento síncrono no backend web

Não recomendado para a prova inicial.

Mesmo com limites atuais de Vercel Functions mais amplos em cenários com Fluid Compute, vídeo continua sensível a memória, tamanho do binário, tempo de CPU, timeout, upload grande e variação de aparelho. O endpoint atual de fotos processa imagens no request; repetir esse modelo para vídeo aumentaria o risco de falhas visíveis para convidados.

Esse caminho só deveria ser reavaliado se:

- o clipe de entrada for rigidamente limitado;
- o volume esperado for muito baixo;
- FFmpeg couber de forma confiável no ambiente;
- houver validação em deploy real, não apenas local.

### 3. Job externo separado

Recomendado como segundo passo, depois do script local.

Fluxo possível:

1. App ou operador coloca o original em R2 numa área de prova, por exemplo `video-proof/<eventId>/original/`.
2. Um script separado lista pendências ou recebe um caminho de entrada.
3. O script baixa o original, gera clipe de 5 a 10 segundos e poster.
4. O script sobe os derivados para `video-proof/<eventId>/optimized/`.
5. Um arquivo JSON ou tabela futura registra status, tamanhos e erros.

Vantagens:

- isola compute pesado fora do request de upload;
- permite retry;
- deixa o app web apenas exibindo resultados prontos;
- encaixa melhor no R2, que já é S3-compatível.

Riscos:

- exige operação do job;
- precisa de limpeza de originais;
- precisa decidir onde guardar logs de processamento;
- pode exigir uma fila se virar produto.

### 4. Fila/background gerenciado

Faz sentido apenas após validar volume e formato.

Para produto, a arquitetura mais robusta seria:

```text
Upload original -> Storage temporário -> Registro pendente -> Fila -> Processador -> Clipe otimizado + poster -> Moderação -> Telão
```

O custo principal deixa de ser só storage e passa a incluir execuções de job, retry, observabilidade e possível fila. Como a necessidade atual é prova controlada, essa complexidade deve ficar documentada, não implementada.

### 5. Serviço gerenciado de vídeo

Serviços como Cloudflare Stream reduzem trabalho de encoding, entrega e compatibilidade de player. O custo, porém, passa a ser por minutos armazenados e entregues, além de criar dependência de produto externo.

Esse caminho pode ser bom no futuro se:

- houver muitos eventos com vídeo;
- a qualidade de playback for requisito forte;
- adaptive bitrate for necessário;
- o custo por minuto entregue for aceitável para o modelo comercial.

Para a prova atual, ele não é o caminho de menor custo nem de menor dependência.

## Implicações de Storage e Banda

### Cloudflare R2

R2 é o melhor encaixe para a prova porque o projeto já possui adapter e documentação de domínio de mídias.

Pontos relevantes em 2026-07-05:

- free tier de R2 Standard inclui 10 GB-mês, 1 milhão de operações Class A e 10 milhões de operações Class B por mês;
- egress direto do R2 para Internet é gratuito;
- storage acima do free tier é cobrado por GB-mês;
- writes como `PutObject` contam como Class A;
- reads como `GetObject` contam como Class B;
- Infrequent Access não deve ser usado para prova curta, porque não tem free tier e possui duração mínima/custos de recuperação.

Implicação prática:

- vídeo original pode consumir storage rápido, mesmo com poucos arquivos;
- clipe otimizado de 5 a 10 segundos reduz custo e melhora playback;
- telão pode gerar muitas leituras se vídeos forem recarregados com frequência;
- a prova deve medir leituras e tamanho real antes de projetar produto.

Estimativa simples:

| Cenário | Quantidade | Tamanho médio | Storage aproximado |
| --- | ---: | ---: | ---: |
| Originais temporários | 50 vídeos | 50 MB | 2,5 GB |
| Clipes otimizados | 50 clipes | 3 MB | 150 MB |
| Posters | 50 imagens | 150 KB | 7,5 MB |

Com esse volume, o gargalo não seria egress no R2. O risco maior seria manter originais indefinidamente e multiplicar leituras no telão.

### Vercel Blob

Vercel Blob é viável tecnicamente, mas menos interessante para prova de baixo custo porque cobra storage, operações e transferência com limites menores no plano gratuito. Também há limite de request body em Vercel Functions para server upload; para vídeos maiores, client upload seria necessário.

Como o projeto já caminha para R2, Blob não deve ser a opção preferida para vídeo.

### Vercel Functions

Vercel continua adequado para o app web, autenticação, páginas e APIs leves. O ponto de atenção é usar function para transcodificar vídeo dentro do request.

Mesmo quando a duração máxima permitir, transcodificação é trabalho de CPU/memória. Ela pode:

- bloquear resposta de upload;
- falhar em vídeos grandes;
- aumentar custo de compute;
- exigir binários e dependências maiores;
- competir com rotas críticas de fotos e moderação.

Por isso, o processamento de vídeo deve ficar fora do caminho crítico.

## Política de Originais

O estudo deve tratar originais como custo e risco, não como default permanente.

### Opção A: descartar original após processamento

Recomendação para produto de baixo custo quando o clipe otimizado for suficiente.

Vantagens:

- menor storage;
- menor risco de privacidade;
- custo mais previsível.

Desvantagens:

- não permite reprocessar com qualidade melhor;
- não permite exportar o original ao cliente.

### Opção B: reter temporariamente

Recomendação para a prova controlada.

Política sugerida:

- manter original por 24 a 72 horas;
- registrar tamanho, duração e resultado do processamento;
- apagar original após validação do clipe;
- manter somente clipe otimizado e poster.

Vantagens:

- permite investigar falhas;
- reduz custo após a janela de QA;
- preserva opção de reprocessar durante a prova.

Desvantagens:

- exige rotina manual ou automática de limpeza;
- precisa ficar claro para operador e cliente.

### Opção C: reter original no longo prazo

Não recomendado como padrão gratuito.

Pode virar opção paga futura se houver valor comercial em backup, exportação ou reprocessamento. Nesse caso, o produto precisa precificar storage, privacidade, prazo de retenção e exclusão sob demanda.

## Modelo de Dados Futuro

Não implementar agora, mas um produto futuro deveria evitar sobrecarregar `Photo` com campos ambíguos.

Opção preferida:

- criar uma entidade separada, por exemplo `MediaAsset`;
- incluir `kind` (`PHOTO` ou `VIDEO`);
- separar URLs de `original`, `optimized`, `poster`;
- guardar `durationMs`, `processingStatus`, `processingError`, `processedAt`;
- manter moderação e auditoria por item de mídia.

Para a prova, um arquivo JSON de metadados ou documento de resultado é suficiente. Não há necessidade de migration.

## Recomendação

O caminho de menor risco e menor custo é:

1. Fazer uma prova local com FFmpeg e vídeos de amostra, sem rotas públicas.
2. Medir para cada arquivo: duração original, tamanho original, tempo de processamento, tamanho do clipe de 5 a 10 segundos e qualidade percebida.
3. Subir opcionalmente os resultados otimizados para uma pasta de prova no R2.
4. Reter originais apenas temporariamente durante a prova.
5. Documentar uma configuração FFmpeg padrão.
6. Só depois avaliar um job externo simples para processar arquivos em R2.

Não recomendado agora:

- aceitar vídeo no upload público de convidados;
- exibir vídeo no telão de produção;
- adaptar moderação de fotos para vídeo;
- transcodificar vídeo dentro do endpoint atual de upload;
- contratar serviço gerenciado de vídeo antes de medir volume e valor.

## Menor Próximo Experimento

Criar um spike isolado, fora do fluxo produtivo:

- pasta de entrada local: `samples/video-proof/input/`;
- pasta de saída local ignorada pelo Git: `storage/video-proof/output/`;
- script manual documentado em `scripts/` ou runbook separado;
- 3 configurações FFmpeg: 5s, 8s e 10s;
- relatório com tabela de tamanho, tempo e qualidade.

Critério de sucesso do spike:

- gerar MP4 de 5 a 10 segundos abaixo de 3 MB para vídeos comuns de celular;
- gerar poster estático;
- confirmar que o output pode ser servido pelo mesmo padrão de URL de mídia, sem alterar telão ou moderação;
- estimar custo R2 para 50, 200 e 1.000 clipes.

## Fontes Consultadas

- Cloudflare R2 Pricing, consultado em 2026-07-05: https://developers.cloudflare.com/r2/pricing/
- Cloudflare Stream Pricing, consultado em 2026-07-05: https://developers.cloudflare.com/stream/pricing/
- Vercel Function duration limits, consultado em 2026-07-05: https://vercel.com/docs/functions/configuring-functions/duration
- Vercel platform limits, consultado em 2026-07-05: https://vercel.com/docs/limits
- Vercel Blob usage and pricing, consultado em 2026-07-05: https://vercel.com/docs/vercel-blob/usage-and-pricing
