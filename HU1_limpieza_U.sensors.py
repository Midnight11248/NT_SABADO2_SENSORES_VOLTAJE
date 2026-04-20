import pandas as pd
import random
import string

# GENERADOR DE DATOS SUCIOS PARA LA TABLA USER_SENSORS

def generar_token(n=12):
    """Genera un token aleatorio de letras y números."""
    return ''.join(random.choices(string.ascii_letters + string.digits, k=n))

def generar_user_sensors(n):
    nombres_sensores = [
        "Sensor Temperatura", "sensor_humedad", "SENSOR PRESION",
        "sensor luz", "Sensor CO2", "sensor_movimiento"
    ]

    datos = []
    tokens_usados = set()

    for i in range(n):
        token = generar_token()

        registro = {
            "id": i + 1,
            "user_id": random.randint(1, 5),
            "sensor_name": random.choice(nombres_sensores),
            "sensor_token": token
        }

        # ERRORES CONTROLADOS
        prob = random.random()

        if prob < 0.15:
            registro["user_id"] = None                      # FK nula

        elif prob < 0.30:
            registro["sensor_name"] = None                  # nombre nulo

        elif prob < 0.45:
            registro["sensor_name"] = "  " + registro["sensor_name"] + "  "  # espacios extra

        elif prob < 0.55:
            registro["sensor_token"] = None                 # token nulo

        elif prob < 0.65:
            # Duplicar el token de un registro anterior (viola UNIQUE)
            if tokens_usados:
                registro["sensor_token"] = random.choice(list(tokens_usados))

        tokens_usados.add(registro["sensor_token"])
        datos.append(registro)

    # Agregar algunos duplicados completos de filas
    if len(datos) >= 3:
        datos.append(datos[0].copy())
        datos.append(datos[2].copy())

    return datos


# 1. GENERAR DATOS SUCIOS

data = generar_user_sensors(20)
df = pd.DataFrame(data)

print("=" * 55)
print("      DATOS ORIGINALES — USER_SENSORS")
print("=" * 55)
print(df.to_string(index=False))
print(f"\nTotal de registros: {len(df)}")

# 2. REPORTE DE VALORES NULOS

print("\n" + "=" * 55)
print("      VALORES NULOS POR COLUMNA")
print("=" * 55)
nulos = df.isnull().sum()
for col, cantidad in nulos.items():
    pct = (cantidad / len(df)) * 100
    print(f"  {col:<20} {cantidad:>3} nulos  ({pct:.1f}%)")

# 3. REPORTE DE DUPLICADOS

print("\n" + "=" * 55)
print("      REGISTROS DUPLICADOS")
print("=" * 55)
duplicados_filas = df.duplicated().sum()
duplicados_token = df.duplicated(subset=["sensor_token"], keep=False)
print(f"  Filas completamente duplicadas : {duplicados_filas}")
print(f"  Tokens duplicados (viola UNIQUE): {duplicados_token.sum()}")

df_tokens_dup = df[duplicados_token & df["sensor_token"].notna()]
if not df_tokens_dup.empty:
    print("\n  Registros con sensor_token duplicado:")
    print(df_tokens_dup.to_string(index=False))

# 4. LIMPIEZA PASO A PASO

print("\n" + "=" * 55)
print("      INICIANDO LIMPIEZA")
print("=" * 55)
transformaciones = []

# Eliminar filas completamente duplicadas
antes = len(df)
df = df.drop_duplicates()
eliminados = antes - len(df)
transformaciones.append(f"Filas duplicadas eliminadas       : {eliminados}")
print(f"  [1] Duplicados eliminados: {eliminados} fila(s)")

# Eliminar registros con user_id nulo (FK obligatoria)
antes = len(df)
df = df.dropna(subset=["user_id"])
eliminados = antes - len(df)
transformaciones.append(f"Registros sin user_id (FK) borrados: {eliminados}")
print(f"  [2] Filas sin user_id eliminadas: {eliminados}")

# Eliminar registros con sensor_name nulo
antes = len(df)
df = df.dropna(subset=["sensor_name"])
eliminados = antes - len(df)
transformaciones.append(f"Registros sin sensor_name borrados : {eliminados}")
print(f"  [3] Filas sin sensor_name eliminadas: {eliminados}")

# Eliminar registros con sensor_token nulo
antes = len(df)
df = df.dropna(subset=["sensor_token"])
eliminados = antes - len(df)
transformaciones.append(f"Registros sin sensor_token borrados: {eliminados}")
print(f"  [4] Filas sin sensor_token eliminadas: {eliminados}")

# Eliminar tokens duplicados (conserva el primero)
antes = len(df)
df = df.drop_duplicates(subset=["sensor_token"], keep="first")
eliminados = antes - len(df)
transformaciones.append(f"Tokens UNIQUE duplicados eliminados: {eliminados}")
print(f"  [5] Tokens duplicados eliminados: {eliminados}")

# Normalizar sensor_name: quitar espacios, Title Case
df["sensor_name"] = df["sensor_name"].str.strip().str.title()
transformaciones.append("sensor_name normalizado (strip + title case)")
print("  [6] sensor_name normalizado (espacios y capitalización)")

# Corregir tipos de datos
df["id"]      = df["id"].astype(int)
df["user_id"] = df["user_id"].astype(int)
df["sensor_name"]  = df["sensor_name"].astype(str)
df["sensor_token"] = df["sensor_token"].astype(str)
transformaciones.append("Tipos de datos corregidos (int / str)")
print("  [7] Tipos de datos corregidos")

# Resetear índice
df = df.reset_index(drop=True)
df["id"] = df.index + 1          # Reasignar IDs limpios y consecutivos
transformaciones.append("IDs reasignados consecutivamente tras limpieza")
print("  [8] IDs reasignados")

# 5. RESULTADO FINAL

print("\n" + "=" * 55)
print("      DATOS LIMPIOS — USER_SENSORS")
print("=" * 55)
print(df.to_string(index=False))
print(f"\nRegistros finales: {len(df)}")

# 6. DOCUMENTACIÓN DE TRANSFORMACIONES

print("\n" + "=" * 55)
print("      RESUMEN DE TRANSFORMACIONES")
print("=" * 55)
for i, t in enumerate(transformaciones, 1):
    print(f"  {i}. {t}")

# 7. EXPORTAR CSV LIMPIO

df.to_csv("user_sensors_limpio.csv", index=False)
print("\n  Archivo exportado: user_sensors_limpio.csv")
print("=" * 55)