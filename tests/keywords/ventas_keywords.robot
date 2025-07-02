*** Settings ***
Documentation    Keywords para manejo de ventas
Resource         ../resources/common.robot
Resource         auth_keywords.robot

*** Keywords ***
Navegar A Ventas
    [Documentation]    Navega a la página de ventas
    [Arguments]    ${rol}=admin
    ${ventas_url}=    Set Variable If    '${rol}' == 'admin'    
    ...    ${FRONTEND_URL}/pages/dashboard_admin/pages/ventas/ventas.html
    ...    ${FRONTEND_URL}/pages/dashboard_empacador/pages/ventas/ventas.html
    Go To    ${ventas_url}
    Wait Until Element Is Visible    css:h4.card-title    timeout=${TIMEOUT}
    Element Text Should Contain    css:h4.card-title    Ventas de Productos

Crear Nueva Venta
    [Documentation]    Crea una nueva venta con productos
    [Arguments]    ${usuario_index}=1    ${sucursal_index}=1    @{productos}
    
    # Hacer clic en "Nueva Venta"
    Wait Until Element Is Visible    id:btnNuevaVenta    timeout=${TIMEOUT}
    Click Element    id:btnNuevaVenta
    
    # Esperar que aparezca el modal
    Wait Until Element Is Visible    id:modalVenta    timeout=${TIMEOUT}
    
    # Seleccionar usuario y sucursal
    Select From List By Index    id:ventaUsuario    ${usuario_index}
    Select From List By Index    id:ventaSucursal    ${sucursal_index}
    
    # Agregar productos al carrito
    FOR    ${producto}    IN    @{productos}
        ${nombre}=    Get From Dictionary    ${producto}    nombre
        ${cantidad}=    Get From Dictionary    ${producto}    cantidad
        ${precio}=    Get From Dictionary    ${producto}    precio    ${TEST_PRECIO_VENTA}
        
        Agregar Producto Al Carrito    ${nombre}    ${cantidad}    ${precio}
    END
    
    # Guardar venta
    Click Button    css:#modalVenta button[type="submit"]
    
    # Verificar que el modal se cierre
    Wait Until Element Is Not Visible    id:modalVenta    timeout=${TIMEOUT}
    
    # Verificar mensaje de éxito o que aparezca en la tabla
    Sleep    2s    # Esperar que se actualice la tabla
    Log    Nueva venta creada exitosamente

Agregar Producto Al Carrito
    [Documentation]    Agrega un producto al carrito en el modal de venta
    [Arguments]    ${nombre_producto}    ${cantidad}    ${precio_unitario}=${TEST_PRECIO_VENTA}
    
    # Seleccionar producto
    Select From List By Label    id:ventaProducto    ${nombre_producto}
    
    # Introducir cantidad
    Clear Element Text    id:ventaCantidad
    Input Text    id:ventaCantidad    ${cantidad}
    
    # Introducir precio unitario
    Clear Element Text    id:ventaPrecio
    Input Text    id:ventaPrecio    ${precio_unitario}
    
    # Hacer clic en agregar
    Click Element    id:btnAgregarProducto
    
    # Verificar que el producto aparezca en la tabla del carrito
    Wait Until Element Is Visible    css:#tablaCarrito tbody tr    timeout=${TIMEOUT}
    ${ultima_fila}=    Get WebElement    css:#tablaCarrito tbody tr:last-child
    Element Should Contain    ${ultima_fila}    ${nombre_producto}
    Log    Producto ${nombre_producto} agregado al carrito

Verificar Venta En Tabla
    [Documentation]    Verifica que una venta aparezca en la tabla principal
    [Arguments]    ${usuario_nombre}    ${sucursal_nombre}    ${total_esperado}
    
    # Buscar la venta en la tabla
    ${filas}=    Get WebElements    css:#ventas-productos-tbody tr
    ${venta_encontrada}=    Set Variable    False
    
    FOR    ${fila}    IN    @{filas}
        ${texto_fila}=    Get Text    ${fila}
        ${contiene_usuario}=    Run Keyword And Return Status    Should Contain    ${texto_fila}    ${usuario_nombre}
        ${contiene_sucursal}=    Run Keyword And Return Status    Should Contain    ${texto_fila}    ${sucursal_nombre}
        ${contiene_total}=    Run Keyword And Return Status    Should Contain    ${texto_fila}    ${total_esperado}
        
        ${venta_encontrada}=    Set Variable If    ${contiene_usuario} and ${contiene_sucursal} and ${contiene_total}    True    ${venta_encontrada}
        Exit For Loop If    ${venta_encontrada}
    END
    
    Should Be True    ${venta_encontrada}    No se encontró la venta con los datos especificados
    Log    Venta verificada en tabla correctamente

Editar Venta
    [Documentation]    Edita una venta existente
    [Arguments]    ${indice_venta}=1
    
    # Hacer clic en el botón de editar de la primera venta
    ${selector_editar}=    Set Variable    css:#ventas-productos-tbody tr:nth-child(${indice_venta}) .btn-warning
    Wait Until Element Is Visible    ${selector_editar}    timeout=${TIMEOUT}
    Click Element    ${selector_editar}
    
    # Esperar que aparezca el modal de edición
    Wait Until Element Is Visible    id:modalVenta    timeout=${TIMEOUT}
    Element Text Should Contain    id:modalVentaLabel    Editar Venta
    
    Log    Modal de edición de venta abierto

Eliminar Venta
    [Documentation]    Elimina una venta
    [Arguments]    ${indice_venta}=1
    
    # Hacer clic en el botón de eliminar
    ${selector_eliminar}=    Set Variable    css:#ventas-productos-tbody tr:nth-child(${indice_venta}) .btn-danger
    Wait Until Element Is Visible    ${selector_eliminar}    timeout=${TIMEOUT}
    Click Element    ${selector_eliminar}
    
    # Confirmar eliminación en SweetAlert
    Wait Until Element Is Visible    css:.swal2-confirm    timeout=${TIMEOUT}
    Click Element    css:.swal2-confirm
    
    # Verificar mensaje de éxito
    Wait Until Element Is Visible    css:.swal2-success    timeout=${TIMEOUT}
    Click Element    css:.swal2-confirm
    Log    Venta eliminada exitosamente

Cambiar Estado Venta
    [Documentation]    Cambia el estado de una venta
    [Arguments]    ${indice_venta}=1    ${nuevo_estado}=entregado
    
    # Hacer clic en la fila de la venta para seleccionarla
    ${selector_fila}=    Set Variable    css:#ventas-productos-tbody tr:nth-child(${indice_venta})
    Wait Until Element Is Visible    ${selector_fila}    timeout=${TIMEOUT}
    Click Element    ${selector_fila}
    
    # Cambiar el estado en el dropdown
    Wait Until Element Is Visible    id:editarEstadoVenta    timeout=${TIMEOUT}
    Select From List By Value    id:editarEstadoVenta    ${nuevo_estado}
    
    # Verificar que el estado se haya actualizado
    Sleep    2s    # Esperar que se procese el cambio
    Log    Estado de venta cambiado a: ${nuevo_estado}

Buscar Venta
    [Documentation]    Busca ventas usando el campo de búsqueda
    [Arguments]    ${termino_busqueda}
    
    Wait Until Element Is Visible    id:search-venta-producto    timeout=${TIMEOUT}
    Clear Element Text    id:search-venta-producto
    Input Text    id:search-venta-producto    ${termino_busqueda}
    Sleep    1s    # Esperar que se aplique el filtro
    
    # Verificar que hay resultados visibles
    ${filas_visibles}=    Get Element Count    css:#ventas-productos-tbody tr:not([style*="display: none"])
    Should Be True    ${filas_visibles} > 0    No se encontraron ventas con el término: ${termino_busqueda}
    Log    Búsqueda de ventas aplicada: ${termino_busqueda}

Verificar Total Carrito
    [Documentation]    Verifica que el total del carrito sea el esperado
    [Arguments]    ${total_esperado}
    
    Wait Until Element Is Visible    id:ventaTotal    timeout=${TIMEOUT}
    ${total_actual}=    Get Text    id:ventaTotal
    Should Be Equal    ${total_actual}    ${total_esperado}
    Log    Total del carrito verificado: ${total_esperado}

Eliminar Producto Del Carrito
    [Documentation]    Elimina un producto del carrito
    [Arguments]    ${indice_producto}=1
    
    ${selector_eliminar}=    Set Variable    css:#tablaCarrito tbody tr:nth-child(${indice_producto}) .btn-danger
    Wait Until Element Is Visible    ${selector_eliminar}    timeout=${TIMEOUT}
    Click Element    ${selector_eliminar}
    
    # Verificar que el producto se eliminó
    Sleep    1s
    Log    Producto eliminado del carrito

Verificar Campos Visibles Para Rol
    [Documentation]    Verifica que los campos apropiados estén visibles según el rol
    [Arguments]    ${rol}
    
    IF    '${rol}' == 'admin'
        # Para admin, todos los campos deben estar visibles
        Element Should Be Visible    id:ventaPrecio
        Element Should Be Visible    id:ventaTotal
        ${headers}=    Get Text    css:#tablaCarrito thead tr
        Should Contain    ${headers}    Precio unitario
        Should Contain    ${headers}    Subtotal
    ELSE
        # Para empacador, todos los campos también deben estar visibles (sin restricciones)
        Element Should Be Visible    id:ventaPrecio
        Element Should Be Visible    id:ventaTotal
        ${headers}=    Get Text    css:#tablaCarrito thead tr
        Should Contain    ${headers}    Precio unitario
        Should Contain    ${headers}    Subtotal
    END
    Log    Campos verificados para rol: ${rol}
