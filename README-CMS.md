# Mantenedor de contenidos

Requiere Node.js >=22.13 y servidor Next.js con runtime Node. No admite exportación estática.

## Inicio local

1. Ejecutar `npm install`.
2. Copiar `.env.example` a `.env.local` únicamente si aún no existe.
3. Configurar ADMIN_EMAIL, ADMIN_PASSWORD_HASH y SESSION_SECRET (32 caracteres o más).
4. Opcional: `npm run db:seed` importa las noticias antiguas y los PDF existentes en public/documents, sin sobrescribir contenidos.
5. Ejecutar `npm run dev` y abrir http://localhost:3000/admin.

En este entorno ya se configuró el usuario local solicitado. Su contraseña está almacenada como hash scrypt; no es necesario volver a configurar el acceso.

Para generar una credencial nueva, definir temporalmente ADMIN_PASSWORD en el entorno y ejecutar `npm run auth:hash` (mínimo 16 caracteres). Copiar la línea ADMIN_PASSWORD_HASH resultante a la configuración del servidor y retirar ADMIN_PASSWORD del entorno. No pasar contraseñas como argumentos del comando ni guardarlas en Git.
SESSION_SECRET puede generarse con `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

Solo en desarrollo se acepta ADMIN_PASSWORD como alternativa al hash. Producción exige ADMIN_PASSWORD_HASH; usar una contraseña distinta a la de pruebas y HTTPS.

## Experiencia de administración

- Biblioteca con paginación SQL: 5, 10, 20 o 50 contenidos por página.
- Búsqueda por título/categoría, filtros por tipo y estado, orden por cambios, fecha o título.
- Los filtros permanecen al cambiar de página; una página fuera de rango se ajusta a la última.
- Resumen de noticias, documentos y calendario; enlaces para editar o ver el contenido.
- Formularios con URL automática editable, vista previa textual, contador del resumen, indicador de cambios y confirmación al salir mediante enlaces o cerrar la pestaña. El historial del navegador no se intercepta.
- Formularios conservan los campos cuando el servidor rechaza una operación.
- PDF de hasta 5 MB, con validación en cliente y servidor y reemplazo opcional.
- La eliminación está en una sección desplegable y requiere confirmación.
- Desmarcar Publicado guarda un borrador. La fecha describe el contenido; no programa su publicación.
- Los cambios son visibles sin recompilar. El calendario filtra por mes/año e incluye fecha final opcional, hora local y lugar.
- Los eventos de ejemplo originales no se importan porque no tenían año ni fecha completa.

## Seguridad

- Contraseñas con scrypt, salt aleatorio, N=32768, r=8, p=1. El servidor solo acepta el hash en producción.
- Sesiones opacas de 256 bits: la base conserva únicamente el hash del token.
- Cookies HttpOnly, SameSite=Strict, Secure en producción; vencimiento absoluto de 8 horas y de 30 minutos sin solicitudes autenticadas.
- Cerrar sesión revoca el token en el servidor. /admin/seguridad permite cerrar todas las sesiones con confirmación.
- Cambiar el correo, la credencial o SESSION_SECRET invalida las sesiones anteriores.
- Límite global compartido de 10 intentos de acceso por ventana de 15 minutos. No se confía en cabeceras IP proporcionadas por el cliente. Este límite puede bloquear al administrador temporalmente ante abuso; en un despliegue público conviene agregar límites por IP en el proxy confiable.
- Cada mutación verifica autorización y origen; Next.js mantiene su protección de origen. Si hay un proxy que cambia Host, configurar ADMIN_ORIGIN con el origen público exacto, sin ruta.
- Las actualizaciones y eliminaciones comprueban la versión del contenido en la base para evitar sobrescribir cambios de otra pestaña.
- Consultas parametrizadas; campos validados; mensajes públicos sin detalles internos de errores.
- Cabeceras del panel: no-cache/no-store, anti-iframe, sin indexación y política que restringe base-uri, object-src y form-action. No es una CSP estricta de scripts.
- Registro de accesos y cambios: últimos 30 movimientos visibles; retención de 90 días, limpiada al registrar actividad. No registra contraseñas ni tokens.
- Sin registro público: un administrador por entorno. MFA y roles múltiples no están implementados.
- Los PDF se entregan como descarga; se valida extensión, tamaño, MIME y cabecera. No incluye antivirus.

## Base de datos y respaldos

SQLite usa data/cms.sqlite y archivos locales en data/uploads. Respaldar ambos. Este modo requiere disco persistente y una sola instancia.

`docker compose up -d postgres` inicia PostgreSQL local.
Configurar `DATABASE_URL=postgresql://yangtse:yangtse_local@localhost:5432/yangtse`.
Cambiar DATABASE_URL no mueve los datos automáticamente.

Para trasladar contenido:
1. Con la base origen: `npm run db:export -- respaldo.json`.
2. Configurar la base destino vacía.
3. `npm run db:import -- respaldo.json`.

Se conservan los IDs y referencias de contenido. Copiar también data/uploads si se mantienen archivos locales. La transferencia no copia sesiones, intentos ni auditoría. Guardar respaldos fuera del directorio público y de Git.
Las tablas e índices nuevos se crean de forma aditiva, sin borrar contenido existente. Los cambios futuros de estructura requieren migraciones explícitas.

## Supabase Storage

Crear un bucket PRIVADO llamado colegio-documentos, tamaño máximo 5 MB y MIME application/pdf.
Configurar STORAGE_PROVIDER=supabase, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY y SUPABASE_STORAGE_BUCKET.
La clave service role es exclusivamente de servidor, nunca NEXT_PUBLIC.
No habilitar cargas anónimas ni descargas públicas: /archivos/[id] verifica publicación o sesión.
Cambiar el proveedor afecta las cargas futuras; los archivos existentes conservan su proveedor.
Si falla la limpieza de un archivo anterior, el panel lo informa y el servidor registra el identificador para limpieza manual.

Los documentos históricos en public/documents siguen accesibles por su URL original; moverlos fuera de public si deben ser privados.
No se crearon proyectos ni buckets remotos. Consultar los límites actuales del plan elegido antes de desplegar.

## Verificación

`npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.

Para navegador: definir TEST_ADMIN_PASSWORD solo en el entorno del proceso de pruebas y ejecutar `npm run test:integration`. Puede usarse PLAYWRIGHT_CHANNEL=chrome si Chrome ya está instalado. No guardar TEST_ADMIN_PASSWORD en el repositorio.

Se prueban publicación, borradores, PDF, paginación, filtros, conflictos de versión, autorización, sesiones caducadas, revocación y reutilización de cookies después del cierre de sesión.
Las pruebas crean y eliminan únicamente sus propios contenidos temporales. Las pruebas de seguridad en base de datos usan SQLite temporal aislado.

Referencias: [Next.js: seguridad de datos](https://nextjs.org/docs/app/guides/data-security), [OWASP: gestión de sesiones](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) y [Supabase: control de acceso](https://supabase.com/docs/guides/storage/security/access-control).

