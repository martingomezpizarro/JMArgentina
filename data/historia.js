/*
 * Contenido de la Historia de la JM Argentina.
 * Fuentes: "Buscando nuestra misión · Camino recorrido · Ideal Nacional JM Argentina" (preparación al Congreso 2018),
 * "El camino al símbolo nacional" y "Manual de Mística con el Ideal Nacional".
 * Para sumar un hito, agregá un objeto a HITOS (key: true = hito destacado).
 */
window.JM_HISTORIA = (function () {
  var CR = 'Buscando nuestra misión · Camino recorrido (2018)';
  var CS = 'El camino al símbolo nacional';
  var MM = 'Manual de Mística con el Ideal Nacional';

  var HITOS = [
    {
      anio: '[año]', cat: 'Encuentros nacionales', titulo: 'Origen de la JM en Argentina',
      resumen: '[A completar por el equipo nacional: primeras ramas y fundadores.]',
      parrafos: [
        'Esta ficha queda abierta para que el Secretariado Nacional y las ramas cuenten cómo empezó la Juventud Masculina de Schoenstatt en Argentina: las primeras ramas, quiénes la impulsaron y los primeros encuentros.',
        'Si tenés fotos, fechas o testimonios de esos años, usá el botón “Proponer un hito”.'
      ],
      pendiente: true
    },
    {
      anio: '2007–2010', cat: 'Corrientes de vida', titulo: 'Patria de María',
      resumen: 'Rumbo al Bicentenario, la JM se compromete a teñir de celeste y blanco cada rincón de la Patria con el Pacto del Bicentenario.',
      cita: 'La Juventud Masculina de Schoenstatt se compromete rumbo al Bicentenario a teñir de celeste y blanco cada rincón de la Patria.',
      parrafos: [
        'El Bicentenario de la Patria puso de manifiesto el amor a nuestro país, y ese compromiso se plasmó en proyectos sociales concretos.',
        'Los campamentos nacionales de esos años se llamaron “Patria de María” y querían abordar este tema. La JM Nacional se comprometió a promocionar el Pacto del Bicentenario a través de talleres y campañas de concientización ciudadana.',
        'Es una de las corrientes de vida que nutren a la JM Nacional, junto con la Alianza de Amor y la Generación Misionera.'
      ],
      fuente: CR
    },
    {
      anio: '2010–2014', cat: 'Corrientes de vida', titulo: 'Generación Misionera', key: true,
      resumen: 'Un pilar por año: Protagonismo, Unidad Internacional, Fuego de la Misión y Cultura de Alianza.',
      cita: 'Ser Generación Misionera es unirnos como JM internacional y por medio del fuego propio de la juventud ser protagonistas de nuestro tiempo, tal como lo hicieron el Padre Kentenich y los Congregantes.',
      parrafos: [
        'Rumbo al centenario de Schoenstatt, la corriente misionera empapó toda la juventud y contagió a toda la Familia. Con ella se quiso renovar Schoenstatt para regalar al mundo y a la Iglesia una cultura de Alianza que respondiera de forma audaz a la realidad actual.',
        'Como JM Argentina se trabajaron los cuatro pilares que definen a la Generación Misionera, uno por año:'
      ],
      lista: ['2011 · Protagonismo', '2012 · Unidad Internacional', '2013 · Fuego de la Misión', '2014 · Cultura de Alianza'],
      parrafos2: [
        'Es corriente de vida porque en las juventudes se multiplicaron con fuerza las actividades misioneras, que dinamizaron la fe y ayudaron a trabajar una actitud misionera permanente.',
        'Al evaluar el camino, la JM descubrió la misión como centro: “La Generación Misionera no termina. Eso somos, es nuestra identidad.” El desafío que quedó fue misionar también en el día a día: ser “cristianos de jean y zapatillas”.'
      ],
      fuente: CR
    },
    {
      anio: '2012', cat: 'Ideal', titulo: 'JNJ Mendoza',
      resumen: 'Nos proponemos empezar la búsqueda de la identidad nacional por el Jubileo de los 100 años de Schoenstatt.',
      cita: 'Como JM Nacional nos propusimos comenzar la búsqueda de la Identidad Nacional por el Jubileo de los 100 años de Schoenstatt.',
      parrafos: [
        'En la Jornada Nacional de Jefes de Mendoza nace la inquietud por la Identidad Nacional. Ahí empieza el camino que seis años después desembocaría en el Ideal Nacional.',
        'El Ideal Nacional se entiende como misión comunitaria: la misión que Dios y la Mater pensaron para la Juventud Masculina Argentina, la que nos enciende y por la cual queremos arder.',
        'La búsqueda se pensó desde la imagen de la vid frente a Babel: cuando Dios habla, nunca habla a alguien en solitario sino en comunidad. Cuando Dios nos une, nos da identidad y misión. No se trata de inventar frases teóricas, sino de “ponerle nombre” a lo que somos y nos pasa.'
      ],
      fuente: CR
    },
    {
      anio: '2013', cat: 'Ideal', titulo: 'JNJ Mar del Plata',
      resumen: '¿Qué somos? Jóvenes alegres, hermanos, valientes. ¿Qué queremos ser? Respuesta concreta al tiempo actual.',
      parrafos: ['En la Jornada Nacional de Jefes de Mar del Plata, la JM respondió dos grandes preguntas.'],
      bloques: [
        { t: '¿Qué somos como Juventud Masculina de Argentina?', l: [
          'Jóvenes alegres, que buscamos dar respuesta a la realidad desde nuestro carisma misionero y anclados en la Alianza con la MTA.',
          'Hermanos, una unidad que no se divide, que aplica en la vida lo que Schoenstatt enseña.',
          'Valientes, que nos la jugamos por lo que creemos y lo transformamos en proyectos concretos.'
        ] },
        { t: '¿Qué queremos ser?', l: [
          'Respuesta concreta al tiempo actual.',
          'Estar insertos en el corazón de la Iglesia.',
          'Regalar nuestro carisma y complementarnos por los demás.',
          'Vivir la JM Nacional en las ramas y las ramas en la JM Nacional.'
        ] }
      ],
      fuente: CR
    },
    {
      anio: '2013', cat: 'Misiones', titulo: 'Misión Nacional en Florencio Varela',
      resumen: 'Jóvenes de todas las ramas del país en la parroquia San Pantaleón, como regalo a la Mater por el centenario.',
      parrafos: [
        'Como regalo a la Mater por el centenario de Schoenstatt, la JM Argentina organizó una Misión Nacional en 2013.',
        'Jóvenes de todas las ramas del país se reunieron en la parroquia San Pantaleón de Florencio Varela para compartir la fe entre ellos y con el barrio. Fue uno de los frutos concretos de la corriente de la Generación Misionera, en el año dedicado al “Fuego de la Misión”.'
      ],
      fuente: CR
    },
    {
      anio: '2013', cat: 'Misiones', titulo: 'Cruzadas de María y JMJ Río',
      resumen: 'Hitos de la Generación Misionera vividos junto a la JM de otros países.',
      parrafos: [
        'Unidos a la JM de otros países, los grandes hitos de la Generación Misionera fueron las Cruzadas de María, el Congreso Misionero Internacional y la Jornada Mundial de la Juventud de Río 2013.',
        'La novedad que dejó el Jubileo fue haber vivido un proyecto grande y en común —entre ramas y entre países— y descubrir la pasión por las misiones como un llamado a ser misioneros todos los días, viviendo la fe con alegría.'
      ],
      fuente: CR
    },
    {
      anio: '2014', cat: 'Encuentros nacionales', titulo: 'JNJ Salta y coronación', key: true,
      resumen: 'Rasgos y sueños de la JM Argentina. El 17/10 coronamos a la Mater como Reina de la Generación Misionera.',
      parrafos: ['En la Jornada Nacional de Jefes de Salta se dieron pasos concretos en la búsqueda de la identidad nacional. Se trabajaron cuatro preguntas:'],
      bloques: [
        { t: '¿Cómo marcó la JM tu vida?', l: ['Misiones, proyectos cívicos y sociales, alianzas, la vida de los grupos, la escuela de jefes y los campamentos de rama.'] },
        { t: '¿A qué voces del tiempo queremos responder?', l: ['Adicciones, materialismo, masificación, falta de fe y valores, falta de afecto, educación, falta de ideales y horizonte.'] },
        { t: '¿Cuáles son los rasgos de la JM Argentina?', l: ['Una escuela de vida que enseña a vivir con un estilo; libertad interior; apuesta por la originalidad; alegría; protagonismo; alianza con la MTA; audacia para soñar en grande sin temor a los desafíos.'] },
        { t: '¿Qué sueños tenemos para la JM Nacional?', l: ['La unidad nacional en la Alianza, una identidad común marcada, coronar a María como Reina de la JM Nacional, un símbolo nacional y una participación activa en la Patria.'] }
      ],
      parrafos2: [
        'El 17 de octubre de 2014, en la vigilia del centenario, la JM Argentina se unió a la JM de todo el mundo para coronar a la Mater como Reina de la Generación Misionera. El compromiso con ella terminaba así:'
      ],
      cita: 'Juramos con Gloria morir con heroísmo y radicalidad. Mater, somos tu JM, llevamos en nosotros la herencia de nuestros próceres y nuestros congregantes.',
      fuente: CR
    },
    {
      anio: '2015', cat: 'Ideal', titulo: 'JNJ San Juan',
      resumen: 'Se pide al Secretariado Nacional una propuesta de camino y un taller para los grupos de vida.',
      parrafos: [
        'En la Jornada Nacional de Jefes de San Juan se le pidió al Secretariado Nacional de la JM que elaborara una propuesta de camino para buscar la Misión Nacional.',
        'También se le encargó un taller para trabajar la identidad nacional en los grupos de vida a nivel local, de modo que la búsqueda no quedara solo en los jefes sino que llegara a cada grupo.'
      ],
      fuente: CR
    },
    {
      anio: '2016', cat: 'Ideal', titulo: 'JNJ Sion, Florencio Varela',
      resumen: 'Los jefes se comprometen a trabajar el Taller de Identidad Nacional en todos los grupos.',
      parrafos: [
        'En Sion se presentó el camino hacia el Ideal Nacional: la peregrinación a Brochero y la JNJ de Chaco en 2017, la Escuela Nacional de Jefes, el Campamento Nacional de Secundarios y el Congreso de 2018.',
        'Todos los jefes de rama se comprometieron a trabajar el Taller de Identidad Nacional en sus grupos de vida. Las “ideas fuerza” y los símbolos que surgieron se enviaron al Secretariado Nacional para trabajar el símbolo de rama.',
        'Se propuso además una Oración de Conquista del Ideal Nacional, para ir aportando al Capital de Gracias:'
      ],
      cita: 'Enséñanos a ser Testimonios de Vida, Amigos de la calle, Protagonistas de la Historia de nuestra Patria. Nos ponemos a Tu disposición, usa de nosotros según Tu Voluntad.',
      fuente: CR
    },
    {
      anio: '2017', cat: 'Encuentros nacionales', titulo: 'Camino de Brochero',
      resumen: 'Peregrinación de la JM Nacional de 150 km desde la ciudad de Córdoba hasta Villa Cura Brochero.',
      parrafos: [
        'Como parte del camino hacia el Ideal Nacional, la JM Nacional peregrinó 150 km desde la ciudad de Córdoba hasta Villa Cura Brochero, donde descansan los restos del santo argentino.',
        'Ese mismo año, la Escuela Nacional de Jefes en Florencio Varela reunió a representantes de todas las ramas en días de trabajo fecundo.'
      ],
      fuente: CR
    },
    {
      anio: '2017', cat: 'Símbolo', titulo: 'JNJ Chaco',
      resumen: 'Concreción de los símbolos: santuario, fuego, bandera, abrazo, cruz y montaña.',
      parrafos: [
        'En la Jornada Nacional de Jefes de Chaco se concretaron los símbolos de la JM Argentina: símbolos que expresan valores y vivencias, que van formando una “cultura JM” con costumbres y códigos propios, y que no se cierran en sí mismos sino que invitan a otros a un “modo de pensar, vivir y amar”.'
      ],
      lista: [
        'Santuario: nuestra casa y refugio, origen de nuestra fuerza. “Y tu Santuario se vuelve mi hogar.”',
        'Fuego: nuestro motor; ser brasa encendida que da luz y enciende a los demás.',
        'Cruz: signo del amor infinito del Padre, que marca el camino; herencia de las Cruces Negras.',
        'Bandera: identidad, lucha y victoria. “¡Nuestra bandera no se iza en un mástil! ¡Fue grabada en el alma!”',
        'Abrazo: la grandeza de Dios en un acto pequeño; acompañamiento y corrección fraterna.',
        'Montaña: fuerza y firmeza; el desafío de llegar a la cima. Somos hombre roca.'
      ],
      fuente: CR
    },
    {
      anio: '2018', cat: 'Encuentros nacionales', titulo: 'Campamento Nacional de Secundarios',
      resumen: 'Lago Hermoso, Neuquén: seguir palpitando la misión nacional.',
      parrafos: [
        'En Lago Hermoso, provincia de Neuquén, los secundarios de todo el país vivieron un campamento nacional para seguir trabajando y palpitando la Misión Nacional, pocos meses antes del Congreso.'
      ],
      fuente: CR
    },
    {
      anio: '20/08/2018', cat: 'Ideal', titulo: 'Congreso JM Argentina', key: true,
      resumen: 'Descubrimos lo que somos y estamos llamados a ser: “Con María, pasión que transforma”.',
      cita: 'Con María, pasión que transforma.',
      parrafos: [
        'El 20 de agosto de 2018, después de un largo camino de búsqueda, la JM Argentina pudo descubrir lo que era y lo que estaba llamada a ser. “¡Con María, pasión que transforma!” pasó a ser su motor y su norte.',
        'María: reconocemos en nuestra historia a María como nuestra Madre, la que cambió nuestro corazón. Desde el Santuario es educadora firme y tierna que trabaja en nuestros procesos interiores; guía nuestra misión y nuestros gestos revolucionarios. Preside el Ideal porque siempre presidió nuestra vida.',
        'Pasión: es el Fuego de la Misión, el modo más argentino de entregarse a Dios y a los demás, que nos impulsa a la acción heroica en el día a día.',
        'Transforma: así buscamos transformar y dejarnos transformar. Al reconocer nuestra identidad estamos conectados, complementados y plenificados.'
      ],
      fuente: CS + ' · ' + MM
    },
    {
      anio: '2019', cat: 'Ideal', titulo: 'Primer aniversario',
      resumen: 'Cabeza, corazón y manos al ideal: oración del ideal y estrategias regionales en la JNJ de Paraná.',
      parrafos: ['A un año del Congreso, la JM Nacional hizo balance: le pusimos cabeza, corazón y manos al Ideal.'],
      bloques: [
        { t: 'Cabeza', l: ['Profundizar en lo dicho en el Congreso para saber cómo vivir el regalo que la Mater y Dios nos hicieron.'] },
        { t: 'Corazón', l: ['Unirnos en una misma oración —la Oración del Ideal Nacional— para consagrarnos a la Mater y renovar el Ideal.'] },
        { t: 'Manos', l: ['En la Jornada Nacional de Jefes de marzo, en Paraná, los jefes de las ramas definieron estrategias y tácticas regionales para implementar el Ideal: “Manos a la obra”.'] }
      ],
      parrafos2: ['También se propuso vivir el Ideal en cada etapa de la JM: María para Pioneros, Pasión para Secundarios y Transforma para Universitarios.'],
      fuente: MM
    },
    {
      anio: '2023', cat: 'Símbolo', titulo: 'JNJ La Plata',
      resumen: 'Trabajo en la identidad gráfica: fuego, santuario y bandera como los tres símbolos nacionales.',
      parrafos: [
        'En la JNJ de La Plata el trabajo se centró en la identidad gráfica y se retomaron los símbolos. Entre los cinco elegidos había que enfocarse aún más.',
        'Allí se definieron los tres símbolos más representativos a nivel nacional: fuego, santuario y bandera. La JM tenía un ideal y un camino, pero faltaba una representación visual que uniera todo lo trabajado; un símbolo que, al verlo, encendiera el corazón.'
      ],
      fuente: CS
    },
    {
      anio: '2024', cat: 'Símbolo', titulo: 'JNJ Paraná · Símbolo nacional', key: true,
      resumen: 'Convocatoria abierta, decenas de propuestas y la elección en oración del símbolo que nos acompaña.',
      parrafos: [
        'En la previa a la JNJ de Paraná se lanzó una amplia convocatoria para crear el símbolo nacional de la JM Argentina. Llegaron decenas de propuestas y, tras una primera selección, las mejores llegaron a la Jornada.',
        'Durante la Jornada se vio cada una y, después de sucesivos intercambios y en oración, se presentó el símbolo que hoy nos acompaña: el fuego que arde dentro del Santuario, la bandera y el sol naciente.',
        'El deseo es continuar lo que empezó hace más de diez años: grabar este símbolo no solo de manera visual sino en el alma y el corazón, para que cada vez que lo veamos nos transforme y nos motive a seguir con nuestra misión de llevar a María al corazón de todos.'
      ],
      fuente: CS
    }
  ];

  var ESTRATEGIAS = [
    {
      n: 1, titulo: 'Formación', lema: 'Formar para transformar.',
      manual: 'Formación de nuestros portadores, encargados y dirigentes.',
      parrafos: [
        'La primera estrategia apunta a quienes acompañan a otros: portadores, encargados de grupo y dirigentes. El Manual de Mística describe la etapa universitaria como el tiempo en que el JM “regala de lo que le fue regalado”: la autoeducación y el anhelo de educar, frutos de un camino recorrido y de una pertenencia profunda a la comunidad.',
        'Ahí comienza a asomarse el espíritu de paternidad, que se desarrolla en el acompañamiento de grupos y en la devolución de la experiencia acumulada con los años.'
      ],
      vivir: ['Escuelas de jefes e instancias formativas en liderazgo.', 'Dirigencia de grupos y dirección espiritual.', 'Formarse para formar: material pedagógico y espiritual de Schoenstatt.'],
      link: { href: 'itinerario.html', text: 'Ir al itinerario para dirigentes' }
    },
    {
      n: 2, titulo: 'Pioneros', lema: 'De la cantera a la primera.',
      manual: 'Pioneros: son nuestro futuro.',
      parrafos: [
        'María es la primera palabra del Ideal Nacional y la primera que nos recibe al entrar en la JM. El Manual de Mística propone que los Pioneros conozcan a una Madre que no se queda quieta en una estampita, sino que está viva y presente abriendo caminos como Pionera.',
        'María es Reina (somos sus caballeros), Madre (somos sus hijos) y primera Bandera (somos sus jugadores). El hito para el final de la etapa es conquistar un cuadro de María que forme un santuario habitación u hogar, a partir de las cuatro etapas del manual del Pionero: bandera, santuario, cruz-espada y corona.'
      ],
      vivir: ['Campamentos, conquistas y juegos en equipo.', 'Experiencias con la naturaleza: fuego, choza, patrulla.', 'Primeros encuentros con María como Reina, Madre y Bandera.'],
      link: { href: 'biblioteca.html?carpeta=1.%20Talleres%20%2F%20Pioneros', text: 'Ver talleres para Pioneros' }
    },
    {
      n: 3, titulo: 'Schoenstatt en salida', lema: 'Dilexit Ecclesiam.',
      manual: 'Hoy tenemos una especial misión para con nuestra Iglesia y sociedad.',
      parrafos: [
        '“Dilexit Ecclesiam” —amó a la Iglesia— es el lema que acompaña esta estrategia. Schoenstatt es misión, y por eso la JM se ocupa siempre de su espíritu misionero y apostólico.',
        'Para los universitarios, el Manual de Mística lo describe como un tiempo de acercamiento a la Iglesia diocesana para aportar el testimonio de fe viva en Jesús resucitado, y de compromiso con la transformación de la sociedad mediante proyectos concretos. Es el tiempo en que la pregunta “¿qué vas a hacer por tu Patria?” quema en el corazón.'
      ],
      vivir: ['Misiones, voluntariados y acción social.', 'Meterse en el barro y concretar proyectos.', 'El compromiso cívico y la coherencia en el día a día.'],
      link: { href: 'biblioteca.html?q=apostolado', text: 'Buscar material sobre apostolado' }
    },
    {
      n: 4, titulo: 'Oración y espiritualidad', lema: 'Más que organizar actividades.',
      manual: 'Queremos preocuparnos por nuestro alimento espiritual y no quedarnos sólo en organizar actividades.',
      parrafos: [
        'La cuarta estrategia cuida lo que sostiene todo lo demás. El Manual de Mística orienta cada etapa hacia la meta de ser santos en comunidad para la Iglesia y el mundo de hoy.',
        'Para los secundarios propone encontrar su lugar en el Santuario y reafirmar la fe —creer con pasión—; para los universitarios, una espiritualidad de alianzas (filial, fraterna, Poder en Blanco, Inscriptio) y diaria, con horario espiritual y un vivo anhelo de ser protagonistas del plan que Dios pensó para cada uno.'
      ],
      vivir: ['Momentos de oración en el Santuario.', 'Vigilias, adoraciones y noches heroicas.', 'Horario espiritual y dirección espiritual.'],
      link: { href: 'biblioteca.html?carpeta=2.%20Libros%20%2F%20Espiritualidad', text: 'Ver libros de espiritualidad' }
    },
    {
      n: 5, titulo: 'Comunidad JM Nacional', lema: 'Juremos con gloria morir.',
      manual: 'Somos una sola Gran JM situada en diferentes puntos del país.',
      parrafos: [
        'La quinta estrategia hace realidad el sueño de Mar del Plata 2013: vivir la JM Nacional en las ramas y las ramas en la JM Nacional.',
        'Su lema retoma el compromiso de la coronación de 2014: “Juramos con gloria morir, porque cada uno de nosotros es responsable de esta misión siendo protagonistas de los próximos 100 años”.'
      ],
      vivir: ['Jornadas nacionales de jefes y encuentros nacionales.', 'Campamentos nacionales y misiones compartidas entre ramas.', 'Un mismo Ideal, una misma oración y un mismo símbolo.'],
      link: { href: '#linea', text: 'Ver la línea del tiempo' }
    }
  ];

  return { HITOS: HITOS, ESTRATEGIAS: ESTRATEGIAS };
})();
