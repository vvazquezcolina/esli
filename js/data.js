/* data.js — niveles, monstruos, paletas y diálogos */
window.G = window.G || {};
(function () {
  const D = (G.DATA = {});

  D.NAMES = { esli: 'Esli', annie: 'Annie', chiquis: 'Chiquis', narrador: '✦' };

  D.INTRO = [
    'En el taller de Esli los cuadros respiraban: los trigales olían a sol y las estrellas zumbaban como abejas doradas. Hasta que llegó la Niebla Gris. Se bebió el color del mundo y rompió en doce pedazos el retrato que Esli había pintado de sí: el cuadro donde estaba todo lo que Esli es.',
    'Esli tiene miedo. Muchísimo miedo. Las manos le tiemblan tanto que el pincel parece sonaja. Aun así, respiró hondo, se amarró la bufanda… y salió a buscar sus pedazos.',
    'Porque el coraje no es no tener miedo. El coraje es pintar de todos modos.'
  ];

  D.FINAL = [
    'El retrato volvió a unirse, pieza por pieza. No quedó perfecto: las grietas se ven, finitas y doradas, como ríos de luz entre los colores. Esli lo miró un buen rato y decidió que así estaba mejor: un cuadro que sabe lo que le costó.',
    'La Niebla Gris no murió — los miedos no mueren —, pero quedó chiquita, del tamaño de una nube de bolsillo, y ya no manda. Cada vez que crece tantito, Esli toma el pincel con las manos temblorosas y pinta de todos modos. Annie abriga. Chiquis ladra. Y eso basta.',
    '«¿Qué sería de la vida si no tuviéramos el valor de intentar nada?»',
    '— Vincent van Gogh'
  ];

  D.QUOTES = [
    '¡Hazlo con miedo!',
    'Temblando, pero avanzando.',
    'El miedo también sabe pintar.',
    'Pincelada a pincelada.',
    'Respira azul, golpea rojo.',
    'Con todo y miedo, aquí sigo.'
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
        { who: 'monster', text: '—¿Y si todo te sale mal? ¿Y si mejor ni lo intentas? —grazna el Cuervo.' },
        { who: 'esli', text: 'Ay no, ay no, ay no… Bueno. Ya estoy aquí. Une 3 fichas: la roja golpea, la azul calma mi miedo, la verde me sana y la amarilla llena mi botón de Coraje.' }
      ],
      post: [
        { who: 'esli', text: '¡Lo hice! Temblando como gelatina, pero lo hice.' },
        { who: 'narrador', text: 'Entre las plumas quedó algo brillante: un fragmento del retrato.' }
      ]
    }),
    lvl({
      cuadro: 'Los girasoles',
      ncolors: 4,
      monster: { name: 'Marchito', key: 'marchito', hp: 70, atk: 7, every: 4, effect: 'golpe' },
      pal: { sky: ['#3f6fb5', '#7fa8d8'], skyStrokes: ['#5c8ac9', '#86abdd', '#b6cdee', '#f5d76e'], ground: '#b9770e', groundStrokes: ['#f1c40f', '#d68910', '#1e8449', '#f7dc6f'] },
      pre: [
        { who: 'narrador', text: 'Un jarrón de girasoles. Uno de ellos se dobla, gris y rezongón.' },
        { who: 'monster', text: '—Para qué florecer, si todo se marchita —suspira Marchito.' },
        { who: 'esli', text: 'Sí da miedo marchitarse… pero más miedo da no florecer nunca. ¡Vamos!' }
      ],
      post: [
        { who: 'narrador', text: 'Entre los pétalos hay algo blanco temblando de frío. Es… ¿una nubecita con patas?' },
        { who: 'annie', text: '—Mmm… hola. Soy Annie. Me escondía de la Niebla. ¿Puedo ir contigo? Sé abrigar.' },
        { who: 'esli', text: '¡Claro que sí! Juntas tiembla una menos. Digo… se tiembla menos.' }
      ]
    }),
    lvl({
      cuadro: 'La noche estrellada',
      ncolors: 5,
      monster: { name: 'Remolino Inquieto', key: 'remolino', hp: 85, atk: 7, every: 3, effect: 'graznido' },
      pal: { sky: ['#0b1437', '#1b2a5e'], skyStrokes: ['#27408b', '#3f5fa3', '#1f618d', '#f5d76e'], ground: '#0e2240', groundStrokes: ['#1a3a5c', '#254e78', '#0d2b45'] },
      pre: [
        { who: 'narrador', text: 'El cielo gira y gira. Un remolino piensa demasiadas cosas a la vez.' },
        { who: 'monster', text: '—¿Yqué tal que? ¿yqué tal que? ¿YQUÉTALQUE? —zumba el Remolino.' },
        { who: 'annie', text: '—Las fichas naranjas llenan mi lanita. Cuando esté llena, tócame: mi abrigo detiene el siguiente golpe y te sana tantito.' }
      ],
      post: [
        { who: 'esli', text: 'Shhh… el cielo también puede girar bonito.' },
        { who: 'narrador', text: 'El remolino se deshace en estrellas. Otra pieza recuperada.' }
      ]
    }),
    lvl({
      cuadro: 'El dormitorio en Arlés',
      ncolors: 5,
      monster: { name: 'La Cobija Viviente', key: 'cobija', hp: 100, atk: 9, every: 4, effect: 'golpe' },
      pal: { sky: ['#6d9dc5', '#9ec3df'], skyStrokes: ['#7fb3d5', '#a9cce3', '#d4e6f1', '#f5d76e'], ground: '#b9770e', groundStrokes: ['#d68910', '#a04000', '#873600', '#dc7633'] },
      pre: [
        { who: 'narrador', text: 'Un cuartito acogedor. La cama es suave. Demasiado suave.' },
        { who: 'monster', text: '—Quédate aquí para siempre. Afuera hace frío y todo cuesta —bosteza la Cobija.' },
        { who: 'esli', text: 'Cinco minutitos má… ¡NO! ¡Esli, despierta! ¡Tus piezas no se van a buscar solas!' }
      ],
      post: [
        { who: 'esli', text: 'Descansar está bien. Esconderse, no. Ya aprendí la diferencia.' },
        { who: 'narrador', text: 'Bajo la almohada, otro fragmento del retrato.' }
      ]
    }),
    lvl({
      cuadro: 'Terraza de café por la noche',
      ncolors: 5,
      monster: { name: 'El Murmullo', key: 'murmullo', hp: 115, atk: 9, every: 3, effect: 'graznido' },
      pal: { sky: ['#10203f', '#23365f'], skyStrokes: ['#27408b', '#16224e', '#f4d03f', '#b7950b'], ground: '#7d6608', groundStrokes: ['#9a7d0a', '#b7950b', '#6e5a06', '#85929e'] },
      pre: [
        { who: 'narrador', text: 'Un café dorado en la noche azul. En las mesas, sombras que cuchichean.' },
        { who: 'monster', text: '—¿Ya la vieron? ¿Quién se cree? Seguro ni puede —sisea el Murmullo.' },
        { who: 'esli', text: 'Que murmuren. El cuadro es mío, no de ellos.' }
      ],
      post: [
        { who: 'narrador', text: 'De abajo de una mesa sale disparado un perrito negro, ladrándole a las sombras.' },
        { who: 'chiquis', text: '—¡¿QUIÉN ANDA MOLESTANDO A MI GENTE?! Soy Chiquis. Mido veinte centímetros y NO me importa. Yo los cuido.' },
        { who: 'esli', text: 'Bienvenido, guardián. Eres chiquito y enorme a la vez.' }
      ]
    }),
    lvl({
      cuadro: 'Los lirios',
      ncolors: 6,
      monster: { name: 'Espina Azul', key: 'espina', hp: 130, atk: 10, every: 3, effect: 'golpe' },
      pal: { sky: ['#4a7fb5', '#7fb3d5'], skyStrokes: ['#5c8ac9', '#86abdd', '#d4e6f1', '#f5d76e'], ground: '#1e8449', groundStrokes: ['#145a32', '#27ae60', '#7d5ba6', '#117a65'] },
      pre: [
        { who: 'narrador', text: 'Un jardín de lirios morados. Uno crece torcido, mirando a los demás.' },
        { who: 'monster', text: '—Aquel lirio es más alto. Aquel, más azul. Tú… tú eres del montón —pincha la Espina.' },
        { who: 'chiquis', text: '—¡Las fichas moradas llenan mi ladrido! Cuando esté listo, tócame: ¡GUAU! El monstruo se espanta y tarda más en atacar.' }
      ],
      post: [
        { who: 'esli', text: 'No quiero ser aquel lirio. Quiero ser este. El mío.' },
        { who: 'narrador', text: 'La espina florece y suelta otra pieza.' }
      ]
    }),
    lvl({
      cuadro: 'El sembrador',
      ncolors: 6,
      monster: { name: 'Espantapájaros Hueco', key: 'espanta', hp: 150, atk: 11, every: 4, effect: 'golpe' },
      pal: { sky: ['#d4ac0d', '#e59866'], skyStrokes: ['#f1c40f', '#e67e22', '#f7dc6f', '#dc7633'], ground: '#6e2c00', groundStrokes: ['#873600', '#5b2c6f', '#a04000', '#4a235a'] },
      pre: [
        { who: 'narrador', text: 'Un campo recién sembrado bajo un sol enorme. Algo cuelga de un palo, vacío por dentro.' },
        { who: 'monster', text: '—Siembra lo que quieras: no va a crecer nada. Nunca crece nada —cruje el Espantapájaros.' },
        { who: 'esli', text: 'Eso no lo sabes. Ni yo. Por eso se siembra: para averiguarlo.' }
      ],
      post: [
        { who: 'esli', text: 'Algo sí crece: yo. Aunque no se note de lejos.' },
        { who: 'narrador', text: 'En el surco brilla la séptima pieza.' }
      ]
    }),
    lvl({
      cuadro: 'Barcas en la playa',
      ncolors: 6,
      monster: { name: 'Marea Gris', key: 'marea', hp: 165, atk: 10, every: 3, effect: 'niebla' },
      pal: { sky: ['#5d6d7e', '#85929e'], skyStrokes: ['#85929e', '#aab7c4', '#d6dbdf', '#5d6d7e'], ground: '#34495e', groundStrokes: ['#5d6d7e', '#aab7c4', '#2c3e50', '#d6dbdf'] },
      pre: [
        { who: 'narrador', text: 'Barcas quietas frente a un mar sin color. La marea respira niebla.' },
        { who: 'monster', text: '—No zarpes. Nadie sabe qué hay del otro lado —ruge la Marea.' },
        { who: 'esli', text: 'Exacto. Nadie sabe. Podría ser algo horrible… o algo hermoso. ¡Ojo: su niebla tapa fichas! Haz combinaciones junto a ella para limpiarla.' }
      ],
      post: [
        { who: 'annie', text: '—El mar ya tiene azul otra vez. Huele a sal y a valiente.' },
        { who: 'narrador', text: 'Entre la espuma, la octava pieza.' }
      ]
    }),
    lvl({
      cuadro: 'La iglesia de Auvers',
      ncolors: 6,
      monster: { name: 'Eco Solitario', key: 'eco', hp: 180, atk: 12, every: 3, effect: 'graznido' },
      pal: { sky: ['#1a2a52', '#27408b'], skyStrokes: ['#27408b', '#3f5fa3', '#16224e', '#f5d76e'], ground: '#145a32', groundStrokes: ['#1e8449', '#0b3d20', '#27ae60', '#117a65'] },
      pre: [
        { who: 'narrador', text: 'Una iglesia azul en la noche. Adentro no hay nadie. Solo un eco que repite.' },
        { who: 'monster', text: '—Sola… sola… sola… —repite el Eco.' },
        { who: 'esli', text: '¿Sola? Vengo con una alpaca que abriga y un chihuahua que ruge. El eco está mal informado.' }
      ],
      post: [
        { who: 'chiquis', text: '—¡GUAU! (Traducción: aquí nadie está solo mientras yo tenga pulmones.)' },
        { who: 'narrador', text: 'El eco aprendió una palabra nueva: «juntos». Novena pieza.' }
      ]
    }),
    lvl({
      cuadro: 'El espejo rajado',
      ncolors: 6,
      monster: { name: 'El Crítico', key: 'critico', hp: 200, atk: 13, every: 3, effect: 'golpe' },
      pal: { sky: ['#2c3e50', '#4d5656'], skyStrokes: ['#5d6d7e', '#34495e', '#85929e', '#aab7c4'], ground: '#283747', groundStrokes: ['#34495e', '#2c3e50', '#5d6d7e', '#1b2631'] },
      pre: [
        { who: 'narrador', text: 'Un taller en penumbra. En el espejo roto vive alguien con tu cara y peor carácter.' },
        { who: 'monster', text: '—Trazo flojo. Color equivocado. ¿A esto le llamas arte? —escupe el Crítico.' },
        { who: 'esli', text: 'Le llamo MÍO. Y eso ya es más de lo que tú has pintado nunca.' }
      ],
      post: [
        { who: 'esli', text: 'Gracias por los consejos. Los voy a usar… como trapo para limpiar pinceles.' },
        { who: 'narrador', text: 'El espejo, ya en paz, devuelve la décima pieza.' }
      ]
    }),
    lvl({
      cuadro: 'Almendro en flor',
      ncolors: 6,
      monster: { name: 'Helada Tardía', key: 'helada', hp: 220, atk: 12, every: 3, effect: 'pinta' },
      pal: { sky: ['#73a9c2', '#a9cce3'], skyStrokes: ['#85c1e9', '#aed6f1', '#d6eaf8', '#f8c8dc'], ground: '#4a7a96', groundStrokes: ['#5499c7', '#7fb3d5', '#aed6f1', '#f8c8dc'] },
      pre: [
        { who: 'narrador', text: 'Ramas llenas de flores nuevas contra un cielo turquesa. Y un frío que no debería estar aquí.' },
        { who: 'monster', text: '—Florecieron demasiado pronto. La esperanza siempre llega temprano y se congela —cruje la Helada. ¡Cuidado: su escarcha pinta fichas de otro color!' },
        { who: 'esli', text: 'Pues yo le soplo tibiecito. Las flores que se hielan… vuelven a abrir.' }
      ],
      post: [
        { who: 'annie', text: '—Mmm… huele a primavera otra vez. Te presto mi lanita, florecitas.' },
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
        { who: 'monster', text: '—Te falta una pieza. Siempre te va a faltar algo. Nunca vas a estar en una sola pieza —susurra la Niebla.' },
        { who: 'esli', text: 'Puede ser. Pero hoy vengo temblando, con una alpaca, con un chihuahua y con mi pincel. Y te vengo a quitar lo que es mío.' },
        { who: 'chiquis', text: '—¡GUAU GUAU GUAU! (Traducción: lo que dijo Esli, pero con más dientes.)' }
      ],
      post: [
        { who: 'monster', text: '—…¿Cómo? ¿Con miedo y TODO lo hiciste? Eso… eso no estaba en mis planes —se encoge la Niebla.' },
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
    '</ul>';
})();
