import random
from datetime import datetime, timedelta


def simular_roles(numeroRoles):
    
    listaRoles = ["Administrador", "root", "SoloLectura"]
    
    codigoRoles = ["01", "02", "03"]
    
    roles=[]
    
    fechaInicial = datetime(2010, 1, 1)
    for i in range(numeroRoles):
        fechaSimulada = fechaInicial + timedelta(days=random.randint(0,60))
        rol = {
            "id_roles":random.randint(0, 5000),
            "Administrador": random.choice(listaRoles),
            "SoloLectura": random.choice(listaRoles),
            "codigo": random.choice(codigoRoles),           
            "root": random.randint(0, 5000),
            "valor": random.randint(80000, 100000),
            "fecha": fechaSimulada.strftime("%Y/%m/%d")
        }
        
        roles.append(rol)
    return roles    