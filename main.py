import pandas as pd

from utils.hu2_simulacion_roles import simular_roles
from notebook.hu1_limpieza_roles import limpiar_datos

def generar_simulacion_roles(numeroRoles):
    return simular_roles(numeroRoles)

# LLamando a la función para generar la simulación de roles
simular_roles = generar_simulacion_roles(10)

# Llamando a pandas para crear dataframe de los datos de entrada
simulaciones_roles_ordenadas = pd.DataFrame(simular_roles)

# Llamando a la función de limpieza de datos
simulacion_roles_limpios = limpiar_datos(simulaciones_roles_ordenadas)

print("\nSimulación de Roles Limpios:")
print(simulacion_roles_limpios) 
