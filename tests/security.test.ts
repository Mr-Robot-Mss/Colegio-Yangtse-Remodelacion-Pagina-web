import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { adminContent, deleteVersion, saveVersion } from "../src/lib/admin-content";
import { emptyContent, getContent } from "../src/lib/content";
import { ConflictError } from "../src/lib/errors";
import { hashPassword, verifyPassword, newSession, checkSession, revokeSession, revokeAllSessions, consumeLoginAttempt, SESSION_IDLE, SESSION_LIFETIME } from "../src/lib/security";

test("paginación, filtros literales, ediciones concurrentes y sesiones revocables", async () => {
  const dir = await mkdtemp(join(tmpdir(), "yangtse-security-"));
  process.env.DATABASE_URL = "file:" + join(dir,"test.sqlite");
  try {
    for (let i=0;i<13;i++) {
      const item={...emptyContent("noticia"),slug:"prueba-"+i,titulo:"Noticia "+i,categoria:i===0?"100%":"Comunidad",published:i%2===0};
      await saveVersion(item);
    }
    const first=await adminContent({size:"5"});
    assert.equal(first.total,13); assert.equal(first.pages,3); assert.equal(first.items.length,5);
    const last=await adminContent({size:"5",page:"999"});
    assert.equal(last.page,3); assert.equal(last.items.length,3);
    const next=await adminContent({size:"5",page:"2"});
    assert.equal(first.items.some(i=>next.items.some(j=>i.id===j.id)),false);
    assert.equal((await adminContent({state:"draft"})).total,6);
    assert.equal((await adminContent({q:"%"})).total,1);
    assert.equal((await adminContent({q:"' OR 1=1 --"})).total,0);
    assert.equal((await adminContent({kind:"evento"})).total,0);
    const original=first.items[0];
    await saveVersion({...original,titulo:"Modificado"},original.updatedAt);
    await assert.rejects(saveVersion({...original,titulo:"Cambio obsoleto"},original.updatedAt),ConflictError);
    await assert.rejects(deleteVersion(original.id,original.updatedAt),ConflictError);
    assert.equal((await getContent(original.id))?.titulo,"Modificado");
    const updated=(await getContent(original.id))!;
    await deleteVersion(updated.id,updated.updatedAt);
    assert.equal(await getContent(updated.id),undefined);

    const hash=await hashPassword("Una contraseña de prueba");
    assert.equal(await verifyPassword("Una contraseña de prueba",hash),true);
    assert.equal(await verifyPassword("incorrecta",hash),false);
    assert.equal(await verifyPassword("x","hash-invalido"),false);
    const now=Date.now();
    const token=await newSession("v1",now);
    assert.equal(await checkSession(token,"v1",now+100),true);
    assert.equal(await checkSession(token,"v2",now+200),false);
    assert.equal(await checkSession("manipulada","v1",now+200),false);
    await revokeSession(token);
    assert.equal(await checkSession(token,"v1",now+300),false);
    const idle=await newSession("v1",now);
    assert.equal(await checkSession(idle,"v1",now+SESSION_IDLE+1),false);
    const expired=await newSession("v1",now);
    assert.equal(await checkSession(expired,"v1",now+SESSION_LIFETIME+1),false);
    const other=await newSession("v1",now);
    await revokeAllSessions();
    assert.equal(await checkSession(other,"v1",now+100),false);
    for(let i=0;i<10;i++) assert.equal(await consumeLoginAttempt(now),true);
    assert.equal(await consumeLoginAttempt(now),false);
    assert.equal(await consumeLoginAttempt(now+15*60000+1),true);
  } finally {
    const state=globalThis as unknown as {cmsSqlite?:{close:()=>void};cmsReady?:Promise<void>};
    state.cmsSqlite?.close();state.cmsSqlite=undefined;state.cmsReady=undefined;
    await rm(dir,{recursive:true,force:true});
  }
});

