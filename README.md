# JM Argentina · Itinerario y biblioteca formativa

Sitio de la Juventud Masculina de Schoenstatt Argentina: el **itinerario del grupo de vida** (texto completo + diagnóstico), una **biblioteca abierta** con todo el material ordenado, los **cuadernos de NotebookLM** por tema, el **calendario de eventos** (los jefes de rama publican con su cuenta de Google), el **mapa de ramas y santuarios** y la **historia de la JM Argentina**. Se puede instalar en el celular como app.

Es un sitio estático (HTML, CSS y JavaScript, sin compilación), pensado para publicarse gratis en GitHub Pages con dominio propio.

## Páginas

| Archivo | Qué es |
|---|---|
| `index.html` | Inicio: qué es la plataforma, para quién, qué tiene, de dónde sale y recorrido guiado |
| `itinerario.html` | Texto completo del itinerario (justificado) con el diagnóstico y las preguntas en una tarjeta lateral |
| `asistente.html` | Asistente: preguntas guiadas o texto libre → material recomendado con motivos y pregunta lista para NotebookLM |
| `biblioteca.html` | Índice jerárquico (Talleres / Libros / Recursos / Con María, pasión que transforma) con buscador y links a Drive |
| `cuadernos.html` | Cuadernos de NotebookLM por tema |
| `historia.html` | Línea del tiempo con fichas por hito, el Ideal, el símbolo, la oración y las estrategias |
| `calendario.html` | Calendario mensual y agenda. Ingreso con Google; los jefes de rama publican eventos (fecha, descripción, flyer, costo, info extra) y el administrador habilita jefes. Ver [FIREBASE.md](FIREBASE.md) |
| `ramas.html` | Mapa de los santuarios de Schoenstatt en Argentina con las fichas de cada rama |

## Verlo en tu compu

La biblioteca carga `data/biblioteca.json`, así que hay que abrirlo con un servidor local (abrir el `.html` con doble clic no alcanza):

```bash
python3 -m http.server 8000
# y abrir http://localhost:8000
```

En Windows sirve `py -m http.server 8000`, o la extensión *Live Server* de VS Code.

## Publicarlo con GitHub Pages

1. En el repo: **Settings → Pages**.
2. En *Build and deployment* elegir **Deploy from a branch**, rama `main`, carpeta `/ (root)` y guardar.
3. En uno o dos minutos queda en `https://martingomezpizarro.github.io/JMArgentina/`.

### Cuando tengamos el dominio

1. Crear en la raíz del repo un archivo `CNAME` con una sola línea, por ejemplo `jmargentina.com.ar` (o `www.jmargentina.com.ar`).
2. En el proveedor del dominio (NIC Argentina delega a un DNS, p. ej. Cloudflare):
   - Para el dominio raíz, registros **A** hacia `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
   - Para `www`, un **CNAME** hacia `martingomezpizarro.github.io`.
3. En **Settings → Pages** escribir el dominio en *Custom domain* y activar **Enforce HTTPS**.

## App del celular

El sitio es una PWA: desde el celular, abrirlo en Chrome → menú → **Instalar app** (en iPhone: Safari → Compartir → **Agregar a inicio**). Usa el símbolo nacional como ícono.

- Íconos: `assets/icons/` (192, 512, versión *maskable* para Android, `apple-touch-icon` para iPhone) y `favicon.ico`.
- Imagen para compartir en WhatsApp/redes: `assets/img/og-image.png`.
- `manifest.webmanifest` (nombre, colores, accesos directos) y `sw.js` (funciona sin conexión en las páginas ya visitadas). Si cambiás archivos importantes, subí `VERSION` en `sw.js`.

## Cómo actualizar el contenido

- **Links de cuadernos, correo de contacto, reglas de acceso:** `assets/js/config.js`.
- **Materiales de la biblioteca:** `data/biblioteca.json`. Cada material tiene `titulo`, `carpeta` (ruta con ` / `), `formato`, `url`, `licencia` y `acceso` (`abierto`, `derechos` o `no-publicar`). Las carpetas nuevas aparecen solas en el índice.
- **Hitos y estrategias de la historia:** `data/historia.js` (cada hito tiene su ficha: párrafos, listas, cita y fuente).
- **Fichas de materiales para el asistente:** `data/fichas.json`. Cada ficha se vincula a un material por su link de Drive y puede tener `resumen`, `etapa`, `temas` y `utilidad`. Es el lugar para cargar los resúmenes que salgan de NotebookLM.
- **Reglas del asistente** (temas, palabras clave, ramas): al inicio de `assets/js/asistente.js`.
- **Calendario (Firebase):** pasos en [FIREBASE.md](FIREBASE.md); reglas de seguridad en `firestore.rules`.
- **Santuarios y fichas de ramas:** `data/ramas.json`. Cada santuario tiene `lat`/`lng` (aproximadas, a corregir); cada rama es una ficha con `descripcion`, `jefe`, `instagram`, `encuentros`, `gruposDeVida`, `actividades`, `fotos` (lista de URLs), `video` (YouTube) y `contacto`.
- **Preguntas del diagnóstico, material recomendado por etapa y preguntas frecuentes:** `assets/js/itinerario.js`.
- **Texto del itinerario:** directamente en `itinerario.html`.
- **Colores y tipografía** (según el Manual del logo): variables al inicio de `assets/css/styles.css`. Se usa Montserrat como reemplazo web de Gotham.

## Derechos de autor

Mientras se define el tema, `mostrarMaterialConDerechos` está en `false`: los libros con derechos vigentes aparecen en el índice con un botón **Solicitar acceso** en lugar del link. Las copias no oficiales (`no-publicar`) nunca se muestran. Cambiando ese valor en `config.js` se habilitan todos los links.

## Pendientes

- [ ] Confirmar el correo de contacto (`contactoAcceso` en `config.js`).
- [ ] Confirmar qué contiene cada cuaderno de NotebookLM y crear los propuestos.
- [ ] Revisar el tema de derechos de autor del material.
- [ ] Completar el origen de la JM en la línea del tiempo y revisar fechas (JNJ Paraná 2024, Ideal 20/08/2018).
- [ ] Comprar el dominio y agregar el `CNAME`. Después, poner la URL completa en `og:image` de cada página.
- [ ] Activar Firebase para el calendario y hacerte administrador (FIREBASE.md).
- [ ] Corregir las coordenadas de los santuarios y revisar qué ramas van en cada uno.
- [ ] Definir cómo completa cada jefe la ficha de su rama (formulario con el mismo login de Google).
