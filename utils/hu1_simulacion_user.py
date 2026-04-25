import random

def registrar_usuarios():
    usuarios = []

    cantidad = int(input("¿Cuántos usuarios deseas registrar?: "))

    for i in range(cantidad):
        print(f"\n--- Datos del Usuario {i + 1} ---")

        id_usuario         = int(input("ID del usuario: "))
        userme             = input("Nombre de usuario (userme): ")
        email              = input("Correo electrónico (email): ")
        password           = int(input("Contraseña numérica (password): "))
        registration_date  = input("Fecha de registro (YYYY-MM-DD): ")

        # Validar que el email sea único
        email_repetido = False
        for u in usuarios:
            if u["email"] == email.strip().lower():
                email_repetido = True
                break

        if email_repetido:
            print(f"Error: El email '{email}' ya existe. Este usuario no se agregará.")
        else:
            nuevo_usuario = {
                "id":                id_usuario,
                "userme":            userme.strip().lower(),
                "email":             email.strip().lower(),
                "password":          password,
                "registration_date": registration_date
            }
            usuarios.append(nuevo_usuario)
            print("Usuario registrado exitosamente.")

    return usuarios


mi_base_de_datos = registrar_usuarios()

print("\n--- Contenido de la 'Base de Datos' ---")
print(mi_base_de_datos)