import Image from "next/image";
import type { CSSProperties } from "react";

type SchoolEmblemProps = {
  size: number;
  priority?: boolean;
  fluid?: boolean;
};

/** Dos capas del mismo emblema: centro fijo y anillo exterior independiente. */
export default function SchoolEmblem({ size, priority = false, fluid = false }: SchoolEmblemProps) {
  return (
    <span
      className={`school-emblem${fluid ? " school-emblem--fluid" : ""}`}
      style={{ "--emblem-size": `${size}px` } as CSSProperties}
    >
      <Image
        className="school-emblem__center"
        src="/images/logo-colegio-yangtse.png"
        alt="Emblema del Colegio Yangtsé"
        fill
        priority={priority}
        sizes={`${size}px`}
      />
      <span className="school-emblem__ring" aria-hidden="true">
        <Image
          src="/images/logo-colegio-yangtse.png"
          alt=""
          fill
          priority={priority}
          sizes={`${size}px`}
        />
      </span>
    </span>
  );
}

