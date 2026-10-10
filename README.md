# Mefisto · candidata de publicación RC1

Estado: preparada para revisión local, no publicada. Esta candidata contiene únicamente Atlas de la memoria. El sitio y sus verificaciones funcionan desde esta carpeta; la exploración original se conserva intacta en `/Users/augusto-romero-arango/Documents/Codex/2026-10-09/sites-plugin-sites-openai-curated-remote/outputs/mefisto-direcciones/`.

## Estructura

- `site/`: raíz del sitio que se entregaría al proveedor de hosting. HTML, CSS, JavaScript y recursos locales; sin build, backend ni dependencias de ejecución.
- `review/`: comprobaciones y fuentes auxiliares. No se sube al hosting.
- `package.json`: comandos de verificación con Node 20 o posterior. No es necesario instalar paquetes para ejecutarlos.

## Qué quedó preparado

- Producto antes del relato; dos etapas, tres agentes TDD, CQRS, decisiones de arquitectura, experiencia de desarrollo y cierre de instalación.
- Navegación propia, sin selector de conceptos ni instrucciones del estudio creativo. Se mantienen las anclas `memoria-*` para las revisiones existentes.
- Enlaces de instalación y OpenCode actualizados; documentación dirigida a la guía del consumidor; enlace a la licencia Apache-2.0 del plugin.
- Ilustraciones WebP de 768 y 1536 píxeles, dimensiones declaradas y carga diferida de las imágenes inferiores. Las tres versiones grandes suman 1.168.412 bytes frente a 10.069.475 bytes de los originales: 88 % menos.
- Fuentes locales Baskervville, Source Sans 3 e IBM Plex Mono, con sus licencias OFL. No se hacen peticiones a Google Fonts desde la página.
- Captura de Fausto original. En Mefisto se ocultaron únicamente dos rutas locales, con autorización del autor; el resto de los píxeles permanece idéntico. La captura sin protección no está en `site/`.
- Favicon, icono móvil, imagen social de 1200 × 630, metadatos, canonical, sitemap y página 404. La imagen social tiene su fuente editable en `review/social-card.svg`.
- Enlace para saltar al contenido, foco visible, alternativas de imágenes, estados accesibles de la demostración, reducción de movimiento y navegación móvil sin enlaces ocultos.
- No se añadieron analítica, cookies, formularios ni servicios de terceros.

## Verificación

Desde esta carpeta:

```sh
npm test
npm run check:links
```

`npm test` comprueba estructura y anclas, recursos locales, metadatos, presupuesto de imágenes, la lógica de los tres estados del ejemplo, las dos mascotas y contraste de texto sobre los dos fondos sólidos. No renderiza la página ni sustituye una auditoría de accesibilidad.

`npm run check:links` comprueba recursos externos por HTTP y las anclas de Markdown usadas para instalación y OpenCode. Requiere red. Puede verse afectado por límites temporales del servidor.

Las pruebas se ejecutaron correctamente en esta entrega. También siguen pasando las comprobaciones de la exploración original. La revisión visual en navegador no se pudo realizar porque la automatización de la página local estaba restringida; no se usó otra superficie para eludir esa restricción.

## Antes de autorizar publicación

- [ ] Revisar visualmente en móvil (320, 390 y 768 px) y escritorio (1280 y 1600 px), incluyendo Safari y Chrome. Confirmar que las fuentes nuevas conservan los saltos, que el punto rojo de la i queda bien y que no hay desbordes ni texto sobre zonas de imagen de bajo contraste.
- [ ] Recorrer por teclado: salto al contenido, navegación, desplegables, capturas y demostración de eventos. Comprobar también con un lector de pantalla, zoom al 200 % y JavaScript desactivado.
- [ ] Aprobar copy, imágenes, captura protegida y vista previa social. Confirmar que las capacidades descritas siguen coincidiendo con la versión que se publicará del plugin.
- [ ] Elegir proveedor y confirmar permisos, acceso público, condiciones de hosting y compatibilidad de dominio. No se ha creado un Site ni contratado hosting.
- [ ] Guardar esta candidata en el repositorio que decida el autor y establecer un proceso de despliegue reversible. Esta carpeta aún no es un repositorio Git independiente.
- [ ] Probar en un entorno autorizado de prepublicación: HTTPS, rutas y 404, carga de fuentes, cabeceras, tamaños transferidos y métricas de rendimiento reales. Servir HTML con revalidación; no marcar recursos sin hash como inmutables.
- [ ] Conectar `mefisto.io` únicamente con autorización explícita, validar DNS/TLS y elegir si `www` redirige al dominio principal. No se modificó DNS.
- [ ] Antes de la salida pública, cambiar el meta robots a `index,follow` y `robots.txt` a `Allow: /`, añadir `Sitemap: https://mefisto.io/sitemap.xml` y ajustar las dos comprobaciones de indexación en `review/verify.cjs`. Los metadatos y el sitemap asumen ese dominio; revisarlos si el destino cambia.
- [ ] Ya en el dominio final, probar CTAs, anclas, URL social, HTTPS y 404. Validar que el sitio es accesible sin sesión. Revisar la representación real en buscadores y redes cuando estos rastreen la página.

La candidata incluye `noindex,nofollow` y `Disallow: /` como precaución de prepublicación. No son un mecanismo de privacidad: no sustituyen autenticación ni garantizan que una URL no aparezca en un buscador.

## Recursos y reproducción

Todos los recursos necesarios para servir el sitio están incluidos en `site/assets/`. Las ilustraciones originales y la captura sin protección siguen en la exploración, fuera de esta copia. Solo para regenerar los recursos, ejecutar `node review/prepare-assets.cjs /ruta/a/mefisto-direcciones`, indicando la carpeta de originales. El script requiere la biblioteca Sharp disponible en el entorno y no sobrescribe los originales. La comparación exige identidad exacta de los píxeles fuera de los dos rectángulos autorizados y relleno opaco dentro de ellos.

La imagen social es una composición vectorial de marca, no una nueva ilustración generada. Se rasterizó con Sharp; para regenerarla, renderizar `review/social-card.svg` a `site/assets/social-card.png` a 1200 × 630. Las tipografías del SVG deben estar disponibles en el entorno de renderizado; el PNG entregado no depende de ellas en el navegador.

Las fuentes se obtuvieron de Google Fonts; sus URLs figuran en `review/font-sources.json` y sus licencias completas viajan en `site/assets/fonts/`. La licencia Apache-2.0 enlazada corresponde al plugin, no supone una nueva licencia para todos los materiales visuales de esta web.

## Alcance de esta entrega

Se entrega una candidata revisable, no una certificación de producción. No hay despliegue, cuenta de hosting vinculada, cambios de DNS, mensajes externos ni publicación en GitHub. La revisión visual y la decisión de hosting son los siguientes pasos.
