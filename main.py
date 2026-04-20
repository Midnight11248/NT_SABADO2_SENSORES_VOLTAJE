import pandas as pd

from utils.hu3_simulacion_roles import simular_roles
def generar_simulacion(numeroRoles):
    return simular_roles(numeroRoles)

from notebook.limpieza import limpiar_datos

#Llamando a las rutinas de simulacion
simulaciones=generar_simulacion(10)

#Llamando a pandas para crear data frames de los datos de entrada
simulaciones_ordenadas=pd.DataFrame(simulaciones)

#LLamando a la rutina de limpieza
simulaciones_limpias=limpiar_datos(simulaciones_ordenadas)
print(simulaciones_limpias)
