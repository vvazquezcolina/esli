# Esli — Las Piezas de Mí

Puzzle match-3 con combate, pintado a código con estética Van Gogh. Esli, una
artista pelirroja con el corazón de Coraje (miedo permanente, valentía
permanente), recorre doce cuadros para recuperar los fragmentos de su
autorretrato, robados por la Niebla Gris. En el camino se le unen **Annie**
(alpaca bebé blanca como la nieve, escudo de lana) y **Chiquis** (chihuahua
negro con pecho crema, ladrido que asusta monstruos).

## Mecánica central

- Une 3+ fichas: rojo golpea, azul calma el miedo, verde sana, amarillo carga
  el botón de **Coraje**, naranja carga a Annie, violeta a Chiquis.
- El miedo sube cuando te golpean — y **entre más miedo, más daño haces**.
  Hazlo con miedo.
- 4 en línea crean una ficha ✦ (limpia fila y columna). La niebla del tablero
  se disipa combinando junto a ella.
- Cada victoria devuelve una pieza del autorretrato (+5 de vida máxima).

## Tecnología

- HTML + CSS + JavaScript vanilla. **Cero dependencias, cero assets**: todo el
  arte (fondos, retratos, monstruos, el autorretrato) se pinta en canvas con
  pinceladas procedurales; el sonido es WebAudio sintetizado.
- Pensado para gama baja: los fondos se pintan una sola vez por pantalla,
  las animaciones son CSS transform/opacity, DPR limitado a 1.3.
- Progreso en `localStorage`.

## Correr local

```bash
python3 -m http.server 8123
# → http://localhost:8123
```

## Deploy en Vercel

Es un sitio estático sin build:

```bash
npm i -g vercel   # si no lo tienes
vercel --prod
```

O arrastra la carpeta en https://vercel.com/new.

## Tests

```bash
node test/board.test.js        # invariantes del motor match-3
# smoke visual (Chrome headless): abrir /?smoke=battle
```
