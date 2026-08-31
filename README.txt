TOP COMPUTER ONE PAGE

Marca:
Top Computer | venta de Ordenadores de Segunda mano de diversas marcas conocidas

Dominio:
https://toppcusados.com.es/

NOTA: inicialmente se había usado por error el dominio de VitamixTech
(vitamixtech.com.es, copiado de la plantilla). Corregido a
toppcusados.com.es en canonical, og:url, robots.txt, sitemap.xml y
el JSON-LD.

Teléfono caja y botones:
+34 914 46 85 03

Actividad:
Venta de ordenadores de segunda mano.

Incluye:
- Logo e isotipo proporcionados
- WhatsApp 24/365
- Atención telefónica
- Google Business
- YouTube
- Cal.com
- Formulario SMTP
- Chatbot n8n
- Mapa
- SEO One Page
- Secciones por tipos de equipos y marcas
- Mensaje de stock variable sin inventar disponibilidad concreta

Variables SMTP compartidas en Vercel:
SMTP_HOST=cp7124.webempresa.eu
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=soporte@kelatos.com
SMTP_PASS=[configurada únicamente en Vercel]
CONTACT_EMAIL=soporte@kelatos.com

El correo no aparece visible en la web; solo se utiliza en /api/contacto.

Google Analytics:
G-7TWJ9KMGV0

HISTORIAL: el repositorio era multipágina (13 páginas /servicios/ de
compra, financiación, garantía y postventa) y se convirtió a one-page;
esas páginas fueron eliminadas en commits anteriores. Como ya no
existen en el sitemap actual, se ha añadido middleware.mjs para
redirigir (301) cualquier URL antigua a la home, evitando 404 en
enlaces indexados o backlinks antiguos. Excluye /api/* y cualquier
ruta con extensión de archivo. Se añadió "@vercel/functions": "^2.0.3"
a package.json como dependencia de esta función.

REVISIÓN (fixes aplicados en esta pasada):
- Ya estaba bien: banner de cookies, schema.org (Store), sección SEO,
  menú móvil, borde blanco del chat, api/contacto.js con SMTP +
  nodemailer, teléfono consistente. No se ha modificado ninguno de
  estos.
- Google Analytics: no existía. Añadido G-7TWJ9KMGV0.
- Meta robots: no existía. Añadido.
- .navcall: el texto largo ("Atención Telefónica 24 horas 365 días")
  deformaba la píldora del menú. Acortado a solo el número (mismo
  número, +34 914 46 85 03) y añadido white-space:nowrap como
  salvaguarda.
- H1 de portada reescrito, corto, directo y totalmente afirmativo
  (sin condicionales tipo "pero no quieres..."), sin forzar ninguna
  marca concreta ya que es una tienda multimarca: "Ordenadores de
  segunda mano, revisados y listos para usar." Tamaño del H1
  aumentado: clamp(38-58px) → clamp(46-74px) en escritorio, 40px →
  48px en móvil.

REVISIÓN ADICIONAL (a petición del cliente, regla general de la familia):
- Quitada la pestaña/etiqueta rotada del hero (.hero-chip o
  .hero-tag) que sobresalía y se solapaba visualmente con la caja de
  información en anchos de tablet/escritorio medio (detectado con
  captura en vivo en AcerTech). Regla para toda la familia: no volver
  a añadir este tipo de elemento decorativo.
