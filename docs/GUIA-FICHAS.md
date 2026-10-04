# Guía: fichas de material desde NotebookLM

Las fichas le dicen al asistente **para qué sirve cada material**: resumen, cómo usarlo con el grupo, rama, etapa del itinerario, temas y utilidad. NotebookLM no tiene una API pública para cuentas comunes, así que el circuito es: NotebookLM arma las fichas → la herramienta `herramientas/fichas.html` las reconoce → se sube `data/fichas.json`.

## 0. Antes de empezar
- Abrí la herramienta: `https://<tu-sitio>/herramientas/fichas.html` (en local: `http://localhost:8000/herramientas/fichas.html`). No figura en el menú.
- En la sección **0 · Plan de cuadernos** están los 15 cuadernos propuestos (503 materiales, sin cancioneros, videos ni repetidos), en orden de prioridad y divididos en lotes de 8.
- Si un cuaderno que ya existe tiene parte de esas fuentes, podés usarlo: preguntale “Listá todas las fuentes de este cuaderno” y completá lo que falte.

## 1. Armar cada cuaderno (una vez)
1. En NotebookLM: **Nuevo cuaderno** y ponele el nombre del plan (ej. “JM · Talleres Pioneros y Secundarios”).
2. **Agregar fuente → Drive** y buscá la carpeta que dice el plan (“En Drive: …”). Marcá varios archivos a la vez.
3. Los PDF y Google Docs entran directo. Si un `.doc` o `.docx` no aparece, abrilo en Drive con *Abrir con → Documentos de Google* y agregá esa copia.
4. Compartí el cuaderno con el equipo (Compartir → con las cuentas del Secretariado) para no depender de una sola cuenta.

## 2. Sacar las fichas (por lotes de 8)
1. En el panel de fuentes, **desmarcá todas** y marcá solo las 6 a 8 del lote.
2. Pegá el **prompt de fichas** (botón “Copiar prompt” en la herramienta) en el chat.
3. Copiá la respuesta completa (botón de copiar de NotebookLM).
4. En la herramienta: **pegá → Procesar → revisá → Guardar estas fichas**. Lo que guardes queda acumulado en ese navegador aunque cierres la página.
5. Repetí con el siguiente lote. Si una respuesta viene cortada, volvé a pedir solo las fuentes que faltaron.

## 3. Publicar
- Cada tanto: **Descargar fichas.json** y subilo al repo en `data/fichas.json` (GitHub → carpeta `data` → *Add file → Upload files* → *Commit changes*). El asistente lo usa apenas se publica.

## Consejos
- Revisá algunas fichas al azar: si NotebookLM inventa algo, corregilo editando el JSON o volvé a pedir esa fuente.
- El orden recomendado es el del plan: primero talleres, Ideal Nacional, retiros y dirigentes (lo que más se usa para preparar encuentros); el Magisterio al final.
- Una tanda de 8 lleva unos 3 minutos: el plan completo son ~63 tandas. Se puede repartir entre varias personas: cada uno usa la herramienta en su navegador, descarga su `fichas.json` y se juntan (la herramienta suma lo que ya está publicado).
