*** Settings ***
Documentation    Tests de registro de usuario para aplicación INTRAPOD
Library          SeleniumLibrary
Resource         ../resources/registerUser_keywords.robot
Suite Setup      Abrir Navegador
Suite Teardown   Cerrar Navegador

*** Test Cases ***
TC001 - Login Y Acceso Al Registro
    [Documentation]    Verifica login exitoso y acceso al módulo de registro
    [Tags]    login    registro    smoke
    Ir A Página De Login
    Ingresar Credenciales    ${USERNAME}    ${PASSWORD}
    Verificar Login Exitoso

TC002 - Registro De Nuevo Usuario
    [Documentation]    Verifica el registro exitoso de un nuevo usuario
    [Tags]    registro    usuarios    crud
    Ir A Página De Registro Usuario
    Ingresar Nuevo Usuario    ${NOMBRES}    ${APELLIDOS}    ${NEW_USERNAME}    ${EMAIL}    ${NEW_PASSWORD}
    Verificar Registro Exitoso

TC003 - Validación De Campos Obligatorios
    [Documentation]    Verifica que los campos obligatorios sean validados
    [Tags]    registro    validacion    negativo
    Ir A Página De Registro Usuario
    Click Button    xpath=//button[@type='submit']
    Verificar Mensaje De Error

TC004 - Registro Con Email Duplicado
    [Documentation]    Verifica validación de email duplicado
    [Tags]    registro    validacion    negativo
    Ir A Página De Registro Usuario
    Ingresar Nuevo Usuario    ${NOMBRES}    ${APELLIDOS}    usuario.duplicado    ${EMAIL}    ${NEW_PASSWORD}
    Verificar Mensaje De Error

TC005 - Navegación En Gestión De Usuarios
    [Documentation]    Verifica navegación dentro del módulo de usuarios
    [Tags]    navegacion    usuarios
    Go To    ${URL_USUARIOS}
    Wait Until Page Contains    Lista De Usuarios
    Wait Until Page Contains    Administrar Usuarios

TC006 - Limpiar Y Rellenar Formulario
    [Documentation]    Verifica funcionalidad de limpiar formulario
    [Tags]    formulario    ux
    Ir A Página De Registro Usuario
    Ingresar Nuevo Usuario    TestNombre    TestApellido    test.user    test@test.com    test123
    Limpiar Formulario
    Ingresar Nuevo Usuario    ${NOMBRES_2}    ${APELLIDOS_2}    ${NEW_USERNAME_2}    ${EMAIL_2}    ${NEW_PASSWORD_2}
    Verificar Registro Exitoso
