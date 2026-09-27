import { test, expect } from "@playwright/test";
import { deleteContent, emptyContent, getContent, saveContent } from "../../src/lib/content";
test("paginación, formularios, conflictos y revocación de cookies", async ({ page, browser }) => {
  const prefix = "Revision-" + Date.now();
  const fixtures = Array.from({ length: 12 }, (_, index) => ({
    ...emptyContent("noticia"), slug: prefix.toLowerCase() + "-" + index,
    titulo: prefix + " " + String(index).padStart(2,"0"), categoria: "Pruebas UX",
    contenido: ["Contenido de prueba"], published: false
  }));
  for (const item of fixtures) await saveContent(item);
  const visitor = await browser.newContext();
  try {
    await page.goto("/admin/login");
    await page.getByLabel("Correo electrónico").fill(process.env.ADMIN_EMAIL!);
    await page.getByLabel("Contraseña", {exact:true}).fill((process.env.TEST_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD)!);
    await page.getByRole("button",{name:"Ingresar al mantenedor"}).click();
    await expect(page).toHaveURL(/\/admin$/);
    await page.goto("/admin?q=" + prefix + "&size=5&state=draft&sort=title");
    await expect(page.locator("tbody tr")).toHaveCount(5);
    await expect(page.getByText("Mostrando 1–5 de 12 resultados")).toBeVisible();
    await page.getByRole("link",{name:"Página siguiente",exact:true}).click();
    await expect(page.getByText("Mostrando 6–10 de 12 resultados")).toBeVisible();
    await expect(page).toHaveURL(/state=draft/);
    await page.getByRole("link",{name:"Página siguiente",exact:true}).click();
    await expect(page.locator("tbody tr")).toHaveCount(2);
    await page.goto("/admin?q=" + prefix + "&state=published");
    await expect(page.getByRole("heading",{name:"No encontramos contenidos con estos filtros"})).toBeVisible();
    const response = await page.goto("/admin/editar/" + fixtures[0].id);
    expect(response?.headers()["x-frame-options"]).toBe("DENY");
    expect(response?.headers()["content-security-policy"]).toContain("frame-ancestors 'none'");
    const second = await page.context().newPage();
    await second.goto("/admin/editar/" + fixtures[0].id);
    await page.getByLabel("Título",{exact:true}).fill(prefix + " Cambio");
    const requestPromise = page.waitForRequest(request => request.method() === "POST");
    await page.getByRole("button",{name:"Guardar cambios",exact:true}).click();
    const mutation = await requestPromise;
    await expect(page).toHaveURL(/status=saved/);
    await second.getByLabel("Título",{exact:true}).fill(prefix + " Obsoleto");
    await second.getByRole("button",{name:"Guardar cambios",exact:true}).click();
    await expect(second.getByRole("alert").filter({hasText:"cambió en otra pestaña"})).toBeVisible();
    await expect(second.getByLabel("Título",{exact:true})).toHaveValue(prefix + " Obsoleto");
    expect((await getContent(fixtures[0].id))?.titulo).toBe(prefix + " Cambio");
    await second.close();
    const requestHeaders = mutation.headers();
    const unauthenticated = await visitor.request.post(mutation.url(), {
      headers: { "content-type": requestHeaders["content-type"], "next-action": requestHeaders["next-action"], origin: "http://localhost:3000" },
      data: mutation.postDataBuffer()!, maxRedirects:0
    });
    expect(unauthenticated.headers()["x-action-redirect"] || unauthenticated.headers().location).toContain("/admin/login");
    await page.goto("/admin/seguridad");
    await expect(page.getByRole("heading",{name:"Seguridad y actividad"})).toBeVisible();
    await expect(page.getByText("Contenido actualizado",{exact:true}).first()).toBeVisible();
    await page.goto("/admin?size=5");
    await page.screenshot({path:"test-results/admin-updated-desktop.png",fullPage:true,caret:"initial"});
    await page.setViewportSize({width:390,height:844});
    await page.screenshot({path:"test-results/admin-updated-mobile.png",fullPage:true,caret:"initial"});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    const oldCookies = await page.context().cookies();
    const token = oldCookies.find(c=>c.name==="yangtse_admin")!;
    expect(token.httpOnly).toBe(true); expect(token.sameSite).toBe("Strict");
    await page.getByRole("button",{name:"Cerrar sesión",exact:true}).click();
    await expect(page).toHaveURL(/\/admin\/login/);
    await visitor.addCookies(oldCookies);
    const replay = await visitor.newPage();
    await replay.goto("/admin");
    await expect(replay).toHaveURL(/\/admin\/login/);
  } finally {
    await visitor.close();
    for (const item of fixtures) await deleteContent(item.id);
  }
});

