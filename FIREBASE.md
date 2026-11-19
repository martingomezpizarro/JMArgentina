# Calendario y eventos: cómo activar Firebase

La página `calendario.html` (y los formularios “Proponer un hito”, “Solicitar acceso” y “Proponer material”) usa **Firebase** (de Google, gratis en el plan Spark) para tres cosas:

- **Ingresar con Google.**
- **Roles:** vos sos administrador y habilitás a los jefes de rama.
- **Guardar los eventos** (con su flyer) para que los vea todo el mundo.

Mientras `firebase` esté vacío en `assets/js/config.js`, la página funciona en **modo demostración**: eventos de ejemplo guardados solo en tu navegador y un selector “Ver como” para probar cómo la ve un visitante, un usuario, un jefe o el administrador.

No hace falta Cloud Storage (que ahora pide tarjeta): los flyers se achican en el navegador y se guardan en Firestore.

## 1. Crear el proyecto

1. Entrá a <https://console.firebase.google.com> con la cuenta de la JM (o la tuya) → **Agregar proyecto** → nombre `jm-argentina`. Google Analytics no hace falta.
2. En la pantalla del proyecto, tocá el ícono **Web `</>`** → nombre `Sitio JM` → **Registrar app** (sin Hosting).
3. Te muestra un bloque `const firebaseConfig = { ... }`. Copiá esos valores en `assets/js/config.js`:

```js
firebase: {
  apiKey: 'AIza…',
  authDomain: 'jm-argentina.firebaseapp.com',
  projectId: 'jm-argentina',
  storageBucket: 'jm-argentina.firebasestorage.app',
  messagingSenderId: '…',
  appId: '1:…:web:…'
},
```

Estos datos **no son secretos** (son públicos en cualquier sitio que use Firebase); lo que protege los datos son las reglas del paso 3.

## 2. Activar el ingreso con Google

1. **Compilación → Authentication → Comenzar → Google → Habilitar**, elegí el correo de asistencia y guardá.
2. **Authentication → Configuración → Dominios autorizados → Agregar dominio**:
   - `martingomezpizarro.github.io`
   - el dominio propio cuando lo tengamos (p. ej. `jmargentina.com.ar` y `www.jmargentina.com.ar`).
   - `localhost` ya viene agregado para probar en tu compu.

## 3. Crear la base de datos y pegar las reglas

1. **Compilación → Firestore Database → Crear base de datos**, ubicación `southamerica-east1 (São Paulo)`, modo **producción**.
2. Pestaña **Reglas**: borrá lo que haya, pegá todo el contenido de [`firestore.rules`](firestore.rules) y tocá **Publicar**.

Las reglas hacen que:

| Quién | Qué puede hacer |
|---|---|
| Cualquiera | Ver los eventos, sus flyers y las fichas de las ramas |
| Quien ingresa con Google | Guardar su nombre y correo (para aparecer en la lista del admin) |
| Jefe de rama | Publicar eventos y editar o borrar **los suyos**; completar y editar la ficha **de su rama** |
| Administrador | Todo lo anterior, editar o borrar cualquier evento, completar cualquier ficha y asignar jefes |

## 4. Hacerte administrador (una sola vez)

1. Subí los cambios, abrí la página de calendario y tocá **Ingresar con Google** con tu cuenta.
2. En la consola: **Authentication → Usuarios**, copiá el **UID** de tu cuenta.
3. **Firestore Database → Datos → Iniciar colección** → ID de colección `roles` → ID del documento: **tu UID** → campo `rol` (string) = `admin` → Guardar.
4. Recargá la página: aparece el botón **Gestionar jefes**.

## 5. Habilitar jefes de rama

Desde **Calendario → Gestionar jefes** tenés dos formas:

- **Por mail (más rápido):** en *Habilitar por mail* escribí el Gmail del jefe, elegí **Jefe de rama** y su rama, y tocá **Habilitar**. Si esa persona ya había ingresado, queda habilitada al instante (tiene que recargar). Si todavía no ingresó, queda en *Habilitados por mail que todavía no ingresaron* y se activa sola la primera vez que ingrese con Google con ese correo, desde cualquier página del sitio.
- **De la lista:** quien ya ingresó con Google (en cualquier página) aparece en *Personas que ya ingresaron*; elegí **Jefe de rama** y su rama. Se guarda al instante.

Para quitarle el permiso a alguien, volvelo a **Usuario**.

### Registro de cambios

En **Calendario → Registro de cambios** (solo lo ve el administrador) aparece quién creó, editó o borró cada evento y cada ficha de rama, y quién habilitó o quitó jefes, con fecha, hora, correo y qué cambió (antes → después). Desde ahí mismo podés **Quitar como jefe** a quien hizo un cambio.

Las reglas exigen que cada cambio en eventos y fichas se guarde junto con su entrada en el registro, con el usuario y la hora reales: aunque alguien modifique la página, no puede cambiar nada sin quedar anotado. Nadie puede editar ni borrar el registro, ni siquiera el admin. Lo que se cambió antes de publicar estas reglas no quedó registrado.

### Fichas de las ramas

En **Ramas**, cada ficha muestra el botón **Completar la ficha** solo al administrador y al jefe de esa rama. La rama que elegís en “Gestionar jefes” tiene que ser exactamente la de la ficha (p. ej. `JM Córdoba`). Las reglas de Firestore lo controlan también del lado del servidor: aunque alguien modifique la página, no puede escribir la ficha de otra rama.

**Cada vez que cambie `firestore.rules`, hay que volver a pegarlo en Firestore → Reglas → Publicar.**

## Límites del plan gratis

Sobra para la JM: 1 GB de datos (≈ 1.500 eventos con flyer), 50.000 lecturas y 20.000 escrituras por día. Cada flyer se guarda en hasta ~650 KB y la lista de eventos solo carga miniaturas.

## Datos que se guardan

| Colección | Contenido |
|---|---|
| `usuarios/{uid}` | nombre, correo, foto y último ingreso de quien entró con Google (solo lo ve el admin) |
| `roles/{uid}` | `rol` (`admin` o `jefe`) y `rama` |
| `registro/{id}` | registro de cambios: `tipo`, `accion`, quién (`uid`, `nombre`, `email`), `fecha`, `antes` y `despues` |
| `invitaciones/{correo}` | habilitaciones por mail pendientes: `rol` y `rama`; se borran solas cuando la persona ingresa |
| `eventos/{id}` | nombre, fecha, fecha de fin, hora, lugar, rama, alcance, descripción, costo, link de inscripción, información extra, miniatura y autor |
| `flyers/{id}` | imagen del flyer en tamaño completo |
| `fichas_ramas/{id}` | ficha de cada rama: quiénes somos, encuentros, grupos de vida, jefe, contacto, Instagram, video y actividades (el `id` es el de `data/ramas.json`) |
| `fichas_fotos/{id}` | hasta 6 fotos de la ficha, achicadas |
| `propuestas_hitos/{id}` | hitos propuestos para la historia (los lee solo el admin) |
| `solicitudes_acceso/{id}` | pedidos de acceso a material con derechos de autor (los lee solo el admin) |
| `propuestas_material/{id}` | material o correcciones propuestas para la biblioteca (los lee solo el admin) |

Los pedidos de los formularios del sitio se ven en la consola de Firebase → Firestore → Datos.
