import pandas as pd

from utils.hu1_simulacion_user import generar_usuarios

def exportar_datos():
    simulaciones = generar_usuarios(1000)
    data_frame = pd.DataFrame(simulaciones)
    data_frame.to_csv('simulacion_usuarios.csv', index=False)
    data_frame.to_json('simulacion_usuarios.json', orient='records', indent=4)
    print('Archivo CSV generado: simulacion_usuarios.csv')
    print('Archivo JSON generado: simulacion_usuarios.json')
    print(f'Total de registros: {len(data_frame)}')

exportar_datos()