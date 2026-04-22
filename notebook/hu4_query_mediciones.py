import pandas as pd

def consultar_datos(data_frame):

    consulta1 = data_frame.query('voltaje > 500')
    print('Mediciones con voltaje mayor a 500:')
    print(consulta1)

    consulta2 = data_frame.query('sensor_id == 1')
    print('Mediciones del sensor 1:')
    print(consulta2)

    consulta3 = data_frame.query('voltaje < 100 and sensor_id == 2')
    print('Mediciones del sensor 2 con voltaje menor a 100:')
    print(consulta3)
