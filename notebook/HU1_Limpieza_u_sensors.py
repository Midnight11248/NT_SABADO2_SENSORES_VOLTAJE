import pandas as pd
import random
import string


def generar_token(n=12):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=n))


def generar_user_sensors_sucio(n=20):
    datos = []
    tokens_usados = []

    for i in range(n):
        token = generar_token()
        registro = {
            "id"          : i + 1,
            "user_id"     : random.randint(1, 10),
            "sensor_name" : "Sensor Voltaje",
            "sensor_token": token
        }

        prob = random.random()
        if prob < 0.15:
            registro["user_id"] = None
        elif prob < 0.30:
            registro["sensor_name"] = None
        elif prob < 0.45:
            registro["sensor_token"] = None
        elif prob < 0.55 and tokens_usados:
            registro["sensor_token"] = random.choice(tokens_usados)

        tokens_usados.append(registro["sensor_token"])
        datos.append(registro)

    datos.append(datos[0].copy())
    datos.append(datos[1].copy())
    return datos


def limpiar_datos(data_frame_sucio):
    data_frame_limpio = data_frame_sucio.copy()

    # 1. Limpiar las columnas String del DF
    columnas_texto = ["sensor_name", "sensor_token"]
    for columna in columnas_texto:
        data_frame_limpio[columna] = data_frame_limpio[columna].astype("string").str.strip().str.title()

    # 1.1 Definir el único valor válido para sensor_name
    data_frame_limpio["sensor_name"] = data_frame_limpio["sensor_name"].where(
        data_frame_limpio["sensor_name"] == "Sensor Voltaje", other=pd.NA)

    # 2. Limpiar las columnas numéricas del DF
    data_frame_limpio["user_id"] = pd.to_numeric(data_frame_limpio["user_id"], errors="coerce")
    data_frame_limpio = data_frame_limpio.dropna(subset=["user_id"])

    # 2.1 Limpiar campos numéricos que no tengan valores válidos
    data_frame_limpio["user_id"] = data_frame_limpio["user_id"].astype(int)

    # 3. Organizar las columnas del DF
    data_frame_limpio = data_frame_limpio[["id", "user_id", "sensor_name", "sensor_token"]]

    # 3.1 Si no viene sensor_name, asignar el valor por defecto
    data_frame_limpio["sensor_name"] = data_frame_limpio["sensor_name"].fillna("Sensor Voltaje")

    # 4. Eliminar registros que tengan campos obligatorios vacíos
    campos_obligatorios = ["user_id", "sensor_token"]
    data_frame_limpio = data_frame_limpio.dropna(subset=campos_obligatorios)

    # 4.1 Eliminar tokens duplicados (restricción UNIQUE)
    data_frame_limpio = data_frame_limpio.drop_duplicates(subset=["sensor_token"], keep="first")

    # 5. Eliminar registros duplicados
    data_frame_limpio = data_frame_limpio.drop_duplicates()

    return data_frame_limpio


# Ejecución

data = generar_user_sensors_sucio(20)
df_sucio = pd.DataFrame(data)

print("DATOS ORIGINALES")
print(df_sucio)

print("\nVALORES NULOS")
print(df_sucio.isnull().sum())

df_limpio = limpiar_datos(df_sucio)

print("\nDATOS LIMPIOS")
print(df_limpio)

df_limpio.to_csv("user_sensors_limpio.csv", index=False)
print("\nArchivo exportado: user_sensors_limpio.csv")