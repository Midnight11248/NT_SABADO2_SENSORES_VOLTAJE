import pandas as pd
import random
import string


def generar_token(n=12):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=n))


def generar_user_sensors_limpio(n=15):
    datos = []
    tokens_usados = set()

    for i in range(1, n + 1):
        token = generar_token()
        while token in tokens_usados:
            token = generar_token()
        tokens_usados.add(token)

        datos.append({
            "id"          : i,
            "user_id"     : random.randint(1, 10),
            "sensor_name" : "Sensor Voltaje",
            "sensor_token": token
        })

    return datos


def describir_datos(df):

    # 1. Muestras del dataset
    print("PRIMERAS 5 FILAS")
    print(df.head())

    print("\nULTIMAS 5 FILAS")
    print(df.tail())

    # 2. Estructura del DataFrame
    print("\nESTRUCTURA DEL DATAFRAME")
    df.info()

    # 3. Dimensiones y nombres de columnas
    filas, columnas = df.shape
    print("\nDIMENSIONES")
    print(f"  Filas    : {filas}")
    print(f"  Columnas : {columnas}")

    print("\nNOMBRES DE COLUMNAS")
    for i, col in enumerate(df.columns, 1):
        print(f"  {i}. {col}")

    # 4. Identificar columnas numéricas y categóricas
    cols_numericas   = df.select_dtypes(include=["number"]).columns.tolist()
    cols_categoricas = df.select_dtypes(include=["object", "category"]).columns.tolist()

    print("\nCOLUMNAS NUMERICAS")
    for c in cols_numericas:
        print(f"  - {c}  (dtype: {df[c].dtype})")

    print("\nCOLUMNAS CATEGORICAS")
    for c in cols_categoricas:
        print(f"  - {c}  (dtype: {df[c].dtype})")

    # 5. Estadísticas descriptivas
    print("\nESTADISTICAS DESCRIPTIVAS - COLUMNAS NUMERICAS")
    print(df.describe())

    print("\nESTADISTICAS DESCRIPTIVAS - COLUMNAS CATEGORICAS")
    print(df.describe(include="object"))

    # 6. Resumen de calidad
    print("\nRESUMEN DE CALIDAD")
    print(f"  Valores nulos totales : {df.isnull().sum().sum()}")
    print(f"  Filas duplicadas      : {df.duplicated().sum()}")
    print(f"  Tokens unicos         : {df['sensor_token'].nunique()}")
    print(f"  Usuarios distintos    : {df['user_id'].nunique()}")
    print(f"  Tipo de sensor        : {df['sensor_name'].unique()}")


# Ejecución

df = pd.read_csv("user_sensors_limpio.csv")

data = generar_user_sensors_limpio(15)
df = pd.DataFrame(data)

print("=" * 55)
print("   HU2 - ANALISIS EXPLORATORIO - USER_SENSORS")
print("=" * 55)

describir_datos(df)