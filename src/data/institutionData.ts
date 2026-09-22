export const institutionData = {
  name: "Colegio Yangtsé",

  slogan:
    "Educar con amor por el sendero de la excelencia.",

  location: {
    address:
      "Av. Alcalde Fernando Castillo Velasco 7631",
    commune: "La Reina",
    city: "Santiago",
    region: "Región Metropolitana",

    googleMapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Av.+Alcalde+Fernando+Castillo+Velasco+7631,+La+Reina,+Chile",
  },

  phones: [
    {
      label: "Contacto principal",
      display: "+56 2 2520 1346",
      href: "tel:+56225201346",
    },
    {
      label: "Contacto alternativo",
      display: "+56 2 2520 1351",
      href: "tel:+56225201351",
    },
  ],

  emails: [
    {
      label: "Correo institucional",
      address: "cyangtse@corp-lareina.cl",
      href: "mailto:cyangtse@corp-lareina.cl",
    },
    {
      label: "Dirección",
      address: "mrojas@corp-lareina.cl",
      href: "mailto:mrojas@corp-lareina.cl",
    },
  ],

  publicHours: {
    days: "Lunes a viernes",
    hours: "08:30 a 16:30 horas",
    short: "Lunes a viernes · 08:30 a 16:30 hrs.",
  },

  principal: "Marcela Rojas Cantillana",

  academicSchedule:
    "Jornada Escolar Completa (JEC)",

  statistics: {
    students: 635,
    teachers: 27,
  },
} as const;