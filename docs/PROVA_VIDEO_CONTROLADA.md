# Prova Controlada de Vídeo

Este documento consolida a direção de produto e tecnologia para vídeo no Revela. A prova é isolada, de baixo custo e não altera o fluxo público de fotos, moderação, telão, exportação, schema ou storage de produção do evento de 11/07/2026.

Referências técnicas:

- [Estudo de vídeo de baixo custo](ESTUDO_VIDEO_BAIXO_CUSTO.md)
- [Spike de processamento de vídeo](VIDEO_PROCESSING_SPIKE.md)
- Script local: `scripts/video-proof.mjs`
- Comando npm: `pnpm video:proof`

## Estado atual

A prova local já demonstrou que é possível gerar derivados de um vídeo de amostra sem tocar no fluxo produtivo:

- entrada manual de um vídeo local;
- saída de um clipe MP4/H.264 entre 5 e 10 segundos;
- largura máxima de 1280 px;
- áudio removido por padrão;
- poster JPG gerado a partir do clipe;
- manifest JSON com metadados, tamanhos e tempo de processamento;
- escrita padrão em `storage/video-proof/output/`, diretório ignorado pelo Git.

Validação registrada no runbook:

- amostra sintética local de 12 segundos;
- clipe gerado com duração de 8 segundos;
- clipe observado com `1.323.507` bytes;
- processamento observado em `2.175 ms`;
- nenhum arquivo de produção alterado.

Essa validação prova o mecanismo local. Ela ainda não prova qualidade real com vídeos de celular, volume concorrente, fila, retry, moderação de vídeo ou exibição no telão.

## Como reproduzir a prova

Pré-requisitos:

- `ffmpeg` instalado;
- `ffprobe` instalado;
- vídeo local sem dados sensíveis.

Coloque o arquivo de entrada em:

```text
storage/video-proof/input/
```

Rode a prova com duração padrão de 8 segundos:

```bash
pnpm video:proof -- --input storage/video-proof/input/amostra.mov
```

Rode com duração explícita:

```bash
pnpm video:proof -- --input storage/video-proof/input/amostra.mov --duration 5
pnpm video:proof -- --input storage/video-proof/input/amostra.mov --duration 10
```

Se a worktree não tiver `node_modules`, rode diretamente:

```bash
node scripts/video-proof.mjs --input storage/video-proof/input/amostra.mov --duration 8
```

Saídas esperadas:

- clipe MP4 em `storage/video-proof/output/`;
- poster JPG em `storage/video-proof/output/`;
- manifest JSON em `storage/video-proof/output/`.

Não commitar vídeos de entrada, clipes gerados, posters ou manifests com caminhos locais.

## Arquitetura futura recomendada

O caminho recomendado, se vídeo virar produto, é manter o processamento fora do request público de upload.

Fluxo futuro preferido:

```text
Upload controlado -> Storage temporário -> Registro pendente -> Processador externo -> Clipe + poster -> Moderação -> Exibição
```

Responsabilidades:

- app web recebe ou referencia o original, mas não transcodifica no request;
- storage temporário guarda originais por período curto;
- processador externo roda FFmpeg, gera clipe e poster;
- banco registra status, erro, duração, URLs e tempos de processamento;
- moderação decide se o item pode aparecer;
- telão exibe apenas mídia já otimizada e aprovada.

Esse desenho evita pressionar rotas críticas de fotos, moderação e telão.

## Opções para originais

### Opção A - Descartar após processamento

Recomendação para produto de menor custo quando o clipe otimizado for suficiente.

Vantagens:

- menor custo de storage;
- menor risco de privacidade;
- operação mais simples.

Desvantagens:

- não permite reprocessar em qualidade maior;
- não permite entregar o original ao cliente depois.

### Opção B - Reter temporariamente

Recomendação para prova e para operação controlada.

Exemplo de política:

- manter original por 24 a 72 horas;
- apagar automaticamente após validação;
- manter apenas clipe, poster e metadados.

Vantagens:

- permite revisar falhas de processamento;
- reduz custo e risco em comparação com retenção permanente.

Desvantagens:

- exige rotina de limpeza;
- exige comunicação clara se o cliente esperar acesso ao original.

### Opção C - Reter longo prazo como opção paga futura

Reservar para produto comercial, não para a prova atual.

Vantagens:

- permite reprocessamento;
- pode compor pacote premium;
- preserva material completo para entrega posterior.

Desvantagens:

- aumenta custo recorrente;
- aumenta responsabilidade de privacidade;
- exige política de retenção, exclusão e suporte mais madura.

## Custos e privacidade

Vídeo aumenta custo principalmente por storage de originais, processamento e possíveis leituras repetidas no telão.

Diretrizes práticas:

- preferir Cloudflare R2 para prova, pois já é o caminho de storage recomendado do projeto;
- não usar Vercel Function síncrona para transcodificação de vídeo como primeiro caminho;
- não contratar serviço gerenciado de vídeo antes de medir qualidade, volume e valor comercial;
- remover áudio por padrão para reduzir risco de privacidade e evitar reprodução indesejada;
- evitar vídeos com dados sensíveis durante prova;
- documentar tamanho original, tamanho otimizado e tempo de processamento para cada amostra.

## Não objetivos para 11/07/2026

- liberar upload de vídeo para convidados;
- exibir vídeo no telão de produção;
- adaptar moderação de fotos para vídeo;
- incluir vídeo na exportação ZIP do evento;
- criar migration ou modelo de dados definitivo;
- contratar Cloudflare Stream, Mux ou outro serviço gerenciado;
- processar vídeo dentro do endpoint público de upload.

## Próximas necessidades antes de produto

- testar vídeos reais de celular, escolhidos sem exposição de dados sensíveis;
- comparar qualidade em 5, 8 e 10 segundos;
- medir tamanho de original, clipe e poster;
- decidir limite de duração e tamanho de entrada;
- validar se 1280 px e CRF 28 são suficientes;
- definir política de retenção de originais;
- desenhar modelo de dados separado para mídia futura;
- definir fila, retry, observabilidade e limpeza automática;
- validar custo em volume realista antes de prometer a funcionalidade.

## Decisão atual

Vídeo permanece prova controlada. O produto de 11/07/2026 continua focado em fotos via web, moderação segura e telão estável. Qualquer evolução de vídeo deve acontecer depois do evento, com decisão explícita de custo, privacidade e arquitetura.
