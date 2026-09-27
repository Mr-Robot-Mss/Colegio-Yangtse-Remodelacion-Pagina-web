import { redirect } from "next/navigation";
import { authenticated, authConfigured } from "@/lib/auth";
import { LoginForm } from "@/components/AdminForms";
export const dynamic = "force-dynamic";
export default async function LoginPage({ searchParams }: { searchParams: Promise<{expired?:string;revoked?:string}> }) {
  if (await authenticated()) redirect("/admin");
  const params=await searchParams;
  return <section className="cms-card cms-login">
    <p className="eyebrow eyebrow--red">Colegio Yangtsé</p><h1>Gestiona tu comunidad</h1>
    <p>Publica noticias, comparte documentos y organiza el calendario académico.</p>
    {params.revoked === "1" && <p className="cms-notice" role="status">Se cerraron todas las sesiones. Ingresa nuevamente para continuar.</p>}
    {params.expired === "1" && <p className="cms-notice" role="status">Tu sesión ya no está activa. Ingresa nuevamente para continuar.</p>}
    {authConfigured() ? <LoginForm /> : <p role="alert" className="cms-error">El acceso administrativo aún no está configurado. Completa ADMIN_EMAIL, ADMIN_PASSWORD_HASH y SESSION_SECRET en el servidor siguiendo README-CMS.md.</p>}
  </section>;
}

