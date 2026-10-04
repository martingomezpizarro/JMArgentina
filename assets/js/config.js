/*
 * Configuración general del sitio.
 * Editá este archivo para cambiar links de cuadernos o reglas de la biblioteca
 * sin tocar el resto del código.
 */
window.JM_CONFIG = {
  // Si es true, la biblioteca muestra el link de TODOS los materiales,
  // incluidos los libros con derechos de autor vigentes.
  // Mientras se define el tema de derechos, queda en false.
  mostrarMaterialConDerechos: false,

  // Las copias no oficiales (descargadas de sitios como z-library) nunca se enlazan.
  mostrarCopiasNoOficiales: false,

  // Correo o formulario para pedir acceso a material de uso interno.
  contactoAcceso: 'mailto:jm.sch.argentina@gmail.com?subject=Pedido%20de%20acceso%20a%20material%20-%20Biblioteca%20JM',

  // Instagram de la JM Nacional (se usa en el aviso para pedir eventos y en las fichas de ramas).
  instagram: 'https://www.instagram.com/jm.argentina/',

  // Calendario y eventos: datos del proyecto de Firebase (ver FIREBASE.md).
  // Mientras esté vacío, la página de calendario funciona en "modo demostración"
  // con eventos de ejemplo guardados solo en tu navegador.
  firebase: {
    apiKey: 'AIzaSyCgRYXOpwUbYl8p5HnSYIGoun7GGrKnEO4',
    authDomain: 'jm-argentina.firebaseapp.com',
    projectId: 'jm-argentina',
    storageBucket: 'jm-argentina.firebasestorage.app',
    messagingSenderId: '690923477462',
    appId: '1:690923477462:web:ada8a97785e4a5d49b2c77'
  },

  // Botones "Proponer un hito", "Solicitar acceso" y "Proponer material".
  acciones: {
    // Cuando esté el inicio de sesión (JM_AUTH), solo los usuarios logueados pueden usarlos.
    requiereLogin: true,
    // Mientras no haya inicio de sesión: 'correo' = el formulario arma un mail; null = muestra "muy pronto".
    modoProvisorio: 'correo',
    correo: 'jm.sch.argentina@gmail.com'
  },

  // Carpeta raíz de la biblioteca en Google Drive.
  carpetaDrive: 'https://drive.google.com/drive/folders/129jnPLVrK0Vor6_yo7MNZCI9amVqJGJN',

  // Cuadernos de NotebookLM por tema. "url": null = cuaderno propuesto, todavía no creado.
  cuadernos: [
    {
      tema: 'Itinerario y grupos de vida',
      url: 'https://notebook.google.com/notebook/c51f16d1-48f5-4db1-a435-3201f4e17c5d',
      etapas: [1, 2, 3, 4],
      descripcion: 'El itinerario completo, el manual del jefe de rama y los talleres por etapa. [Confirmar contenido]',
      pregunta: '¿Qué dinámica uso para un grupo nuevo que todavía no se conoce?'
    },
    {
      tema: 'Padre Kentenich y Schoenstatt',
      url: 'https://notebook.google.com/notebook/68f2483d-05ef-46a4-901a-3b664dc6cc2f',
      etapas: [2, 3, 4],
      descripcion: 'Historia fundacional, textos del PK y pedagogía schoenstattiana. [Confirmar contenido]',
      pregunta: 'Explicame la solidaridad de destinos para chicos de 20 años.'
    },
    {
      tema: 'Ideal Nacional y mística',
      url: 'https://notebook.google.com/notebook/7eca0a30-9aac-43b2-9e47-309c779d32d9',
      etapas: [2, 3],
      descripcion: 'Camino recorrido, manual de mística, símbolo nacional y oraciones. [Confirmar contenido]',
      pregunta: '¿Qué hito propone la mística para la etapa de secundarios?'
    },
    {
      tema: 'Magisterio · La palabra de los Papas',
      url: null,
      etapas: [1, 4],
      descripcion: 'Encíclicas y exhortaciones, una sección por Papa con el año de cada documento.',
      pregunta: '¿Qué dice Christus vivit sobre la amistad?'
    },
    {
      tema: 'Talleres JM por rama',
      url: null,
      etapas: [1, 2, 3],
      descripcion: 'Todos los talleres de Pioneros, Secundarios y Universitarios.',
      pregunta: 'Dame un taller de una hora sobre la alianza para secundarios.'
    },
    {
      tema: 'Espiritualidad y sexualidad',
      url: null,
      etapas: [3, 4],
      descripcion: 'Oración, santos, virtudes, sexualidad y matrimonio.',
      pregunta: '¿Qué libro recomendás para hablar de noviazgo en el grupo?'
    }
  ]
};
