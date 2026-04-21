import pandas as pd

def limpiar_datos(data_frame_sucio):
    data_frame_limpio = data_frame_sucio.copy()

    #1. Limpiar las columnas String del DF
    columnas_texto = ["nombre_rol", "codigo"]
    for columna in columnas_texto:
        data_frame_limpio[columna] = data_frame_limpio[columna].astype("string").str.strip().str.lower()

    #1.1 Definir valores de String esperados
    valores_validos_nombre_rol = ["root", "administrador", "solelectura"]
    data_frame_limpio["nombre_rol"] = data_frame_limpio["nombre_rol"].where(data_frame_limpio["nombre_rol"].isin(valores_validos_nombre_rol), other=pd.NA)

    #2. Limpiar las columnas numéricas del DF
    data_frame_limpio["codigo"] = pd.to_numeric(data_frame_limpio["codigo"], errors="coerce")
    data_frame_limpio=data_frame_limpio.dropna(subset=["codigo"])

    #2.1 Limpiando campos numericos que no tengan valores validos
    data_frame_limpio = data_frame_limpio[data_frame_limpio["codigo"].isin([1, 2, 3])]

    #3. Organizar las columnas del DF
    data_frame_limpio = data_frame_limpio[["nombre_rol", "codigo"]]

    #3.1 si no viene un nombre de rol, asignar un valor por defecto
    rol_default = "desconocido"
    data_frame_limpio["nombre_rol"] = data_frame_limpio["nombre_rol"].fillna(rol_default)

    #4. Eliminar registros que tengan campos obligatorios vacios
    rol_obligatorio = ["codigo", "nombre_rol"]
    data_frame_limpio = data_frame_limpio.dropna(subset=rol_obligatorio)

    #5. Eliminar registros duplicados
    data_frame_limpio = data_frame_limpio.drop_duplicates()

    return data_frame_limpio