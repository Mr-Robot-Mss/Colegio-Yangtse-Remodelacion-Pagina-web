import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { securityOverview } from "@/lib/security";
import { RevokeSessionsForm } from "@/components/AdminForms";
export const dynamic = "force-dynamic";
const labels: Record<string,string> = { login: "Inicio de sesión", login_failed: "Intento de acceso fallido", logout: "Cierre de sesión", created: "Contenido creado", updated: "Contenido actualizado", deleted: "Contenido eliminado" };
export default async function SecurityPage() {
  await requireAdmin();
  const { events, sessionCount } = await securityOverview();
  return <>
    <Link className="text-link" href="/admin">← Volver al panel</Link>
    <div className="cms-heading cms-security-heading"><div><p className="eyebrow eyebrow--red">Control de acceso</p><h1>Seguridad y actividad</h1><p>Revisa los accesos recientes y cierra las sesiones abiertas.</p></div></div>
    <div className="cms-two">
      <section className="cms-card"><h2>Sesiones activas</h2><p className="cms-session-count">{sessionCount}</p><p>Las sesiones vencen después de 30 minutos sin solicitudes o de 8 horas desde el acceso.</p><RevokeSessionsForm /></section>
      <section className="cms-card"><h2>Tu acceso</h2><p>{process.env.ADMIN_EMAIL}</p><ul className="cms-security-list"><li>Sesiones revocables en el servidor.</li><li>Límite de intentos de inicio de sesión.</li><li>Archivos en borrador protegidos.</li><li>Control de origen en las operaciones.</li></ul><p className="cms-hint">El cierre global también cerrará esta sesión. Los cambios de credenciales invalidan los accesos anteriores.</p></section>
    </div>
    <section className="cms-card cms-audit"><h2>Actividad reciente</h2><p className="cms-hint">Últimos 30 movimientos. Los registros se conservan durante 90 días; no incluyen contraseñas ni cookies.</p>
      <ol className="cms-audit-list">{events.map((event,index) => <li key={index}><div><strong>{labels[String(event.event)] || "Actividad"}</strong>{!!event.detail && <p>{String(event.detail)}</p>}</div><time dateTime={new Date(Number(event.created_at)).toISOString()}>{new Intl.DateTimeFormat("es-CL",{dateStyle:"short",timeStyle:"short",timeZone:"America/Santiago"}).format(Number(event.created_at))}</time></li>)}</ol>
      {!events.length && <p>Aún no hay actividad registrada.</p>}
    </section>
  </>;
}

