import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { isKind } from "@/lib/content";
import { ContentForm } from "@/components/AdminForms";
export default async function NewPage({ params }: { params: Promise<{ kind: string }> }) {
  await requireAdmin();
  const { kind } = await params;
  if (!isKind(kind)) notFound();
  return <><Link className="text-link" href="/admin">← Volver al panel</Link><section className="cms-card cms-editor"><h1>{{ noticia: "Crear noticia", documento: "Cargar documento", evento: "Agregar actividad académica" }[kind]}</h1><ContentForm kind={kind} /></section></>;
}

