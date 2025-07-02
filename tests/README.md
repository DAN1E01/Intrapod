# Suite de Pruebas con Robot Framework - Pollería Intrapod

Esta suite de pruebas automatizadas está diseñada para verificar el correcto funcionamiento del sistema de la Pollería Intrapod, incluyendo autenticación, inventario, ventas y control de acceso basado en roles.

## 📁 Estructura del Proyecto

```
tests/
├── requirements.txt          # Dependencias de Python/Robot Framework
├── ejecutar_pruebas.ps1     # Script PowerShell para ejecutar pruebas
├── suite_principal.robot    # Suite principal de configuración
├── README.md               # Este archivo
├── resources/              # Recursos y configuración común
│   └── common.robot        # Variables y keywords globales
├── keywords/               # Keywords reutilizables
│   ├── auth_keywords.robot      # Keywords de autenticación
│   ├── inventario_keywords.robot # Keywords de inventario
│   └── ventas_keywords.robot    # Keywords de ventas
├── api/                    # Pruebas de API
│   ├── test_auth_api.robot      # Pruebas API de autenticación
│   ├── test_inventario_api.robot # Pruebas API de inventario
│   └── test_ventas_api.robot    # Pruebas API de ventas
├── ui/                     # Pruebas de interfaz de usuario
│   ├── test_auth_ui.robot       # Pruebas UI de autenticación
│   ├── test_inventario_ui.robot # Pruebas UI de inventario
│   └── test_ventas_ui.robot     # Pruebas UI de ventas
└── results/                # Reportes generados (se crea automáticamente)
```

## 🚀 Instalación y Configuración

### 1. Instalar Dependencias

```powershell
# Navegar al directorio de pruebas
cd tests

# Instalar dependencias de Python
pip install -r requirements.txt
```

### 2. Configurar el Entorno

Antes de ejecutar las pruebas, asegúrese de que:

- El servidor backend esté ejecutándose en `http://localhost:8000`
- El frontend esté disponible en `http://localhost:5500/frontend` (o ajuste la URL en `common.robot`)
- La base de datos esté configurada y contenga datos de prueba

### 3. Verificar Credenciales

Las credenciales de prueba están definidas en `resources/common.robot`:

```robot
${ADMIN_USERNAME}        admin
${ADMIN_PASSWORD}        admin123
${EMPACADOR_USERNAME}    empacador1
${EMPACADOR_PASSWORD}    empacador123
```

Ajuste estas credenciales según su configuración.

## 📋 Ejecución de Pruebas

### Usando el Script PowerShell (Recomendado)

```powershell
# Ver ayuda
.\ejecutar_pruebas.ps1 -Ayuda

# Ejecutar todas las pruebas
.\ejecutar_pruebas.ps1

# Ejecutar solo pruebas de API
.\ejecutar_pruebas.ps1 -Tipo api

# Ejecutar solo pruebas de UI
.\ejecutar_pruebas.ps1 -Tipo ui

# Ejecutar pruebas por módulo
.\ejecutar_pruebas.ps1 -Tipo auth
.\ejecutar_pruebas.ps1 -Tipo inventario
.\ejecutar_pruebas.ps1 -Tipo ventas

# Ejecutar con tags específicos
.\ejecutar_pruebas.ps1 -Tags "admin AND crud"

# Ejecutar un archivo específico
.\ejecutar_pruebas.ps1 -Archivo "api/test_auth_api.robot"
```

### Usando Robot Framework Directamente

```powershell
# Ejecutar todas las pruebas
robot --outputdir results .

# Ejecutar pruebas por directorio
robot --outputdir results api/
robot --outputdir results ui/

# Ejecutar con tags
robot --outputdir results --include auth .
robot --outputdir results --include "admin AND inventario" .

# Ejecutar archivo específico
robot --outputdir results api/test_auth_api.robot
```

## 🏷️ Tags Disponibles

Las pruebas están organizadas con los siguientes tags:

### Por Tipo de Prueba
- `api`: Pruebas de API/Backend
- `ui`: Pruebas de interfaz de usuario

### Por Módulo
- `auth`: Autenticación y autorización
- `inventario`: Gestión de inventario
- `ventas`: Gestión de ventas

### Por Rol
- `admin`: Pruebas específicas para administradores
- `empacador`: Pruebas específicas para empacadores

### Por Funcionalidad
- `crud`: Operaciones Create, Read, Update, Delete
- `security`: Pruebas de seguridad
- `permissions`: Verificación de permisos
- `validation`: Validación de formularios
- `negative`: Casos de prueba negativos

### Ejemplos de Combinaciones
```powershell
# Solo pruebas de admin en inventario
.\ejecutar_pruebas.ps1 -Tags "admin AND inventario"

# Pruebas de seguridad en API
.\ejecutar_pruebas.ps1 -Tags "api AND security"

# Operaciones CRUD para empacadores
.\ejecutar_pruebas.ps1 -Tags "empacador AND crud"
```

## 📊 Reportes

Después de ejecutar las pruebas, se generan los siguientes reportes en la carpeta `results/`:

- **report.html**: Reporte principal con resumen de resultados
- **log.html**: Log detallado de la ejecución
- **output.xml**: Archivo XML con resultados (para integración CI/CD)

## 🧪 Casos de Prueba Incluidos

### Autenticación (`auth`)
- ✅ Login exitoso para admin y empacador
- ✅ Login fallido con credenciales incorrectas
- ✅ Verificación de tokens
- ✅ Control de acceso basado en roles
- ✅ Guards de navegación

### Inventario (`inventario`)
- ✅ CRUD completo de productos (admin y empacador)
- ✅ Gestión de stock por sucursal
- ✅ Filtros y búsquedas
- ✅ Validación de formularios
- ✅ Paridad de funciones entre roles

### Ventas (`ventas`)
- ✅ Creación de ventas con productos
- ✅ Visualización de detalles de venta
- ✅ Filtros por fecha
- ✅ Cálculo automático de totales
- ✅ Gestión de clientes y sucursales
- ✅ Paridad de funciones entre roles

## 🔧 Configuración Avanzada

### Cambiar URLs Base
Edite `resources/common.robot` para ajustar las URLs:

```robot
${BASE_URL}          http://localhost:8000
${FRONTEND_URL}      http://localhost:5500/frontend
```

### Agregar Nuevas Credenciales
```robot
${NEW_USER}          nuevo_usuario
${NEW_PASSWORD}      nueva_password
```

### Configurar Timeouts
```robot
${TIMEOUT}           10s
${IMPLICIT_WAIT}     5s
```

## 🐛 Troubleshooting

### Error: "Server not available"
- Verifique que el backend esté ejecutándose en el puerto correcto
- Confirme que no hay firewall bloqueando la conexión

### Error: "Element not found"
- Verifique que el frontend esté cargando correctamente
- Confirme que los selectores CSS coinciden con la aplicación actual

### Error: "Login failed"
- Verifique las credenciales en `common.robot`
- Confirme que los usuarios existen en la base de datos

### Pruebas Lentas
- Ajuste los timeouts en `common.robot`
- Considere usar headless browser para pruebas UI

## 📈 Integración CI/CD

Para integrar con sistemas de CI/CD, use:

```bash
# Generar reporte JUnit
robot --outputdir results --xunit junit.xml .

# Fallar si hay pruebas que fallan
robot --outputdir results --exitonfailure .
```

## 🤝 Contribuir

Para agregar nuevas pruebas:

1. Cree keywords reutilizables en `keywords/`
2. Agregue casos de prueba en `api/` o `ui/`
3. Use tags apropiados
4. Documente el propósito de cada prueba
5. Verifique que las pruebas sean independientes

## 📝 Notas Importantes

- Las pruebas están diseñadas para ser **independientes** entre sí
- Se recomienda ejecutar las pruebas en un **entorno de desarrollo/testing**
- Los datos de prueba se limpian automáticamente
- Ambos roles (admin y empacador) tienen **paridad completa** de funciones según el diseño actual

## 📞 Soporte

Para problemas o preguntas sobre las pruebas, revise:
1. Los logs detallados en `results/log.html`
2. La documentación de Robot Framework: https://robotframework.org/
3. Los comentarios en los archivos de prueba
