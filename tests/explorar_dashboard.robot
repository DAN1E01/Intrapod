*** Settings ***
Documentation    Explorar enlaces en el dashboard de INTRAPOD
Library          SeleniumLibrary
Resource         ../resources/login_keywords_robusto.robot

*** Test Cases ***
Explorar Dashboard Y Enlaces
    [Documentation]    Después del login, explorar qué enlaces están disponibles
    Abrir Navegador
    Ir A Página De Login
    Ingresar Credenciales    ${USERNAME}    ${PASSWORD}
    Verificar Login Exitoso
    
    # Esperar a que cargue el dashboard
    Sleep    3s
    
    # Tomar screenshot del dashboard
    Capture Page Screenshot    dashboard_completo.png
    
    # Buscar todos los enlaces disponibles
    Log    === EXPLORANDO ENLACES EN EL DASHBOARD ===
    
    ${all_links}=    Get WebElements    xpath=//a
    ${link_count}=   Get Length    ${all_links}
    Log    Total de enlaces encontrados: ${link_count}
    
    # Buscar enlaces específicos por texto común
    Log    === PROBANDO TEXTOS DE ENLACES COMUNES ===
    
    ${usuarios_texts}=    Create List    
    ...    Gestionar Usuarios    
    ...    Usuarios    
    ...    Users    
    ...    Administrar Usuarios    
    ...    Admin Usuarios
    
    FOR    ${text}    IN    @{usuarios_texts}
        ${found}=    Run Keyword And Return Status    Page Should Contain Element    xpath=//a[contains(text(), '${text}')]
        Log    Enlace '${text}': ${found}
    END
    
    ${ventas_texts}=    Create List    
    ...    Ventas    
    ...    Sales    
    ...    Vender    
    ...    Transacciones
    
    FOR    ${text}    IN    @{ventas_texts}
        ${found}=    Run Keyword And Return Status    Page Should Contain Element    xpath=//a[contains(text(), '${text}')]
        Log    Enlace '${text}': ${found}
    END
    
    ${inventario_texts}=    Create List    
    ...    Inventario    
    ...    Inventory    
    ...    Productos    
    ...    Stock    
    ...    Almacén
    
    FOR    ${text}    IN    @{inventario_texts}
        ${found}=    Run Keyword And Return Status    Page Should Contain Element    xpath=//a[contains(text(), '${text}')]
        Log    Enlace '${text}': ${found}
    END
    
    ${reportes_texts}=    Create List    
    ...    Reportes    
    ...    Reports    
    ...    Informes    
    ...    Estadísticas
    
    FOR    ${text}    IN    @{reportes_texts}
        ${found}=    Run Keyword And Return Status    Page Should Contain Element    xpath=//a[contains(text(), '${text}')]
        Log    Enlace '${text}': ${found}
    END
    
    # Buscar también por estructura de menú (nav, ul, li)
    Log    === EXPLORANDO ESTRUCTURA DE MENÚ ===
    
    ${nav_found}=    Run Keyword And Return Status    Page Should Contain Element    xpath=//nav
    Log    Elemento nav encontrado: ${nav_found}
    
    ${menu_found}=    Run Keyword And Return Status    Page Should Contain Element    xpath=//ul[contains(@class, 'menu')]
    Log    Menú ul encontrado: ${menu_found}
    
    ${sidebar_found}=    Run Keyword And Return Status    Page Should Contain Element    xpath=//*[contains(@class, 'sidebar')]
    Log    Sidebar encontrado: ${sidebar_found}
    
    Sleep    10s
    Cerrar Navegador
