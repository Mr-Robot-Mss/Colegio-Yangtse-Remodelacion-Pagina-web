export type TipoArteNoticia =
  | "red"
  | "gold"
  | "ink";

export type Noticia = {
  id: number;
  slug: string;
  destacada?: boolean;
  tipoArte: TipoArteNoticia;
  categoria: string;
  fecha: string;
  fechaISO: string;
  titulo: string;
  descripcion: string;
  contenido: string[];
  enlace: string;
};

export type Documento = {
  id: number;
  titulo: string;
  categoria: string;
  tipo: "PDF";
  enlace: string;
};

export type Evento = {
  id: number;
  dia: string;
  mes: string;
  categoria: string;
  titulo: string;
};

export const noticias: Noticia[] = [
  {
    id: 1,
    slug: "listas-utiles-escolares",
    destacada: true,
    tipoArte: "red",
    categoria: "Comunicado",
    fecha: "12 enero 2025",
    fechaISO: "2025-01-12",
    titulo: "Listas de útiles escolares",
    descripcion:
      "Documentos organizados por nivel, desde kínder hasta octavo básico.",
    contenido: [
      "Informamos a nuestra comunidad educativa que ya se encuentran disponibles las listas de útiles escolares correspondientes a cada nivel.",
      "Las familias podrán revisar y descargar los documentos desde el centro de recursos del sitio web.",
      "Recomendamos verificar cuidadosamente el nivel correspondiente antes de adquirir los materiales solicitados.",
    ],
    enlace: "/noticias/listas-utiles-escolares",
  },
  {
    id: 2,
    slug: "actividades-mes-octubre",
    tipoArte: "gold",
    categoria: "Comunidad",
    fecha: "18 noviembre 2024",
    fechaISO: "2024-11-18",
    titulo: "Actividades del mes de octubre",
    descripcion:
      "Revisa los principales encuentros y experiencias de nuestra comunidad.",
    contenido: [
      "Durante octubre se realizaron diferentes actividades orientadas a fortalecer la participación y convivencia de nuestra comunidad educativa.",
      "Estudiantes, docentes y familias participaron en jornadas formativas, encuentros recreativos y actividades organizadas por nivel.",
      "Agradecemos el compromiso y entusiasmo demostrado por todos quienes formaron parte de estas iniciativas.",
    ],
    enlace: "/noticias/actividades-mes-octubre",
  },
  {
    id: 3,
    slug: "agosto-mes-de-campanas",
    tipoArte: "ink",
    categoria: "Convivencia",
    fecha: "31 julio 2024",
    fechaISO: "2024-07-31",
    titulo: "Agosto: mes de campañas",
    descripcion:
      "Iniciativas para fortalecer el bienestar y la buena convivencia escolar.",
    contenido: [
      "Durante agosto desarrollaremos diferentes campañas destinadas a promover el bienestar, el respeto y la buena convivencia escolar.",
      "Las actividades permitirán reflexionar sobre la importancia de construir espacios seguros e inclusivos para todos los integrantes de la comunidad.",
      "Invitamos a estudiantes y familias a participar activamente en cada una de las iniciativas programadas.",
    ],
    enlace: "/noticias/agosto-mes-de-campanas",
  },
];

export const documentos: Documento[] = [
  {
    id: 1,
    titulo: "Proyecto Educativo Institucional",
    categoria: "PEI · Documento institucional",
    tipo: "PDF",
    enlace:
      "/documents/proyecto-educativo-institucional.pdf",
  },
  {
    id: 2,
    titulo: "Reglamento Interno y de Convivencia",
    categoria: "Convivencia escolar",
    tipo: "PDF",
    enlace:
      "/documents/reglamento-interno-convivencia.pdf",
  },
  {
    id: 3,
    titulo: "Listas de útiles por nivel",
    categoria: "Kínder a 8° básico",
    tipo: "PDF",
    enlace: "/documents/listas-utiles.pdf",
  },
  {
    id: 4,
    titulo: "Cuenta Pública",
    categoria: "Gestión institucional",
    tipo: "PDF",
    enlace: "/documents/cuenta-publica.pdf",
  },
];

export const eventos: Evento[] = [
  {
    id: 1,
    dia: "05",
    mes: "MAR",
    categoria: "Comunidad",
    titulo: "Inicio de actividades escolares",
  },
  {
    id: 2,
    dia: "12",
    mes: "MAR",
    categoria: "Apoderados",
    titulo: "Reunión informativa por nivel",
  },
  {
    id: 3,
    dia: "21",
    mes: "MAR",
    categoria: "Convivencia",
    titulo: "Jornada de bienvenida",
  },
];

export function obtenerNoticiaPorSlug(
  slug: string,
): Noticia | undefined {
  return noticias.find(
    (noticia) => noticia.slug === slug,
  );
}