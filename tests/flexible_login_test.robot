*** Settings ***
Documentation    Test mejorado de INTRAPOD con selectores genéricos
Library          SeleniumLibrary
Resource         ../resources/login_keywords.robot

*** Test Cases ***
TC001 - Login Con Selectores Genéricos
    [Documentation]    Test de login usando keywords robustos y validaciones reales
    [Tags]    login    smoke
    Abrir Navegador
    Ir A Página De Login
    Ingresar Credenciales    ${USERNAME}    ${PASSWORD}
    Verificar Login Exitoso
    Capture Page Screenshot    login_result.png
    Cerrar Navegador
