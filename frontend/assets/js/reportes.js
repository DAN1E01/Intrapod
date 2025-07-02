// frontend/assets/js/reportes.js
// Este archivo obtiene datos reales del backend y genera los gráficos de reportes

const API_URL = window.API_URL || 'http://localhost:8000'; // Ajusta si usas otra URL

document.addEventListener('DOMContentLoaded', async () => {
  // Cargar Chart.js si no está cargado
  if (typeof Chart === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = () => cargarReportes();
    document.head.appendChild(script);
  } else {
    cargarReportes();
  }
});

// frontend/assets/js/reportes.js
// Este archivo obtiene datos reales del backend y genera los gráficos de reportes

document.addEventListener('DOMContentLoaded', async () => {
  // Cargar Chart.js si no está cargado
  if (typeof Chart === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = () => cargarReportes();
    document.head.appendChild(script);
  } else {
    cargarReportes();
  }
});

// Función para decodificar JWT
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

// Detectar el rol del usuario
function getUserRole() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  const decoded = parseJwt(token);
  return decoded ? decoded.rol : null;
}

async function cargarReportes() {
  const userRole = getUserRole();
  
  if (userRole === 'administrador') {
    // Administradores ven todos los reportes
    const ventasPorMes = await fetchDatos('/dashboard/admin/ventas_por_mes');
    renderLineChart(ventasPorMes);

    const inventarioPorCategoria = await fetchDatos('/dashboard/admin/inventario_por_categoria');
    renderBarChart(inventarioPorCategoria);

    const proporcionProductos = await fetchDatos('/dashboard/admin/proporcion_productos');
    renderDoughnutChart(proporcionProductos);

    const ventasPorProducto = await fetchDatos('/dashboard/admin/ventas_por_producto');
    renderPieChart(ventasPorProducto);
  } else if (userRole === 'empacador') {
    // Empacadores ven reportes limitados
    // Ocultar gráfico de ventas por mes (información financiera)
    const lineChartContainer = document.getElementById('lineChart');
    if (lineChartContainer) {
      lineChartContainer.parentElement.parentElement.style.display = 'none';
    }

    // Mostrar solo inventario por categoría de su sucursal
    const inventarioPorCategoria = await fetchDatos('/dashboard/admin/inventario_por_categoria');
    renderBarChart(inventarioPorCategoria);

    const proporcionProductos = await fetchDatos('/dashboard/admin/proporcion_productos');
    renderDoughnutChart(proporcionProductos);

    // En lugar del pie chart de ventas, mostrar distribución de stock
    const stockData = await fetchDatos('/dashboard/admin/inventario_por_categoria');
    renderPieChart(stockData);
  }
}

const token = localStorage.getItem('token');

async function fetchDatos(endpoint) {
  try {
    const res = await fetch(API_URL + endpoint, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error('Error al obtener datos');
    return await res.json();
  } catch (e) {
    console.error(e);
    return { labels: [], data: [] };
  }
}

function renderLineChart({ labels, data }) {
  const ctx = document.getElementById('lineChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Ventas',
        data,
        borderColor: '#4B49AC',
        backgroundColor: 'rgba(75,73,172,0.1)',
        fill: true,
        tension: 0.4
      }]
    },
    options: { responsive: true }
  });
}

function renderBarChart({ labels, data }) {
  const ctx = document.getElementById('barChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Inventario',
        data,
        backgroundColor: '#FFC100'
      }]
    },
    options: { responsive: true }
  });
}

function renderDoughnutChart({ labels, data }) {
  const ctx = document.getElementById('doughnutChart').getContext('2d');
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: [
          '#4B49AC', '#FFC100', '#248AFD', '#FF4747', '#57B657', '#8F5FE8', '#F3797E'
        ]
      }]
    },
    options: { responsive: true }
  });
}

function renderPieChart({ labels, data }) {
  const ctx = document.getElementById('pieChart').getContext('2d');
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: [
          '#4B49AC', '#FFC100', '#248AFD', '#FF4747', '#57B657', '#8F5FE8', '#F3797E'
        ]
      }]
    },
    options: { responsive: true }
  });
}
