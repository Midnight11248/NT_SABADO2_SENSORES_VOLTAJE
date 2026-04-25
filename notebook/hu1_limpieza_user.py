import pandas as pd

def limpiar_datos_user(data_frame_sucio):

    data_frame_limpio = data_frame_sucio.copy()

    # 1. Limpiar las columnas String del DF
    columnas_texto = ["userme", "email"]
    for columna in columnas_texto:
        data_frame_limpio[columna] = data_frame_limpio[columna].astype("string").str.strip().str.lower()

    # 1.1 Definir valores de String esperados
    valores_validos_userme = ["maria", "juan", "andres", "sara"]
    data_frame_limpio["userme"] = data_frame_limpio["userme"].where(
        data_frame_limpio["userme"].isin(valores_validos_userme),
        pd.NA
    )

    # 2. Limpiar las columnas numericas del DF
    data_frame_limpio["id"]  = pd.to_numeric(data_frame_limpio["id"],)
    data_frame_limpio["password"] = pd.to_numeric(data_frame_limpio["password"],)

    # 2.1 Limpiando campos numericos que no tengan valores validos
    data_frame_limpio = data_frame_limpio[data_frame_limpio["id"]       > 0]
    data_frame_limpio = data_frame_limpio[data_frame_limpio["password"] >= 0]

    # 3. Organizar las columnas de tipo fecha
    data_frame_limpio["registration_date"] = pd.to_datetime(
        data_frame_limpio["registration_date"],

        
    )

    # 3.1 Si una fecha no viene la reemplazamos por un valor por defecto
    fecha_default = pd.to_datetime("2026-01-01")
    data_frame_limpio["registration_date"] = data_frame_limpio["registration_date"].fillna(fecha_default)

    # 4. Eliminar registros que tengan datos obligatorios vacios
    columnas_obligatorias = ["id", "userme", "email", "registration_date"]
    data_frame_limpio = data_frame_limpio.dropna(subset=columnas_obligatorias)

    # 5. Eliminar registros duplicados
    data_frame_limpio = data_frame_limpio.drop_duplicates()

    return data_frame_limpio
