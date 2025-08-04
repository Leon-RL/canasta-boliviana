// Firebase config (si usas Firebase, coloca aquí la config real)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyCbE78-0DMWVEuf7rae3uyI-FqhDTPL3J8",
  authDomain: "canasta-boliviana.firebaseapp.com",
  projectId: "canasta-boliviana",
  storageBucket: "canasta-boliviana.appspot.com",
  messagingSenderId: "995591486402",
  appId: "1:995591486402:web:51517ae579805d2a43f45b"
};

const app = initializeApp(firebaseConfig);


// Función para cargar unidades según producto
export function CargarUnidades() {
  const producto = document.getElementById('Producto').value;
  const equivalenciaSelect = document.getElementById('equivalencia');
  equivalenciaSelect.innerHTML = '';

  const unidadesGenerales = [
    { value: 'g', label: 'Gramos (g)' },
    { value: 'kg', label: 'Kilogramos (kg)' },
    { value: 'lb', label: 'Libras (lb)' },
    { value: 'a', label: 'Arroba (a)' },
    { value: 'q', label: 'Quintal (q)' },
    { value: 't', label: 'Tonelada (t)' }
  ];

  const unidadesLiquidos = [
    { value: 'ml', label: 'Mililitros (ml)' },
    { value: 'l', label: 'Litros (l)' },
    { value: 'gal', label: 'Galón (gal)' },
    { value: 'bbl', label: 'Barril (bbl)' }
  ];

  const unidadesUnidad = [
    { value: 'unidad', label: 'Unidad' }
  ];

  const unidadesPaquete = [
    { value: 'paquete', label: 'Paquete' }
  ];
  const unidadesMaple = [
    { value: 'maple', label: 'Maple' }
  ];

  // Productos que pueden ser "unidad o paquete"
  const productosUnidadPaquete = ['Papel higénico', 'Sal', 'Jabon', 'Pañales', 'Shampoo', 'Detergente', 'Wafle',
     'Pasta dental', 'Jaboncillo','Mayonesa', 'Salsa soya','Pata dental'];

  // Productos líquidos
  const productosLiquidos = ['Aceite', 'Leche evaporada', 'Café', 'Aguas', 'Jugo', 'Refresco', 'Té'];

  // Productos que solo son por unidad
  const productosUnidad = ['Huevo', 'Pan integral', 'Pan de maíz', 'Pan blanco', 'Pastel', 'Panqueque',
     'Pizza', 'Tortilla', 'Helado','Colino Colgate','Cepillo Dental','Cepillo de ropa','Escoba','Ace','Cremas'];
  const productosUnidadMaple=['Huevo'];

  let opciones;

  if (productosUnidadPaquete.includes(producto)) {
    opciones = [...unidadesUnidad, ...unidadesPaquete];
  }else if (productosUnidadMaple.includes(producto)) {
    opciones = [...unidadesUnidad, ...unidadesMaple];
  } else if (productosLiquidos.includes(producto)) {
    opciones = unidadesLiquidos;
  } else if (productosUnidad.includes(producto)) {
    opciones = unidadesUnidad;
  } else {
    opciones = unidadesGenerales;
  }

  equivalenciaSelect.innerHTML = '<option disabled selected>Selecciona la Unidad</option>';
  opciones.forEach(u => {
    equivalenciaSelect.innerHTML += `<option value="${u.value}">${u.label}</option>`;
  });
}



function obtenerClaveSemana(fecha) {
  const d = new Date(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()));
  const dia = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dia);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const semanaNum = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-${semanaNum.toString().padStart(2, '0')}`;
}

function fechasSemana(year, week) {
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const dow = simple.getDay();
  const ISOweekStart = simple;
  if (dow <= 4) ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  const ISOweekEnd = new Date(ISOweekStart);
  ISOweekEnd.setDate(ISOweekStart.getDate() + 6);
  return { inicio: ISOweekStart, fin: ISOweekEnd };
}

function formatearFecha(fecha) {
  return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function guardarRegistroSemanal(registro) {
  const historial = JSON.parse(localStorage.getItem('historialSemanal')) || {};
  const claveSemana = obtenerClaveSemana(new Date());
  if (!historial[claveSemana]) historial[claveSemana] = [];
  historial[claveSemana].push(registro);
  localStorage.setItem('historialSemanal', JSON.stringify(historial));
}

function obtenerDatosSemana(claveSemana) {
  const historial = JSON.parse(localStorage.getItem('historialSemanal')) || {};
  return historial[claveSemana] || [];
}

let semanaSeleccionadaIndex = 0;

function calcularClaveSemanaConOffset(offset) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + offset * 7);
  return obtenerClaveSemana(fecha);
}

function mostrarTituloSemana(claveSemana) {
  const titulo = document.getElementById('titulo-semana');
  const [yearStr, semanaStr] = claveSemana.split('-');
  const year = Number(yearStr);
  const semana = Number(semanaStr);
  const { inicio, fin } = fechasSemana(year, semana);
  const rango = `Del ${formatearFecha(inicio)} al ${formatearFecha(fin)}`;

  titulo.textContent = semanaSeleccionadaIndex === 0
    ? `Semana Actual (${rango})`
    : `Semana ${semana} del ${year} (${rango})`;

  document.getElementById('btn-semana-siguiente').disabled = (semanaSeleccionadaIndex >= 0);
}

function unidadLabel(codigo) {
  const map = {
    g: 'Gramos (g)', kg: 'Kilogramos (kg)', lb: 'Libras (lb)',a:'Arroba (a)',
    q: 'Quintal (q)', t: 'Tonelada (t)', ml: 'Mililitros (ml)',
    l: 'Litros (l)', gal: 'Galón (gal)', bbl: 'Barril (bbl)', unidad: 'Unidad',paquete:'Paquete',maple:'Maple'
  };
  return map[codigo] || codigo;
}

function mostrarDatos(datos) {
  const tbody = document.getElementById('tabla-precios');
  tbody.innerHTML = '';
  if (!datos.length) {
    tbody.innerHTML = `<tr><td colspan="4">No hay datos registrados.</td></tr>`;
    return;
  }
  datos.forEach(d => {
    tbody.innerHTML += `<tr>
      <td>${d.producto}</td>
      <td>${d.precio.toFixed(2)}</td>
      <td>${unidadLabel(d.equivalencia)}</td>
      <td>${d.ciudad}</td>
    </tr>`;
  });
}

function mostrarEstadisticas(datos) {
  const tbodyEstadisticas = document.getElementById('tabla-estadisticas');
  tbodyEstadisticas.innerHTML = '';
  const agrupados = {};

  datos.forEach(d => {
    if (!agrupados[d.producto]) agrupados[d.producto] = [];
    agrupados[d.producto].push(d);
  });

  if (Object.keys(agrupados).length === 0) {
    tbodyEstadisticas.innerHTML = '<tr><td>No hay productos.</td></tr>';
    return;
  }

  Object.keys(agrupados).forEach(producto => {
    tbodyEstadisticas.innerHTML += `<tr style="cursor:pointer;" onclick="mostrarDetalle('${producto}')">
      <td style="color:blue;">${producto}</td></tr>`;
  });
}

window.mostrarDetalle = function(producto) {
  const claveSemana = semanaSeleccionadaIndex === 0
    ? obtenerClaveSemana(new Date())
    : calcularClaveSemanaConOffset(semanaSeleccionadaIndex);
  const datos = obtenerDatosSemana(claveSemana);
  const registrosProducto = datos.filter(d => d.producto === producto);
  const detalleDiv = document.getElementById('detalle-estadisticas');
  const detalleContenido = document.getElementById('detalle-contenido');

  if (!registrosProducto.length) {
    detalleContenido.innerHTML = "Sin registros.";
    detalleDiv.classList.remove('hidden');
    return;
  }

  let detalleHTML = `<strong>${producto}</strong><br><br>`;
  const agrupados = {};
  registrosProducto.forEach(r => {
    if (!agrupados[r.equivalencia]) agrupados[r.equivalencia] = [];
    agrupados[r.equivalencia].push(r);
  });

  for (const unidad in agrupados) {
  const registros = agrupados[unidad];
  const precios = registros.map(r => r.precio);
  const max = Math.max(...precios);
  const min = Math.min(...precios);

  const ciudadesMax = registros.filter(r => r.precio === max).map(r => r.ciudad).join(', ');
  const ciudadesMin = registros.filter(r => r.precio === min).map(r => r.ciudad).join(', ');

  let titulo = '';

  if (unidad === 'unidad') titulo = 'Unidad';
  else if (unidad === 'paquete') titulo = 'Paquete';
  else if (unidad === 'maple') titulo = 'Maple';
  else titulo = unidadLabel(unidad);

  detalleHTML += `<strong>${titulo}:</strong> ${unidadLabel(unidad)}<br>
    Máximo: ${max.toFixed(2)} Bs (${ciudadesMax})<br>
    Mínimo: ${min.toFixed(2)} Bs (${ciudadesMin})<br><br>`;
}


  const promedio = registrosProducto.reduce((sum, r) => sum + r.precio, 0) / registrosProducto.length;
  detalleHTML += `<strong>Promedio:</strong> ${promedio.toFixed(2)} Bs<br>`;
  detalleContenido.innerHTML = detalleHTML;
  detalleDiv.classList.remove('hidden');
};

function mostrarDatosSemana() {
  const clave = semanaSeleccionadaIndex === 0
    ? obtenerClaveSemana(new Date())
    : calcularClaveSemanaConOffset(semanaSeleccionadaIndex);
  const datosSemana = obtenerDatosSemana(clave);
  mostrarDatos(datosSemana);
  mostrarEstadisticas(datosSemana);
  mostrarTituloSemana(clave);
}

function limpiarFormulario() {
  document.getElementById('Producto').selectedIndex = 0;
  document.getElementById('precio').value = '';
  document.getElementById('equivalencia').innerHTML = '<option disabled selected>Selecciona la Unidad</option>';
  document.getElementById('ciudad').selectedIndex = 0;
}

function mostrarToast(msg, color) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.style.background = color;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
}

document.getElementById('btn-reportar').addEventListener('click', () => {
  const producto = document.getElementById('Producto').value.trim();
  const precioStr = document.getElementById('precio').value.trim();
  const equivalencia = document.getElementById('equivalencia').value.trim();
  const ciudad = document.getElementById('ciudad').value.trim();

  // Validaciones:
  if (!producto || categorias.hasOwnProperty(producto) ) {
    // No debe ser vacío ni categoría (solo productos válidos)
    mostrarToast('⚠️ Por favor, selecciona un producto válido.', '#e74c3c');
    return;
  }
  if (!precioStr || isNaN(precioStr) || Number(precioStr) <= 0) {
    mostrarToast('⚠️ Ingresa un precio válido mayor que cero.', '#e74c3c');
    return;
  }
  if (!equivalencia || equivalencia === 'Selecciona la Unidad') {
    mostrarToast('⚠️ Selecciona una unidad válida.', '#e74c3c');
    return;
  }
  if (!ciudad || ciudad === 'Selecciona Ciudad') {
    mostrarToast('⚠️ Selecciona una ciudad válida.', '#e74c3c');
    return;
  }

  // Si pasa todas las validaciones
  const precio = Number(precioStr);
  guardarRegistroSemanal({ producto, precio, equivalencia, ciudad, fecha: new Date().toISOString() });
  limpiarFormulario();
  mostrarToast('✅ Precio guardado con éxito.', '#27ae60');
  mostrarDatosSemana();
});


document.getElementById('btn-semana-anterior').addEventListener('click', () => {
  semanaSeleccionadaIndex--;
  mostrarDatosSemana();
});

document.getElementById('btn-semana-siguiente').addEventListener('click', () => {
  if (semanaSeleccionadaIndex < 0) {
    semanaSeleccionadaIndex++;
    mostrarDatosSemana();
  }
});

document.getElementById('Producto').addEventListener('change', CargarUnidades);
window.addEventListener('load', () => {
  mostrarDatosSemana();
  CargarUnidades();
});

// Menú lateral
// Menú lateral
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menu-toggle');

menuToggle.addEventListener('click', () => {
  sidebar.classList.toggle('hidden');
  overlay.classList.toggle('active');
});
overlay.addEventListener('click', () => {
  sidebar.classList.add('hidden');
  overlay.classList.remove('active');
});

window.mostrarSeccion = function(id) {
  document.querySelectorAll('.card').forEach(sec => sec.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
  sidebar.classList.add('hidden');
  if (id === 'estadisticas') mostrarDatosSemana();
};

// Cierra el menú si haces clic fuera de él
document.addEventListener('click', function (event) {
  const isClickInsideSidebar = sidebar.contains(event.target);
  const isClickOnMenuBtn = menuToggle.contains(event.target);

  if (!isClickInsideSidebar && !isClickOnMenuBtn && !sidebar.classList.contains('hidden')) {
    sidebar.classList.add('hidden');
  }
});





/*const btnMostrar = document.getElementById("btn-mostrar-qr");
    const modalFondo = document.getElementById("modal-fondo");
    const btnCerrar = document.getElementById("cerrar-modal");

    btnMostrar.addEventListener("click", () => {
      modalFondo.style.display = "flex";
      document.body.style.overflow = "hidden"; // evita scroll cuando modal abierto
    });

    btnCerrar.addEventListener("click", () => {
      modalFondo.style.display = "none";
      document.body.style.overflow = "auto"; // permite scroll cuando modal cerrado
    });

    // Cerrar modal si se hace click fuera del contenido
    modalFondo.addEventListener("click", (e) => {
      if(e.target === modalFondo){
        modalFondo.style.display = "none";
        document.body.style.overflow = "auto";
      }
    });*/

    
    
    const categorias = {
  
  Verduras: ["Papa","Camote","Yuca","Chuño","Plátano macho","Calabaza", "Aceituna",
    "Cebolla", "Zanahoria", "Tomate","Remolacha","Brócoli","Espárragos",
    "Coliflor","Apio","Pepino","Berenjena","Lechugas","Acelga","Espinaca","Frijoles"],
  Proteínas:["Carne de pollo","Carne de res","Huevo","Pescados","Atún","Maríscos","Langostas",
    "Carne de magra","Lomo","Pavo","","Frijoles","Lentejas","Frutos secos",""],
  Granos:["Arroz integral","Trigo","Avena","Polenta","Palomitas de maíz","Quinoa"],
  Preparaciones:["Pan integral","Pan de maíz","Pan blanco","Fideo","Galleta integral","Pasta integral",
    "Pastel","Sémola de maíz","Panqueque","Pizza","Tortilla","Wafle"],
  Frutas:["Manzana","Plátano","Arandanos","Melón","Cerezas","Cóctel de frutas","Toronja",
    "Uvas","Limón","Lima","Nectarinas","Naranja","Fresas","Durazno","Pera","Piña","Ciruela",
    "Frambuesas","Mandarinas","Sandía","Chabacano"],
  Lácteos: ["Leche en polvo", "Leche evaporada","Yogur","Queso","Helado","Soya","Coco","Almendra","Mantequillas"],
  BasicosCocina:["Azúcar","Sal","Aceite","Harina","Vinagre","Salsa soya","Mayonesa"],
  Bebidas:["Aguas","Jugo","Refresco","Café","Té"],
  Aseopersonal:["Papel higénico","Pasta dental","Colino Colgate","Jaboncillo","Jabon","Cepillo Dental","Cepillo de ropa",
    "Escoba","Ace","Shampoo","Cremas"]
};

const productosInsertados = {
  
  Verduras: false,
  Proteínas: false,
  Granos:false,
  Preparaciones:false,
  Frutas:false,
  Lácteos: false,
  BasicosCocina: false,
  Bebidas:false,
  Aseopersonal:false
};

const select = document.getElementById('Producto');
let ultimaCategoriaClick = null;

// Cambia el evento a mousedown para capturar clic antes de que select cambie
select.addEventListener('mousedown', function(e) {
  e.preventDefault();
  const opciones = Array.from(select.options);

  // Obtener la opción sobre la que se hizo clic
  const clickedOption = opciones.find(opt => {
    const rect = opt.getBoundingClientRect();
    return e.clientY >= rect.top && e.clientY <= rect.bottom;
  });

  if (!clickedOption || !clickedOption.value) return;

  const valor = clickedOption.value;

  if (categorias[valor]) {
    // Es una categoría
    if (valor === ultimaCategoriaClick) {
      eliminarProductosDe(valor);
      ultimaCategoriaClick = null;
      select.value = ""; // Reinicia visual
    } else {
      if (ultimaCategoriaClick) eliminarProductosDe(ultimaCategoriaClick);
      insertarProductosDebajo(valor);
      ultimaCategoriaClick = valor;
      select.value = valor;
    }
  } else {
    // Es un producto
    select.value = valor; // ✅ queda seleccionado visualmente
    select.innerHTML = `<option selected value="${valor}">${valor}</option>`;

    ultimaCategoriaClick = null;
    if (typeof CargarUnidades === "function") CargarUnidades(); // ✅ carga unidades
  }
});

function insertarProductosDebajo(categoria) {
  if (productosInsertados[categoria]) return;

  const opciones = Array.from(select.options);
  const indice = opciones.findIndex(opt => opt.value === categoria);

  categorias[categoria].forEach((producto, i) => {
    const option = document.createElement('option');
    option.value = producto;
    option.textContent = " " + producto;
    option.classList.add('producto');
    select.add(option, indice + 1 + i);
  });

  productosInsertados[categoria] = true;
}

function eliminarProductosDe(categoria) {
  const opciones = Array.from(select.options);
  for (let i = opciones.length - 1; i >= 0; i--) {
    const opt = opciones[i];
    if (opt.classList.contains('producto') && categorias[categoria].includes(opt.value)) {
      select.remove(i);
    }
  }
  productosInsertados[categoria] = false;
}




