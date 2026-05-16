import pandas as pd

# Importar funciones de cada HU roles
#from utils.hu2_simulacion_roles import simular_roles
#from notebook.hu1_limpieza_roles import limpiar_datos_roles
#from notebook.hu3_descripcion_exploratoria import *

# Importar funciones de cada HU mediciones
from notebook.consumir_mediciones import consumir_api_tabla_mediciones
from notebook.transformacion import transformar_datos
#from utils.simulacion_mediciones import generar_simulacion
#from notebook.hu1_limpieza_mediciones import limpiar_datos
#from notebook.hu2_descripcion_mediciones import describir_datos
#from notebook.hu3_simulacion_exportacion_mediciones import exportar_datos
#from notebook.hu4_query_mediciones import consultar_datos
#from notebook.hu5_agrupacion_mediciones import agrupar_datos

#Cargando los datos del API
datos_API = consumir_api_tabla_mediciones()
data_frame_limpio = pd.DataFrame(datos_API)
print(data_frame_limpio)

agrupaciones = transformar_datos(data_frame_limpio)
print(agrupaciones)

# df_mediciones_limpio = limpiar_datos(df_mediciones)

# describir_datos(df_mediciones_limpio)
# exportar_datos()
# consultar_datos(df_mediciones_limpio)
# agrupar_datos(df_mediciones_limpio)
