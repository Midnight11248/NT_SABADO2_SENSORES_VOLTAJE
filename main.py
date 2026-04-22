import pandas as pd

from utils.simulacion_mediciones import generar_simulacion
from notebook.hu1_limpieza_mediciones import limpiar_datos

simulaciones = generar_simulacion(10)
simulaciones_ordenadas = pd.DataFrame(simulaciones)

simulaciones_limpias = limpiar_datos(simulaciones_ordenadas)
print(simulaciones_limpias)
