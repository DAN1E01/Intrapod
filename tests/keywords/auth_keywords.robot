*** Settings ***
Documentation    Keywords para manejo de autenticación y login
Resource         ../resources/common.robot

*** Keywords ***
Realizar Login Como Admin
    [Documentation]    Realiza login como administrador en la interfaz web
    [Arguments]    ${username}=${ADMIN_USERNAME}    ${password}=${ADMIN_PASSWORD}
    Go To    ${FRONTEND_URL}/pages/login.html
    Wait Until Element Is Visible    ${LOGIN_USERNAME_FIELD}    timeout=${TIMEOUT}
    Input Text    ${LOGIN_USERNAME_FIELD}    ${username}
    Input Password    ${LOGIN_PASSWORD_FIELD}    ${password}
    Click Button    ${LOGIN_SUBMIT_BUTTON}
    # Verificar redirección exitosa
    Wait Until Location Contains    dashboard_admin    timeout=${TIMEOUT}
    Log    Login como administrador exitoso

Realizar Login Como Empacador
    [Documentation]    Realiza login como empacador en la interfaz web
    [Arguments]    ${username}=${EMPACADOR_USERNAME}    ${password}=${EMPACADOR_PASSWORD}
    Go To    ${FRONTEND_URL}/pages/login.html
    Wait Until Element Is Visible    ${LOGIN_USERNAME_FIELD}    timeout=${TIMEOUT}
    Input Text    ${LOGIN_USERNAME_FIELD}    ${username}
    Input Password    ${LOGIN_PASSWORD_FIELD}    ${password}
    Click Button    ${LOGIN_SUBMIT_BUTTON}
    # Verificar redirección exitosa
    Wait Until Location Contains    dashboard_empacador    timeout=${TIMEOUT}
    Log    Login como empacador exitoso

Realizar Logout
    [Documentation]    Cierra la sesión del usuario actual
    Wait Until Element Is Visible    ${LOGOUT_BUTTON}    timeout=${TIMEOUT}
    Click Element    ${LOGOUT_BUTTON}
    Wait Until Location Contains    login.html    timeout=${TIMEOUT}
    Log    Logout exitoso

Verificar Login Fallido
    [Documentation]    Verifica que el login falle con credenciales incorrectas
    [Arguments]    ${username}    ${password}
    Go To    ${FRONTEND_URL}/pages/login.html
    Wait Until Element Is Visible    ${LOGIN_USERNAME_FIELD}    timeout=${TIMEOUT}
    Input Text    ${LOGIN_USERNAME_FIELD}    ${username}
    Input Password    ${LOGIN_PASSWORD_FIELD}    ${password}
    Click Button    ${LOGIN_SUBMIT_BUTTON}
    # Verificar que aparezca mensaje de error
    Wait Until Element Is Visible    css:.alert-danger    timeout=${TIMEOUT}
    Log    Login falló correctamente con credenciales incorrectas

Login API Con Credenciales
    [Documentation]    Realiza login vía API y retorna el token
    [Arguments]    ${username}    ${password}
    Create Session    api    ${API_URL}    verify=False
    ${login_data}=    Create Dictionary    username=${username}    password=${password}
    ${response}=    POST On Session    api    /auth/login    json=${login_data}
    Should Be Equal As Numbers    ${response.status_code}    200
    ${token}=    Get Value From Json    ${response.json()}    $.access_token
    [Return]    ${token[0]}

Verificar Token Válido
    [Documentation]    Verifica que el token proporcionado sea válido
    [Arguments]    ${token}
    Create Session    api    ${API_URL}    verify=False
    ${headers}=    Create Dictionary    Authorization=Bearer ${token}
    ${response}=    GET On Session    api    /auth/verify-token    headers=${headers}
    Should Be Equal As Numbers    ${response.status_code}    200
    Log    Token válido verificado

Verificar Rol Usuario
    [Documentation]    Verifica el rol del usuario actual mediante token
    [Arguments]    ${token}    ${rol_esperado}
    Create Session    api    ${API_URL}    verify=False
    ${headers}=    Create Dictionary    Authorization=Bearer ${token}
    ${response}=    GET On Session    api    /auth/me    headers=${headers}
    Should Be Equal As Numbers    ${response.status_code}    200
    ${user_data}=    Set Variable    ${response.json()}
    Should Be Equal    ${user_data['rol']}    ${rol_esperado}
    Log    Rol ${rol_esperado} verificado correctamente
