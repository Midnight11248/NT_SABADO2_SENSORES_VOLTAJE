import pandas as pd
import random
import string
import json


def generar_token(n=16):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=n))


def generar_user_sensors(n=1000):
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


def exportar_csv(df, ruta):
    df.to_csv(ruta, index=False, encoding="utf-8")
    print(f"\nEXPORTACION CSV")
    print(f"  Archivo  : {ruta}")
    print(f"  Registros: {len(df)}")


def exportar_json(df, ruta):
    df.to_json(ruta, orient="records", indent=2, force_ascii=False)
    print(f"\nEXPORTACION JSON")
    print(f"  Archivo  : {ruta}")
    print(f"  Formato  : orient='records'")

    with open(ruta, "r", encoding="utf-8") as f:
        preview = json.load(f)
    print(f"  Preview  : {preview[:2]}")


def verificar_archivos(ruta_csv, ruta_json):
    df_csv  = pd.read_csv(ruta_csv)
    df_json = pd.read_json(ruta_json, orient="records")

    print(f"\nVERIFICACION DE ARCHIVOS")
    print(f"  [CSV]  Filas: {len(df_csv)}  | Nulos: {df_csv.isnull().sum().sum()}  | Tokens unicos: {df_csv['sensor_token'].nunique()}")
    print(f"  [JSON] Filas: {len(df_json)} | Nulos: {df_json.isnull().sum().sum()} | Tokens unicos: {df_json['sensor_token'].nunique()}")
    print(f"  CSV y JSON identicos: {'Si' if df_csv.equals(df_json) else 'No'}")


# Ejecución
TOTAL = 100
RUTA_CSV  = "user_sensors_simulado.csv"
RUTA_JSON = "user_sensors_simulado.json"

print("=" * 55)
print("   HU3 - SIMULACION Y EXPORTACION - USER_SENSORS")
print("=" * 55)

print(f"\nGenerando {TOTAL} registros...")
data = generar_user_sensors(TOTAL)
df   = pd.DataFrame(data)

print(f"  Registros generados : {len(df)}")
print(f"  Usuarios distintos  : {df['user_id'].nunique()}")
print(f"  Tipo de sensor      : {df['sensor_name'].unique()}")
print(f"  Tokens unicos       : {df['sensor_token'].nunique()}")

exportar_csv(df, RUTA_CSV)
exportar_json(df, RUTA_JSON)
verificar_archivos(RUTA_CSV, RUTA_JSON)

print("\n" + "=" * 55)
print("  Simulacion y exportacion completada correctamente.")
print("=" * 55)