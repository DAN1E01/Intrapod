*** Settings ***
Documentation    Pruebas de API para ventas
Resource         ../resources/common.robot
Resource         ../keywords/auth_keywords.robot
Resource         ../keywords/ventas_keywords.robot
Suite Setup      Setup Test Environment
Suite Teardown   Cleanup Test Environment

*** Variables ***
${ID_CLIENTE}            1
${ID_SUCURSAL}           1
${ID_PRODUCTO}           1
${CANTIDAD_PRODUCTO}     2

*** Test Cases ***
Admin Puede Obtener Lista De Ventas
    [Documentation]    Verifica que el admin pueda obtener la lista de ventas
    [Tags]    ventas    admin    api
    ${token}=    Login As Admin
    ${ventas}=    Obtener Lista De Ventas    ${token}    admin
    Should Contain    ${ventas}    ventas
    Log    Lista de ventas obtenida exitosamente

Empacador Puede Obtener Lista De Ventas
    [Documentation]    Verifica que el empacador pueda obtener la lista de ventas
    [Tags]    ventas    empacador    api
    ${token}=    Login As Empacador
    ${ventas}=    Obtener Lista De Ventas    ${token}    empacador
    Should Contain    ${ventas}    ventas
    Log    Lista de ventas obtenida exitosamente por empacador

Admin Puede Crear Venta
    [Documentation]    Verifica que el admin pueda crear una nueva venta
    [Tags]    ventas    admin    crud    api
    ${token}=    Login As Admin
    @{productos}=    Create List    ${ID_PRODUCTO}
    &{producto_venta}=    Create Dictionary    id=${ID_PRODUCTO}    cantidad=${CANTIDAD_PRODUCTO}
    @{productos_venta}=    Create List    ${producto_venta}
    ${resultado}=    Crear Venta    ${token}    ${ID_CLIENTE}    ${ID_SUCURSAL}    ${productos_venta}    admin
    Should Contain    ${resultado}    message
    Log    Venta creada exitosamente

Empacador Puede Crear Venta
    [Documentation]    Verifica que el empacador pueda crear una nueva venta
    [Tags]    ventas    empacador    crud    api
    ${token}=    Login As Empacador
    &{producto_venta}=    Create Dictionary    id=${ID_PRODUCTO}    cantidad=${CANTIDAD_PRODUCTO}
    @{productos_venta}=    Create List    ${producto_venta}
    ${resultado}=    Crear Venta    ${token}    ${ID_CLIENTE}    ${ID_SUCURSAL}    ${productos_venta}    empacador
    Should Contain    ${resultado}    message
    Log    Venta creada exitosamente por empacador

Admin Puede Obtener Clientes
    [Documentation]    Verifica que el admin pueda obtener la lista de clientes
    [Tags]    ventas    admin    clientes    api
    ${token}=    Login As Admin
    ${clientes}=    Obtener Clientes    ${token}    admin
    Should Contain    ${clientes}    usuarios
    Log    Lista de clientes obtenida exitosamente

Empacador Puede Obtener Clientes
    [Documentation]    Verifica que el empacador pueda obtener la lista de clientes
    [Tags]    ventas    empacador    clientes    api
    ${token}=    Login As Empacador
    ${clientes}=    Obtener Clientes    ${token}    empacador
    Should Contain    ${clientes}    usuarios
    Log    Lista de clientes obtenida exitosamente por empacador

Admin Puede Obtener Productos Para Venta
    [Documentation]    Verifica que el admin pueda obtener productos disponibles para venta
    [Tags]    ventas    admin    productos    api
    ${token}=    Login As Admin
    ${productos}=    Obtener Productos Para Venta    ${token}    admin
    Log    Productos para venta obtenidos exitosamente

Empacador Puede Obtener Productos Para Venta
    [Documentation]    Verifica que el empacador pueda obtener productos disponibles para venta
    [Tags]    ventas    empacador    productos    api
    ${token}=    Login As Empacador
    ${productos}=    Obtener Productos Para Venta    ${token}    empacador
    Log    Productos para venta obtenidos exitosamente por empacador

Crear Venta Con Datos Inválidos
    [Documentation]    Verifica que la creación de venta falle con datos inválidos
    [Tags]    ventas    negative    api
    ${token}=    Login As Admin
    &{headers}=    Get Auth Headers    ${token}
    &{venta_invalida}=    Create Dictionary    id_cliente=${EMPTY}    id_sucursal=${ID_SUCURSAL}
    ${response}=    POST On Session    api    /ventas/admin/ventas    json=${venta_invalida}    headers=${headers}    expected_status=400
    Should Be Equal As Numbers    ${response.status_code}    400

Crear Venta Sin Productos
    [Documentation]    Verifica que no se pueda crear una venta sin productos
    [Tags]    ventas    negative    api
    ${token}=    Login As Admin
    &{headers}=    Get Auth Headers    ${token}
    @{productos_vacios}=    Create List
    &{venta_sin_productos}=    Create Dictionary    id_cliente=${ID_CLIENTE}    id_sucursal=${ID_SUCURSAL}    productos=${productos_vacios}
    ${response}=    POST On Session    api    /ventas/admin/ventas    json=${venta_sin_productos}    headers=${headers}    expected_status=400
    Should Be Equal As Numbers    ${response.status_code}    400

Acceso Sin Autenticación A Ventas
    [Documentation]    Verifica que las rutas de ventas requieran autenticación
    [Tags]    ventas    security    api
    ${response}=    GET On Session    api    /ventas/admin/ventas    expected_status=401
    Should Be Equal As Numbers    ${response.status_code}    401

Verificar Paridad De Funciones Entre Roles En Ventas
    [Documentation]    Verifica que ambos roles tengan las mismas funcionalidades en ventas
    [Tags]    ventas    roles    parity    api
    ${token_admin}=    Login As Admin
    ${token_empacador}=    Login As Empacador
    
    # Ambos deben poder obtener ventas
    ${ventas_admin}=    Obtener Lista De Ventas    ${token_admin}    admin
    ${ventas_empacador}=    Obtener Lista De Ventas    ${token_empacador}    empacador
    
    Should Contain    ${ventas_admin}    ventas
    Should Contain    ${ventas_empacador}    ventas
    
    # Ambos deben poder obtener clientes
    ${clientes_admin}=    Obtener Clientes    ${token_admin}    admin
    ${clientes_empacador}=    Obtener Clientes    ${token_empacador}    empacador
    
    Should Contain    ${clientes_admin}    usuarios
    Should Contain    ${clientes_empacador}    usuarios
    
    Log    Ambos roles pueden acceder a las funciones de ventas

Verificar Estructura De Datos En Ventas
    [Documentation]    Verifica que la estructura de datos de ventas sea correcta
    [Tags]    ventas    data    structure    api
    ${token}=    Login As Admin
    ${ventas}=    Obtener Lista De Ventas    ${token}    admin
    Should Contain    ${ventas}    ventas
    
    # Verificar que cada venta tenga los campos necesarios
    ${primera_venta}=    Get From List    ${ventas}[ventas]    0
    Should Contain    ${primera_venta}    id
    Should Contain    ${primera_venta}    fecha
    Should Contain    ${primera_venta}    total
    Should Contain    ${primera_venta}    cliente_nombre
    Should Contain    ${primera_venta}    sucursal_nombre
    
    Log    Estructura de datos de ventas verificada correctamente
