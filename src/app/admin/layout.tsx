import type { Metadata } from "next";
import Link from "next/link";
import "./admin.css";
export const metadata: Metadata = { title: "Administración", robots: { index: false, follow: false } };
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="cms"><header className="cms-top"><Link href="/admin"><strong>Yangtsé</strong> · Administración</Link><Link href="/">Ver sitio ↗</Link></header><main id="contenido" className="cms-main">{children}</main></div>;
}

