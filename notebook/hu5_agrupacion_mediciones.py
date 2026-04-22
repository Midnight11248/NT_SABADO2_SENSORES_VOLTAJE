import pandas as pd

def agrupar_datos(data_frame):

    agrupacion1 = data_frame.groupby('sensor_id')['voltaje'].mean()
    print('Voltaje promedio por sensor:')
    print(agrupacion1)

    agrupacion2 = data_frame.groupby('sensor_id')['voltaje'].agg(['count','min','max'])
    print('Conteo, minimo y maximo de voltaje por sensor:')
    print(agrupacion2)
