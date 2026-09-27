import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getContent } from "@/lib/content";
import { ContentForm, DeleteForm } from "@/components/AdminForms";
export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const item = await getContent((await params).id);
  if (!item) notFound();
  return <><Link className="text-link" href="/admin">← Volver al panel</Link><section className="cms-card cms-editor"><h1>Editar contenido</h1><ContentForm kind={item.kind} item={item} /></section><DeleteForm id={item.id} version={item.updatedAt} /></>;
}

