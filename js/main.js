/**
 * PROYECTO: Order Now - Plataforma de Gestión de Pedidos
 * ROL: Frontend Developer (Freelance)
 * TECNOLOGÍAS: HTML5, CSS3 (Variables & Grid), JavaScript ES6+
 * * ESTRUCTURA DE LA LÓGICA:
 * 1. Inicialización: Carga de datos mediante Fetch API (data.json).
 * 2. Estado: Gestión del carrito mediante un array de objetos.
 * 3. Renderizado: Manipulación dinámica del DOM para menú y carrito.
 * 4. Eventos: Control de interfaz, modales y proceso de checkout.
 */

// --- VARIABLES GLOBALES (Estado de la Aplicación) ---
let menuCompleto = []; // Almacena la "Base de Datos" del JSON
let carrito = [];      // Almacena los productos seleccionados por el usuario


// Elementos del DOM
const side = document.getElementById('cart-sidebar');
const over = document.getElementById('overlay');
const modal = document.getElementById('modal-confirm');

// 1. CARGA DE DATOS
async function iniciarApp() {
    try {
        const res = await fetch('data.json');
        if (!res.ok) throw new Error("Archivo no encontrado");
        const data = await res.json();
        menuCompleto = data.items;
        renderizarMenu(menuCompleto);
    } catch (e) {
        console.error("Error cargando el menú. Asegúrate de usar Live Server.");
    }
}


// 2. RENDERIZAR MENÚ DIVIDIDO POR CATEGORÍAS
function renderizarMenu(items) {
    // Filtramos los arrays
    const principales = items.filter(item => item.categoria === "Principales");
    const postres = items.filter(item => item.categoria === "Postres");

    // Seleccionamos los contenedores
    const containerPrincipales = document.getElementById('container-principales');
    const containerPostres = document.getElementById('container-postres');

    // Función auxiliar para generar el HTML de una lista de productos
    const generarHTML = (lista) => lista.map(plato => `
        <div class="card-plato">
            <img src="${plato.imagen}" alt="${plato.nombre}" loading="lazy">
            <div class="info">
                <h3>${plato.nombre}</h3>
                <p>${plato.descripcion}</p>
                <div class="precio-row">
                    <strong>${plato.precio.toFixed(2)}€</strong>
                    <button class="btn-add" onclick="agregar(${plato.id})">Añadir +</button>
                </div>
            </div>
        </div>
    `).join('');

    // Inyectamos el HTML en cada sección
    containerPrincipales.innerHTML = generarHTML(principales);
    containerPostres.innerHTML = generarHTML(postres);
}

// 3. LÓGICA DEL CARRITO
function agregar(id) {
    const item = carrito.find(p => p.id === id);
    if (item) {
        item.cantidad++;
    } else {
        carrito.push({ id, cantidad: 1 });
    }
    actualizar();
}

function cambiarCantidadCarrito(id, cambio) {
    const item = carrito.find(p => p.id === id);
    if (item) {
        item.cantidad += cambio;
        if (item.cantidad <= 0) {
            carrito = carrito.filter(p => p.id !== id);
        }
    }
    actualizar();
}

function actualizar() {
    // Actualizar contador del icono
    const totalQty = carrito.reduce((acc, p) => acc + p.cantidad, 0);
    document.getElementById('cart-count').innerText = totalQty;
    
    // Si el carrito está abierto, refrescar la lista
    if (side.classList.contains('open')) {
        renderizarCarrito();
    }
}

/**
 * Renderiza visualmente el contenido del carrito en el panel lateral (Sidebar).
 * Se ejecuta cada vez que hay un cambio en el array de estado 'carrito'.
 */
function renderizarCarrito() {
    // 1. Seleccionamos los elementos del DOM donde vamos a inyectar HTML y Texto
    const container = document.getElementById('cart-items-container');
    const totalDisplay = document.getElementById('cart-total-price');
    let totalAcumulado = 0; // Inicializamos el contador de dinero a 0

    // 2. Manejo de Estado Vacío: Si no hay items, mostramos mensaje y cortamos ejecución
    if (carrito.length === 0) {
        container.innerHTML = `<div class="empty-state">
                                  <p>Tu carrito está vacío </p>
                                  <small>¡Añade algo rico del menú!</small>
                               </div>`;
        totalDisplay.innerText = "0.00€";
        return; // Salimos de la función aquí
    }

    // 3. Generación dinámica del HTML (Mapping)
    // Recorremos el carrito y cruzamos datos con 'menuCompleto' para obtener precios y nombres reales
    container.innerHTML = carrito.map(itemCarrito => {
        // Buscamos el objeto completo del producto original usando su ID
        const producto = menuCompleto.find(p => p.id === itemCarrito.id);
        
        // Calculamos el subtotal de esa línea (Precio x Cantidad)
        const subtotal = producto.precio * itemCarrito.cantidad;
        
        // Sumamos al total global
        totalAcumulado += subtotal;
        
        // Retornamos la estructura HTML de la tarjeta del carrito
        // Nota: Usamos Template Literals (``) para inyectar variables ${}
        return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <strong>${producto.nombre}</strong>
                    <span>${producto.precio.toFixed(2)}€</span>
                </div>
                <div class="cart-item-actions">
                    <div class="qty-selector">
                        <button onclick="cambiarCantidadCarrito(${itemCarrito.id}, -1)">-</button>
                        <span>${itemCarrito.cantidad}</span>
                        <button onclick="cambiarCantidadCarrito(${itemCarrito.id}, 1)">+</button>
                    </div>
                    <span class="subtotal-item">${subtotal.toFixed(2)}€</span>
                </div>
            </div>
        `;
    }).join(''); // Unimos el array de strings en un solo HTML

    // 4. Actualización final del precio total en la interfaz
    totalDisplay.innerText = `${totalAcumulado.toFixed(2)}€`;
}

// 4. EVENTOS DE INTERFAZ (UI)
document.getElementById('cart-btn').onclick = () => {
    side.classList.add('open');
    over.style.display = 'block';
    renderizarCarrito();
};

document.getElementById('close-cart').onclick = cerrarCarrito;
over.onclick = cerrarCarrito;

function cerrarCarrito() {
    side.classList.remove('open');
    over.style.display = 'none';
}

document.getElementById('open-modal-empty').onclick = () => modal.style.display = 'flex';
document.getElementById('cancel-vaciar').onclick = () => modal.style.display = 'none';

document.getElementById('confirm-vaciar').onclick = () => {
    carrito = [];
    actualizar();
    modal.style.display = 'none';
};

document.getElementById('btn-checkout').onclick = () => {
    if (carrito.length === 0) return alert("El carrito está vacío");
    alert("¡Pedido tramitado con éxito!");
    carrito = [];
    actualizar();
    cerrarCarrito();
};

// Iniciar aplicación
iniciarApp();