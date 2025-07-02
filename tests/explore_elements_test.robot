*** Settings ***
Documentation    Explora y valida elementos clave de la página de login INTRAPOD
Library          SeleniumLibrary
Library          Collections
Resource         ../variables/variables.robot

*** Test Cases ***
Explorar Elementos Login
    [Documentation]    Encontrar y validar todos los elementos de entrada y botones en la página de login
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

    # Buscar y loguear todos los inputs
    ${inputs}=    Get WebElements    xpath=//input
    ${input_count}=    Get Length    ${inputs}
    Log    Total de inputs encontrados: ${input_count}
    FOR    ${index}    IN RANGE    ${input_count}
        ${element}=    Get From List    ${inputs}    ${index}
        ${name}=    Get Element Attribute    ${element}    name
        ${id}=    Get Element Attribute    ${element}    id
        ${type}=    Get Element Attribute    ${element}    type
        ${class}=    Get Element Attribute    ${element}    class
        ${placeholder}=    Get Element Attribute    ${element}    placeholder
        Log    Input ${index}: name=${name}, id=${id}, type=${type}, class=${class}, placeholder=${placeholder}
    END

    # Buscar y loguear todos los botones
    ${buttons}=    Get WebElements    xpath=//button
    ${button_count}=    Get Length    ${buttons}
    Log    Total de botones encontrados: ${button_count}
    FOR    ${index}    IN RANGE    ${button_count}
        ${element}=    Get From List    ${buttons}    ${index}
        ${text}=    Get Text    ${element}
        ${type}=    Get Element Attribute    ${element}    type
        ${onclick}=    Get Element Attribute    ${element}    onclick
        Log    Botón ${index}: texto="${text}", type=${type}, onclick=${onclick}
    END

    # Buscar formularios
    ${forms}=    Get WebElements    xpath=//form
    ${form_count}=    Get Length    ${forms}
    Log    Total de formularios encontrados: ${form_count}
    Should Be True    ${form_count} > 0    La página debe tener al menos un formulario

    Capture Page Screenshot    login_page_exploracion.png
    Close Browser
