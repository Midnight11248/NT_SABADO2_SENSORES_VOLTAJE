import pandas as pd

from utils.simulacion_mediciones import generar_simulacion

def exportar_datos():

    simulaciones = generar_simulacion(1000)
    data_frame = pd.DataFrame(simulaciones)

    data_frame.to_csv('simulacion_mediciones.csv', index=False)
    data_frame.to_json('simulacion_mediciones.json', orient='records')

    print('Archivo CSV generado: simulacion_mediciones.csv')
    print('Archivo JSON generado: simulacion_mediciones.json')
    print(f'Total de registros: {len(data_frame)}')
