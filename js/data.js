/* data.js — niveles, monstruos, paletas y diálogos */
window.G = window.G || {};
(function () {
  const D = (G.DATA = {});

  D.NAMES = { esli: 'Esli', annie: 'Annie', chiquis: 'Chiquis', narrador: '✦' };

  D.INTRO = [
    'En el taller de Esli los cuadros respiraban. El trigal olía a pan recién hecho y la noche zumbaba bajito, como panal. Una madrugada entró la Niebla Gris sin tocar la puerta: se bebió los colores uno por uno y, antes de irse, rompió en doce pedazos el autorretrato de Esli. El único cuadro que no se puede volver a pintar de memoria.',
    'Esli juntó sus pinceles con las manos temblando tan fuerte que sonaban a sonaja. Pensó en quedarse. Lo pensó muy seriamente, como unas cuarenta veces. Luego se amarró la bufanda y abrió la puerta.',
    'Afuera esperaban doce cuadros, doce miedos con dientes, una alpaca y un chihuahua. Esli todavía no sabía nada de eso. Solo sabía cómo se da la primera pincelada: con miedo.'
  ];

  D.FINAL = [
    'El retrato volvió a unirse, pieza por pieza. No quedó perfecto: las grietas se notan, finitas y doradas. Los museos restauran los cuadros para que parezca que nunca pasó nada. Esli no. Esli rellenó las suyas con oro y colgó el retrato un poquito chueco, a propósito.',
    'La Niebla Gris no murió — los miedos no mueren —, pero quedó del tamaño de una nube de bolsillo y ya no manda. Cuando crece tantito, Esli agarra el pincel con las manos temblando, Annie se le acomoda en las piernas y Chiquis le gruñe a la nube. Y la nube, que no es tonta, mejor se vuelve a hacer chiquita.',
    '«¿Qué sería de la vida si no tuviéramos el valor de intentar nada?»',
    '— Vincent van Gogh'
  ];

  D.QUOTES = [
    '¡Hazlo con miedo!',
    'Miedo: 80. Ganas: 81.',
    '¿Tiemblo? Sí. ¿Sigo? También.',
    'Ay nanita… y sin embargo.',
    'Respira azul, golpea rojo.',
    'Hoy no, Niebla.'
  ];

  /* posiciones de nodos en el mapa (% del área) */
  D.MAP_POS = [
    { x: 15, y: 88 }, { x: 38, y: 83 }, { x: 63, y: 86 }, { x: 82, y: 76 },
    { x: 62, y: 68 }, { x: 36, y: 64 }, { x: 17, y: 54 }, { x: 38, y: 46 },
    { x: 64, y: 48 }, { x: 82, y: 38 }, { x: 55, y: 29 }, { x: 30, y: 18 }
  ];

  function lvl(o) { return o; }

  D.LEVELS = [
    lvl({
      cuadro: 'Trigal con cuervos',
      ncolors: 4,
      monster: { name: 'Cuervo de la Duda', key: 'cuervo', hp: 55, atk: 6, every: 4, effect: 'graznido' },
      pal: { sky: ['#2e4482', '#5c7fc0'], skyStrokes: ['#3f5fa3', '#6f8fd0', '#8aa8e0', '#dce6f5'], ground: '#c87f0a', groundStrokes: ['#f1c40f', '#d68910', '#a9690a', '#f7dc6f'] },
      pre: [
        { who: 'narrador', text: 'Un trigal dorado bajo un cielo nervioso. Algo grazna entre las espigas.' },
        { who: 'monster', text: '—Graznido de cortesía: ¿ya pensaste en todo lo que puede salir mal? Yo traigo una lista —dice el Cuervo. Y sí: trae una lista.' },
        { who: 'esli', text: 'Ay no, ay no, ay no… Bueno, ya. Plan: juntar 3 fichas iguales. Rojo pega, azul me calma, verde me cura, amarillo carga mi Coraje. Tú puedes, Esli. Bueno: tú tiembla, y puedes.' }
      ],
      post: [
        { who: 'esli', text: '¡Lo hice! Temblando como gelatina, pero lo hice.' },
        { who: 'narrador', text: 'El Cuervo se fue volando sin su lista. Entre las plumas quedó un fragmento del retrato.' }
      ]
    }),
    lvl({
      cuadro: 'Los girasoles',
      ncolors: 4,
      monster: { name: 'Marchito', key: 'marchito', hp: 70, atk: 7, every: 4, effect: 'golpe' },
      pal: { sky: ['#3f6fb5', '#7fa8d8'], skyStrokes: ['#5c8ac9', '#86abdd', '#b6cdee', '#f5d76e'], ground: '#b9770e', groundStrokes: ['#f1c40f', '#d68910', '#1e8449', '#f7dc6f'] },
      pre: [
        { who: 'narrador', text: 'Un jarrón de girasoles. Uno se dobla, gris y rezongón.' },
        { who: 'monster', text: '—Yo también fui amarillo, ¿eh? ¿Y de qué sirvió? Todo acaba en florero —suspira Marchito.' },
        { who: 'esli', text: 'Marchito, estás hablando con alguien que salió de su casa HOY. Florecer con miedo también cuenta.' }
      ],
      post: [
        { who: 'narrador', text: 'Entre los pétalos hay algo blanco temblando. Es… ¿una nubecita con patas?' },
        { who: 'annie', text: '—Mmm… hola. Soy Annie. Estaba practicando ser invisible, pero soy blanca y esto es un girasol. ¿Mejor puedo ir contigo? Sé abrigar.' },
        { who: 'esli', text: '¡Claro que sí! Juntas tiembla una menos. Digo… se tiembla menos.' }
      ]
    }),
    lvl({
      cuadro: 'La noche estrellada',
      ncolors: 5,
      mode: 'estrellas',
      modeCfg: { stars: 14 },
      monster: { name: 'Remolino Inquieto', key: 'remolino', hp: 85, atk: 7, every: 6, effect: 'graznido' },
      pal: { sky: ['#0b1437', '#1b2a5e'], skyStrokes: ['#27408b', '#3f5fa3', '#1f618d', '#f5d76e'], ground: '#0e2240', groundStrokes: ['#1a3a5c', '#254e78', '#0d2b45'] },
      pre: [
        { who: 'narrador', text: 'El cielo gira y gira. Las estrellas se apagaron del puro susto.' },
        { who: 'monster', text: '—¿Yqué tal que? ¿yqué tal que? ¿YQUÉTALQUE? —zumba el Remolino, revolviéndolo todo.' },
        { who: 'esli', text: 'Respira. Voy a encender las estrellas en orden: 1, 2, 3… Y si este loco las revuelve, las vuelvo a contar. Contar también calma.' }
      ],
      post: [
        { who: 'esli', text: 'Shhh. ¿Ya viste? El cielo entero, contado y encendido.' },
        { who: 'narrador', text: 'El remolino se deshace en estrellas quietas. Otra pieza recuperada.' }
      ]
    }),
    lvl({
      cuadro: 'El dormitorio en Arlés',
      ncolors: 5,
      mode: 'memoria',
      modeCfg: { pairs: 8 },
      monster: { name: 'La Cobija Viviente', key: 'cobija', hp: 100, atk: 9, every: 3, effect: 'golpe' },
      pal: { sky: ['#6d9dc5', '#9ec3df'], skyStrokes: ['#7fb3d5', '#a9cce3', '#d4e6f1', '#f5d76e'], ground: '#b9770e', groundStrokes: ['#d68910', '#a04000', '#873600', '#dc7633'] },
      pre: [
        { who: 'narrador', text: 'Un cuartito acogedor. La cama es suave. Sospechosamente suave.' },
        { who: 'monster', text: '—Cinco minutitos más. Mira qué tibio —bosteza la Cobija, escondiendo los colores bajo la tela.' },
        { who: 'esli', text: '¡ESA FRASE ES MÍA! …Bueno. Voy a voltear las cartas y sacar los colores por pares. Memoria, no me falles ahorita.' }
      ],
      post: [
        { who: 'esli', text: 'Me llevo la siesta de recuerdo. Veinte minutos. Cronometrados. Con alarma.' },
        { who: 'narrador', text: 'Bajo la almohada, todavía tibio, otro fragmento del retrato.' }
      ]
    }),
    lvl({
      cuadro: 'Terraza de café por la noche',
      ncolors: 5,
      monster: { name: 'El Murmullo', key: 'murmullo', hp: 115, atk: 9, every: 3, effect: 'graznido' },
      pal: { sky: ['#10203f', '#23365f'], skyStrokes: ['#27408b', '#16224e', '#f4d03f', '#b7950b'], ground: '#7d6608', groundStrokes: ['#9a7d0a', '#b7950b', '#6e5a06', '#85929e'] },
      pre: [
        { who: 'narrador', text: 'Un café dorado en la noche azul. En las mesas, sombras que cuchichean.' },
        { who: 'monster', text: '—¿Ya la vieron? Trae la bufanda toda chueca. ¿Quién se cree? —sisea el Murmullo.' },
        { who: 'esli', text: 'La bufanda va así A PROPÓSITO. …No pienso explicarle mi outfit a unas sombras.' },
        { who: 'annie', text: '—Psst: aquí las fichas naranjas llenan mi lanita. Llena, tócame: detengo el siguiente golpe y te sano tantito.' }
      ],
      post: [
        { who: 'narrador', text: 'De abajo de una mesa sale disparado un perrito negro, ladrándole a las sombras una por una.' },
        { who: 'chiquis', text: '—¡¿QUIÉN ANDA MOLESTANDO A MI GENTE?! Soy Chiquis. Mido veinte centímetros y NO me importa. Yo los cuido.' },
        { who: 'esli', text: 'No sé quién va a cuidar a quién, y no pienso averiguarlo. Bienvenido, Chiquis.' }
      ]
    }),
    lvl({
      cuadro: 'Los lirios',
      ncolors: 6,
      mode: 'restaura',
      modeCfg: { grid: [3, 4], img: 'lirios', attackLine: '—¿Seguro va ahí? —pincha la Espina.' },
      monster: { name: 'Espina Azul', key: 'espina', hp: 130, atk: 10, every: 4, effect: 'golpe' },
      pal: { sky: ['#4a7fb5', '#7fb3d5'], skyStrokes: ['#5c8ac9', '#86abdd', '#d4e6f1', '#f5d76e'], ground: '#1e8449', groundStrokes: ['#145a32', '#27ae60', '#7d5ba6', '#117a65'] },
      pre: [
        { who: 'narrador', text: 'Un jardín de lirios morados, rajado en pedazos y revuelto. Uno de los lirios tiene espinas y opiniones.' },
        { who: 'monster', text: '—Aquel es más alto. Aquel, más azul. Tu cuadro ni entero está —pincha la Espina.' },
        { who: 'esli', text: 'Pues lo armo de nuevo: toco dos fragmentos y los intercambio hasta que el jardín respire. A ver quién se cansa primero.' }
      ],
      post: [
        { who: 'esli', text: '¿Del montón? El cuadro se llama LOS lirios, Espina. En plural. Ese siempre fue el chiste.' },
        { who: 'narrador', text: 'La espina florece, ya sin mirar a los lados, y suelta otra pieza.' }
      ]
    }),
    lvl({
      cuadro: 'El sembrador',
      ncolors: 6,
      monster: { name: 'Espantapájaros Hueco', key: 'espanta', hp: 150, atk: 11, every: 4, effect: 'golpe' },
      pal: { sky: ['#d4ac0d', '#e59866'], skyStrokes: ['#f1c40f', '#e67e22', '#f7dc6f', '#dc7633'], ground: '#6e2c00', groundStrokes: ['#873600', '#5b2c6f', '#a04000', '#4a235a'] },
      pre: [
        { who: 'narrador', text: 'Un campo recién sembrado bajo un sol enorme. Algo cuelga de un palo, vacío por dentro.' },
        { who: 'monster', text: '—Llevo años parado aquí y jamás espanté ni a un cuervo. Para qué sembrar, si nada funciona —cruje el Espantapájaros.' },
        { who: 'esli', text: 'Al Cuervo lo espanté yo, fíjate. Y soy nueva. A lo mejor el problema no es el campo.' },
        { who: 'chiquis', text: '—¡Aquí las fichas moradas llenan mi ladrido! Listo el ladrido, tócame: ¡GUAU!, y el monstruo se lo piensa dos veces.' }
      ],
      post: [
        { who: 'narrador', text: 'El Espantapájaros pidió quedarse a cuidar el trigal en serio esta vez. El trigal dijo que bueno.' },
        { who: 'esli', text: 'Y en el surco, brillando como semilla: la séptima pieza.' }
      ]
    }),
    lvl({
      cuadro: 'Barcas en la playa',
      ncolors: 6,
      mode: 'memoria',
      modeCfg: { pairs: 10, fog: true },
      monster: { name: 'Marea Gris', key: 'marea', hp: 165, atk: 10, every: 3, effect: 'niebla' },
      pal: { sky: ['#5d6d7e', '#85929e'], skyStrokes: ['#85929e', '#aab7c4', '#d6dbdf', '#5d6d7e'], ground: '#34495e', groundStrokes: ['#5d6d7e', '#aab7c4', '#2c3e50', '#d6dbdf'] },
      pre: [
        { who: 'narrador', text: 'Barcas quietas frente a un mar sin color. La marea escondió lo que el mar quería decir.' },
        { who: 'monster', text: '—¿Sabes qué hay debajo? Yo tampoco. NADIE SABE. ¿A poco no te da algo? —ruge la Marea.' },
        { who: 'esli', text: 'Me da. Y aun así volteo las cartas, par por par. Si su niebla tapa alguna, un toque la limpia.' }
      ],
      post: [
        { who: 'annie', text: '—El mar ya tiene azul otra vez. Huele a sal y a que sí se pudo.' },
        { who: 'narrador', text: 'Entre la espuma, la octava pieza.' }
      ]
    }),
    lvl({
      cuadro: 'La iglesia de Auvers',
      ncolors: 6,
      mode: 'eco',
      modeCfg: { rounds: 5 },
      monster: { name: 'Eco Solitario', key: 'eco', hp: 180, atk: 12, every: 99, effect: 'graznido' },
      pal: { sky: ['#1a2a52', '#27408b'], skyStrokes: ['#27408b', '#3f5fa3', '#16224e', '#f5d76e'], ground: '#145a32', groundStrokes: ['#1e8449', '#0b3d20', '#27ae60', '#117a65'] },
      pre: [
        { who: 'narrador', text: 'Una iglesia azul en la noche. Adentro no hay nadie. Solo un eco que repite por las ventanas iluminadas.' },
        { who: 'monster', text: '—Sola… sola… sola… —repite el Eco.' },
        { who: 'esli', text: '¿Sabes qué le encanta a un eco? Que le contesten. Voy a escuchar su secuencia y devolvérsela igualita. Si fallo, se enoja.' }
      ],
      post: [
        { who: 'chiquis', text: '—¡GUAU! (Traducción: aquí nadie está solo mientras yo tenga pulmones.)' },
        { who: 'narrador', text: 'Ahora el eco repite los ladridos de Chiquis. Dice que le gustan más. Novena pieza.' }
      ]
    }),
    lvl({
      cuadro: 'El espejo rajado',
      ncolors: 6,
      mode: 'restaura',
      modeCfg: { grid: [4, 4], img: 'retrato', attackLine: '—Estaba mejor antes —escupe el Crítico.' },
      monster: { name: 'El Crítico', key: 'critico', hp: 200, atk: 13, every: 4, effect: 'golpe' },
      pal: { sky: ['#2c3e50', '#4d5656'], skyStrokes: ['#5d6d7e', '#34495e', '#85929e', '#aab7c4'], ground: '#283747', groundStrokes: ['#34495e', '#2c3e50', '#5d6d7e', '#1b2631'] },
      pre: [
        { who: 'narrador', text: 'Un taller en penumbra. En el espejo roto está tu retrato, hecho pedazos y mal acomodado a propósito.' },
        { who: 'monster', text: '—Trazo flojo. Color equivocado. Hasta roto se ve mejor —escupe el Crítico.' },
        { who: 'esli', text: 'Es MI retrato y yo decido cómo se arma. Cada pieza en su lugar… y tú te callas tantito.' }
      ],
      post: [
        { who: 'esli', text: 'Gracias por los consejos. Los voy a usar… de trapo, para limpiar pinceles.' },
        { who: 'narrador', text: 'El espejo, ya en paz con su reflejo, devuelve la décima pieza.' }
      ]
    }),
    lvl({
      cuadro: 'Almendro en flor',
      ncolors: 6,
      monster: { name: 'Helada Tardía', key: 'helada', hp: 220, atk: 12, every: 3, effect: 'pinta' },
      pal: { sky: ['#73a9c2', '#a9cce3'], skyStrokes: ['#85c1e9', '#aed6f1', '#d6eaf8', '#f8c8dc'], ground: '#4a7a96', groundStrokes: ['#5499c7', '#7fb3d5', '#aed6f1', '#f8c8dc'] },
      pre: [
        { who: 'narrador', text: 'Ramas llenas de flores nuevas contra un cielo turquesa. Y un frío que no debería estar aquí.' },
        { who: 'monster', text: '—Florecieron demasiado pronto. La esperanza siempre llega temprano, y yo siempre llego después —cruje la Helada. ¡Cuidado: su escarcha repinta fichas!' },
        { who: 'esli', text: 'Pues yo les soplo tibiecito. A ver quién aguanta más: tu frío o mis manos.' }
      ],
      post: [
        { who: 'annie', text: '—Mmm… huele a primavera otra vez. Florecitas, les presto mi lanita.' },
        { who: 'narrador', text: 'Cae, girando como pétalo, la penúltima pieza.' }
      ]
    }),
    lvl({
      cuadro: 'El taller gris',
      ncolors: 6,
      monster: { name: 'La Niebla Gris', key: 'niebla', hp: 280, atk: 14, every: 3, effect: 'boss' },
      pal: { sky: ['#3b3b46', '#56565f'], skyStrokes: ['#6c6c78', '#56565f', '#6c5b7b', '#44444e'], ground: '#2e2e38', groundStrokes: ['#3b3b46', '#4a4a55', '#38323e', '#56565f'] },
      pre: [
        { who: 'narrador', text: 'El taller de Esli. O lo que la Niebla dejó de él: un cuarto sin color con un caballete vacío.' },
        { who: 'monster', text: '—Te falta una pieza. Siempre te va a faltar algo. Nunca vas a estar entera —susurra la Niebla.' },
        { who: 'esli', text: 'Puede ser. Pero fíjate: vengo temblando Y vengo. Una alpaca, un chihuahua, un pincel y yo. Devuélveme mi pedazo.' },
        { who: 'chiquis', text: '—¡GUAU GUAU GUAU! (Traducción: lo que dijo Esli, pero con más dientes.)' }
      ],
      post: [
        { who: 'monster', text: '—¿…Cómo? ¿Con miedo y TODO lo hiciste? Eso no estaba en mis planes —se encoge la Niebla.' },
        { who: 'esli', text: 'Ese siempre fue el truco. No esperar a que se me quitara.' },
        { who: 'narrador', text: 'La última pieza flota hasta el caballete. El retrato espera.' }
      ]
    })
  ];

  D.EFFECT_NAMES = {
    golpe: 'Golpe',
    graznido: 'Graznido de miedo',
    niebla: 'Aliento de niebla',
    pinta: 'Escarcha que pinta',
    boss: ''
  };

  D.HOWTO =
    '<h3>Cómo jugar</h3><ul>' +
    '<li>Une <b>3 o más fichas</b> iguales deslizándolas.</li>' +
    '<li><span class="swatch" style="background:#c0392b"></span> <b>Rojo</b>: golpea al monstruo.</li>' +
    '<li><span class="swatch" style="background:#f1c40f"></span> <b>Amarillo</b>: llena tu botón de <b>Coraje</b>.</li>' +
    '<li><span class="swatch" style="background:#27408b"></span> <b>Azul</b>: calma tu miedo.</li>' +
    '<li><span class="swatch" style="background:#1e8449"></span> <b>Verde</b>: te sana.</li>' +
    '<li><span class="swatch" style="background:#e67e22"></span> <b>Naranja</b>: lana de Annie (escudo + sanación).</li>' +
    '<li><span class="swatch" style="background:#7d5ba6"></span> <b>Violeta</b>: ladrido de Chiquis (retrasa el ataque).</li>' +
    '<li>4 en línea crean una ficha <b>✦</b> que limpia fila y columna.</li>' +
    '<li>El miedo sube cuando te pegan… y entre <b>más miedo tengas, más fuerte pegas</b>. Hazlo con miedo.</li>' +
    '<li>La niebla gris del tablero se limpia haciendo combinaciones <b>junto a ella</b>.</li>' +
    '<li><b>No todos los cuadros se pelean igual:</b> hay memoramas, fragmentos por acomodar, estrellas que encender en orden y un eco que repetir. Ahí, cada acierto carga a todo el equipo y el botón de <b>Coraje resuelve un paso por ti</b>.</li>' +
    '</ul>';
})();
