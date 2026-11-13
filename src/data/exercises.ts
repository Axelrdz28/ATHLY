import type { Exercise } from './types';

const list: Exercise[] = [
  /* ───────────── EMPUJE · LUNES ───────────── */
  {
    id: 'bench', name: 'Press banca', primary: ['Pecho'], secondary: ['Tríceps', 'Deltoide anterior'], equipment: 'Barra',
    cues: ['Escápulas juntas y hacia abajo, pies firmes en el suelo.', 'Baja la barra a la parte baja del pecho con los codos a unos 45°.', 'Empuja hacia arriba y un poco hacia atrás, sin despegar los glúteos.'],
    errors: ['Rebotar la barra en el pecho.', 'Abrir los codos a 90° (carga el hombro).'],
    progression: 'double', increment: 2.5, alts: ['db-bench', 'machine-chest'], anim: 'bench',
  },
  { id: 'db-bench', name: 'Press con mancuernas', primary: ['Pecho'], secondary: ['Tríceps'], equipment: 'Mancuernas',
    cues: ['Mancuernas a la altura del pecho, antebrazos verticales.', 'Sube juntándolas ligeramente arriba.'],
    errors: ['Bajar sin control y perder la posición de hombros.'], progression: 'double', increment: 2, anim: 'bench' },
  { id: 'machine-chest', name: 'Press de pecho en máquina', primary: ['Pecho'], secondary: ['Tríceps'], equipment: 'Máquina',
    cues: ['Ajusta el asiento para que los agarres queden a media altura del pecho.', 'Espalda pegada al respaldo todo el recorrido.'],
    errors: ['Bloquear los codos de golpe arriba.'], progression: 'double', increment: 5 },

  {
    id: 'incline-db', name: 'Press inclinado con mancuernas', primary: ['Pecho superior'], secondary: ['Deltoide anterior', 'Tríceps'], equipment: 'Mancuernas',
    cues: ['Banco a 30°: más inclinado trabaja sobre todo hombro.', 'Baja hasta sentir el estiramiento del pecho.', 'Sube en línea recta sobre el pecho.'],
    errors: ['Banco demasiado inclinado.', 'Arquear la espalda baja para empujar.'],
    progression: 'double', increment: 2, alts: ['incline-smith', 'incline-machine'], anim: 'incline',
  },
  { id: 'incline-smith', name: 'Press inclinado en Smith', primary: ['Pecho superior'], equipment: 'Smith',
    cues: ['Banco a 30°, la barra baja a la parte alta del pecho.', 'Codos ligeramente cerrados.'], errors: ['Tocar el cuello con la barra.'], progression: 'double', increment: 2.5, anim: 'incline' },
  { id: 'incline-machine', name: 'Press inclinado en máquina', primary: ['Pecho superior'], equipment: 'Máquina',
    cues: ['Asiento a la altura que deje los agarres en la parte alta del pecho.', 'Empuja sin despegar la espalda.'], errors: ['Recorrido corto.'], progression: 'double', increment: 5, anim: 'incline' },

  {
    id: 'dips', name: 'Fondos en paralelas', primary: ['Pecho inferior', 'Tríceps'], secondary: ['Deltoide anterior'], equipment: 'Paralelas',
    cues: ['Torso ligeramente inclinado al frente para cargar el pecho.', 'Baja hasta que el hombro quede a la altura del codo.', 'Sube sin bloquear de golpe.'],
    errors: ['Bajar demasiado y forzar el hombro.', 'Balancear las piernas.'],
    progression: 'double', increment: 2.5, alts: ['decline-press', 'assisted-dips'], anim: 'dips',
  },
  { id: 'decline-press', name: 'Press declinado', primary: ['Pecho inferior'], secondary: ['Tríceps'], equipment: 'Barra',
    cues: ['Pies bien sujetos, la barra baja a la parte baja del pecho.', 'Controla la bajada.'], errors: ['Rebotar la barra.'], progression: 'double', increment: 2.5 },
  { id: 'assisted-dips', name: 'Fondos asistidos', primary: ['Pecho inferior', 'Tríceps'], equipment: 'Máquina',
    cues: ['Misma técnica que los fondos; la asistencia solo quita peso.', 'Progresa reduciendo la asistencia.'], errors: ['Usar demasiada asistencia y no sentir el esfuerzo.'], progression: 'double', increment: 5, anim: 'dips' },

  {
    id: 'cable-fly', name: 'Aperturas en polea', primary: ['Pecho'], equipment: 'Polea',
    cues: ['Codos ligeramente flexionados y fijos todo el recorrido.', 'Junta las manos frente al pecho y aprieta 1 s.', 'Vuelve despacio hasta sentir el estiramiento.'],
    errors: ['Convertirlo en un press doblando los codos.'],
    progression: 'double', increment: 2.5, alts: ['pec-deck', 'db-fly'], anim: 'fly',
  },
  { id: 'pec-deck', name: 'Pec deck', primary: ['Pecho'], equipment: 'Máquina',
    cues: ['Codos a la altura de los hombros.', 'Aprieta al cerrar y abre controlado.'], errors: ['Abrir demasiado atrás.'], progression: 'double', increment: 5, anim: 'fly' },
  { id: 'db-fly', name: 'Aperturas con mancuernas', primary: ['Pecho'], equipment: 'Mancuernas',
    cues: ['Codos semiflexionados, baja en arco.', 'Para cuando sientas el estiramiento.'], errors: ['Bajar demasiado con peso alto.'], progression: 'double', increment: 2, anim: 'fly' },

  {
    id: 'pushdown', name: 'Extensión de tríceps en polea', primary: ['Tríceps'], equipment: 'Polea',
    cues: ['Codos pegados al cuerpo y fijos.', 'Extiende por completo y aprieta abajo.'],
    errors: ['Mover los hombros o inclinarte para empujar.'],
    progression: 'double', increment: 2.5, alts: ['pushdown-rope'], anim: 'pushdown',
  },
  { id: 'pushdown-rope', name: 'Extensión en polea con cuerda', primary: ['Tríceps'], equipment: 'Polea',
    cues: ['Abre la cuerda al final del recorrido.', 'Codos fijos al costado.'], errors: ['Usar impulso del torso.'], progression: 'double', increment: 2.5, anim: 'pushdown' },

  {
    id: 'overhead-ext', name: 'Extensión de tríceps sobre la cabeza', primary: ['Tríceps (cabeza larga)'], equipment: 'Polea',
    cues: ['De espaldas a la polea, codos apuntando al frente.', 'Baja detrás de la cabeza hasta estirar el tríceps.', 'Extiende sin abrir los codos.'],
    errors: ['Abrir los codos hacia afuera.'],
    progression: 'double', increment: 2.5, alts: ['skullcrusher', 'db-overhead-ext'], anim: 'overhead',
  },
  { id: 'skullcrusher', name: 'Press francés', primary: ['Tríceps'], equipment: 'Barra EZ',
    cues: ['Baja la barra hacia la frente o un poco detrás.', 'Solo se mueven los codos.'], errors: ['Abrir los codos.'], progression: 'double', increment: 2.5 },
  { id: 'db-overhead-ext', name: 'Extensión con mancuerna sobre la cabeza', primary: ['Tríceps (cabeza larga)'], equipment: 'Mancuerna',
    cues: ['Sujeta la mancuerna con ambas manos detrás de la cabeza.', 'Codos al frente.'], errors: ['Arquear la espalda baja.'], progression: 'double', increment: 2 },

  {
    id: 'ab-wheel', name: 'Rueda abdominal', primary: ['Core'], equipment: 'Rueda', bodyweight: true,
    cues: ['Abdomen apretado y glúteos activos antes de rodar.', 'Avanza solo hasta donde mantengas la espalda neutra.', 'Regresa tirando con el abdomen, no con la cadera.'],
    errors: ['Hundir la espalda baja.'],
    progression: 'reps', alts: ['plank', 'body-saw'], anim: 'abwheel',
  },
  { id: 'plank', name: 'Plancha', primary: ['Core'], equipment: 'Peso corporal', bodyweight: true, unit: 's',
    cues: ['Codos bajo los hombros, cuerpo en línea recta.', 'Aprieta glúteos y abdomen.'], errors: ['Cadera caída o demasiado alta.'], progression: 'time' },
  { id: 'body-saw', name: 'Body saw', primary: ['Core'], equipment: 'Deslizadores', bodyweight: true,
    cues: ['En plancha, desliza el cuerpo atrás y adelante desde los hombros.', 'Espalda neutra.'], errors: ['Hundir la cadera.'], progression: 'reps' },

  /* ───────────── PIERNA A · MARTES ───────────── */
  {
    id: 'pogo', name: 'Pogo jumps', primary: ['Gemelos', 'Tendón de Aquiles'], equipment: 'Peso corporal', bodyweight: true,
    cues: ['Rodillas casi rígidas: el rebote sale del tobillo.', 'Contacto con el suelo lo más corto posible.', 'Aterriza en la parte delantera del pie.'],
    errors: ['Doblar las rodillas en cada salto.', 'Hacerlos lentos o pesados.'],
    progression: 'plyo', alts: ['jump-rope'], anim: 'pogo',
  },
  { id: 'jump-rope', name: 'Saltar la cuerda', primary: ['Gemelos'], equipment: 'Cuerda', bodyweight: true,
    cues: ['Saltos cortos y rápidos con la parte delantera del pie.', 'Muñecas giran la cuerda, no los brazos.'], errors: ['Saltar demasiado alto.'], progression: 'plyo', anim: 'pogo' },

  {
    id: 'box-jump', name: 'Salto al cajón', primary: ['Glúteo', 'Cuádriceps', 'Gemelos'], equipment: 'Cajón', bodyweight: true, anim: 'boxjump',
    cues: ['Contramovimiento rápido y brazos que acompañan el salto.', 'Aterriza con todo el pie y las rodillas alineadas con las puntas.', 'Baja del cajón caminando y descansa completo entre saltos.'],
    errors: ['Un cajón tan alto que obliga a aterrizar en sentadilla profunda.', 'Bajar del cajón saltando: es impacto innecesario.'],
    progression: 'plyo', alts: ['squat-jump'],
  },
  { id: 'squat-jump', name: 'Squat jump', primary: ['Glúteo', 'Cuádriceps'], equipment: 'Peso corporal', bodyweight: true,
    cues: ['Media sentadilla y salto máximo.', 'Aterriza suave y reinicia la posición antes del siguiente.'], errors: ['Encadenar saltos sin control.'], progression: 'plyo' },

  {
    id: 'sl-broad', name: 'Salto horizontal a una pierna', primary: ['Glúteo', 'Cuádriceps'], secondary: ['Estabilizadores de cadera'], equipment: 'Peso corporal', bodyweight: true, perSide: true,
    cues: ['Impulso con brazos y una pierna, salta hacia adelante.', 'Aterriza en la misma pierna y aguanta 2 s estable.', 'Rodilla alineada con la punta del pie al caer.'],
    errors: ['Rodilla que se va hacia dentro al aterrizar.'],
    progression: 'plyo', alts: ['broad-jump'], anim: 'slbroad',
  },
  { id: 'broad-jump', name: 'Salto largo a pies juntos', primary: ['Glúteo', 'Cuádriceps'], equipment: 'Peso corporal', bodyweight: true,
    cues: ['Brazos atrás y salto hacia adelante extendiendo la cadera.', 'Aterriza suave y estable.'], errors: ['Aterrizar con las rodillas hacia dentro.'], progression: 'plyo' },

  {
    id: 'back-squat', name: 'Sentadilla trasera', primary: ['Cuádriceps', 'Glúteo'], secondary: ['Aductores', 'Lumbar'], equipment: 'Barra', anim: 'squat',
    cues: ['Barra sobre el trapecio, pies a la anchura de hombros y puntas un poco abiertas.', 'Las rodillas siguen la línea de las puntas de los pies.', 'La barra baja y sube en línea recta sobre el medio del pie.'],
    errors: ['Rodillas que se van hacia dentro al subir.', 'La cadera sube antes que el pecho y la espalda se inclina de más.'],
    progression: 'double', increment: 5, alts: ['hack-squat', 'leg-press'],
  },
  { id: 'hack-squat', name: 'Hack squat', primary: ['Cuádriceps', 'Glúteo'], equipment: 'Máquina',
    cues: ['Espalda pegada al respaldo, pies a la anchura de hombros.', 'Baja hasta al menos 90° de rodilla.'], errors: ['Despegar los talones.'], progression: 'double', increment: 5 },
  {
    id: 'leg-press', name: 'Prensa 45°', primary: ['Cuádriceps'], secondary: ['Glúteo'], equipment: 'Máquina', anim: 'legpress',
    cues: ['Pies en el centro de la plataforma, a la anchura de los hombros.', 'Baja hasta que la rodilla quede en unos 90° sin que la lumbar se despegue.', 'Empuja con todo el pie, sin despegar los talones.'],
    errors: ['Bloquear las rodillas por completo arriba.', 'Bajar tanto que la cadera se despega y la zona lumbar se redondea.'],
    progression: 'double', increment: 10,
  },

  {
    id: 'rdl', name: 'Peso muerto rumano', primary: ['Isquiotibiales', 'Glúteo'], secondary: ['Lumbar'], equipment: 'Barra',
    cues: ['Rodillas ligeramente flexionadas y fijas.', 'Lleva la cadera atrás con la barra pegada a las piernas.', 'Baja hasta sentir el estiramiento de isquios, sin redondear la espalda.'],
    errors: ['Redondear la espalda baja.', 'Convertirlo en sentadilla doblando las rodillas.'],
    progression: 'double', increment: 5, alts: ['trap-bar-dl', 'good-morning'], anim: 'rdl',
  },
  { id: 'trap-bar-dl', name: 'Peso muerto con trap bar', primary: ['Glúteo', 'Cuádriceps', 'Isquiotibiales'], equipment: 'Trap bar',
    cues: ['Cadera algo más alta que en sentadilla, pecho arriba.', 'Empuja el suelo y extiende cadera y rodillas a la vez.'], errors: ['Redondear la espalda.'], progression: 'double', increment: 5 },
  { id: 'good-morning', name: 'Good morning', primary: ['Isquiotibiales', 'Lumbar'], equipment: 'Barra',
    cues: ['Barra en el trapecio, cadera atrás con la espalda neutra.', 'Usa poco peso y mucho control.'], errors: ['Bajar más allá de donde mantienes la espalda recta.'], progression: 'double', increment: 2.5 },

  {
    id: 'standing-calf', name: 'Gemelo de pie, pesado', primary: ['Gemelos'], equipment: 'Máquina',
    cues: ['Pausa de 1 s abajo con el talón estirado.', 'Sube hasta la punta máxima y aprieta.', 'Rodillas extendidas.'],
    errors: ['Rebotar abajo.', 'Recorrido corto.'],
    progression: 'double', increment: 5, alts: ['leg-press-calf', 'smith-calf'], anim: 'calf',
  },
  { id: 'leg-press-calf', name: 'Gemelo en prensa', primary: ['Gemelos'], equipment: 'Máquina',
    cues: ['Solo la parte delantera del pie en la plataforma.', 'Rodillas extendidas sin bloquear.'], errors: ['Rebotar.'], progression: 'double', increment: 10 },
  { id: 'smith-calf', name: 'Gemelo en Smith', primary: ['Gemelos'], equipment: 'Smith',
    cues: ['Parte delantera del pie sobre un disco o escalón.', 'Pausa abajo.'], errors: ['Recorrido corto.'], progression: 'double', increment: 5, anim: 'calf' },

  {
    id: 'pallof', name: 'Pallof press', primary: ['Core (antirrotación)'], equipment: 'Polea', perSide: true,
    cues: ['De lado a la polea, agarre al pecho.', 'Extiende los brazos sin dejar que el torso gire.', 'Aguanta 2 s extendido.'],
    errors: ['Girar el torso hacia la polea.'],
    progression: 'double', increment: 2.5, alts: ['side-plank'], anim: 'pallof',
  },

  /* ───────────── TRACCIÓN · MIÉRCOLES ───────────── */
  {
    id: 'pullup', name: 'Dominadas', primary: ['Dorsal'], secondary: ['Bíceps', 'Romboides'], equipment: 'Barra fija', anim: 'pullup',
    cues: ['Agarre un poco más ancho que los hombros, palmas al frente.', 'Empieza bajando las escápulas antes de doblar los codos.', 'Sube hasta que la barbilla pase la barra y baja hasta estirar los brazos.'],
    errors: ['Balancearte o patear para subir.', 'Hacer medio rango: no bajar del todo o no llegar arriba.'],
    progression: 'double', increment: 2.5, alts: ['lat-pulldown', 'assisted-pullup'],
  },
  { id: 'lat-pulldown', name: 'Jalón al pecho', primary: ['Dorsal'], secondary: ['Bíceps'], equipment: 'Polea',
    cues: ['Torso apenas inclinado atrás.', 'Lleva la barra a la parte alta del pecho tirando con los codos.'], errors: ['Tirar con impulso del torso.'], progression: 'double', increment: 5 },
  { id: 'assisted-pullup', name: 'Dominada asistida', primary: ['Dorsal'], secondary: ['Bíceps'], equipment: 'Máquina', anim: 'pullup',
    cues: ['Misma técnica que la dominada.', 'Progresa reduciendo la asistencia.'], errors: ['Medio rango.'], progression: 'double', increment: 5 },

  {
    id: 'bb-row', name: 'Remo con barra', primary: ['Dorsal', 'Romboides'], secondary: ['Bíceps', 'Lumbar'], equipment: 'Barra',
    cues: ['Torso a unos 45°, espalda neutra.', 'Lleva la barra al ombligo tirando con los codos.', 'Baja controlado sin perder la postura.'],
    errors: ['Levantar el torso para mover más peso.'],
    progression: 'double', increment: 2.5, alts: ['t-bar-row', 'db-row'], anim: 'bbrow',
  },
  { id: 't-bar-row', name: 'Remo en T', primary: ['Dorsal', 'Romboides'], equipment: 'Barra en T',
    cues: ['Pecho arriba, espalda neutra.', 'Tira hacia el abdomen.'], errors: ['Redondear la espalda.'], progression: 'double', increment: 2.5, anim: 'bbrow' },
  { id: 'db-row', name: 'Remo con mancuerna', primary: ['Dorsal'], equipment: 'Mancuerna', perSide: true,
    cues: ['Apoyo en banco, espalda plana.', 'Lleva el codo hacia la cadera.'], errors: ['Girar el torso.'], progression: 'double', increment: 2 },

  {
    id: 'cable-row', name: 'Remo sentado en polea', primary: ['Romboides', 'Dorsal'], secondary: ['Bíceps'], equipment: 'Polea',
    cues: ['Pecho arriba, sin balancear el torso.', 'Junta las escápulas al final del tirón.'],
    errors: ['Inclinarte atrás para ayudarte.'],
    progression: 'double', increment: 5, alts: ['machine-row', 'chest-row'], anim: 'cablerow',
  },
  { id: 'machine-row', name: 'Remo en máquina', primary: ['Romboides', 'Dorsal'], equipment: 'Máquina',
    cues: ['Pecho contra el apoyo.', 'Aprieta las escápulas atrás.'], errors: ['Recorrido corto.'], progression: 'double', increment: 5, anim: 'cablerow' },
  { id: 'chest-row', name: 'Remo con apoyo en pecho', primary: ['Romboides', 'Dorsal'], equipment: 'Mancuernas',
    cues: ['Banco inclinado, pecho apoyado.', 'Tira con los codos hacia atrás.'], errors: ['Despegar el pecho.'], progression: 'double', increment: 2 },

  {
    id: 'face-pull', name: 'Face pull', primary: ['Deltoide posterior'], secondary: ['Manguito rotador'], equipment: 'Polea',
    cues: ['Polea a la altura de la cara, agarre con cuerda.', 'Tira hacia la frente separando las manos.', 'Termina con los pulgares apuntando atrás.'],
    errors: ['Usar demasiado peso y tirar con la espalda baja.'],
    progression: 'double', increment: 2.5, alts: ['rear-delt-db'], anim: 'facepull',
  },
  { id: 'rear-delt-db', name: 'Pájaros con mancuerna', primary: ['Deltoide posterior'], equipment: 'Mancuernas',
    cues: ['Torso inclinado, codos semiflexionados.', 'Abre los brazos hacia los lados.'], errors: ['Balancear el torso.'], progression: 'double', increment: 1, anim: 'reversefly' },

  {
    id: 'bb-curl', name: 'Curl con barra', primary: ['Bíceps'], equipment: 'Barra',
    cues: ['Codos pegados al cuerpo.', 'Sube sin balancear y baja en 2 s.'],
    errors: ['Usar impulso de la cadera.'],
    progression: 'double', increment: 2.5, alts: ['ez-curl', 'db-curl'], anim: 'curl',
  },
  { id: 'ez-curl', name: 'Curl con barra EZ', primary: ['Bíceps'], equipment: 'Barra EZ',
    cues: ['Agarre en la parte angulada.', 'Codos fijos.'], errors: ['Balancear.'], progression: 'double', increment: 2.5, anim: 'curl' },
  { id: 'db-curl', name: 'Curl con mancuernas', primary: ['Bíceps'], equipment: 'Mancuernas',
    cues: ['Gira la palma hacia arriba mientras subes.', 'Codos fijos.'], errors: ['Balancear el torso.'], progression: 'double', increment: 2, anim: 'curl' },

  {
    id: 'hammer-curl', name: 'Curl martillo', primary: ['Braquial', 'Antebrazo'], secondary: ['Bíceps'], equipment: 'Mancuernas',
    cues: ['Palmas mirándose entre sí todo el recorrido.', 'Codos pegados.'],
    errors: ['Balancear.'],
    progression: 'double', increment: 2, alts: ['rope-curl'], anim: 'hammer',
  },
  { id: 'rope-curl', name: 'Curl con cuerda en polea', primary: ['Braquial', 'Bíceps'], equipment: 'Polea',
    cues: ['Agarre neutro con la cuerda.', 'Codos fijos.'], errors: ['Inclinarse atrás.'], progression: 'double', increment: 2.5, anim: 'hammer' },

  {
    id: 'hanging-leg-raise', name: 'Elevación de piernas colgado', primary: ['Core (abdomen inferior)'], equipment: 'Barra fija', bodyweight: true,
    cues: ['Sin balanceo: empieza apretando el abdomen.', 'Sube las piernas enrollando la pelvis.', 'Baja controlado.'],
    errors: ['Balancearte para subir.'],
    progression: 'reps', alts: ['dip-leg-raise', 'reverse-crunch'], anim: 'hangingraise',
  },
  { id: 'dip-leg-raise', name: 'Elevación de piernas en paralelas', primary: ['Core (abdomen inferior)'], equipment: 'Paralelas', bodyweight: true,
    cues: ['Espalda apoyada, sube las rodillas al pecho.', 'Enrolla la pelvis arriba.'], errors: ['Balancear.'], progression: 'reps' },
  { id: 'reverse-crunch', name: 'Crunch inverso', primary: ['Core (abdomen inferior)'], equipment: 'Peso corporal', bodyweight: true,
    cues: ['Tumbado, lleva las rodillas al pecho despegando la cadera.', 'Baja despacio.'], errors: ['Impulsarte con las piernas.'], progression: 'reps' },

  /* ───────────── PIERNA B · JUEVES ───────────── */
  {
    id: 'lateral-hop', name: 'Saltos laterales a una pierna', primary: ['Estabilizadores de cadera', 'Gemelos'], equipment: 'Peso corporal', bodyweight: true, perSide: true,
    cues: ['Salta de lado sobre una pierna y aterriza estable.', 'Rodilla alineada con la punta.', 'Contacto corto y reactivo.'],
    errors: ['Rodilla que se va hacia dentro.'],
    progression: 'plyo', alts: ['lateral-hop-2'], anim: 'lateralhop',
  },
  { id: 'lateral-hop-2', name: 'Saltos laterales a dos pies', primary: ['Gemelos', 'Estabilizadores de cadera'], equipment: 'Peso corporal', bodyweight: true,
    cues: ['Salta de lado a lado sobre una línea.', 'Contactos cortos.'], errors: ['Saltos pesados y lentos.'], progression: 'plyo' },

  {
    id: 'drop-jump', name: 'Drop jump (cajón bajo)', primary: ['Gemelos', 'Cuádriceps'], secondary: ['Tendón de Aquiles'], equipment: 'Cajón 20-30 cm', bodyweight: true,
    cues: ['Da un paso fuera del cajón, no saltes de él.', 'Al tocar el suelo rebota hacia arriba de inmediato.', 'Contacto lo más corto posible.'],
    errors: ['Hundirse al aterrizar (contacto largo).', 'Cajón demasiado alto.'],
    progression: 'plyo', alts: ['pogo'], anim: 'dropjump',
  },

  {
    id: 'step-up', name: 'Step-up a cajón alto', primary: ['Glúteo', 'Cuádriceps'], equipment: 'Mancuernas + cajón', perSide: true,
    cues: ['Todo el pie sobre el cajón (rodilla a unos 90°).', 'Sube empujando con la pierna de arriba, sin impulsarte con la de abajo.', 'Baja controlado.'],
    errors: ['Rebotar con la pierna de abajo.', 'Rodilla hacia dentro.'],
    progression: 'double', increment: 2, alts: ['bulgarian', 'walking-lunge'], anim: 'stepup',
  },
  { id: 'bulgarian', name: 'Sentadilla búlgara', primary: ['Cuádriceps', 'Glúteo'], equipment: 'Mancuernas', perSide: true,
    cues: ['Pie trasero en el banco, torso un poco inclinado.', 'Baja recto hasta que la rodilla trasera casi toque el suelo.'], errors: ['Pie delantero demasiado cerca del banco.'], progression: 'double', increment: 2 },
  { id: 'walking-lunge', name: 'Zancadas caminando', primary: ['Cuádriceps', 'Glúteo'], equipment: 'Mancuernas', perSide: true,
    cues: ['Paso largo, rodilla trasera cerca del suelo.', 'Torso erguido.'], errors: ['Rodilla delantera hacia dentro.'], progression: 'double', increment: 2 },

  {
    id: 'hip-thrust', name: 'Hip thrust', primary: ['Glúteo'], secondary: ['Isquiotibiales'], equipment: 'Barra + banco',
    cues: ['Parte alta de la espalda en el banco, barra sobre la cadera.', 'Sube hasta que el torso quede paralelo al suelo y aprieta 1 s.', 'Mentón recogido, mirada al frente.'],
    errors: ['Arquear la espalda baja en vez de extender la cadera.'],
    progression: 'double', increment: 5, alts: ['glute-bridge', 'glute-machine'], anim: 'hipthrust',
  },
  { id: 'glute-bridge', name: 'Puente de glúteo con barra', primary: ['Glúteo'], equipment: 'Barra',
    cues: ['Espalda en el suelo, barra sobre la cadera.', 'Sube y aprieta 1 s.'], errors: ['Empujar con la espalda baja.'], progression: 'double', increment: 5 },
  { id: 'glute-machine', name: 'Máquina de glúteo', primary: ['Glúteo'], equipment: 'Máquina',
    cues: ['Ajusta la máquina a tu cadera.', 'Aprieta arriba 1 s.'], errors: ['Recorrido corto.'], progression: 'double', increment: 5 },

  {
    id: 'nordic', name: 'Curl nórdico', primary: ['Isquiotibiales'], equipment: 'Peso corporal', bodyweight: true,
    cues: ['Bloque 1: solo la bajada, tan lenta como puedas.', 'Cadera extendida: el cuerpo baja en línea recta.', 'Apóyate con las manos al final y vuelve arriba.'],
    errors: ['Doblar la cadera para acortar la palanca.', 'Hacer demasiadas reps al inicio (agujetas fuertes).'],
    progression: 'reps', alts: ['leg-curl'], anim: 'nordic',
  },
  { id: 'leg-curl', name: 'Curl femoral en máquina', primary: ['Isquiotibiales'], equipment: 'Máquina',
    cues: ['Rodilla alineada con el eje de la máquina.', 'Baja en 2-3 s.'], errors: ['Despegar la cadera.'], progression: 'double', increment: 5 },

  {
    id: 'seated-soleus', name: 'Sóleo sentado', primary: ['Sóleo'], equipment: 'Máquina',
    cues: ['Rodillas a 90°: así trabaja el sóleo.', 'Pausa abajo y sube a la punta máxima.'],
    errors: ['Rebotar.'],
    progression: 'double', increment: 5, alts: ['smith-seated-calf'], anim: 'soleus',
  },
  { id: 'smith-seated-calf', name: 'Gemelo sentado en Smith', primary: ['Sóleo'], equipment: 'Smith',
    cues: ['Barra acolchada sobre los muslos.', 'Pausa abajo.'], errors: ['Recorrido corto.'], progression: 'double', increment: 5, anim: 'soleus' },

  {
    id: 'tibialis', name: 'Elevación de tibial', primary: ['Tibial anterior'], equipment: 'Peso corporal o disco', bodyweight: true,
    cues: ['Espalda en la pared, talones adelante.', 'Sube las puntas de los pies lo más alto posible.', 'Baja despacio.'],
    errors: ['Mover la cadera en vez del tobillo.'],
    progression: 'reps', anim: 'tibialis',
  },

  {
    id: 'monster-walk', name: 'Monster walk con banda', primary: ['Glúteo medio'], equipment: 'Banda', bodyweight: true, perSide: true,
    cues: ['Banda en tobillos o rodillas, media sentadilla.', 'Pasos laterales sin juntar los pies.', 'Rodillas hacia fuera.'],
    errors: ['Dejar que las rodillas se cierren.'],
    progression: 'reps', alts: ['abductor-machine'], anim: 'monster',
  },
  { id: 'abductor-machine', name: 'Máquina abductora', primary: ['Glúteo medio'], equipment: 'Máquina',
    cues: ['Torso ligeramente inclinado al frente.', 'Abre controlado y aguanta 1 s.'], errors: ['Rebotar.'], progression: 'double', increment: 5 },

  {
    id: 'copenhagen', name: 'Plancha Copenhague', primary: ['Aductores'], secondary: ['Core'], equipment: 'Banco', bodyweight: true, perSide: true, unit: 's',
    cues: ['Pierna de arriba sobre el banco, la de abajo libre.', 'Cuerpo en línea recta.', 'Empieza con la rodilla apoyada (más fácil).'],
    errors: ['Cadera caída.'],
    progression: 'time', alts: ['adductor-machine'], anim: 'copenhagen',
  },
  { id: 'adductor-machine', name: 'Máquina aductora', primary: ['Aductores'], equipment: 'Máquina',
    cues: ['Cierra controlado.', 'Abre hasta sentir el estiramiento.'], errors: ['Rebotar.'], progression: 'double', increment: 5 },

  {
    id: 'dead-bug', name: 'Dead bug', primary: ['Core'], equipment: 'Peso corporal', bodyweight: true,
    cues: ['Espalda baja pegada al suelo todo el tiempo.', 'Extiende brazo y pierna contrarios despacio.'],
    errors: ['Arquear la espalda al extender.'],
    progression: 'reps', alts: ['bird-dog'], anim: 'deadbug',
  },
  { id: 'bird-dog', name: 'Bird dog', primary: ['Core', 'Lumbar'], equipment: 'Peso corporal', bodyweight: true,
    cues: ['En cuadrupedia, extiende brazo y pierna contrarios.', 'Cadera estable.'], errors: ['Girar la cadera.'], progression: 'reps' },

  /* ───────────── HOMBRO + BRAZOS · VIERNES ───────────── */
  {
    id: 'ohp', name: 'Press militar de pie', primary: ['Deltoide anterior y medio'], secondary: ['Tríceps', 'Core'], equipment: 'Barra',
    cues: ['Glúteos y abdomen apretados, sin arquear la espalda.', 'Saca la cabeza hacia atrás para que pase la barra.', 'Termina con la barra sobre la mitad del pie.'],
    errors: ['Arquear la espalda baja.', 'Empujar la barra hacia adelante.'],
    progression: 'double', increment: 2.5, alts: ['seated-db-press', 'machine-shoulder'], anim: 'ohp',
  },
  { id: 'seated-db-press', name: 'Press con mancuernas sentado', primary: ['Deltoides'], equipment: 'Mancuernas',
    cues: ['Respaldo casi vertical.', 'Baja hasta la altura de las orejas.'], errors: ['Arquear la espalda.'], progression: 'double', increment: 2 },
  { id: 'machine-shoulder', name: 'Press de hombro en máquina', primary: ['Deltoides'], equipment: 'Máquina',
    cues: ['Agarres a la altura de los hombros al inicio.', 'Espalda pegada al respaldo.'], errors: ['Recorrido corto.'], progression: 'double', increment: 5 },

  {
    id: 'lateral-raise', name: 'Elevaciones laterales', primary: ['Deltoide medio'], equipment: 'Mancuernas',
    cues: ['Codos ligeramente flexionados.', 'Sube hasta la altura de los hombros, guiando con los codos.', 'Baja en 2 s.'],
    errors: ['Balancear el torso.', 'Subir los hombros hacia las orejas.'],
    progression: 'double', increment: 1, alts: ['cable-lateral', 'machine-lateral'], anim: 'lateralraise',
  },
  { id: 'cable-lateral', name: 'Elevación lateral en polea', primary: ['Deltoide medio'], equipment: 'Polea', perSide: true,
    cues: ['Polea baja, cable por delante del cuerpo.', 'Sube hasta la altura del hombro.'], errors: ['Inclinarse.'], progression: 'double', increment: 1.25 },
  { id: 'machine-lateral', name: 'Elevación lateral en máquina', primary: ['Deltoide medio'], equipment: 'Máquina',
    cues: ['Hombro alineado con el eje de la máquina.', 'Sube controlado.'], errors: ['Recorrido corto.'], progression: 'double', increment: 2.5 },

  {
    id: 'reverse-fly', name: 'Pájaros (reverse fly)', primary: ['Deltoide posterior'], secondary: ['Romboides'], equipment: 'Mancuernas',
    cues: ['Torso inclinado casi paralelo al suelo.', 'Abre los brazos con los codos semiflexionados.'],
    errors: ['Usar impulso.'],
    progression: 'double', increment: 1, alts: ['reverse-pec-deck'], anim: 'reversefly',
  },
  { id: 'reverse-pec-deck', name: 'Pec deck invertido', primary: ['Deltoide posterior'], equipment: 'Máquina',
    cues: ['Pecho contra el respaldo.', 'Abre hasta la línea de los hombros.'], errors: ['Recorrido corto.'], progression: 'double', increment: 2.5 },

  {
    id: 'close-grip', name: 'Press cerrado', primary: ['Tríceps'], secondary: ['Pecho'], equipment: 'Barra',
    cues: ['Manos a la anchura de los hombros.', 'Codos pegados al cuerpo al bajar.'],
    errors: ['Agarre demasiado cerrado (muñecas).'],
    progression: 'double', increment: 2.5, alts: ['dips'], anim: 'closegrip',
  },
  {
    id: 'incline-curl', name: 'Curl inclinado', primary: ['Bíceps (cabeza larga)'], equipment: 'Mancuernas',
    cues: ['Banco a 45-60°, brazos colgando detrás del torso.', 'Sube sin adelantar los codos.'],
    errors: ['Despegar la espalda del banco.'],
    progression: 'double', increment: 2, alts: ['cable-curl'], anim: 'inclinecurl',
  },
  { id: 'cable-curl', name: 'Curl en polea', primary: ['Bíceps'], equipment: 'Polea',
    cues: ['Codos fijos.', 'Aprieta arriba 1 s.'], errors: ['Inclinarse atrás.'], progression: 'double', increment: 2.5, anim: 'curl' },

  {
    id: 'farmer-carry', name: 'Farmer carry', primary: ['Agarre', 'Core'], secondary: ['Trapecio'], equipment: 'Mancuernas', unit: 'm',
    cues: ['Mancuernas pesadas a los lados, hombros atrás.', 'Pasos cortos y firmes, torso erguido.'],
    errors: ['Inclinarse hacia un lado.'],
    progression: 'carry', increment: 2, alts: ['suitcase-carry'], anim: 'farmer',
  },
  { id: 'suitcase-carry', name: 'Suitcase carry', primary: ['Core (oblicuos)', 'Agarre'], equipment: 'Mancuerna', unit: 'm', perSide: true,
    cues: ['Una sola mancuerna, el torso no se inclina.', 'Cambia de mano a mitad.'], errors: ['Inclinarse hacia el peso.'], progression: 'carry', increment: 2, anim: 'farmer' },

  {
    id: 'side-plank', name: 'Plancha lateral', primary: ['Core (oblicuos)'], secondary: ['Glúteo medio'], equipment: 'Peso corporal', bodyweight: true, perSide: true, unit: 's',
    cues: ['Codo bajo el hombro, cuerpo en línea recta.', 'Cadera arriba todo el tiempo.'],
    errors: ['Dejar caer la cadera.'],
    progression: 'time', anim: 'sideplank',
  },
];

export const EXERCISES: Record<string, Exercise> = Object.fromEntries(list.map((e) => [e.id, e]));

export function getEx(id: string): Exercise {
  const e = EXERCISES[id];
  if (!e) throw new Error(`Ejercicio desconocido: ${id}`);
  return e;
}

/** El ejercicio principal del que una alternativa depende (para mostrar la regla y las alternativas) */
export function progressionText(ex: Exercise, top: number, rpe?: string): string {
  switch (ex.progression) {
    case 'double':
      return `Doble progresión: cuando completes ${top} ${ex.unit === 's' ? 's' : 'reps'} en todas las series${rpe ? ` con RPE ≤ ${rpe.split('-').pop()}` : ''}, sube ${ex.increment ?? 2.5} kg la siguiente sesión y vuelve al mínimo de reps.`;
    case 'plyo':
      return 'Progresa en calidad, no en peso: más altura o menos tiempo de contacto. Cuando todos los saltos salgan limpios dos sesiones seguidas, sube la dificultad (cajón más alto o a una pierna). Nunca al fallo.';
    case 'reps':
      return 'Suma 1 rep por serie cada semana. Al llegar al tope, agrega dificultad (lastre, más rango o más lento).';
    case 'time':
      return 'Suma 5 s por serie cada semana. Al llegar al tope, usa una variante más difícil.';
    case 'carry':
      return `Cuando completes la distancia sin soltar ni inclinarte, sube ${ex.increment ?? 2} kg por mano.`;
  }
}
