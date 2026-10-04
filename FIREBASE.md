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
| Cualquiera | Ver los eventos y sus flyers |
| Quien ingresa con Google | Guardar su nombre y correo (para aparecer en la lista del admin) |
| Jefe de rama | Publicar eventos y editar o borrar **los suyos** |
| Administrador | Todo lo anterior, editar o borrar cualquier evento y asignar jefes |

## 4. Hacerte administrador (una sola vez)

1. Subí los cambios, abrí la página de calendario y tocá **Ingresar con Google** con tu cuenta.
2. En la consola: **Authentication → Usuarios**, copiá el **UID** de tu cuenta.
3. **Firestore Database → Datos → Iniciar colección** → ID de colección `roles` → ID del documento: **tu UID** → campo `rol` (string) = `admin` → Guardar.
4. Recargá la página: aparece el botón **Gestionar jefes**.

## 5. Habilitar jefes de rama

1. Pediles a los jefes que entren a la página de calendario y toquen **Ingresar con Google** (si tocan “Publicar evento” les va a decir que todavía no están habilitados).
2. Vos tocás **Gestionar jefes**, los buscás por nombre o correo, elegís **Jefe de rama** y su rama. Se guarda al instante; ellos recargan y ya pueden publicar.

Para quitarle el permiso a alguien, volvelo a **Usuario**.

## Límites del plan gratis

Sobra para la JM: 1 GB de datos (≈ 1.500 eventos con flyer), 50.000 lecturas y 20.000 escrituras por día. Cada flyer se guarda en hasta ~650 KB y la lista de eventos solo carga miniaturas.

## Datos que se guardan

| Colección | Contenido |
|---|---|
| `usuarios/{uid}` | nombre, correo, foto y último ingreso de quien entró con Google (solo lo ve el admin) |
| `roles/{uid}` | `rol` (`admin` o `jefe`) y `rama` |
| `eventos/{id}` | nombre, fecha, fecha de fin, hora, lugar, rama, alcance, descripción, costo, link de inscripción, información extra, miniatura y autor |
| `flyers/{id}` | imagen del flyer en tamaño completo |
| `propuestas_hitos/{id}` | hitos propuestos para la historia (los lee solo el admin) |
| `solicitudes_acceso/{id}` | pedidos de acceso a material con derechos de autor (los lee solo el admin) |
| `propuestas_material/{id}` | material o correcciones propuestas para la biblioteca (los lee solo el admin) |

Los pedidos de los formularios del sitio se ven en la consola de Firebase → Firestore → Datos.
