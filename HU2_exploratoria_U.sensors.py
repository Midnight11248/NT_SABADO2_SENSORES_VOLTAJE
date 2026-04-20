import pandas as pd

# HU 2 — DESCRIPCIÓN EXPLORATORIA CON PANDAS
# Dataset: USER_SENSORS (resultado limpio de HU 1)
# Campos: id (PK), user_id (FK), sensor_name, sensor_token

# 1. CARGAR EL DATASET

import random
import string

def generar_token(n=12):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=n))

def generar_user_sensors_limpio(n=15):
    nombres = ["Sensor Temperatura", "Sensor Humedad", "Sensor Presion",
               "Sensor Luz", "Sensor Co2", "Sensor Movimiento"]
    datos = []
    tokens_usados = set()
    i = 1
    intentos = 0
    while len(datos) < n and intentos < n * 5:
        intentos += 1
        token = generar_token()
        if token in tokens_usados:
            continue
        tokens_usados.add(token)
        datos.append({
            "id": i,
            "user_id": random.randint(1, 5),
            "sensor_name": random.choice(nombres),
            "sensor_token": token
        })
        i += 1
    return datos

df = pd.DataFrame(generar_user_sensors_limpio(15))

print("=" * 60)
print("   HU 2 — ANÁLISIS EXPLORATORIO — USER_SENSORS")
print("=" * 60)

# 2. MUESTRAS DEL DATASET

print("  PRIMERAS 5 FILAS  (head)")
print(df.head())

print("  ÚLTIMAS 5 FILAS   (tail)")
print(df.tail())


# 3. ESTRUCTURA DEL DATAFRAME

print("  ESTRUCTURA DEL DATAFRAME (info)")
df.info()

# 4. DIMENSIONES Y NOMBRES DE COLUMNAS
filas, columnas = df.shape

print("  DIMENSIONES")
print(f"  Filas    : {filas}")
print(f"  Columnas : {columnas}")

print("  NOMBRES DE COLUMNAS")
for i, col in enumerate(df.columns, 1):
    print(f"  {i}. {col}")

# 5. IDENTIFICAR COLUMNAS NUMÉRICAS Y CATEGÓRICAS

cols_numericas    = df.select_dtypes(include=["number"]).columns.tolist()
cols_categoricas  = df.select_dtypes(include=["object", "category"]).columns.tolist()

print("  COLUMNAS NUMÉRICAS")
if cols_numericas:
    for c in cols_numericas:
        print(f"  • {c}  (dtype: {df[c].dtype})")
else:
    print("  (ninguna)")

print("  COLUMNAS CATEGÓRICAS (texto)")
if cols_categoricas:
    for c in cols_categoricas:
        print(f"  • {c}  (dtype: {df[c].dtype})")
else:
    print("  (ninguna)")


# 6. ESTADÍSTICAS DESCRIPTIVAS

print("  ESTADÍSTICAS DESCRIPTIVAS — COLUMNAS NUMÉRICAS─")
print(df.describe())

print("  ESTADÍSTICAS DESCRIPTIVAS — COLUMNAS CATEGÓRICAS─")
print(df.describe(include="object"))


# 7. ANÁLISIS ADICIONAL DE COLUMNAS CATEGÓRICAS

print("  VALORES ÚNICOS POR COLUMNA CATEGÓRICA")
for c in cols_categoricas:
    unicos = df[c].nunique()
    print(f"\n  Columna: {c}  ({unicos} valores únicos)")
    print(df[c].value_counts().to_string())


# 8. ANÁLISIS DE COLUMNAS NUMÉRICAS — DETALLE

print("\n DETALLE COLUMNAS NUMÉRICAS")
for c in cols_numericas:
    print(f"\n  Columna : {c}")
    print(f"  Min     : {df[c].min()}")
    print(f"  Max     : {df[c].max()}")
    print(f"  Media   : {df[c].mean():.2f}")
    print(f"  Mediana : {df[c].median():.2f}")
    print(f"  Desv.std: {df[c].std():.2f}")



# 9. RESUMEN DE CALIDAD

print("  RESUMEN DE CALIDAD")
print(f"  Total registros       : {filas}")
print(f"  Total columnas        : {columnas}")
print(f"  Valores nulos totales : {df.isnull().sum().sum()}")
print(f"  Filas duplicadas      : {df.duplicated().sum()}")
print(f"  Tokens únicos         : {df['sensor_token'].nunique()}")
print(f"  Usuarios distintos    : {df['user_id'].nunique()}")
print(f"  Tipos de sensor       : {df['sensor_name'].nunique()}")
print("=" * 60)
print("  Análisis exploratorio completado correctamente.")
print("=" * 60)