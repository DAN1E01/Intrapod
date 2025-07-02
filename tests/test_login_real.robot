*** Settings ***
Documentation    Test de login probando diferentes selectores
Library          SeleniumLibrary
Resource         ../variables/variables.robot

*** Test Cases ***
Probar Login Con Diferentes Selectores
    [Documentation]    Intentar login con DAN1E10/admin123 usando diferentes selectores
    Open Browser    ${URL}    chrome
    Maximize Browser Window
    Sleep    3s
    
    # Tomar screenshot inicial
    Capture Page Screenshot    antes_login.png
    
    Log    === INTENTANDO LOGIN CON CREDENCIALES REALES ===
    Log    Usuario: ${USERNAME}
    Log    Contraseña: ${PASSWORD}
    
    # Intentar con diferentes selectores para usuario
    ${user_filled}=    Set Variable    False
    
    # Probar name=username
    ${status}=    Run Keyword And Return Status    Input Text    name=username    ${USERNAME}
    Run Keyword If    ${status}    Set Variable    ${user_filled}    True
    Run Keyword If    ${status}    Log    ✓ Usuario ingresado con name=username
    
    # Si no funcionó, probar id=username
    Run Keyword If    not ${user_filled}    Run Keywords
    ...    ${status}=    Run Keyword And Return Status    Input Text    id=username    ${USERNAME}
    ...    AND    Run Keyword If    ${status}    Set Variable    ${user_filled}    True
    ...    AND    Run Keyword If    ${status}    Log    ✓ Usuario ingresado con id=username
    
    # Si no funcionó, probar name=user
    Run Keyword If    not ${user_filled}    Run Keywords
    ...    ${status}=    Run Keyword And Return Status    Input Text    name=user    ${USERNAME}
    ...    AND    Run Keyword If    ${status}    Set Variable    ${user_filled}    True
    ...    AND    Run Keyword If    ${status}    Log    ✓ Usuario ingresado con name=user
    
    # Si no funcionó, probar id=user
    Run Keyword If    not ${user_filled}    Run Keywords
    ...    ${status}=    Run Keyword And Return Status    Input Text    id=user    ${USERNAME}
    ...    AND    Run Keyword If    ${status}    Set Variable    ${user_filled}    True
    ...    AND    Run Keyword If    ${status}    Log    ✓ Usuario ingresado con id=user
    
    # Probar por tipo text
    Run Keyword If    not ${user_filled}    Run Keywords
    ...    ${status}=    Run Keyword And Return Status    Input Text    xpath=//input[@type='text']    ${USERNAME}
    ...    AND    Run Keyword If    ${status}    Set Variable    ${user_filled}    True
    ...    AND    Run Keyword If    ${status}    Log    ✓ Usuario ingresado con xpath=//input[@type='text']
    
    Sleep    2s
    
    # Intentar con diferentes selectores para contraseña
    ${pass_filled}=    Set Variable    False
    
    # Probar name=password
    ${status}=    Run Keyword And Return Status    Input Text    name=password    ${PASSWORD}
    Run Keyword If    ${status}    Set Variable    ${pass_filled}    True
    Run Keyword If    ${status}    Log    ✓ Contraseña ingresada con name=password
    
    # Si no funcionó, probar id=password
    Run Keyword If    not ${pass_filled}    Run Keywords
    ...    ${status}=    Run Keyword And Return Status    Input Text    id=password    ${PASSWORD}
    ...    AND    Run Keyword If    ${status}    Set Variable    ${pass_filled}    True
    ...    AND    Run Keyword If    ${status}    Log    ✓ Contraseña ingresada con id=password
    
    # Probar por tipo password
    Run Keyword If    not ${pass_filled}    Run Keywords
    ...    ${status}=    Run Keyword And Return Status    Input Text    xpath=//input[@type='password']    ${PASSWORD}
    ...    AND    Run Keyword If    ${status}    Set Variable    ${pass_filled}    True
    ...    AND    Run Keyword If    ${status}    Log    ✓ Contraseña ingresada con xpath=//input[@type='password']
    
    Sleep    2s
    
    # Tomar screenshot con credenciales
    Capture Page Screenshot    credenciales_ingresadas.png
    
    # Intentar hacer clic en botón de submit
    ${submitted}=    Set Variable    False
    
    # Probar button type=submit
    ${status}=    Run Keyword And Return Status    Click Button    xpath=//button[@type='submit']
    Run Keyword If    ${status}    Set Variable    ${submitted}    True
    Run Keyword If    ${status}    Log    ✓ Botón presionado con xpath=//button[@type='submit']
    
    # Si no funcionó, probar input type=submit
    Run Keyword If    not ${submitted}    Run Keywords
    ...    ${status}=    Run Keyword And Return Status    Click Button    xpath=//input[@type='submit']
    ...    AND    Run Keyword If    ${status}    Set Variable    ${submitted}    True
    ...    AND    Run Keyword If    ${status}    Log    ✓ Botón presionado con xpath=//input[@type='submit']
    
    # Probar por texto del botón
    Run Keyword If    not ${submitted}    Run Keywords
    ...    ${status}=    Run Keyword And Return Status    Click Button    xpath=//button[contains(text(), 'Login')]
    ...    AND    Run Keyword If    ${status}    Set Variable    ${submitted}    True
    ...    AND    Run Keyword If    ${status}    Log    ✓ Botón presionado por texto 'Login'
    
    Run Keyword If    not ${submitted}    Run Keywords
    ...    ${status}=    Run Keyword And Return Status    Click Button    xpath=//button[contains(text(), 'Iniciar')]
    ...    AND    Run Keyword If    ${status}    Set Variable    ${submitted}    True
    ...    AND    Run Keyword If    ${status}    Log    ✓ Botón presionado por texto 'Iniciar'
    
    Run Keyword If    not ${submitted}    Run Keywords
    ...    ${status}=    Run Keyword And Return Status    Click Button    xpath=//button[contains(text(), 'Entrar')]
    ...    AND    Run Keyword If    ${status}    Set Variable    ${submitted}    True
    ...    AND    Run Keyword If    ${status}    Log    ✓ Botón presionado por texto 'Entrar'
    
    Sleep    5s
    
    # Verificar resultado
    ${current_url}=    Get Location
    Log    URL después del intento de login: ${current_url}
    
    ${title}=    Get Title
    Log    Título después del intento: ${title}
    
    # Tomar screenshot final
    Capture Page Screenshot    despues_login.png
    
    # Verificar si el login fue exitoso
    ${dashboard_reached}=    Run Keyword And Return Status    Location Should Contain    dashboard
    ${login_success}=        Run Keyword And Return Status    Page Should Contain    Bienvenido
    ${admin_panel}=          Run Keyword And Return Status    Page Should Contain    Admin
    ${intrapod_found}=       Run Keyword And Return Status    Page Should Contain    INTRAPOD
    
    Log    ¿Login exitoso? Dashboard: ${dashboard_reached}, Bienvenido: ${login_success}, Admin: ${admin_panel}, INTRAPOD: ${intrapod_found}
    
    Sleep    5s
    Close Browser
