/* =====================================================================
   CATÁLOGO DE THE COSMO STUDIO
   ---------------------------------------------------------------------
   Este es el ÚNICO archivo que se edita para cambiar productos,
   precios, colores y fotos. No hace falta tocar index.html.

   Cómo se lee cada producto:
     id        → nombre interno, sin espacios (no se muestra)
     nombre    → como se ve en el sitio y en el mensaje
     tipo      → qué es (se muestra debajo del nombre)
     categoria → filtro donde aparece: "lamparas", "escritorio",
                 "cocina", "decoracion", "clickers" o "temporada"
     precio    → número sin signo de pesos. Ej: 480
                 Si es null, el producto NO aparece en el sitio.
     colores   → lista entre corchetes, escrita igual que en
                 Registro Cosmo. Ej: ["Rosa Claro", "Verde"]
                 null = [FALTA DATO] (todavía no se cargan sus colores)
                 []   = el producto no lleva color
     fotos     → lista de archivos dentro de la carpeta fotos/.
                 Ej: ["fotos/mushylamp-1.jpg", "fotos/mushylamp-2.jpg"]
                 Vacía [] = se muestra un espacio con el nombre.
     uso       → frase corta opcional (ej. "Para tu recámara").
                 Vacía "" = no se muestra nada.
     temporada → true solo para piezas de temporada.

   Después de editar: guardar ("Commit changes") y esperar 1–2 minutos.
   ===================================================================== */

window.COSMO_CONFIG = {
  instagram: "thecosmostudio.mx",

  // Interruptor de la sección "De temporada".
  // false = apagada (no se ve). true = se muestra.
  mostrarTemporada: false,

  // false = al tocar "Pedir por Instagram" el sitio copia el pedido y
  //         muestra el aviso con un botón para abrir el chat.
  // true  = copia el pedido y abre el chat de inmediato.
  abrirInstagramDirecto: false
};

window.COSMO_CATALOGO = [
  // ---------- CATÁLOGO FIJO ----------
  // Precios: verificados contra Registro Cosmo › Productos › Precio Real.
  // Colores: combinaciones de Registro Cosmo › Productos (Color 1 y Color 2),
  // con los nombres corregidos según la tabla de alias de la pestaña
  // Colores de Productos ("Verde Tras" → "Verde Traslúcido", "MoradoTras" →
  // "Morado Traslúcido", "Azul Claro" → "Azul Cielo", "Cafe" → "Café").
  // Las piezas de dos colores se escriben "Color 1 y Color 2".
  // [FALTA DATO] "Verde" está marcado como "tono sin definir" en la tabla de alias.
  // [FALTA DATO] GroovyLamp: el Sheet no trae su segundo color.
  { id: "mushylamp",   nombre: "MushyLamp",   tipo: "Lámpara",                   categoria: "lamparas",   precio: 480, colores: ["Rosa Claro y Azul Oscuro", "Rosa Claro y Verde", "Morado y Blanco", "Rojo y Azul Cielo", "Naranja y Azul Oscuro", "Verde Traslúcido y Rosa Claro", "Blanco y Rojo"], fotos: [], uso: "" },
  { id: "groovylamp",  nombre: "GroovyLamp",  tipo: "Lámpara",                   categoria: "lamparas",   precio: 550, colores: ["Amarillo", "Naranja", "Morado Traslúcido"], fotos: [], uso: "" },
  { id: "whispervase", nombre: "WhisperVase", tipo: "Florero",                   categoria: "decoracion", precio: 275, colores: ["Azul Oscuro", "Rosa Oscuro", "Blanco"], fotos: [], uso: "" },
  { id: "wigglepot",   nombre: "WigglePot",   tipo: "Portalatas con agarradera", categoria: "cocina",     precio: 190, colores: ["Azul Cielo y Naranja", "Rosa Oscuro y Rosa Claro", "Verde y Morado"], fotos: [], uso: "" },
  { id: "curlyholder", nombre: "CurlyHolder", tipo: "Portalaptop",               categoria: "escritorio", precio: 250, colores: ["Azul Cielo", "Rosa Claro", "Verde", "Rosa Oscuro"], fotos: [], uso: "" },
  { id: "wobblestand", nombre: "WobbleStand", tipo: "Base / stand",              categoria: "escritorio", precio: 120, colores: ["Rosa Oscuro", "Rojo", "Morado", "Azul Cielo", "Verde", "Rosa Claro"], fotos: [], uso: "" },
  { id: "chubby",      nombre: "Chubby",      tipo: "Decoración",                categoria: "decoracion", precio: 75,  colores: ["Morado", "Blanco", "Rosa Claro", "Azul Oscuro"], fotos: [], uso: "" },
  { id: "frylock",     nombre: "Frylock",     tipo: "Clips en forma de papas fritas", categoria: "cocina", precio: 100, colores: ["Rojo y Amarillo"], fotos: [], uso: "" },
  { id: "clickerestrella",  nombre: "ClickerEstrella",  tipo: "Clicker / fidget", categoria: "clickers", precio: 35, colores: ["Amarillo"], fotos: [], uso: "" },
  { id: "clickerdumpling",  nombre: "ClickerDumpling",  tipo: "Clicker / fidget", categoria: "clickers", precio: 45, colores: ["Café y Blanco"], fotos: [], uso: "" },
  { id: "clickerconsola",   nombre: "ClickerConsola",   tipo: "Clicker / fidget", categoria: "clickers", precio: 45, colores: ["Morado y Amarillo"], fotos: [], uso: "" },
  { id: "clickerwaffle",    nombre: "ClickerWaffle",    tipo: "Clicker / fidget", categoria: "clickers", precio: 45, colores: ["Café y Amarillo"], fotos: [], uso: "" },
  { id: "destapalatascorazon", nombre: "DestapalatasCorazon", tipo: "Destapalatas", categoria: "cocina", precio: 15, colores: ["Morado"], fotos: [], uso: "" },

  // ---------- DE TEMPORADA ----------
  // [FALTA DATO]: renos, árbol, cascanueces, altares y demás piezas de
  // temporada todavía no tienen precio verificado. Cuando lo tengan,
  // copien esta plantilla (quitando las dos barras //), llénenla con los
  // datos de Registro Cosmo y pongan mostrarTemporada: true arriba.
  //
  // { id: "nombre-sin-espacios", nombre: "Nombre", tipo: "Qué es", categoria: "temporada", temporada: true, precio: null, colores: null, fotos: [], uso: "" },
];
