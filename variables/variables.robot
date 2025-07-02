*** Variables ***
# URLs de INTRAPOD
${URL}                    http://127.0.0.1:5500/frontend/pages/login.html
${URL_DASHBOARD}          http://127.0.0.1:5500/frontend/pages/dashboard_admin/index.html
${URL_USUARIOS}           http://127.0.0.1:5500/frontend/pages/dashboard_admin/pages/gestionar_usuarios/usuarios.html
${URL_VENTAS}             http://127.0.0.1:5500/frontend/pages/dashboard_admin/pages/ventas/ventas.html
${URL_INVENTARIO}         http://127.0.0.1:5500/frontend/pages/dashboard_admin/pages/inventario/inventario.html
${URL_REPORTES}           http://127.0.0.1:5500/frontend/pages/dashboard_admin/pages/reportes/reportes.html

# Credenciales válidas INTRAPOD
${USERNAME}               DAN1E10
${PASSWORD}               admin123

# Credenciales para pruebas negativas
${USERNAME_BLOCK}         user_mal
${PASSWORD_BLOCK}         password_mal
${USERNAME_INC}           miguelito
${PASSWORD_INC}           predsvxxcvsdfs

# Variables para registro de usuario
${NOMBRES}                Carlos
${APELLIDOS}              Rodriguez
${NEW_USERNAME}           carlos.rodriguez
${EMAIL}                  carlos.rodriguez@intrapod.com
${NEW_PASSWORD}           123456789

# Variables adicionales para tests
${NOMBRES_2}              Maria  
${APELLIDOS_2}            Lopez
${NEW_USERNAME_2}         maria.lopez
${EMAIL_2}                maria.lopez@intrapod.com
${NEW_PASSWORD_2}         password123
