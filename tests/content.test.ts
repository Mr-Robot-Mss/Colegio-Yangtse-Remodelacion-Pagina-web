import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseContent } from "../src/lib/validation";
import { deleteContent, emptyContent, getContent, listContent, publicContent, saveContent } from "../src/lib/content";
import { downloadFile, removeFile, uploadPdf } from "../src/lib/storage";
test("CRUD, publicación, persistencia, fechas y almacenamiento PDF", async () => {
  const folder = await mkdtemp(join(tmpdir(), "yangtse-test-"));
  process.env.DATABASE_URL = "file:" + join(folder, "test.sqlite");
  process.env.UPLOAD_DIR = join(folder, "uploads");
  process.env.STORAGE_PROVIDER = "local";
  try {
    const draft = { ...emptyContent("noticia"), slug: "borrador", titulo: "Borrador", categoria: "Comunidad" };
    await saveContent(draft);
    assert.equal((await listContent()).length, 1);
    assert.equal((await publicContent()).noticias.length, 0);
    assert.equal((await getContent(draft.id))?.titulo, "Borrador");
    await saveContent({ ...draft, published: true });
    assert.equal((await publicContent()).noticias[0].slug, "borrador");
    await assert.rejects(saveContent({ ...draft, id: "different" }));
    const form = new FormData();
    for (const [k,v] of Object.entries({ titulo: "Actividad", categoria: "Académico", fechaISO: "2026-02-30" })) form.set(k,v);
    assert.throws(() => parseContent(form,"evento"), /fecha válida/);
    form.set("fechaISO","2026-09-27"); form.set("fechaFin","2026-09-26");
    assert.throws(() => parseContent(form,"evento"), /fecha final/);
    form.set("fechaFin","2026-09-28"); form.set("hora","25:00");
    assert.throws(() => parseContent(form,"evento"), /Hora/);
    form.set("hora","09:30");
    const event = parseContent(form,"evento");
    await saveContent({ ...event, published: true });
    assert.equal((await publicContent()).eventos[0].dia,"27");
    await assert.rejects(uploadPdf(new File(["bad"],"bad.pdf",{ type: "application/pdf" })), /formato PDF/);
    await assert.rejects(uploadPdf(new File(["%PDF-1.4"],"bad.html",{ type: "text/html" })), /Solo/);
    await assert.rejects(uploadPdf(new File([new Uint8Array(5*1024*1024+1)],"large.pdf",{ type:"application/pdf" })), /5 MB/);
    const bytes = "%PDF-1.4\n%%EOF";
    const uploaded = await uploadPdf(new File([bytes],"test.pdf",{ type: "application/pdf" }));
    const doc = { ...emptyContent("documento"), ...uploaded, slug: "test-document" };
    assert.equal(Buffer.from(await downloadFile(doc)).toString(),bytes);
    await removeFile(doc);
    await assert.rejects(downloadFile(doc));
    await deleteContent(draft.id);
    assert.equal(await getContent(draft.id),undefined);
  } finally {
    const state = globalThis as unknown as { cmsSqlite?: { close: () => void }; cmsReady?: Promise<void> };
    state.cmsSqlite?.close(); state.cmsSqlite = undefined; state.cmsReady = undefined;
    await rm(folder, { recursive: true, force: true });
  }
});

