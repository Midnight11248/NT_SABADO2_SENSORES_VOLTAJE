import pandas as pd

def describir_datos_roles(data_frame_limpio_roles):
    print("*** DESCRIPCION DEL DATASET ***")
    print(f"Numero de filas del dataset: {data_frame_limpio_roles.shape[0]}")
    print(f"Numero de columnas del dataset: {data_frame_limpio_roles.shape[1]}")
    print(f"Lista de columnas disponibles: {list(data_frame_limpio_roles.columns)}")
    print(f"Tipos de dato de cada atributo: {data_frame_limpio_roles.dtypes}")

    #Estadisticas (SOLO APLICA PARA DATOS NUMERICOS)
    print("*** ESTADISTICAS ***")
    print(f"{data_frame_limpio_roles[["id","codigo"]].describe()}")

    #Informacion de conteos valiosos
    print("*** CONTEOS ***")
    print(f"{data_frame_limpio_roles["id"].value_counts()}")
    print(f"{data_frame_limpio_roles["codigo"].value_counts()}")

    #Describiendo las fechas
    print("*** DESCRIPCION DE FECHAS ***")
    print(f"{data_frame_limpio_roles["fecha"].min()}")
    print(f"{data_frame_limpio_roles["fecha"].max()}")