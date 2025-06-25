document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");
  fetch("http://localhost:8000/dashboard/admin/data", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.clear();
          window.location.href =
            "../dashboard_admin/pages/samples/error-404.html";
        }
        throw new Error("Error en la peticion");
      }
      return response.json();
    })
    .then((data) => {
      // Mostrar datos del dashboard
      if (data.info_cards) {
        document.getElementById("total-productos").textContent =
          data.info_cards.total_productos;
        document.getElementById("total-stock").textContent =
          data.info_cards.total_stock;
        document.getElementById("total-ventas").textContent =
          data.info_cards.total_ventas;
        document.getElementById(
          "suma-ventas"
        ).textContent = `$${data.info_cards.suma_ventas.toLocaleString(
          "en-US",
          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        )}`;

        // Actualizar recuadros de ejemplo
        const revenueCard = document.getElementById("revenue-card");
        if (revenueCard)
          revenueCard.textContent = `$${data.info_cards.suma_ventas.toLocaleString(
            "en-US",
            { minimumFractionDigits: 2, maximumFractionDigits: 2 }
          )}`;
        const salesCard = document.getElementById("sales-card");
        if (salesCard) salesCard.textContent = data.info_cards.total_ventas;
        const purchaseCard = document.getElementById("purchase-card");
        if (purchaseCard)
          purchaseCard.textContent = data.info_cards.total_productos;
      }
    })
    .catch((error) => {
      console.error(error);
    });

  // Obtener y mostrar productos más vendidos en la tabla
  fetch("http://localhost:8000/dashboard/admin/productos-mas-vendidos", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("No autorizado o error al obtener productos más vendidos");
      }
      return response.json();
    })
    .then((data) => {
      renderProductosTable(data);
    })
    .catch((error) => {
      console.error(error);
    });

  const logoutBtn = document.getElementById("cerrar_sesion");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      localStorage.clear();
      window.location.href = "../../pages/login.html";
    });
  }

  function renderProductosTable(productos) {
    const tbody = document.getElementById("usuarios-tbody");
    if (tbody) {
      tbody.innerHTML = "";
      productos.forEach((u, idx) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
      <td>${idx + 1}</td>
      <td>${u.producto || '-'}</td>
      <td>${u.unidades_vendidas != null ? u.unidades_vendidas : '0'}</td>
      <td>$${u.total_vendido != null ? Number(u.total_vendido).toFixed(2) : '0.00'}</td>
      <td>${u.sucursal || '-'}</td>
  `;
        tbody.appendChild(tr);
      });
    }
  }

  // Mostrar nombre y rol de usuario en el perfil (navbar y sidebar)
  const tokenUser = parseJwt(token);
  if (tokenUser && tokenUser.nombre) {
    // Solo mostrar el primer nombre
    const primerNombre = tokenUser.nombre.split(" ")[0];
    // Sidebar nombre
    const sidebarName = document.querySelector(".profile-name h5");
    if (sidebarName) sidebarName.textContent = primerNombre;
    // Sidebar rol
    const sidebarRole = document.querySelector(".profile-name span");
    if (sidebarRole) sidebarRole.textContent = tokenUser.rol || "";
    // Navbar nombre
    const navbarName = document.querySelector(".navbar-profile-name");
    if (navbarName) navbarName.textContent = primerNombre;
  }
  // Traducir opciones del menú de perfil a español
  const profileMenu = document.querySelector(
    '.dropdown-menu[aria-labelledby="profileDropdown"]'
  );
  if (profileMenu) {
    const items = profileMenu.querySelectorAll(".preview-item-content p");
    items.forEach((item) => {
      if (item.textContent.trim() === "Settings")
        item.textContent = "Configuración";
      if (item.textContent.trim() === "Log out")
        item.textContent = "Cerrar sesión";
      if (item.textContent.trim() === "Advanced settings")
        item.textContent = "Configuración avanzada";
    });
    // Traducir título
    const title = profileMenu.querySelector("h6");
    if (title) title.textContent = "Perfil";
  }
});
