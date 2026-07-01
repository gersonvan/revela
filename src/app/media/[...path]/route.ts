import { NextResponse } from "next/server";
import { readStoredFile } from "@/lib/storage";

type MediaRouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

const contentTypeByExtension: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
};

export async function GET(_request: Request, context: MediaRouteContext) {
  const { path } = await context.params;
  const relativePath = path.join("/");
  const extension = relativePath.split(".").pop()?.toLowerCase() ?? "";
  const contentType = contentTypeByExtension[extension] ?? "application/octet-stream";

  try {
    const file = await readStoredFile(relativePath);

    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": contentType,
      },
    });
  } catch {
    return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });
  }
}
