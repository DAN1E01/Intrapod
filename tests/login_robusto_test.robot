*** Settings ***
Documentation    Test de login usando keywords robustos
Library          SeleniumLibrary
Resource         ../resources/login_keywords_robusto.robot

*** Test Cases ***
TC001 - Login Exitoso Con Keywords Robustos
    [Documentation]    Verificar login con DAN1E10/admin123 usando keywords mejorados
    [Tags]    login    smoke    robusto
    Abrir Navegador
    Ir A Página De Login
    Ingresar Credenciales    ${USERNAME}    ${PASSWORD}
    Verificar Login Exitoso
    
    # Tomar screenshot del resultado
    Capture Page Screenshot    login_exitoso_robusto.png
    
    Cerrar Navegador

TC002 - Login Fallido Usuario Incorrecto
    [Documentation]    Verificar rechazo con usuario incorrecto
    [Tags]    login    negativo    robusto
    Abrir Navegador
    Ir A Página De Login
    Ingresar Credenciales    ${USERNAME_INC}    ${PASSWORD}
    Verificar Mensaje De Error
    
    # Tomar screenshot del error
    Capture Page Screenshot    login_error_usuario.png
    
    Cerrar Navegador

TC003 - Login Fallido Password Incorrecto
    [Documentation]    Verificar rechazo con password incorrecto
    [Tags]    login    negativo    robusto
    Abrir Navegador
    Ir A Página De Login
    Ingresar Credenciales    ${USERNAME}    ${PASSWORD_INC}
    Verificar Mensaje De Error
    
    # Tomar screenshot del error
    Capture Page Screenshot    login_error_password.png
    
    Cerrar Navegador
