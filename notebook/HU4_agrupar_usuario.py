import pandas as pd

def agrupar_datos(data_frame):

    agrupacion1 = data_frame.groupby('userme')['password'].mean()
    print('Password promedio por userme:')
    print(agrupacion1)

    agrupacion2 = data_frame.groupby('userme')['password'].agg(['count', 'min', 'max'])
    print('Conteo, minimo y maximo de password por userme:')
    print(agrupacion2)