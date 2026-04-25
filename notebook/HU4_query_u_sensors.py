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


def consultar_datos(data_frame):

    consulta1 = data_frame.query("user_id == 5")
    print("Sensores asociados al usuario 5:")
    print(consulta1)

    consulta2 = data_frame.query("user_id > 25")
    print("\nSensores de usuarios con ID mayor a 25:")
    print(consulta2)

    consulta3 = data_frame.query("user_id >= 10 and user_id <= 20")
    print("\nSensores de usuarios entre ID 10 y 20:")
    print(consulta3)

    consulta4 = data_frame.query("sensor_name == 'Sensor Voltaje' and user_id <= 5")
    print("\nSensor Voltaje asignado a usuarios del 1 al 5:")
    print(consulta4)

# Ejecución
data_frame = pd.read_csv("user_sensors_simulado.csv")

data       = generar_user_sensors_limpio(1000)
data_frame = pd.DataFrame(data)

print("DATOS CARGADOS")
print(data_frame.head())

print("\nCONSULTAS")
consultar_datos(data_frame)