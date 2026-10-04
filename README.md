# JM Argentina · Itinerario y biblioteca formativa

Sitio de la Juventud Masculina de Schoenstatt Argentina: el **itinerario del grupo de vida** (texto completo + diagnóstico), una **biblioteca abierta** con todo el material ordenado, los **cuadernos de NotebookLM** por tema y la **historia de la JM Argentina**.

Es un sitio estático (HTML, CSS y JavaScript, sin compilación), pensado para publicarse gratis en GitHub Pages con dominio propio.

## Páginas

| Archivo | Qué es |
|---|---|
| `index.html` | Inicio |
| `itinerario.html` | Texto completo del itinerario + diagnóstico del grupo + preguntas frecuentes |
| `biblioteca.html` | Índice jerárquico (Talleres / Libros / Recursos / Con María, pasión que transforma) con buscador y links a Drive |
| `cuadernos.html` | Cuadernos de NotebookLM por tema |
| `historia.html` | Línea del tiempo, el Ideal Nacional y el símbolo |

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

## Cómo actualizar el contenido

- **Links de cuadernos, correo de contacto, reglas de acceso:** `assets/js/config.js`.
- **Materiales de la biblioteca:** `data/biblioteca.json`. Cada material tiene `titulo`, `carpeta` (ruta con ` / `), `formato`, `url`, `licencia` y `acceso` (`abierto`, `derechos` o `no-publicar`). Las carpetas nuevas aparecen solas en el índice.
- **Hitos de la historia:** lista `HITOS` en `assets/js/historia.js`.
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
- [ ] Comprar el dominio y agregar el `CNAME`.
