import pandas as pd

#  Cargamos archivo CSV 
df = pd.read_csv("simulacion_roles.csv")

# Convertir codigo a numérico.
df["codigo"] = pd.to_numeric(df["codigo"], errors="coerce")
df = df.dropna(subset=["codigo"])

# Eliminar registros inválidos
df = df.dropna(subset=["nombre_rol", "codigo"])

# Eliminar registros inválidos
df = df.dropna(subset=["nombre_rol", "codigo"])

print("="*50)
print("AGRUPACION Y RESUMEN:")
print("="*50)

#1. Agrupar por nombre_rol y contar la cantidad de registros por cada rol
resumen_roles = df.groupby("nombre_rol").size().reset_index(name="cantidad")

print("\n --- CANTIDAD DE REGISTROS POR ROL ---")
print(resumen_roles)

#1.1 Cantidad de codigos validos por rol
resumen_codigos = df.groupby("nombre_rol")["codigo"].count().reset_index(name="codigos_validos")

print("\n --- CANTIDAD DE CODIGOS VALIDOS POR ROL ---")
print(resumen_codigos)

#2. Promedio de codigos por rol 
promedio_codigos = df.groupby("nombre_rol")["codigo"].mean().reset_index(name="promedio_codigo")
print("\n --- PROMEDIO DE CODIGOS POR ROL ---")
print(promedio_codigos)

#3. resumen completo
resumen_completo = df.groupby("nombre_rol").agg({
    "codigo": ["count", "mean", "min", "max"]
})
print("\n --- RESUMEN COMPLETO POR ROL ---")
print(resumen_completo)

#4. Guardar el resumen completo en un nuevo archivo CSV
resumen_completo.to_csv("resumen_roles.csv")
print("\nResumen completo guardado en 'resumen_roles.csv'")

#5. Guardar el resumen completo en un nuevo archivo JSON
resumen_completo.to_json("resumen_roles.json", orient="records", indent=4)
print("\nResumen completo guardado en 'resumen_roles.json'")

print("\n✔ AGRUPACION Y RESUMEN COMPLETOS.")
