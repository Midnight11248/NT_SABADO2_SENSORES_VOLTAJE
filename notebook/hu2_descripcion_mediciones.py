import pandas as pd

def describir_datos(data_frame):
    
    #Toda rutina de analisis debe describir el data set

    #1. Es importante conocer cuantos registros tengo
    #2. Es importante conocer cuantos atributos tengo
    #3. Es util tener acceso a una lista con los nombres de los atributos
    #4. Es util hacer conteos de algunas columnas de interes
    #5. Es util conocer las estadisticas descriptivas de los campos numericos
    #Media-max-min-std-percentiles
    #Si tengo fechas es util conocer cual es la fecha mas antigua y la fecha
    #mas nueva

    print("*** PRIMEROS REGISTROS ***")
    print(data_frame.head())
    print("*** ULTIMOS REGISTROS ***")
    print(data_frame.tail())
    print("*** INFORMACION GENERAL ***")
    print(data_frame.info())
    print("*** ESTADISTICAS DESCRIPTIVAS ***")
    print(data_frame.describe())
    print("*** FORMA DEL DATASET ***")
    print(data_frame.shape)
    print("*** LISTA DE COLUMNAS ***")
    print(data_frame.columns.tolist())