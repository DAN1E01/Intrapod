*** Settings ***
Documentation    Keywords para manejo de inventario
Resource         ../resources/common.robot
Resource         auth_keywords.robot

*** Keywords ***
Navegar A Inventario
    [Documentation]    Navega a la página de inventario
    [Arguments]    ${rol}=admin
    ${inventario_url}=    Set Variable If    '${rol}' == 'admin'    
    ...    ${FRONTEND_URL}/pages/dashboard_admin/pages/inventario/inventario.html
    ...    ${FRONTEND_URL}/pages/dashboard_empacador/pages/inventario/inventario.html
    Go To    ${inventario_url}
    Wait Until Element Is Visible    css:h4.card-title    timeout=${TIMEOUT}
    Element Text Should Contain    css:h4.card-title    Productos en Inventario

Agregar Nuevo Producto
    [Documentation]    Agrega un nuevo producto al inventario
    [Arguments]    ${nombre}=${TEST_PRODUCTO_NOMBRE}    ${descripcion}=${TEST_PRODUCTO_DESC}    
    ...           ${precio_compra}=${TEST_PRECIO_COMPRA}    ${precio_venta}=${TEST_PRECIO_VENTA}
    ...           ${sucursal_index}=1    ${categoria_index}=1
    
    # Hacer clic en el botón "Nuevo Producto"
    Wait Until Element Is Visible    id:btnNuevoProducto    timeout=${TIMEOUT}
    Click Element    id:btnNuevoProducto
    
    # Esperar que aparezca el modal
    Wait Until Element Is Visible    id:modalNuevoProducto    timeout=${TIMEOUT}
    
    # Llenar los campos del formulario
    Input Text    id:nombreProducto    ${nombre}
    Input Text    id:descripcionProducto    ${descripcion}
    Input Text    id:precioCompra    ${precio_compra}
    Input Text    id:precioVenta    ${precio_venta}
    
    # Seleccionar sucursal y categoría
    Select From List By Index    id:sucursalProducto    ${sucursal_index}
    Select From List By Index    id:categoriaProducto    ${categoria_index}
    
    # Guardar el producto
    Click Button    css:#modalNuevoProducto button[type="submit"]
    
    # Verificar que el modal se cierre
    Wait Until Element Is Not Visible    id:modalNuevoProducto    timeout=${TIMEOUT}
    
    # Verificar mensaje de éxito
    Wait Until Element Is Visible    css:.alert-success    timeout=${TIMEOUT}
    Log    Producto agregado exitosamente

Buscar Producto En Tabla
    [Documentation]    Busca un producto en la tabla de inventario
    [Arguments]    ${nombre_producto}
    Wait Until Element Is Visible    id:search-user    timeout=${TIMEOUT}
    Input Text    id:search-user    ${nombre_producto}
    Sleep    1s    # Esperar que se aplique el filtro
    ${filas_visibles}=    Get Element Count    css:tbody tr:not([style*="display: none"])
    Should Be True    ${filas_visibles} > 0    No se encontraron productos con el nombre ${nombre_producto}

Editar Producto
    [Documentation]    Edita un producto existente en el inventario
    [Arguments]    ${nombre_original}    ${nuevo_nombre}    ${nueva_descripcion}
    
    # Buscar el producto
    Buscar Producto En Tabla    ${nombre_original}
    
    # Hacer clic en el botón de editar del primer resultado
    Wait Until Element Is Visible    css:.btn-editar-producto    timeout=${TIMEOUT}
    Click Element    css:.btn-editar-producto
    
    # Esperar que aparezca el modal de edición
    Wait Until Element Is Visible    id:modalNuevoProducto    timeout=${TIMEOUT}
    Element Text Should Contain    id:modalNuevoProductoLabel    Editar Producto
    
    # Modificar los campos
    Clear Element Text    id:nombreProducto
    Input Text    id:nombreProducto    ${nuevo_nombre}
    Clear Element Text    id:descripcionProducto
    Input Text    id:descripcionProducto    ${nueva_descripcion}
    
    # Guardar cambios
    Click Button    css:#modalNuevoProducto button[type="submit"]
    
    # Verificar que el modal se cierre
    Wait Until Element Is Not Visible    id:modalNuevoProducto    timeout=${TIMEOUT}
    
    # Verificar mensaje de éxito
    Wait Until Element Is Visible    css:.alert-success    timeout=${TIMEOUT}
    Log    Producto editado exitosamente

Eliminar Producto
    [Documentation]    Elimina un producto del inventario
    [Arguments]    ${nombre_producto}
    
    # Buscar el producto
    Buscar Producto En Tabla    ${nombre_producto}
    
    # Hacer clic en el botón de eliminar
    Wait Until Element Is Visible    css:.btn-eliminar-producto    timeout=${TIMEOUT}
    Click Element    css:.btn-eliminar-producto
    
    # Confirmar eliminación en SweetAlert
    Wait Until Element Is Visible    css:.swal2-confirm    timeout=${TIMEOUT}
    Click Element    css:.swal2-confirm
    
    # Verificar mensaje de éxito
    Wait Until Element Is Visible    css:.swal2-success    timeout=${TIMEOUT}
    Click Element    css:.swal2-confirm
    Log    Producto eliminado exitosamente

Verificar Producto En Tabla
    [Documentation]    Verifica que un producto aparezca en la tabla con los datos correctos
    [Arguments]    ${nombre}    ${precio_compra}    ${precio_venta}    ${stock}
    
    Buscar Producto En Tabla    ${nombre}
    
    # Verificar que aparezcan los datos correctos en la tabla
    ${fila}=    Get WebElement    css:tbody tr:not([style*="display: none"])
    Element Should Contain    ${fila}    ${nombre}
    Element Should Contain    ${fila}    ${precio_compra}
    Element Should Contain    ${fila}    ${precio_venta}
    Element Should Contain    ${fila}    ${stock}
    Log    Producto verificado en tabla correctamente

Ajustar Stock Producto
    [Documentation]    Ajusta el stock de un producto
    [Arguments]    ${nombre_producto}    ${cantidad_ajuste}    ${motivo}=Ajuste de prueba
    
    # Navegar a inventario si no estamos ahí
    ${current_url}=    Get Location
    Run Keyword If    'inventario' not in '${current_url}'    Navegar A Inventario
    
    # Hacer clic en "Ajustar Stock"
    Wait Until Element Is Visible    id:btnAjustarStockGlobal    timeout=${TIMEOUT}
    Click Element    id:btnAjustarStockGlobal
    
    # Esperar que aparezca el modal
    Wait Until Element Is Visible    id:modalAjustarStock    timeout=${TIMEOUT}
    
    # Seleccionar producto por nombre (buscar en el select)
    Select From List By Label    id:ajustarStockIdProducto    ${nombre_producto}
    
    # Introducir cantidad y motivo
    Input Text    id:ajustarStockCantidad    ${cantidad_ajuste}
    Input Text    id:ajustarStockMotivo    ${motivo}
    
    # Guardar ajuste
    Click Button    css:#modalAjustarStock button[type="submit"]
    
    # Verificar que el modal se cierre
    Wait Until Element Is Not Visible    id:modalAjustarStock    timeout=${TIMEOUT}
    
    # Verificar mensaje de éxito
    Wait Until Element Is Visible    css:.alert-success    timeout=${TIMEOUT}
    Log    Stock ajustado exitosamente

Filtrar Por Sucursal
    [Documentation]    Filtra los productos por sucursal
    [Arguments]    ${nombre_sucursal}
    
    Wait Until Element Is Visible    id:dropdownSucursal    timeout=${TIMEOUT}
    Click Element    id:dropdownSucursal
    
    Wait Until Element Is Visible    id:dropdownSucursalMenu    timeout=${TIMEOUT}
    Click Element    css:#dropdownSucursalMenu a[data-value="${nombre_sucursal}"]
    
    # Verificar que el filtro se haya aplicado
    Element Text Should Contain    id:dropdownSucursal    ${nombre_sucursal}
    Log    Filtro por sucursal aplicado: ${nombre_sucursal}

Filtrar Por Categoria
    [Documentation]    Filtra los productos por categoría
    [Arguments]    ${nombre_categoria}
    
    Wait Until Element Is Visible    id:dropdownCategoria    timeout=${TIMEOUT}
    Click Element    id:dropdownCategoria
    
    Wait Until Element Is Visible    id:dropdownCategoriaMenu    timeout=${TIMEOUT}
    Click Element    css:#dropdownCategoriaMenu a[data-value="${nombre_categoria}"]
    
    # Verificar que el filtro se haya aplicado
    Element Text Should Contain    id:dropdownCategoria    ${nombre_categoria}
    Log    Filtro por categoría aplicado: ${nombre_categoria}
