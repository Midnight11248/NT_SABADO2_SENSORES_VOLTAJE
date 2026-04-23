import pandas as pd

# Importar funciones de cada HU roles
from utils.hu2_simulacion_roles import simular_roles
from notebook.hu1_limpieza_roles import limpiar_datos_roles
from notebook.hu3_descripcion_exploratoria import *

# Importar funciones de cada HU mediciones
from utils.simulacion_mediciones import generar_simulacion
from notebook.hu1_limpieza_mediciones import limpiar_datos
from notebook.hu2_descripcion_mediciones import describir_datos
from notebook.hu3_simulacion_exportacion_mediciones import exportar_datos
from notebook.hu4_query_mediciones import consultar_datos
from notebook.hu5_agrupacion_mediciones import agrupar_datos

# Simulación de la tabla de roles
simulacion_roles = simular_roles(10)
df_roles = pd.DataFrame(simulacion_roles)

df_roles_limpio = limpiar_datos_roles(df_roles)
describir_datos(df_roles_limpio)

# Simulación de la tabla de mediciones
simulaciones = generar_simulacion(100)
df_mediciones = pd.DataFrame(simulaciones)

df_mediciones_limpio = limpiar_datos(df_mediciones)

describir_datos(df_mediciones_limpio)
exportar_datos()
consultar_datos(df_mediciones_limpio)
agrupar_datos(df_mediciones_limpio)
