import pandas as pd

def limpiar_datos(data_frame_sucio):
    data_frame_limpio = data_frame_sucio.copy()

    print('Valores nulos por columna:')
    print(data_frame_limpio.isnull().sum())

    data_frame_limpio = data_frame_limpio.drop_duplicates()

    data_frame_limpio['id'] = pd.to_numeric(data_frame_limpio['id'], errors='coerce')
    data_frame_limpio['sensor_id'] = pd.to_numeric(data_frame_limpio['sensor_id'], errors='coerce')
    data_frame_limpio['voltaje'] = pd.to_numeric(data_frame_limpio['voltaje'], errors='coerce')
    data_frame_limpio['fecha'] = pd.to_datetime(data_frame_limpio['fecha'], errors='coerce')

    sensores_validos = [1, 2, 3, 4, 5]
    data_frame_limpio['sensor_id'] = data_frame_limpio['sensor_id'].where(
        data_frame_limpio['sensor_id'].isin(sensores_validos), pd.NA
    )

    data_frame_limpio = data_frame_limpio[data_frame_limpio['voltaje'] >= 0]
    data_frame_limpio = data_frame_limpio.dropna(subset=['id', 'sensor_id', 'voltaje', 'fecha'])

    return data_frame_limpio
