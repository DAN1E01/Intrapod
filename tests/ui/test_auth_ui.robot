*** Settings ***
Documentation    Pruebas de interfaz de usuario para autenticación
Resource         ../resources/common.robot
Resource         ../keywords/auth_keywords.robot
Suite Setup      Configurar Navegador
Suite Teardown   Cerrar Navegador

*** Test Cases ***
Login Exitoso Como Administrador UI
    [Documentation]    Verifica el login exitoso como administrador en la interfaz
    [Tags]    ui    auth    admin
    Realizar Login Como Admin
    Verificar Dashboard Access    administrador
    Verificar Navigation Menu    administrador
    Realizar Logout

Login Exitoso Como Empacador UI
    [Documentation]    Verifica el login exitoso como empacador en la interfaz
    [Tags]    ui    auth    empacador
    Realizar Login Como Empacador
    Verificar Dashboard Access    empacador
    Verificar Navigation Menu    empacador
    Realizar Logout

Login Fallido UI
    [Documentation]    Verifica que el login falle con credenciales incorrectas
    [Tags]    ui    auth    negative
    Verificar Login Fallido    usuario_inexistente    password_incorrecto

Navegación Entre Páginas Admin
    [Documentation]    Verifica la navegación entre páginas para administrador
    [Tags]    ui    navigation    admin
    Realizar Login Como Admin
    
    # Navegar a inventario
    Click Link    xpath://a[contains(@href, 'inventario')]
    Wait Until Location Contains    inventario
    Page Should Contain Element    class:inventory-container
    
    # Navegar a ventas
    Click Link    xpath://a[contains(@href, 'ventas')]
    Wait Until Location Contains    ventas
    Page Should Contain Element    class:ventas-container
    
    # Navegar a reportes
    Click Link    xpath://a[contains(@href, 'reportes')]
    Wait Until Location Contains    reportes
    Page Should Contain Element    class:reportes-container
    
    # Navegar a usuarios (solo admin)
    Click Link    xpath://a[contains(@href, 'usuarios')]
    Wait Until Location Contains    usuarios
    Page Should Contain Element    class:usuarios-container
    
    Realizar Logout

Navegación Entre Páginas Empacador
    [Documentation]    Verifica la navegación entre páginas para empacador
    [Tags]    ui    navigation    empacador
    Realizar Login Como Empacador
    
    # Navegar a inventario
    Click Link    xpath://a[contains(@href, 'inventario')]
    Wait Until Location Contains    inventario
    Page Should Contain Element    class:inventory-container
    
    # Navegar a ventas
    Click Link    xpath://a[contains(@href, 'ventas')]
    Wait Until Location Contains    ventas
    Page Should Contain Element    class:ventas-container
    
    # Navegar a reportes
    Click Link    xpath://a[contains(@href, 'reportes')]
    Wait Until Location Contains    reportes
    Page Should Contain Element    class:reportes-container
    
    Realizar Logout

Verificar Guards De Autenticación
    [Documentation]    Verifica que los guards de autenticación funcionen correctamente
    [Tags]    ui    auth    security
    # Intentar acceder directamente sin login
    Go To    ${FRONTEND_URL}/pages/dashboard_admin/index.html
    Wait Until Location Contains    login.html
    
    Go To    ${FRONTEND_URL}/pages/dashboard_empacador/index.html
    Wait Until Location Contains    login.html

Logout Desde Diferentes Páginas
    [Documentation]    Verifica que el logout funcione desde cualquier página
    [Tags]    ui    auth    logout
    Realizar Login Como Admin
    
    # Logout desde inventario
    Click Link    xpath://a[contains(@href, 'inventario')]
    Wait Until Location Contains    inventario
    Realizar Logout
    
    # Login nuevamente y logout desde ventas
    Realizar Login Como Admin
    Click Link    xpath://a[contains(@href, 'ventas')]
    Wait Until Location Contains    ventas
    Realizar Logout

Verificar Información De Usuario En Dashboard
    [Documentation]    Verifica que la información del usuario se muestre correctamente
    [Tags]    ui    profile    dashboard
    Realizar Login Como Admin
    Page Should Contain Element    class:user-info
    Page Should Contain    admin
    Realizar Logout
    
    Realizar Login Como Empacador
    Page Should Contain Element    class:user-info
    Page Should Contain    empacador
    Realizar Logout

Verificar Redirección Basada En Rol
    [Documentation]    Verifica que los usuarios sean redirigidos al dashboard correcto
    [Tags]    ui    auth    role    redirect
    # Admin debe ir a dashboard_admin
    Realizar Login Como Admin
    Location Should Contain    dashboard_admin
    Realizar Logout
    
    # Empacador debe ir a dashboard_empacador
    Realizar Login Como Empacador
    Location Should Contain    dashboard_empacador
    Realizar Logout
