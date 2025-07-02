*** Settings ***
Documentation    Test específico para encontrar y validar campos de login
Library          SeleniumLibrary
Resource         ../variables/variables.robot

*** Test Cases ***
Encontrar Y Validar Campos Login
    [Documentation]    Buscar y validar campos de login por diferentes métodos y probar login real
    Open Browser    ${URL}    chrome
    Maximize Browser Window
    Sleep    2s

    # Validar campos por id
    Page Should Contain Element    id=username
    Page Should Contain Element    id=password
    Log    ✓ Campos id=username y id=password encontrados

    # Validar campos por tipo
    Page Should Contain Element    xpath=//input[@type='text']
    Page Should Contain Element    xpath=//input[@type='password']

    # Intentar login real
    Input Text    id=username    ${USERNAME}
    Input Text    id=password    ${PASSWORD}
    Click Button    xpath=//button[@type='submit']
    Sleep    2s
    ${url}=    Get Location
    Log    URL después del login: ${url}
    Capture Page Screenshot    despues_login.png
    Close Browser
