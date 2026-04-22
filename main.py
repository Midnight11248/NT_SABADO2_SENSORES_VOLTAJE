import pandas as pd

from utils.simulacion_mediciones import generar_simulacion
from notebook.hu1_limpieza_mediciones import limpiar_datos
from notebook.hu2_descripcion_mediciones import describir_datos
from notebook.hu3_simulacion_exportacion_mediciones import exportar_datos
from notebook.hu4_query_mediciones import consultar_datos

simulaciones = generar_simulacion(100)
simulaciones_ordenadas = pd.DataFrame(simulaciones)

simulaciones_limpias = limpiar_datos(simulaciones_ordenadas)
describir_datos(simulaciones_limpias)
exportar_datos()
consultar_datos(simulaciones_limpias)
