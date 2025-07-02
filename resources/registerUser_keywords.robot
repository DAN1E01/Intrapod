*** Settings ***
Documentation    Keywords robustos y funcionales para registro de usuario en INTRAPOD (adaptados a id)
Library          SeleniumLibrary
Resource         ../variables/variables.robot

*** Variables ***

*** Keywords ***
Abrir Navegador
    Open Browser    ${URL}    chrome
    Maximize Browser Window
    Sleep    2s

Cerrar Navegador
    Close Browser

Ir A Página De Login
    Go To    ${URL}
    Wait Until Page Contains Element    id=username    10s
    Wait Until Page Contains Element    id=password    10s

Ingresar Credenciales
    [Arguments]    ${usuario}    ${clave}
    Input Text    id=username    ${usuario}
    Input Text    id=password    ${clave}
    Click Button    xpath=//button[@type='submit']
    Sleep    2s

Verificar Login Exitoso
    Wait Until Page Contains    INTRAPOD    10s

Ir A Página De Registro Usuario
    # Navega al módulo de registro desde el dashboard
    Click Link    xpath=//a[contains(text(), 'Gestionar Usuarios')]
    Wait Until Page Contains    Administrar Usuarios    10s
    Click Button    xpath=//button[contains(text(), 'Agregar Usuario')] | xpath=//a[contains(text(), 'Nuevo Usuario')] | xpath=//button[contains(text(), 'Registrar')]
    Wait Until Page Contains Element    id=nombres    10s

Ingresar Nuevo Usuario
    [Arguments]    ${NOMBRES}    ${APELLIDOS}    ${NEW_USERNAME}    ${EMAIL}    ${NEW_PASSWORD}
    Input Text    id=nombres    ${NOMBRES}
    Input Text    id=apellidos    ${APELLIDOS}
    Input Text    id=username    ${NEW_USERNAME}
    Input Text    id=email    ${EMAIL}
    Input Text    id=password    ${NEW_PASSWORD}
    Click Button    xpath=//button[@type='submit']
    Sleep    2s

Verificar Registro Exitoso
    Wait Until Page Contains    Usuario registrado exitosamente    10s

Verificar Mensaje De Error
    Wait Until Page Contains Element    id=errorMessage    10s

Limpiar Formulario
    Click Button    xpath=//button[contains(text(), 'Limpiar')]
    Sleep    1s
