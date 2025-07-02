*** Settings ***
Documentation    Test simple de login para INTRAPOD
Library          SeleniumLibrary
Resource         ../resources/login_keywords.robot

*** Test Cases ***
Test Simple Login
    [Documentation]    Test básico de login 
    Abrir Navegador
    Ir A Página De Login
    Ingresar Credenciales    ${USERNAME}    ${PASSWORD}
    Sleep    5s
    
    # Capturar información después del login
    ${url}=    Get Location
    Log    URL después del login: ${url}
    
    ${title}=    Get Title
    Log    Título después del login: ${title}
    
    # Verificar si hay redirección
    ${dashboard_url}=    Run Keyword And Return Status    Location Should Contain    dashboard
    Log    ¿Redirigió a dashboard?: ${dashboard_url}
    
    Capture Page Screenshot    after_login.png
    Cerrar Navegador
