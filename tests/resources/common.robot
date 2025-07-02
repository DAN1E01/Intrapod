*** Settings ***
Documentation    Configuración global para las pruebas de Pollería Intrapod
Library          SeleniumLibrary
Library          RequestsLibrary
Library          Collections
Library          String
Library          DateTime
Library          OperatingSystem

*** Variables ***
# URLs de la aplicación
${BASE_URL}              http://localhost:8000
${FRONTEND_URL}          http://localhost:5500/frontend
${API_URL}               http://localhost:8000

# Credenciales de prueba
${ADMIN_USERNAME}        admin
${ADMIN_PASSWORD}        admin123
${EMPACADOR_USERNAME}    empacador1
${EMPACADOR_PASSWORD}    empacador123

# Configuración del navegador
${BROWSER}               Chrome
${TIMEOUT}               10s
${IMPLICIT_WAIT}         5s

# Datos de prueba
${TEST_PRODUCTO_NOMBRE}     Producto Test
${TEST_PRODUCTO_DESC}       Descripción de producto para pruebas
${TEST_PRECIO_COMPRA}       10.50
${TEST_PRECIO_VENTA}        15.75
${TEST_STOCK_INICIAL}       7

# Selectores CSS comunes
${LOGIN_USERNAME_FIELD}     #username
${LOGIN_PASSWORD_FIELD}     #password
${LOGIN_SUBMIT_BUTTON}      button[type="submit"]
${LOGOUT_BUTTON}            #cerrar_sesion

# Configuración de la base de datos
${DB_HOST}                  localhost
${DB_PORT}                  3306
${DB_NAME}                  polleria_intrapod
${DB_USER}                  root
${DB_PASSWORD}              

*** Keywords ***
Configurar Navegador
    [Documentation]    Configura el navegador con las opciones necesarias
    ${chrome_options}=    Evaluate    sys.modules['selenium.webdriver'].ChromeOptions()    sys, selenium.webdriver
    Call Method    ${chrome_options}    add_argument    --no-sandbox
    Call Method    ${chrome_options}    add_argument    --disable-dev-shm-usage
    Call Method    ${chrome_options}    add_argument    --disable-gpu
    Call Method    ${chrome_options}    add_argument    --window-size=1920,1080
    Create Webdriver    Chrome    chrome_options=${chrome_options}
    Set Window Size    1920    1080
    Set Selenium Timeout    ${TIMEOUT}
    Set Selenium Implicit Wait    ${IMPLICIT_WAIT}

Cerrar Navegador
    [Documentation]    Cierra el navegador y limpia la sesión
    Close All Browsers

Limpiar Datos De Prueba
    [Documentation]    Limpia los datos de prueba de la base de datos
    [Tags]    cleanup
    # Aquí puedes agregar comandos SQL para limpiar datos de prueba
    Log    Limpiando datos de prueba

Generar Token Admin
    [Documentation]    Genera un token de autenticación para el administrador
    Create Session    api    ${API_URL}    verify=False
    ${login_data}=    Create Dictionary    username=${ADMIN_USERNAME}    password=${ADMIN_PASSWORD}
    ${response}=    POST On Session    api    /auth/login    json=${login_data}
    Should Be Equal As Numbers    ${response.status_code}    200
    ${token}=    Get Value From Json    ${response.json()}    $.access_token
    [Return]    ${token[0]}

Generar Token Empacador
    [Documentation]    Genera un token de autenticación para el empacador
    Create Session    api    ${API_URL}    verify=False
    ${login_data}=    Create Dictionary    username=${EMPACADOR_USERNAME}    password=${EMPACADOR_PASSWORD}
    ${response}=    POST On Session    api    /auth/login    json=${login_data}
    Should Be Equal As Numbers    ${response.status_code}    200
    ${token}=    Get Value From Json    ${response.json()}    $.access_token
    [Return]    ${token[0]}

Verificar Estado Del Servidor
    [Documentation]    Verifica que el servidor backend esté funcionando
    Create Session    api    ${API_URL}    verify=False
    ${response}=    GET On Session    api    /    expected_status=any
    Should Be Equal As Numbers    ${response.status_code}    200
