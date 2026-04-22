import pandas as pd

def describir_datos(data_frame):

    print(data_frame.head())
    print(data_frame.tail())
    print(data_frame.info())
    print(data_frame.describe())
    print(data_frame.shape)
    print(data_frame.columns.tolist())
