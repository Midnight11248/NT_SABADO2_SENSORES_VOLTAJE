import pandas as pd
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
            "id": i + 1,
            "nombre_rol": rol_seleccionado["nombre_rol"],
            "codigo": rol_seleccionado["codigo"],
        }

        probabilidadError = random.random()
        if probabilidadError < 0.1:
            rol["nombre_rol"] = None
        elif probabilidadError < 0.3:
            rol["codigo"] = None
        elif probabilidadError < 0.6:
            rol["nombre_rol"] = rol["nombre_rol"].lower()
        elif probabilidadError < 0.9:
            rol["codigo"] = rol["codigo"] + "X" 

        roles.append(rol) 

    df_roles = pd.DataFrame(roles)

    print("="*50)
    print("hu3_Simulación_Roles_Generados:")
    print("="*50)

    print(f"Simulación de Roles Generados: {numeroRoles}")
    print("\nPrimeros 5 Roles Generados:")
    print(df_roles.head())

    df_roles.to_csv("simulacion_roles.csv", index=False)
    print("\nSimulación de Roles guardada en 'simulacion_roles.csv'")

    df_roles.to_json("simulacion_roles.json", orient="records", indent=4)
    print("\nSimulación de Roles guardada en 'simulacion_roles.json'")  

    return roles