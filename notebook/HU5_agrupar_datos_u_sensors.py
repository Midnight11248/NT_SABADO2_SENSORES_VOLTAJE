import pandas as pd
import random
import string


def generar_token(n=12):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=n))


def generar_user_sensors_limpio(n=1000):
    tokens_usados = set()
    datos = []

    for i in range(1, n + 1):
        token = generar_token()
        while token in tokens_usados:
            token = generar_token()
        tokens_usados.add(token)

        datos.append({
            "id"          : i,
            "user_id"     : random.randint(1, 50),
            "sensor_name" : "Sensor Voltaje",
            "sensor_token": token
        })

    return datos


def agrupar_datos(data_frame):

    agrupacion1 = data_frame.groupby("user_id")["id"].count()
    print("Cantidad de sensores por usuario:")
    print(agrupacion1)

    agrupacion2 = data_frame.groupby("user_id")["id"].agg(["count", "min", "max"])
    print("\nConteo, minimo y maximo de ID de sensor por usuario:")
    print(agrupacion2)

    agrupacion3 = data_frame.groupby("sensor_name")["user_id"].count()
    print("\nCantidad de registros por tipo de sensor:")
    print(agrupacion3)


# Ejecución
data_frame = pd.read_csv("user_sensors_simulado.csv")

data       = generar_user_sensors_limpio(1000)
data_frame = pd.DataFrame(data)

print("DATOS CARGADOS")
print(data_frame.head())

print("AGRUPACIONES")
agrupar_datos(data_frame)