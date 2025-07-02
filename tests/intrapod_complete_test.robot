*** Settings ***
Documentation    Tests completos para aplicación INTRAPOD
Library          SeleniumLibrary
Resource         ../resources/login_keywords_robusto.robot
Suite Setup      Abrir Navegador
Suite Teardown   Cerrar Navegador

*** Test Cases ***
TC001 - Login Exitoso INTRAPOD
    [Documentation]    Verifica login exitoso con credenciales válidas
    [Tags]    login    smoke
    Ir A Página De Login
    Ingresar Credenciales    ${USERNAME}    ${PASSWORD}
    Verificar Login Exitoso
    
TC002 - Navegación Al Dashboard
    [Documentation]    Verifica que se muestra el dashboard correctamente
    [Tags]    dashboard    navegacion
    Wait Until Page Contains    INTRAPOD
    Wait Until Page Contains    Ganancia
    Wait Until Page Contains    Ventas
    Wait Until Page Contains    Total Productos

TC003 - Navegación A Gestionar Usuarios
    [Documentation]    Verifica navegación al módulo de usuarios
    [Tags]    usuarios    navegacion
    Click Link    xpath=//a[contains(text(), 'Gestionar Usuarios')]
    Wait Until Location Contains    gestionar_usuarios
    Wait Until Page Contains    Administrar Usuarios
    Wait Until Page Contains    Lista De Usuarios

TC004 - Navegación A Ventas
    [Documentation]    Verifica navegación al módulo de ventas
    [Tags]    ventas    navegacion
    Click Link    xpath=//a[contains(text(), 'Ventas')]
    Wait Until Location Contains    ventas
    Wait Until Page Contains    Ventas De Productos

TC005 - Navegación A Inventario
    [Documentation]    Verifica navegación al módulo de inventario
    [Tags]    inventario    navegacion
    Click Link    xpath=//a[contains(text(), 'Inventario')]
    Wait Until Location Contains    inventario
    Wait Until Page Contains    Gestión de Inventario
    Wait Until Page Contains    Productos En Inventario

TC006 - Navegación A Reportes
    [Documentation]    Verifica navegación al módulo de reportes
    [Tags]    reportes    navegacion
    Click Link    xpath=//a[contains(text(), 'Reportes')]
    Wait Until Location Contains    reportes
    Wait Until Page Contains    Reportes
    Wait Until Page Contains    Ventas Por Mes

TC007 - Login Fallido Usuario Incorrecto
    [Documentation]    Verifica rechazo con usuario incorrecto
    [Tags]    login    negativo
    Go To    ${URL}
    Ingresar Credenciales    ${USERNAME_INC}    ${PASSWORD}
    Verificar Mensaje De Error

TC008 - Login Fallido Password Incorrecto
    [Documentation]    Verifica rechazo con password incorrecto
    [Tags]    login    negativo
    Go To    ${URL}
    Ingresar Credenciales    ${USERNAME}    ${PASSWORD_INC}
    Verificar Mensaje De Error
