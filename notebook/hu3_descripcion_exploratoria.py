import pandas as pd

#1. Cargar el dataset limpio de roles
# Usamos el archivo limpio de roles generado en la HU1

df = pd.read_csv("simulacion_roles.csv")

print("="*50)
print("hu3_Descripción_Exploratoria:")
print("="*50)

#2. Primeras y ultimas filas del dataset

print("\n --- HEAD (primeras 5 filas) ---")
print(df.head())

print("\n --- TAIL (últimas 5 filas) ---")
print(df.tail())

#3. Información general del dataset
print("\n --- INFO (Información general del dataset) ---")
print(df.info())

#4. Estadísticas descriptivas del dataset
print("\n --- DESCRIBE (Estadísticas de columnas numéricas) ---")
print(df.describe())

#5. cantidad de filas y columnas del dataset
filas, columnas = df.shape
print(f"\n --- shape (DIMENSIONES DEL DATASET) ---")
print(f"Filas : {filas}")
print(f"Columnas: {columnas}")

#6. Identificar variables numericas y categoricas
print("\n --- VARIABLES NUMERICAS ---")
numericas = df.select_dtypes(include=['number']).columns.tolist()
print(numericas)

print("\n --- VARIABLES CATEGORICAS / TEXTO ---")
categoricas = df.select_dtypes(include=['object']).columns.tolist()
print(categoricas)

#7. Identificar valores únicos en cada columna
print("\n --- VALORES UNICOS POR COLUMNA ---")
for columna in df.columns:
    print(f" {columna} : {df[columna].unique()} valores únicos")

print("\n✔ EXPLORACION COMPLETA.")    









