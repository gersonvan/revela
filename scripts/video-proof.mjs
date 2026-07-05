#!/usr/bin/env node

import { spawn } from "node:child_process";
import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const DEFAULT_OUTPUT_DIR = "storage/video-proof/output";
const DEFAULT_DURATION_SECONDS = 8;
const MAX_WIDTH = 1280;
const POSTER_AT_SECONDS = 1;

function printUsage() {
  console.log(`Usage:
  node scripts/video-proof.mjs --input <video-file> [--duration 5-10] [--output-dir <dir>]

Example:
  node scripts/video-proof.mjs --input storage/video-proof/input/amostra.mov --duration 8

Notes:
  - Requires ffmpeg and ffprobe in PATH.
  - Writes only to storage/video-proof/output by default.
  - Strips audio by default to reduce privacy and playback risk.`);
}

function parseArgs(argv) {
  const options = {
    duration: DEFAULT_DURATION_SECONDS,
    outputDir: DEFAULT_OUTPUT_DIR,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--input") {
      options.input = argv[++index];
    } else if (arg === "--duration") {
      options.duration = Number(argv[++index]);
    } else if (arg === "--output-dir") {
      options.outputDir = argv[++index];
    } else {
      throw new Error(`Argumento desconhecido: ${arg}`);
    }
  }

  return options;
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      reject(
        new Error(
          `${command} failed with exit code ${code}\n${stderr || stdout}`.trim(),
        ),
      );
    });
  });
}

async function fileSizeBytes(filePath) {
  const fileStat = await stat(filePath);
  return fileStat.size;
}

function safeBaseName(inputPath) {
  return path
    .basename(inputPath, path.extname(inputPath))
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64) || "video";
}

async function probeVideo(inputPath) {
  const { stdout } = await run("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration,size:stream=codec_type,codec_name,width,height",
    "-of",
    "json",
    inputPath,
  ]);

  return JSON.parse(stdout);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printUsage();
    return;
  }

  if (!options.input) {
    printUsage();
    throw new Error("Informe o arquivo de entrada com --input.");
  }

  if (!Number.isFinite(options.duration) || options.duration < 5 || options.duration > 10) {
    throw new Error("--duration deve ser um número entre 5 e 10 segundos.");
  }

  const inputPath = path.resolve(options.input);
  const outputDir = path.resolve(options.outputDir);
  await stat(inputPath);
  await mkdir(outputDir, { recursive: true });

  const startedAt = new Date();
  const baseName = safeBaseName(inputPath);
  const stamp = startedAt.toISOString().replace(/[:.]/g, "-");
  const outputBase = `${baseName}-${options.duration}s-${stamp}`;
  const clipPath = path.join(outputDir, `${outputBase}.mp4`);
  const posterPath = path.join(outputDir, `${outputBase}.jpg`);
  const manifestPath = path.join(outputDir, `${outputBase}.json`);

  const before = await probeVideo(inputPath);
  const inputSizeBytes = await fileSizeBytes(inputPath);

  await run("ffmpeg", [
    "-y",
    "-i",
    inputPath,
    "-t",
    String(options.duration),
    "-vf",
    `scale='min(${MAX_WIDTH},iw)':-2,format=yuv420p`,
    "-an",
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "28",
    "-movflags",
    "+faststart",
    clipPath,
  ]);

  await run("ffmpeg", [
    "-y",
    "-ss",
    String(POSTER_AT_SECONDS),
    "-i",
    clipPath,
    "-frames:v",
    "1",
    "-q:v",
    "3",
    posterPath,
  ]);

  const after = await probeVideo(clipPath);
  const clipSizeBytes = await fileSizeBytes(clipPath);
  const posterSizeBytes = await fileSizeBytes(posterPath);
  const finishedAt = new Date();

  const manifest = {
    proofOnly: true,
    createdAt: finishedAt.toISOString(),
    processingMs: finishedAt.getTime() - startedAt.getTime(),
    retentionPolicy:
      "Original local deve ser mantido apenas durante a validação da prova e removido depois.",
    input: {
      fileName: path.basename(inputPath),
      sizeBytes: inputSizeBytes,
      ffprobe: before,
    },
    output: {
      requestedDurationSeconds: options.duration,
      maxWidth: MAX_WIDTH,
      audio: "stripped",
      clipPath,
      clipSizeBytes,
      posterPath,
      posterSizeBytes,
      manifestPath,
      ffprobe: after,
    },
  };

  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(`Clip: ${clipPath}`);
  console.log(`Poster: ${posterPath}`);
  console.log(`Manifest: ${manifestPath}`);
  console.log(`Input bytes: ${inputSizeBytes}`);
  console.log(`Clip bytes: ${clipSizeBytes}`);
  console.log(`Processing ms: ${manifest.processingMs}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
