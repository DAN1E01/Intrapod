*** Settings ***
Documentation    Keywords robustos y funcionales para login en INTRAPOD (adaptados a id)
Library          SeleniumLibrary
Resource         ../variables/variables.robot

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

Verificar Mensaje De Error
    Wait Until Page Contains Element    id=errorMessage    10s
