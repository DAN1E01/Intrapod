*** Settings ***
Documentation    Pruebas de API para inventario
Resource         ../resources/common.robot
Suite Setup      Verificar Estado Del Servidor
Test Tags        api    inventario

*** Variables ***
${TEST_PRODUCTO_ID}    ${EMPTY}

*** Test Cases ***
Prueba Listar Inventario
    [Documentation]    Verifica que se pueda obtener la lista del inventario
    [Tags]    smoke    positive
    
    ${token}=    Generar Token Admin
    Create Session    api    ${API_URL}    verify=False
    ${headers}=    Create Dictionary    Authorization=Bearer ${token}
    ${response}=    GET On Session    api    /inventario/listar    headers=${headers}
    
    Should Be Equal As Numbers    ${response.status_code}    200
    Dictionary Should Contain Key    ${response.json()}    inventario
    Should Be True    isinstance($response.json()['inventario'], list)
    
    Log    Lista de inventario obtenida correctamente

Prueba Crear Producto
    [Documentation]    Verifica que se pueda crear un nuevo producto
    [Tags]    positive    crud
    
    ${token}=    Generar Token Admin
    Create Session    api    ${API_URL}    verify=False
    ${headers}=    Create Dictionary    Authorization=Bearer ${token}
    
    # Primero obtener sucursales y categorías disponibles
    ${response_data}=    GET On Session    api    /dashboard/admin/data    headers=${headers}
    ${sucursales}=    Get Value From Json    ${response_data.json()}    $.sucursales
    ${response_cat}=    GET On Session    api    /inventario/categorias    headers=${headers}
    ${categorias}=    Set Variable    ${response_cat.json()}
    
    # Crear datos del producto
    ${producto_data}=    Create Dictionary
    ...    nombre=Producto Test API
    ...    descripcion=Descripción de prueba
    ...    precio_compra=10.50
    ...    precio_venta=15.75
    ...    stock_inicial=7
    ...    id_sucursal=${sucursales[0][0]['id']}
    ...    id_categoria=${categorias[0]['id']}
    
    ${response}=    POST On Session    api    /inventario/crear    json=${producto_data}    headers=${headers}
    
    Should Be Equal As Numbers    ${response.status_code}    200
    Dictionary Should Contain Key    ${response.json()}    message
    Dictionary Should Contain Key    ${response.json()}    producto_id
    
    # Guardar ID para pruebas posteriores
    Set Suite Variable    ${TEST_PRODUCTO_ID}    ${response.json()['producto_id']}
    
    Log    Producto creado exitosamente con ID: ${TEST_PRODUCTO_ID}

Prueba Obtener Categorías
    [Documentation]    Verifica que se puedan obtener las categorías
    [Tags]    positive
    
    ${token}=    Generar Token Admin
    Create Session    api    ${API_URL}    verify=False
    ${headers}=    Create Dictionary    Authorization=Bearer ${token}
    ${response}=    GET On Session    api    /inventario/categorias    headers=${headers}
    
    Should Be Equal As Numbers    ${response.status_code}    200
    Should Be True    isinstance($response.json(), list)
    Should Be True    len($response.json()) > 0
    
    # Verificar estructura de las categorías
    ${categoria}=    Set Variable    ${response.json()[0]}
    Dictionary Should Contain Key    ${categoria}    id
    Dictionary Should Contain Key    ${categoria}    nombre
    
    Log    Categorías obtenidas correctamente

Prueba Editar Producto
    [Documentation]    Verifica que se pueda editar un producto existente
    [Tags]    positive    crud
    [Setup]    Skip If    '${TEST_PRODUCTO_ID}' == '${EMPTY}'    No hay producto de prueba creado
    
    ${token}=    Generar Token Admin
    Create Session    api    ${API_URL}    verify=False
    ${headers}=    Create Dictionary    Authorization=Bearer ${token}
    
    # Datos actualizados del producto
    ${producto_data}=    Create Dictionary
    ...    nombre=Producto Test API Editado
    ...    descripcion=Descripción editada
    ...    precio_compra=12.00
    ...    precio_venta=18.00
    
    ${response}=    PUT On Session    api    /inventario/editar/${TEST_PRODUCTO_ID}    json=${producto_data}    headers=${headers}
    
    Should Be Equal As Numbers    ${response.status_code}    200
    Dictionary Should Contain Key    ${response.json()}    message
    
    Log    Producto editado exitosamente

Prueba Ajustar Stock
    [Documentation]    Verifica que se pueda ajustar el stock de un producto
    [Tags]    positive
    [Setup]    Skip If    '${TEST_PRODUCTO_ID}' == '${EMPTY}'    No hay producto de prueba creado
    
    ${token}=    Generar Token Admin
    Create Session    api    ${API_URL}    verify=False
    ${headers}=    Create Dictionary    Authorization=Bearer ${token}
    
    ${ajuste_data}=    Create Dictionary
    ...    cantidad=5
    ...    motivo=Ajuste de prueba API
    
    ${response}=    PATCH On Session    api    /inventario/ajustar-stock/${TEST_PRODUCTO_ID}    json=${ajuste_data}    headers=${headers}
    
    Should Be Equal As Numbers    ${response.status_code}    200
    Dictionary Should Contain Key    ${response.json()}    message
    
    Log    Stock ajustado exitosamente

Prueba Eliminar Producto
    [Documentation]    Verifica que se pueda eliminar un producto
    [Tags]    positive    crud    cleanup
    [Setup]    Skip If    '${TEST_PRODUCTO_ID}' == '${EMPTY}'    No hay producto de prueba creado
    
    ${token}=    Generar Token Admin
    Create Session    api    ${API_URL}    verify=False
    ${headers}=    Create Dictionary    Authorization=Bearer ${token}
    
    ${response}=    DELETE On Session    api    /inventario/eliminar/${TEST_PRODUCTO_ID}    headers=${headers}
    
    Should Be Equal As Numbers    ${response.status_code}    200
    Dictionary Should Contain Key    ${response.json()}    message
    
    # Limpiar variable
    Set Suite Variable    ${TEST_PRODUCTO_ID}    ${EMPTY}
    
    Log    Producto eliminado exitosamente

Prueba Crear Producto Con Datos Inválidos
    [Documentation]    Verifica que se rechace la creación de productos con datos inválidos
    [Tags]    negative
    
    ${token}=    Generar Token Admin
    Create Session    api    ${API_URL}    verify=False
    ${headers}=    Create Dictionary    Authorization=Bearer ${token}
    
    # Datos inválidos (falta campo requerido)
    ${producto_data}=    Create Dictionary
    ...    descripcion=Descripción sin nombre
    ...    precio_compra=10.50
    
    ${response}=    POST On Session    api    /inventario/crear    json=${producto_data}    headers=${headers}    expected_status=400
    
    Should Be Equal As Numbers    ${response.status_code}    400
    
    Log    Creación de producto con datos inválidos rechazada correctamente

Prueba Acceso Empacador A Inventario
    [Documentation]    Verifica que el empacador pueda acceder al inventario
    [Tags]    positive    roles
    
    ${token}=    Generar Token Empacador
    Create Session    api    ${API_URL}    verify=False
    ${headers}=    Create Dictionary    Authorization=Bearer ${token}
    ${response}=    GET On Session    api    /inventario/listar    headers=${headers}
    
    Should Be Equal As Numbers    ${response.status_code}    200
    Dictionary Should Contain Key    ${response.json()}    inventario
    
    Log    Empacador puede acceder al inventario correctamente
