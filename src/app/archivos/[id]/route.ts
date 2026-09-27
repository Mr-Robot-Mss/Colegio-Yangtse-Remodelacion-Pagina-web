import { getContent } from "@/lib/content";
import { authenticated } from "@/lib/auth";
import { downloadFile } from "@/lib/storage";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const item = await getContent((await params).id);
  if (!item || item.kind !== "documento" || (!item.published && !await authenticated())) return new Response("No encontrado", { status: 404 });
  try {
    const bytes = await downloadFile(item);
    return new Response(bytes as BodyInit, { headers: {
      "Content-Type": "application/pdf", "Content-Disposition": "attachment; filename*=UTF-8''" + encodeURIComponent(item.titulo + ".pdf"),
      "X-Content-Type-Options": "nosniff", "Cache-Control": "private, no-store"
    } });
  } catch (error) {
    console.error("No se pudo descargar documento", item.id, error);
    return new Response("El documento no está disponible temporalmente.", { status: 503 });
  }
}

