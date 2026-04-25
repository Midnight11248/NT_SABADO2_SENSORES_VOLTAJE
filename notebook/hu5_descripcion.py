import pandas as pd

def describir_datos(data_frame_limpio):

    print("* DESCRIPCION DEL DATASET *")
    print(f"Numero de filas del dataset: {data_frame_limpio.shape[0]}")
    print(f"Numero de columnas del dataset: {data_frame_limpio.shape[1]}")
    print(f"Lista de columnas disponibles: {list(data_frame_limpio.columns)}")
    print(f"Tipos de dato de cada atributo:\n{data_frame_limpio.dtypes}")

    # Estadisticas (SOLO APLICA PARA DATOS NUMERICOS)
    print("\n* ESTADISTICAS *")
    print(data_frame_limpio[["id", "password"]].describe())

    # Informacion de conteos valiosos
    print("\n* CONTEOS *")
    print("Conteo por userme:")
    print(data_frame_limpio["userme"].value_counts())
    print("\nConteo por email:")
    print(data_frame_limpio["email"].value_counts())

    # Describiendo las fechas
    print("\n* DESCRIPCION DE FECHAS *")
    print(f"Fecha de registro mas antigua: {data_frame_limpio['registration_date'].min()}")
    print(f"Fecha de registro mas reciente: {data_frame_limpio['registration_date'].max()}")