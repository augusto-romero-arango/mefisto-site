# Mefisto · sitio web

Sitio estático de Mefisto, con la dirección visual Atlas de la memoria. Repositorio público: [augusto-romero-arango/mefisto-site](https://github.com/augusto-romero-arango/mefisto-site). Publicado en **[mefisto.io](https://mefisto.io/)** mediante GitHub Pages, con HTTPS obligatorio; `www.mefisto.io` y la dirección anterior de `github.io` redirigen al dominio principal.

## Estructura

- `site/`: fuentes HTML, CSS, JavaScript y recursos locales; sin backend ni dependencias de ejecución.
- `scripts/build.cjs`: adapta metadatos y rutas al destino de publicación, sin transformar el diseño.
- `dist/`: salida generada e ignorada por Git; es lo único que se entrega al hosting.
- `.github/workflows/pages.yml`: verifica y publica automáticamente los cambios de `main`; en los pull requests solo ejecuta pruebas.
- `review/`: comprobaciones y fuentes auxiliares. No se sube al hosting.
- `package.json`: comandos de verificación con Node 20 o posterior. No es necesario instalar paquetes para ejecutarlos.

## Qué quedó preparado

- Producto antes del relato; dos etapas, tres agentes TDD, CQRS, decisiones de arquitectura, experiencia de desarrollo y cierre de instalación.
- Navegación propia, sin selector de conceptos ni instrucciones del estudio creativo. Se mantienen las anclas `memoria-*` para las revisiones existentes.
- Enlaces de instalación y OpenCode actualizados; documentación dirigida a la guía del consumidor; enlace a la licencia Apache-2.0 del plugin.
- Ilustraciones WebP de 768 y 1536 píxeles, dimensiones declaradas y carga diferida de las imágenes inferiores. Las tres versiones grandes suman 1.168.412 bytes frente a 10.069.475 bytes de los originales: 88 % menos.
- Tres escenas complementarias integradas sin marco: los oficios de la obra en TDD, el historiador en el cuaderno y el territorio conectado junto a la arquitectura. Sus versiones de 1200 píxeles suman 449.504 bytes; las de 640, 123.714 bytes. Se cargan de forma diferida, fuera de la portada, y no quedan detrás del texto técnico.
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

`npm test` comprueba estructura y anclas, recursos locales, metadatos, presupuesto de imágenes, la lógica de los tres estados del ejemplo, las dos mascotas y contraste de texto sobre los dos fondos sólidos. También verifica la preparación para un subdirectorio de GitHub Pages y para un dominio propio: canonical, imagen social, sitemap, indexación y enlaces de la página 404, incluso desde URL inexistentes anidadas. No renderiza la página ni sustituye una auditoría de accesibilidad.

`npm run check:links` comprueba recursos externos por HTTP y las anclas de Markdown usadas para instalación y OpenCode. Requiere red. Puede verse afectado por límites temporales del servidor.

`review/status.json` conserva el informe de la revisión local previa al despliegue, no el estado en vivo del servicio. Los resultados actuales de pruebas y despliegues están en [Actions](https://github.com/augusto-romero-arango/mefisto-site/actions).

## Publicación en GitHub Pages

En Settings → Pages, la fuente debe ser **GitHub Actions**. Cada push a `main` ejecuta las verificaciones, prepara los archivos usando la URL que informa Pages y despliega el resultado. También se puede ejecutar manualmente desde Actions. No requiere instalar dependencias ni guardar credenciales personales en el repositorio; el despliegue utiliza los permisos acotados del workflow.

Para preparar la misma salida localmente, sin publicar:

```sh
npm run build -- https://mefisto.io/
```

El proceso no modifica `site/` y puede volver a ejecutarse sobre su propia salida. Si encuentra archivos ajenos en `dist/`, se detiene para que se revisen; no los borra ni publica por accidente.

La indexación la controla la variable de Actions `SITE_INDEXABLE`. Hoy vale `true`: la página publica `index,follow` y `robots.txt` referencia `https://mefisto.io/sitemap.xml`, lo que no garantiza la inclusión en buscadores. Sin la variable, el build usa `noindex,follow`.

### Dominio `mefisto.io`

- **Pages:** dominio propio `mefisto.io`, verificado en la cuenta de GitHub y con "Enforce HTTPS" activo.
- **DNS (GoDaddy):** cuatro registros `A` en `@` hacia `185.199.108.153`, `185.199.109.153`, `185.199.110.153` y `185.199.111.153`; `CNAME` de `www` hacia `augusto-romero-arango.github.io`; TXT `_github-pages-challenge-augusto-romero-arango` para la verificación. No debe haber forwarding ni Website Builder sobre el dominio.
- **Workflow:** canonical, imagen social, sitemap y enlaces de la página 404 adoptan la URL informada por Pages. El build exige HTTPS, así que el workflow normaliza `http://` a `https://`; mientras GitHub no emite el certificado, Pages informa la URL con `http://`.
- Si el certificado se queda en estado `new` con el DNS correcto, abrir Settings → Pages en el navegador destraba la emisión.

Para deshacer un cambio, revertir su commit en `main` y dejar que el workflow vuelva a publicar. El historial de Git y Actions conserva la trazabilidad; no es necesario reescribir ramas ni borrar versiones.

Referencias: [workflow de Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) y [dominio propio](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

## Revisión pendiente

- [ ] Revisar visualmente en móvil (320, 390 y 768 px) y escritorio (1280 y 1600 px), incluyendo Safari y Chrome. Confirmar que las fuentes nuevas conservan los saltos, que el punto rojo de la i queda bien y que no hay desbordes ni texto sobre zonas de imagen de bajo contraste.
- [ ] Recorrer por teclado: salto al contenido, navegación, desplegables, capturas y demostración de eventos. Comprobar también con un lector de pantalla, zoom al 200 % y JavaScript desactivado.
- [ ] Aprobar copy, imágenes, captura protegida y vista previa social. Confirmar que las capacidades descritas siguen coincidiendo con la versión que se publicará del plugin.
- [ ] Probar en un entorno autorizado de prepublicación: HTTPS, rutas y 404, carga de fuentes, cabeceras, tamaños transferidos y métricas de rendimiento reales. Servir HTML con revalidación; no marcar recursos sin hash como inmutables.
- [x] Conectar `mefisto.io`, validar DNS/TLS y redirigir `www` al dominio principal.
- [x] Activar la indexación con `SITE_INDEXABLE=true`.
- [ ] Ya en el dominio final, probar CTAs, anclas, URL social, HTTPS y 404. Validar que el sitio es accesible sin sesión. Revisar la representación real en buscadores y redes cuando estos rastreen la página.

## Recursos y reproducción

Las escenas complementarias se generaron con la herramienta integrada Imagegen. Sus prompts completos y rutas finales están en `review/story-art.json`. Para preparar las variantes web desde los tres PNG originales, ejecutar `node review/prepare-story-art.cjs /ruta/oficios.png /ruta/historiador.png /ruta/territorio.png`, con Sharp disponible en el entorno. Solo cambia tamaño y compresión; opacidad y bordes desvanecidos se aplican con CSS en `site/styles/story-art.css`. Son acompañamiento editorial decorativo: no sustituyen el texto ni los diagramas, ni afirman representar escenas literales de Goethe.

Todos los recursos necesarios para servir el sitio están incluidos en `site/assets/`. Las ilustraciones originales y la captura sin protección siguen en la exploración, fuera de esta copia. Solo para regenerar los recursos, ejecutar `node review/prepare-assets.cjs /ruta/a/mefisto-direcciones`, indicando la carpeta de originales. El script requiere la biblioteca Sharp disponible en el entorno y no sobrescribe los originales. La comparación exige identidad exacta de los píxeles fuera de los dos rectángulos autorizados y relleno opaco dentro de ellos.

La imagen social es una composición vectorial de marca, no una nueva ilustración generada. Se rasterizó con Sharp; para regenerarla, renderizar `review/social-card.svg` a `site/assets/social-card.png` a 1200 × 630. Las tipografías del SVG deben estar disponibles en el entorno de renderizado; el PNG entregado no depende de ellas en el navegador.

Las fuentes se obtuvieron de Google Fonts; sus URLs figuran en `review/font-sources.json` y sus licencias completas viajan en `site/assets/fonts/`. La licencia Apache-2.0 enlazada corresponde al plugin, no supone una nueva licencia para todos los materiales visuales de esta web.

## Alcance de esta entrega

El sitio sigue siendo una versión revisable, no una certificación de producción. El flujo de publicación comprueba el código y la preparación de los archivos; no certifica accesibilidad, rendimiento real ni capacidades del plugin. GitHub Pages sirve archivos estáticos y gestiona las cabeceras del hosting. No se han añadido servicios de backend ni analítica.
