-- Base de datos unificada y escalable para empresa importadora de electrodomésticos (Bolivia)
CREATE DATABASE IF NOT EXISTS inventario_intrapod;
USE inventario_intrapod;

-- Roles
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);
INSERT INTO roles (nombre) VALUES ('administrador'), ('empacador'), ('despachador'), ('proveedor')
    ON DUPLICATE KEY UPDATE nombre=nombre;

-- Sucursales
CREATE TABLE IF NOT EXISTS sucursales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    ciudad VARCHAR(100),
    direccion TEXT
);
INSERT INTO sucursales (nombre, ciudad, direccion) VALUES
('Sucursal Central', 'La Paz', 'Av. Principal 123')
    ON DUPLICATE KEY UPDATE nombre=nombre;

-- Proveedores
CREATE TABLE IF NOT EXISTS proveedores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    contacto VARCHAR(100),
    telefono VARCHAR(20),
    correo VARCHAR(100)
);
INSERT INTO proveedores (nombre, contacto, telefono, correo) VALUES
('Proveedor Demo', 'Juan Pérez', '78945612', 'proveedor@demo.com')
    ON DUPLICATE KEY UPDATE nombre=nombre;

-- Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contraseña TEXT NOT NULL,
    id_rol INT NOT NULL,
    id_sucursal INT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_rol) REFERENCES roles(id),
    FOREIGN KEY (id_sucursal) REFERENCES sucursales(id)
);
INSERT INTO usuarios (nombre, username, correo, contraseña, id_rol, id_sucursal) VALUES
('Administrador', 'admin', 'admin@intrapod.com', '$2b$12$Q5kGUoEJxVwOGkKSCnk9JuEPvJu4IkZ1FSwoQY8BjjHnKclZ3VVWC', 1, 1)
    ON DUPLICATE KEY UPDATE username=username;

-- Categorías de productos
CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);
INSERT INTO categorias (nombre) VALUES ('Refrigeradores'), ('Cocinas'), ('Microondas')
    ON DUPLICATE KEY UPDATE nombre=nombre;

-- Productos
CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    marca VARCHAR(50),
    modelo VARCHAR(50),
    id_categoria INT,
    precio_compra DECIMAL(10,2) NOT NULL,
    precio_venta DECIMAL(10,2) NOT NULL,
    stock_minimo INT DEFAULT 0,
    unidad VARCHAR(20) DEFAULT 'unidad',
    FOREIGN KEY (id_categoria) REFERENCES categorias(id)
);
INSERT INTO productos (nombre, descripcion, marca, modelo, id_categoria, precio_compra, precio_venta, stock_minimo, unidad) VALUES
('Refrigerador Samsung', 'Refrigerador de 2 puertas', 'Samsung', 'RS27T5200SR', 1, 3000.00, 3500.00, 2, 'unidad'),
('Cocina Mabe', 'Cocina a gas 4 hornillas', 'Mabe', 'EM7640CFIS0', 2, 1200.00, 1500.00, 3, 'unidad'),
('Microondas LG', 'Microondas digital 30L', 'LG', 'MS3042D', 3, 500.00, 700.00, 1, 'unidad')
    ON DUPLICATE KEY UPDATE nombre=nombre;

-- Inventario por sucursal
CREATE TABLE IF NOT EXISTS inventario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_producto INT NOT NULL,
    id_sucursal INT NOT NULL,
    stock INT DEFAULT 0,
    FOREIGN KEY (id_producto) REFERENCES productos(id),
    FOREIGN KEY (id_sucursal) REFERENCES sucursales(id)
);
INSERT INTO inventario (id_producto, id_sucursal, stock) VALUES
(1, 1, 10),
(2, 1, 5),
(3, 1, 8)
    ON DUPLICATE KEY UPDATE stock=stock;

-- Compras (corrigiendo para modelo escalable)
CREATE TABLE IF NOT EXISTS compra (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL, -- Relación con usuario que realiza la compra
    id_sucursal INT NOT NULL, -- Relación con sucursal donde se realiza la compra
    id_proveedor INT, -- Relación opcional con proveedor
    total DECIMAL(10,2),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
    FOREIGN KEY (id_sucursal) REFERENCES sucursales(id),
    FOREIGN KEY (id_proveedor) REFERENCES proveedores(id)
);
INSERT INTO compra (id_usuario, id_sucursal, id_proveedor, total) VALUES (1, 1, 1, 9000.00)
    ON DUPLICATE KEY UPDATE total=total;

-- Detalle de compra
CREATE TABLE IF NOT EXISTS detalle_compra (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_compra INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_compra) REFERENCES compra(id),
    FOREIGN KEY (id_producto) REFERENCES productos(id)
);
INSERT INTO detalle_compra (id_compra, id_producto, cantidad, precio_unitario, subtotal) VALUES
(1, 1, 2, 3000.00, 6000.00),
(1, 2, 1, 1200.00, 1200.00),
(1, 3, 4, 500.00, 2000.00)
    ON DUPLICATE KEY UPDATE subtotal=subtotal;

-- Movimientos de inventario
CREATE TABLE IF NOT EXISTS movimientos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_sucursal INT NOT NULL,
    id_proveedor INT,
    tipo ENUM('entrada','salida','solicitud','transferencia','ajuste') NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observacion TEXT,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
    FOREIGN KEY (id_sucursal) REFERENCES sucursales(id),
    FOREIGN KEY (id_proveedor) REFERENCES proveedores(id)
);
INSERT INTO movimientos (id_usuario, id_sucursal, id_proveedor, tipo, observacion) VALUES
(1, 1, NULL, 'entrada', 'Ingreso inicial de productos'),
(1, 1, NULL, 'salida', 'Venta de producto')
    ON DUPLICATE KEY UPDATE tipo=tipo;

CREATE TABLE IF NOT EXISTS detalle_movimiento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_movimiento INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2),
    FOREIGN KEY (id_movimiento) REFERENCES movimientos(id),
    FOREIGN KEY (id_producto) REFERENCES productos(id)
);
INSERT INTO detalle_movimiento (id_movimiento, id_producto, cantidad, precio_unitario) VALUES
(1, 1, 10, 3000.00),
(1, 2, 5, 1200.00),
(1, 3, 8, 500.00),
(2, 1, 1, 3500.00),
(2, 2, 1, 1500.00)
    ON DUPLICATE KEY UPDATE cantidad=cantidad;

-- Ventas y detalle de ventas
CREATE TABLE IF NOT EXISTS ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_sucursal INT NOT NULL,
    total DECIMAL(10,2),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('pendiente','entregado','cancelado') DEFAULT 'pendiente',
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
    FOREIGN KEY (id_sucursal) REFERENCES sucursales(id)
);
INSERT INTO ventas (id_usuario, id_sucursal, total, estado) VALUES
(1, 1, 3500.00, 'entregado'),
(1, 1, 1500.00, 'pendiente')
    ON DUPLICATE KEY UPDATE total=total;

CREATE TABLE IF NOT EXISTS detalle_venta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_venta INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_venta) REFERENCES ventas(id),
    FOREIGN KEY (id_producto) REFERENCES productos(id)
);
INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_unitario, subtotal) VALUES
(1, 1, 1, 3500.00, 3500.00),
(2, 2, 1, 1500.00, 1500.00)
    ON DUPLICATE KEY UPDATE subtotal=subtotal;

-- Auditoría
CREATE TABLE IF NOT EXISTS auditoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    accion TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);
--
