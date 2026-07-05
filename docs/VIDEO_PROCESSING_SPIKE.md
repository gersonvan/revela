# Spike de Processamento de Vídeo

Este runbook descreve uma prova local e controlada para transformar um vídeo de amostra em um clipe MP4 de 5 a 10 segundos. A prova não altera upload público, moderação, telão, exportação, schema ou storage de produção.

## Escopo

O script `scripts/video-proof.mjs` é uma ferramenta local/dev-only. Ele:

- recebe um vídeo local por `--input`;
- gera um clipe MP4/H.264 curto;
- limita largura máxima a 1280 px;
- remove áudio por padrão;
- gera um poster JPG;
- grava um manifest JSON com tamanhos, duração detectada e tempo de processamento;
- escreve tudo em `storage/video-proof/output/` por padrão.

As pastas sob `storage/` já são ignoradas pelo Git. Não commitar vídeos de convidados, vídeos de teste grandes, clipes gerados ou manifests com caminhos locais.

## Pré-requisitos

- `ffmpeg` e `ffprobe` disponíveis no `PATH`.
- Um vídeo de amostra local, preferencialmente sem dados sensíveis.

Para conferir:

```bash
ffmpeg -version
ffprobe -version
```

## Entrada

Coloque o arquivo manualmente em:

```text
storage/video-proof/input/
```

Exemplo:

```text
storage/video-proof/input/amostra.mov
```

Essa pasta é propositalmente local. Ela não deve ser versionada.

## Comando

Rodar com duração padrão de 8 segundos:

```bash
pnpm video:proof -- --input storage/video-proof/input/amostra.mov
```

Se o worktree ainda não tiver `node_modules`, rode diretamente com Node:

```bash
node scripts/video-proof.mjs --input storage/video-proof/input/amostra.mov
```

Rodar com duração explícita:

```bash
pnpm video:proof -- --input storage/video-proof/input/amostra.mov --duration 5
pnpm video:proof -- --input storage/video-proof/input/amostra.mov --duration 10
```

Usar outra pasta de saída:

```bash
pnpm video:proof -- --input storage/video-proof/input/amostra.mov --output-dir storage/video-proof/output
```

## Saída Esperada

O script imprime os caminhos gerados:

```text
Clip: /.../storage/video-proof/output/amostra-8s-<timestamp>.mp4
Poster: /.../storage/video-proof/output/amostra-8s-<timestamp>.jpg
Manifest: /.../storage/video-proof/output/amostra-8s-<timestamp>.json
```

O clipe deve:

- ter entre 5 e 10 segundos, conforme `--duration`;
- estar em MP4/H.264;
- ter áudio removido;
- usar `yuv420p` para compatibilidade;
- ter até 1280 px de largura, sem aumentar vídeos menores;
- ficar pronto para avaliação visual local.

O manifest registra:

- tamanho do original;
- metadados do original via `ffprobe`;
- tamanho do clipe;
- tamanho do poster;
- tempo de processamento;
- política local de retenção do original.

## Restrições

- `--duration` aceita apenas valores entre 5 e 10 segundos.
- O script falha se `ffmpeg` ou `ffprobe` não estiverem instalados.
- O script falha se o arquivo de entrada não existir ou não for lido pelo FFmpeg.
- O script não faz upload para R2, Vercel Blob ou qualquer serviço externo.
- O script não cria registro no banco.
- O script não integra vídeo na moderação nem no telão.

## Falhas Comuns

- **`ffmpeg failed`**: o arquivo pode estar corrompido, usar codec não suportado pela instalação local ou ter permissão inválida.
- **`--duration deve ser um número entre 5 e 10 segundos`**: use apenas a janela permitida pela prova.
- **Arquivo grande demais para uso prático**: reduzir resolução, aumentar CRF ou limitar melhor o vídeo de entrada antes de pensar em produção.
- **Clip acima de 3 MB**: testar `--duration 5` e, se necessário, ajustar futuramente CRF/resolução em outro spike.

## Segurança, Privacidade e Custo

- Use vídeos sem dados sensíveis sempre que possível.
- Se o vídeo original vier de convidado ou evento real, mantenha localmente só pelo tempo necessário para validar a prova.
- Remova originais após a validação local.
- Não suba originais para R2 nesta prova, salvo decisão explícita do operador.
- Se uma etapa futura usar R2, preferir prefixo isolado como `video-proof/<eventId>/original/` e `video-proof/<eventId>/optimized/`.
- O custo desta prova local é zero em nuvem.
- Em produto, o custo relevante passa a ser storage dos originais, storage dos clipes, leituras do telão e compute de transcodificação.

## Critério de Sucesso

A prova é considerada válida quando outro operador consegue:

1. colocar um arquivo local em `storage/video-proof/input/`;
2. rodar `pnpm video:proof -- --input <arquivo> --duration <5-10>`;
3. obter MP4, poster e manifest em `storage/video-proof/output/`;
4. verificar que nenhum arquivo de produção foi alterado;
5. decidir se o clipe gerado atende qualidade, tamanho e tempo de processamento esperados.

## Validação Executada

Em 2026-07-05, o ambiente local tinha `ffmpeg` disponível. A prova foi validada com um vídeo sintético gerado por FFmpeg dentro de `storage/video-proof/input/`, sem versionar o arquivo de amostra.

Comando de amostra usado para validação local:

```bash
mkdir -p storage/video-proof/input
ffmpeg -y -f lavfi -i testsrc2=size=1280x720:rate=30 -f lavfi -i sine=frequency=1000:sample_rate=48000 -t 12 -c:v libx264 -pix_fmt yuv420p -c:a aac storage/video-proof/input/synthetic-12s.mp4
pnpm video:proof -- --input storage/video-proof/input/synthetic-12s.mp4 --duration 8
```

Como o worktree de validação não tinha `node_modules`, a execução confirmada foi:

```bash
node scripts/video-proof.mjs --input storage/video-proof/input/synthetic-12s.mp4 --duration 8
```

Resultado observado:

```text
Input bytes: 4808560
Clip bytes: 1323507
Processing ms: 2175
```

Essa amostra sintética serve apenas para validar o mecanismo. A avaliação real de qualidade ainda deve ser feita com vídeos curtos de celular, escolhidos sem exposição de dados sensíveis.
