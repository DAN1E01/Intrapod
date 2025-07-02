*** Settings ***
Documentation    Test de depuración para inspeccionar INTRAPOD
Library          SeleniumLibrary
Resource         ../variables/variables.robot

*** Test Cases ***
Debug - Inspeccionar Página Login
    [Documentation]    Abrir la página, validar campos clave y mostrar información útil
    Open Browser    ${URL}    chrome
    Maximize Browser Window
    Sleep    2s

    # Validar campos de usuario y contraseña
    Page Should Contain Element    id=username
    Page Should Contain Element    id=password
    Log    ✓ Campos de usuario y contraseña encontrados

    # Validar botón de login
    Page Should Contain Element    xpath=//button[@type='submit']
    Log    ✓ Botón de login encontrado

    # Loguear título y URL
    ${title}=    Get Title
    Log    Título de la página: ${title}
    ${url}=    Get Location
    Log    URL actual: ${url}

    # Validar texto clave en la página
    Page Should Contain    Login
    Page Should Contain    Iniciar
    Log    ✓ Textos clave encontrados

    Capture Page Screenshot    debug_login_page.png
    Close Browser
