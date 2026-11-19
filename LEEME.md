# Sitio catálogo de The Cosmo Studio: entrega para verificar en Cosmo

## 1. Arquitectura confirmada

- **Tipo de sitio:** estático de una sola página (HTML, CSS y JavaScript), sin servidor, sin cobros y sin cuentas.
- **Dónde se publica:** GitHub Pages, gratis, con una dirección tipo `https://USUARIO.github.io/`.
- **Archivos:**
  - `index.html`: el diseño y la lógica. No se edita para cambiar precios.
  - `catalogo.js`: el **único** bloque de datos, con productos, precios, colores, fotos, el interruptor de *De temporada* y el usuario de Instagram.
  - `fotos/`: la carpeta de las fotos reales.
- **Lista de la clienta:** se guarda solo en el navegador de su teléfono (localStorage). No se guarda nada de ella en ningún otro lugar.

## 2. Catálogo cargado en `catalogo.js`

**Fuente de los datos**, leída directo de Registro Cosmo el 19 de noviembre de 2026:

- **Precios:** pestaña **Productos**, columna *Precio Real*. Los 13 coinciden con la tabla del pack.
- **Colores:** pestaña **Productos**, columnas *Color 1* y *Color 2*. Los nombres van corregidos con la tabla de alias de la pestaña **Colores de Productos**:
  - "Verde Tras" → "Verde Traslúcido"
  - "MoradoTras" → "Morado Traslúcido"
  - "Azul Claro" → "Azul Cielo"
  - "Cafe" → "Café"
- **Piezas de dos colores:** se escriben "Color 1 y Color 2".
- **Por qué no se usó solo Colores de Productos:** esa pestaña es una tabla de color → tipo de pieza con nombres genéricos ("Portalaptop", "Wiggle Pot", "Papas"), no una lista por producto. Cesar y Fer eligieron usar la pestaña Productos con los alias.

| Producto | Filtro | Precio | Colores cargados |
|---|---|---:|---|
| MushyLamp | Lámparas | $480 | Rosa Claro y Azul Oscuro · Rosa Claro y Verde · Morado y Blanco · Rojo y Azul Cielo · Naranja y Azul Oscuro · Verde Traslúcido y Rosa Claro · Blanco y Rojo |
| GroovyLamp | Lámparas | $550 | Amarillo · Naranja · Morado Traslúcido (segundo color: [FALTA DATO]) |
| WhisperVase | Decoración | $275 | Azul Oscuro · Rosa Oscuro · Blanco |
| WigglePot | Cocina | $190 | Azul Cielo y Naranja · Rosa Oscuro y Rosa Claro · Verde y Morado |
| CurlyHolder | Para tu escritorio | $250 | Azul Cielo · Rosa Claro · Verde · Rosa Oscuro |
| WobbleStand | Para tu escritorio | $120 | Rosa Oscuro · Rojo · Morado · Azul Cielo · Verde · Rosa Claro |
| Chubby | Decoración | $75 | Morado · Blanco · Rosa Claro · Azul Oscuro |
| Frylock | Cocina | $100 | Rojo y Amarillo |
| ClickerEstrella | Clickers | $35 | Amarillo |
| ClickerDumpling | Clickers | $45 | Café y Blanco |
| ClickerConsola | Clickers | $45 | Morado y Amarillo |
| ClickerWaffle | Clickers | $45 | Café y Amarillo |
| DestapalatasCorazon | Cocina | $15 | Morado |

- **Productos de un solo color:** el color ya viene elegido. En los demás, no se puede agregar sin elegir uno.
- **Filtros:** la asignación de cada producto a un filtro es una propuesta mía, no viene del Sheet.
- **Frase de uso:** queda vacía en todos los productos porque no está en los datos.
- **De temporada:** la sección está apagada y sin productos.
  - La pestaña Productos sí trae precios para algunas piezas: Altar $65, Reno12cm $60, Árbol Escalado $190, Cascanueces $190, y varios paquetes de renos.
  - Como ustedes indicaron que esos precios no están verificados, no los cargué.

### Cómo cargar colores y fotos

1. **Colores:** en `catalogo.js`, editen la lista `colores: [...]` del producto, escribiendo los colores igual que en Registro Cosmo.
   - Si un producto no lleva color, pongan `colores: []`.
2. **Fotos:** suban las fotos a la carpeta `fotos/` con nombres sin espacios ni acentos (por ejemplo `mushylamp-1.jpg`). Después escriban en el producto `fotos: ["fotos/mushylamp-1.jpg", "fotos/mushylamp-2.jpg"]`.
   - Pueden poner varias fotos; en la ficha se ven deslizando.
   - Para que carguen rápido, que cada foto pese menos de 300 KB, más o menos 1200 px de lado.

## 3. Publicar en GitHub Pages, paso a paso

1. Crea una cuenta gratuita en github.com. Si el nombre de usuario es `thecosmostudio`, el link queda `https://thecosmostudio.github.io/`.
2. Arriba a la derecha toca **+** y luego **New repository**.
   - En nombre escribe exactamente `TU-USUARIO.github.io`. Por ejemplo: `thecosmostudio.github.io`.
   - Déjalo como **Public**.
   - Toca **Create repository**.
3. En el repositorio nuevo toca **uploading an existing file**. Arrastra `index.html`, `catalogo.js` y `LEEME.md`, y luego toca **Commit changes**.
4. Para subir fotos, toca **Add file**, luego **Upload files**, y arrastra la carpeta `fotos` completa. Después toca **Commit changes**.
5. Ve a **Settings**, luego a **Pages**.
   - En *Source* elige **Deploy from a branch**.
   - En *Branch* elige **main** y la carpeta **/(root)**.
   - Toca **Save**.
6. Espera 1 o 2 minutos y abre `https://TU-USUARIO.github.io/`. Si GitHub muestra un aviso arriba con el link, también sirve.
7. **Para cambiar un precio o un color después:** abre `catalogo.js` en GitHub, toca el lápiz ✏️, edita y toca **Commit changes**. El sitio se actualiza solo en 1 o 2 minutos.

### Poner el link en la bio, solo después de la verificación de Cosmo y la prueba en teléfono

1. En Instagram, entra a tu perfil y toca **Editar perfil**.
2. Ve a **Enlaces** y luego a **Agregar enlace externo**.
3. Pega el link de GitHub Pages, ponle de título "Catálogo" y guarda.

## 4. El enlace de mensajes directos de Instagram

- **Enlace que usa el sitio:** `https://ig.me/m/thecosmostudio.mx`. Es el enlace oficial de Meta para abrir un chat.
- **Prueba desde aquí:** no la pude hacer. Mi entorno no tiene Instagram y ig.me no deja que herramientas automáticas abran la página. Lo que sí comprobé es que el botón del sitio apunta exactamente a ese enlace.
- **Lo que debería pasar en el teléfono:** según la documentación de Meta y de herramientas que usan este enlace, se abre el chat con @thecosmostudio.mx en la app de Instagram, o en la web si la app no está instalada.
  - Como la clienta llega desde la bio, lo normal es que el sitio esté abierto dentro del navegador de Instagram, y el enlace la lleve al chat sin salir de la app.
  - Si en algún teléfono abre solo el perfil, la pantalla de confirmación ya le dice que toque **Mensaje** y pegue su pedido.
- **Hay que confirmarlo** en la prueba con el teléfono de Cesar. Conviene probar en un iPhone y en un Android, si se puede.

**Una decisión que tomé:** al tocar **Pedir por Instagram**, el sitio arma el mensaje, lo copia y muestra el aviso "Tu pedido ya se copió. Solo pégalo en el chat y envíalo" con el botón **Abrir chat de @thecosmostudio.mx**.

- **Ventaja:** la clienta ve el aviso antes de salir, y el chat se abre con un toque directo suyo, que es lo que los teléfonos abren de forma más confiable.
- **Costo:** es un toque más que el flujo del pack.
- **Para quitarlo:** pongan `abrirInstagramDirecto: true` en `catalogo.js`. Así, el mismo botón copia y abre el chat de inmediato, y el aviso queda en el sitio para cuando la clienta regrese.

## 5. Pruebas hechas en un navegador Chrome con tamaño de teléfono (390 px), con el catálogo real

**Prueba 1: lista con 2 productos de colores distintos y una cantidad mayor a 1**

- Agregué 1 MushyLamp "Rosa Claro y Azul Oscuro", después 1 CurlyHolder "Verde", y después otra vez 1 CurlyHolder "Verde".
- La lista quedó con **2 líneas**, no 3: el segundo CurlyHolder se sumó a la misma línea, que quedó con cantidad 2.
- Cálculo a mano: $480 + 2 × $250 = $480 + $500 = **$980**. La barra fija mostró "3 piezas · $980" y la lista mostró "Total $980".
- Al intentar agregar MushyLamp sin elegir color, el sitio mostró "Elige un color para agregarlo a tu lista." y no agregó nada.
- En ClickerEstrella, que tiene un solo color, el color ya aparece elegido.
- Recargué la página y la lista siguió ahí ("3 piezas · $980").

**Prueba 2: mensaje generado, copiado tal cual del portapapeles**

```text
Hola, quiero realizar esta compra:

- 1 × MushyLamp — Rosa Claro y Azul Oscuro — $480
- 2 × CurlyHolder — Verde — $250 c/u

Total: $980
```

- El texto del portapapeles es idéntico al que se muestra en pantalla.
- El aviso mostrado fue "Tu pedido ya se copió. Solo pégalo en el chat y envíalo".
- Si la clienta escribe algo en *¿Algo que debamos saber?*, aparece debajo del total como `Nota: ...`.

**Prueba 3: pedir con la lista vacía**

- El botón **Pedir por Instagram** aparece desactivado, con el texto "Agrega al menos una pieza para poder pedir."
- Forcé el toque y no se abrió nada.

En las pruebas no hubo errores de JavaScript, y la página mide exactamente el ancho de la pantalla.

**Tipografía:** el sitio usa la letra redondeada del sistema cuando existe (SF Rounded en iPhone). En Android y en otros equipos usa la letra normal del sistema.

## 6. Lista final de [FALTA DATO]

1. **Tono de "Verde"** en MushyLamp (Rosa Claro y Verde), WigglePot (Verde y Morado), CurlyHolder y WobbleStand.
   - La tabla de alias lo marca como "Verde (tono sin definir)".
   - En el sitio se muestra como "Verde", tal como está en Productos. Definan si es Verde Pastel o Verde Oscuro.
2. **Segundo color de GroovyLamp.** En Productos la columna Color 2 está vacía, aunque sí tiene consumo de filamento.
3. **Fila de CurlyHolder Rosa Oscuro.** En Productos le faltan los gramos y el tiempo. El precio de $250 sí está.
4. **Tono exacto de Rosa Cosmo.** Usé `#FF4F9A` provisional, en `--rosa-cosmo` al inicio de `index.html`.
5. **Productos de temporada:** faltan precios verificados. La sección está apagada.
6. **Fotos de los 13 productos.**
7. **Prueba real del enlace ig.me** en teléfono.
8. **Filtros de cada producto:** la asignación es una propuesta mía y Cosmo debe confirmarla.
