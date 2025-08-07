// Firebase config (si usas Firebase, coloca aquí la config real)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { 
  getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCbE78-0DMWVEuf7rae3uyI-FqhDTPL3J8",
  authDomain: "canasta-boliviana.firebaseapp.com",
  projectId: "canasta-boliviana",
  storageBucket: "canasta-boliviana.appspot.com",
  messagingSenderId: "995591486402",
  appId: "1:995591486402:web:51517ae579805d2a43f45b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const selectProducto = document.getElementById("select-producto");
const selectCategoria = document.getElementById("Categoria");
document.getElementById('select-producto').innerHTML = '<option disabled selected>-- Selecciona un producto --</option>';


async function guardarRegistroSemanal(registro) {
  const claveSemana = obtenerClaveSemana(new Date());
  try {
    await addDoc(collection(db, "precios"), {
      ...registro,
      semana: claveSemana,
      fecha: serverTimestamp() // 🔹 Fecha exacta desde el servidor
    });
    console.log("✅ Registro guardado en Firestore");
    return true;
  } catch (error) {
    console.error("❌ Error al guardar en Firestore:", error);
    return false;
  }
}





// Función para cargar unidades según producto
function CargarUnidades() {
  const producto = document.getElementById('select-producto').value;
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



async function obtenerDatosSemana(claveSemana) {
  try {
    const q = query(collection(db, "precios"), where("semana", "==", claveSemana));
    const querySnapshot = await getDocs(q);
    const datos = [];
    querySnapshot.forEach(doc => {
      datos.push(doc.data());
    });
    return datos;
  } catch (error) {
    console.error("Error al obtener datos de Firestore:", error);
    return [];
  }
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

  document.getElementById('btn-semana-siguiente').disabled = (semanaSeleccionadaIndex === 0);

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
    // 🔹 Mostrar solo si hay mínimo 2 registros
    if (agrupados[producto].length >= 1) {
      tbodyEstadisticas.innerHTML += `<tr style="cursor:pointer;" onclick="mostrarDetalle('${producto}')">
        <td style="color:blue;">${producto}</td></tr>`;
    }
  });

  if (tbodyEstadisticas.innerHTML.trim() === '') {
    tbodyEstadisticas.innerHTML = '<tr><td>No hay productos con suficientes registros.</td></tr>';
  }
}


window.mostrarDetalle = async function(producto) {
  const claveSemana = semanaSeleccionadaIndex === 0
    ? obtenerClaveSemana(new Date())
    : calcularClaveSemanaConOffset(semanaSeleccionadaIndex);

  const datos = await obtenerDatosSemana(claveSemana);
  const registrosProducto = datos.filter(d => d.producto === producto);

  // 🔹 Evitar mostrar si hay menos de 2 registros
  if (registrosProducto.length < 1) {
    document.getElementById('detalle-contenido').innerHTML = "No hay suficientes registros para mostrar.";
    document.getElementById('detalle-estadisticas').classList.remove('hidden');
    return;
  }

  const detalleDiv = document.getElementById('detalle-estadisticas');
  const detalleContenido = document.getElementById('detalle-contenido');

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


async function mostrarDatosSemana() {
  const clave = semanaSeleccionadaIndex === 0
    ? obtenerClaveSemana(new Date())
    : calcularClaveSemanaConOffset(semanaSeleccionadaIndex);

  const datosSemana = await obtenerDatosSemana(clave);
  mostrarDatos(datosSemana);
  mostrarEstadisticas(datosSemana);
  mostrarTituloSemana(clave);
}


function limpiarFormulario() {
  document.getElementById('Categoria').selectedIndex = 0;
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

document.getElementById('btn-reportar').addEventListener('click', async () => {
  const producto = document.getElementById('select-producto').value?.trim() || "";
  const precioStr = document.getElementById('precio').value.trim();
  const equivalencia = document.getElementById('equivalencia').value || "";
  const ciudad = document.getElementById('ciudad').value.trim();

  // Validaciones antes de intentar guardar
  if (!producto) return mostrarToast('⚠️ Selecciona un producto.', '#e74c3c');
  if (!precioStr || isNaN(precioStr) || Number(precioStr) <= 0) return mostrarToast('⚠️ Ingresa un precio válido.', '#e74c3c');
  if (!equivalencia || equivalencia === 'Selecciona la Unidad') return mostrarToast('⚠️ Selecciona una unidad.', '#e74c3c');
  if (!ciudad || ciudad === 'Selecciona Ciudad') return mostrarToast('⚠️ Selecciona una ciudad.', '#e74c3c');

  // Si pasa las validaciones → intentar guardar
  const exito = await guardarRegistroSemanal({ 
    producto, 
    precio: Number(precioStr), 
    equivalencia, 
    ciudad
  });

  if (exito) {
    limpiarFormulario();
    mostrarToast('✅ Precio guardado con éxito.', '#27ae60');
    await mostrarDatosSemana(); 
  } else {
    // Este error solo sale si realmente Firestore falló
    mostrarToast('❌ No se pudo guardar. Revisa la conexión o permisos.', '#e74c3c');
  }
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

document.getElementById('select-producto').addEventListener('change', CargarUnidades);
window.addEventListener('load', () => {
  const selectCategoria = document.getElementById("Categoria");
  

  // Cargar categorías
  selectCategoria.innerHTML = '<option disabled selected>-- Selecciona una categoría --</option>';
  Object.keys(productosPorCategoria).forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    selectCategoria.appendChild(option);
  });

  // Cuando cambia categoría → cargar productos
  // Cuando cambia categoría → cargar productos
selectCategoria.addEventListener("change", (e) => {
  const categoria = e.target.value;
  const productos = productosPorCategoria[categoria] || [];

  selectProducto.innerHTML = '<option disabled selected>-- Selecciona un producto --</option>';
  
  productos.forEach(prod => {
    const opt = document.createElement("option");
    opt.value = prod;
    opt.textContent = prod;
    selectProducto.appendChild(opt);
  });
});

selectProducto.addEventListener("change", CargarUnidades);


  mostrarDatosSemana();
});



// Menú lateral
// Menú lateral
const overlay = document.getElementById('overlay');
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menu-toggle');

menuToggle.addEventListener('click', () => {
  sidebar.classList.toggle('hidden');

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
  // Eventos
  const selectCat = document.getElementById("Categoria");
  if (selectCat) {
    selectCat.addEventListener("change", (e) => {
      cargarProductos(e.target.value);
    });
  }

  const selectProd = document.getElementById("select-producto");
  if (selectProd) {
    selectProd.addEventListener("change", (e) => {
      CargarUnidades();
    });
  }
    // Cargar productos
  const cargarProductos = (categoria) => {
    
    if (!selectProducto) return;

    selectProducto.innerHTML = "<option disabled selected>-- Selecciona un producto --</option>";
    (productosPorCategoria[categoria] || []).forEach(p => {
      const opt = document.createElement("option");
      opt.value = p;
      opt.textContent = p;
      selectProducto.appendChild(opt);
    });

    // Limpiar unidades
    const unidadSelect = document.getElementById("equivalencia");
    if (unidadSelect) unidadSelect.innerHTML = "<option disabled selected>Selecciona unidad</option>";
  };
     // Productos por categoría
  const productosPorCategoria = {
    Verduras: [
      "Papa", "Camote", "Yuca", "Chuño", "Plátano macho", "Calabaza", "Aceituna",
      "Cebolla", "Zanahoria", "Tomate", "Remolacha", "Brócoli", "Espárragos",
      "Coliflor", "Apio", "Pepino", "Berenjena", "Lechugas", "Acelga", "Espinaca", "Frijoles"
    ],
    Proteínas: [
      "Carne de pollo", "Carne de res", "Huevo", "Pescados", "Atún", "Maríscos", "Langostas",
      "Carne de magra", "Lomo", "Pavo", "Frijoles", "Lentejas", "Frutos secos"
    ],
    Granos: [
      "Arroz integral", "Trigo", "Avena", "Polenta", "Palomitas de maíz", "Quinoa"
    ],
    Preparaciones: [
      "Pan integral", "Pan de maíz", "Pan blanco", "Fideo", "Galleta integral", "Pasta integral",
      "Pastel", "Sémola de maíz", "Panqueque", "Pizza", "Tortilla", "Wafle"
    ],
    Frutas: [
      "Manzana", "Plátano", "Arandanos", "Melón", "Cerezas", "Cóctel de frutas", "Toronja",
      "Uvas", "Limón", "Lima", "Nectarinas", "Naranja", "Fresas", "Durazno", "Pera",
      "Piña", "Ciruela", "Frambuesas", "Mandarinas", "Sandía", "Chabacano"
    ],
    Lácteos: [
      "Leche en polvo", "Leche evaporada", "Yogur", "Queso", "Helado",
      "Soya", "Coco", "Almendra", "Mantequillas"
    ],
    BasicosCocina: [
      "Azúcar", "Sal", "Aceite", "Harina", "Vinagre", "Salsa soya", "Mayonesa"
    ],
    Bebidas: [
      "Aguas", "Jugo", "Refresco", "Café", "Té"
    ],
    Aseopersonal: [
      "Papel higénico", "Pasta dental", "Colino Colgate", "Jaboncillo", "Jabon",
      "Cepillo Dental", "Cepillo de ropa", "Escoba", "Ace", "Shampoo", "Cremas"
    ]
  };
  




