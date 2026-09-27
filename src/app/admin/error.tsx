"use client";
export default function AdminError({ reset }: { reset: () => void }) {
  return <section className="cms-card"><h1>No pudimos completar la operación</h1><p>Intenta nuevamente. Si el problema persiste, revisa la conexión a la base de datos y los registros del servidor.</p><button className="cms-button" onClick={reset}>Reintentar</button></section>;
}

