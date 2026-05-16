import requests

def consumir_api_tabla_mediciones():

    #1. Escribir la url del servicio que quiero consumir
    url="http://localhost:8080/mediciones/ultimas/3"

    #2. Utilizar el request de python para ir a la API 
    respuesta=requests.get(url)

    #3. Verificamos la respuesta
    respuesta.raise_for_status()

    #4. verifico el formato de los datos recibidos
    datos=respuesta.json()

    return datos