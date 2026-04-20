import pandas as pd

def limpiar_datos(data_frame_sucio):

    data_frame_sucio=data-data_frame_sucio.copy()

    #1. Limpiar las columnas String del DF
    columnas_texto=["codigo",]