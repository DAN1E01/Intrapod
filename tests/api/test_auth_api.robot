*** Settings ***
Documentation    Pruebas de API para autenticación
Resource         ../resources/common.robot
Suite Setup      Verificar Estado Del Servidor
Test Tags        api    auth

*** Test Cases ***
Prueba Login Admin Exitoso
    [Documentation]    Verifica que el login del administrador funcione correctamente
    [Tags]    smoke    positive
    
    Create Session    api    ${API_URL}    verify=False
    ${login_data}=    Create Dictionary    username=${ADMIN_USERNAME}    password=${ADMIN_PASSWORD}
    ${response}=    POST On Session    api    /auth/login    json=${login_data}
    
    Should Be Equal As Numbers    ${response.status_code}    200
    Dictionary Should Contain Key    ${response.json()}    access_token
    Dictionary Should Contain Key    ${response.json()}    token_type
    Should Be Equal    ${response.json()['token_type']}    bearer
    
    Log    Login de administrador exitoso

Prueba Login Empacador Exitoso
    [Documentation]    Verifica que el login del empacador funcione correctamente
    [Tags]    smoke    positive
    
    Create Session    api    ${API_URL}    verify=False
    ${login_data}=    Create Dictionary    username=${EMPACADOR_USERNAME}    password=${EMPACADOR_PASSWORD}
    ${response}=    POST On Session    api    /auth/login    json=${login_data}
    
    Should Be Equal As Numbers    ${response.status_code}    200
    Dictionary Should Contain Key    ${response.json()}    access_token
    Dictionary Should Contain Key    ${response.json()}    token_type
    Should Be Equal    ${response.json()['token_type']}    bearer
    
    Log    Login de empacador exitoso

Prueba Login Con Credenciales Incorrectas
    [Documentation]    Verifica que el login falle con credenciales incorrectas
    [Tags]    negative
    
    Create Session    api    ${API_URL}    verify=False
    ${login_data}=    Create Dictionary    username=usuario_incorrecto    password=password_incorrecto
    ${response}=    POST On Session    api    /auth/login    json=${login_data}    expected_status=401
    
    Should Be Equal As Numbers    ${response.status_code}    401
    Dictionary Should Contain Key    ${response.json()}    detail
    
    Log    Login falló correctamente con credenciales incorrectas

Prueba Verificación De Token Válido
    [Documentation]    Verifica que se pueda validar un token correctamente
    [Tags]    positive
    
    # Obtener token válido
    ${token}=    Generar Token Admin
    
    # Verificar el token
    Create Session    api    ${API_URL}    verify=False
    ${headers}=    Create Dictionary    Authorization=Bearer ${token}
    ${response}=    GET On Session    api    /auth/verify-token    headers=${headers}
    
    Should Be Equal As Numbers    ${response.status_code}    200
    Dictionary Should Contain Key    ${response.json()}    username
    Dictionary Should Contain Key    ${response.json()}    rol
    
    Log    Token verificado correctamente

Prueba Verificación De Token Inválido
    [Documentation]    Verifica que se rechacen tokens inválidos
    [Tags]    negative
    
    Create Session    api    ${API_URL}    verify=False
    ${headers}=    Create Dictionary    Authorization=Bearer token_invalido
    ${response}=    GET On Session    api    /auth/verify-token    headers=${headers}    expected_status=401
    
    Should Be Equal As Numbers    ${response.status_code}    401
    
    Log    Token inválido rechazado correctamente

Prueba Obtener Información Del Usuario
    [Documentation]    Verifica que se pueda obtener información del usuario autenticado
    [Tags]    positive
    
    # Obtener token válido
    ${token}=    Generar Token Admin
    
    # Obtener información del usuario
    Create Session    api    ${API_URL}    verify=False
    ${headers}=    Create Dictionary    Authorization=Bearer ${token}
    ${response}=    GET On Session    api    /auth/me    headers=${headers}
    
    Should Be Equal As Numbers    ${response.status_code}    200
    Dictionary Should Contain Key    ${response.json()}    id
    Dictionary Should Contain Key    ${response.json()}    username
    Dictionary Should Contain Key    ${response.json()}    nombre
    Dictionary Should Contain Key    ${response.json()}    rol
    Should Be Equal    ${response.json()['username']}    ${ADMIN_USERNAME}
    
    Log    Información del usuario obtenida correctamente

Prueba Acceso Sin Token
    [Documentation]    Verifica que se rechace el acceso a endpoints protegidos sin token
    [Tags]    negative    security
    
    Create Session    api    ${API_URL}    verify=False
    ${response}=    GET On Session    api    /dashboard/admin/data    expected_status=401
    
    Should Be Equal As Numbers    ${response.status_code}    401
    
    Log    Acceso sin token rechazado correctamente

Prueba Acceso Con Rol Incorrecto
    [Documentation]    Verifica que se rechace el acceso con rol incorrecto
    [Tags]    negative    security
    
    # Obtener token de empacador
    ${token}=    Generar Token Empacador
    
    # Intentar acceder a endpoint de admin
    Create Session    api    ${API_URL}    verify=False
    ${headers}=    Create Dictionary    Authorization=Bearer ${token}
    ${response}=    GET On Session    api    /dashboard/admin/users    headers=${headers}    expected_status=403
    
    Should Be Equal As Numbers    ${response.status_code}    403
    
    Log    Acceso con rol incorrecto rechazado correctamente
