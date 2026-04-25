import random
import string
from datetime import datetime, timedelta

def generar_usuarios(cantidad):

    usuarios = []
    emails_usados = set()

    nombres_base = ["juan", "maria", "carlos", "ana", "luis", "sofia", "andres", "valentina"]
    dominios = ["gmail.com", "hotmail.com", "outlook.com"]

    fecha_base = datetime(2020, 1, 1)

    for i in range(cantidad):

        # 🆔 ID
        id_usuario = i + 1

        # 👤 Username
        nombre = random.choice(nombres_base)
        numero = random.randint(1, 999)
        username = f"{nombre}{numero}"

        # 📧 Email único
        while True:
            email = f"{username}@{random.choice(dominios)}"
            if email not in emails_usados:
                emails_usados.add(email)
                break

        # 🔑 Password (string segura)
        password = ''.join(random.choices(string.digits, k=6))

        # 📅 Fecha aleatoria
        fecha = fecha_base + timedelta(days=random.randint(0, 1500))
        registration_date = fecha.strftime("%Y-%m-%d")

        usuario = {
            "id": id_usuario,
            "userme": username.lower(),
            "email": email.lower(),
            "password": password,
            "registration_date": registration_date
        }

        usuarios.append(usuario)

    return usuarios


# 🚀 Ejecutar simulación
mi_base_de_datos = generar_usuarios(10)

print("\n--- USUARIOS GENERADOS ---")
for u in mi_base_de_datos:
    print(u)