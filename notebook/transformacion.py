import pandas as pd

def transformar_datos(data_frame_limpio):

    df = data_frame_limpio.copy()
    df["fecha"] = pd.to_datetime(df["fecha"])
    df["fecha_dia"] = df["fecha"].dt.date
    df["hora"] = df["fecha"].dt.hour

    #1. Transformacion 1 (Voltaje maximo, promedio y minimo por Fecha)
    filtro1 = df.query("voltaje > 0")
    agrupacion1 = filtro1.groupby("fecha_dia")["voltaje"].agg(
        voltaje_maximo="max",
        voltaje_promedio="mean",
        voltaje_minimo="min"
    ).reset_index()

    #2. Transformacion 2 (Voltaje maximo, promedio y minimo por Hora)
    filtro2 = df.query("voltaje > 0")
    agrupacion2 = filtro2.groupby("hora")["voltaje"].agg(
        voltaje_maximo="max",
        voltaje_promedio="mean",
        voltaje_minimo="min"
    ).reset_index()

    #3. Transformacion 3 (Voltaje elevado por Hora - umbral > 26.7V)
    filtro3 = df.query("voltaje > 26.7")
    agrupacion3 = filtro3.groupby("hora")["voltaje"].agg(
        voltaje_maximo="max",
        voltaje_promedio="mean",
        voltaje_minimo="min"
    ).reset_index()

    agrupacion_resumen = {
        "agrupacion_fecha": agrupacion1,
        "agrupacion_hora": agrupacion2,
        "agrupacion_critica": agrupacion3
    }

    return agrupacion_resumen
