import random
from datetime import datetime, timedelta

def simular_roles(numeroRoles):

    lista_roles = [
        {"nombre_rol": "root", "codigo": "01"},
        {"nombre_rol": "Administrador", "codigo": "02"},
        {"nombre_rol": "SoloLectura", "codigo": "03"}
    ]

    roles = []

    for i in range(numeroRoles):
        rol_seleccionado = random.choice(lista_roles)

        rol = {
            "nombre_rol": i + 1,
            "nombre_rol": rol_seleccionado["nombre_rol"],
            "codigo": rol_seleccionado["codigo"],
        }

        roles.append(rol)

    return roles
# ejemplo de uso de la función

# roles_generados = simular_roles(10)

# for rol in roles_generados:
#     print(rol)


