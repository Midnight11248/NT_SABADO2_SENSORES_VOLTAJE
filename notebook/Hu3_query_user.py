import pandas as pd

def consultar_datos(data_frame):

    consulta1 = data_frame.query('id > 500')
    print('Usuarios con ID mayor a 500:')
    print(consulta1)

    consulta2 = data_frame.query('userme == "maria"')
    print('Usuarios con userme igual a maria:')
    print(consulta2)

    consulta3 = data_frame.query('password < 3000 and userme == "juan"')
    print('Usuarios juan con password menor a 3000:')
    print(consulta3)