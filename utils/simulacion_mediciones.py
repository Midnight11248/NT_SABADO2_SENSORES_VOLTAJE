import random
from datetime import datetime, timedelta

def generar_simulacion(numeroSimulaciones):

    sensores_validos = [1, 2, 3, 4, 5]
    fecha_inicio = datetime(2026, 1, 1)

    simulaciones = []
    for _ in range(numeroSimulaciones):

        simulacion = {
            'id': random.randint(1, 1000),
            'sensor_id': random.choice(sensores_validos),
            'voltaje': round(random.uniform(0.0, 999.99), 2),
            'fecha': fecha_inicio + timedelta(days=random.randint(0, 60))
        }

        # Inyectando errores controlados
        probabilidadError = random.random()
        if probabilidadError < 0.2:
            simulacion['id'] = None
        elif probabilidadError < 0.4:
            simulacion['sensor_id'] = random.choice([99, 100, None])
        elif probabilidadError < 0.6:
            simulacion['voltaje'] = random.choice([-5.0, None, 'error'])
        elif probabilidadError < 0.8:
            simulacion['fecha'] = None

        simulaciones.append(simulacion)
    return simulaciones
