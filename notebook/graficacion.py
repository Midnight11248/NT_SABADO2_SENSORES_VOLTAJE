# Se importa matplotlib para crear los gráficos
import matplotlib.pyplot as plt
# Se importa seaborn para el mapa de calor con estilo mejorado
import seaborn as sns
# Se importa os para manejar rutas y crear carpetas
import os

# Ruta típica de la carpeta assets en un proyecto React con Vite
RUTA_ASSETS = os.path.join(os.path.dirname(__file__), "..", "frontend", "src", "assets", "graficos")


def crear_ruta_si_no_existe(ruta_destino):
    # Se crea la carpeta destino en caso de que aún no exista
    os.makedirs(ruta_destino, exist_ok=True)


def graficar_lineas(datos_agrupados, columna_eje_x, columna_eje_y,
                    titulo="Gráfico de líneas", color_linea="#2196F3",
                    nombre_archivo="lineas.png", ruta_destino=RUTA_ASSETS):
    # Dibuja un gráfico de líneas con marcadores, útil para mostrar tendencias en el tiempo
    # Recibe un DataFrame agrupado y los nombres de las columnas para cada eje

    # Se asegura de que la carpeta donde se guardará la imagen exista
    crear_ruta_si_no_existe(ruta_destino)

    # Se crea la figura y el área de dibujo con un tamaño de 10 de ancho por 5 de alto
    figura, area_dibujo = plt.subplots(figsize=(10, 5))

    # Se dibuja la línea con marcadores circulares usando el color recibido
    area_dibujo.plot(
        datos_agrupados[columna_eje_x],
        datos_agrupados[columna_eje_y],
        marker="o",
        color=color_linea,
        linewidth=2
    )

    # Se coloca el título del gráfico con tamaño de fuente 14
    area_dibujo.set_title(titulo, fontsize=14)

    # Se coloca la etiqueta del eje horizontal
    area_dibujo.set_xlabel(columna_eje_x, fontsize=12)

    # Se coloca la etiqueta del eje vertical
    area_dibujo.set_ylabel(columna_eje_y, fontsize=12)

    # Se activa la cuadrícula con línea punteada y transparencia para mejor lectura
    area_dibujo.grid(True, linestyle="--", alpha=0.6)

    # Se rotan las etiquetas del eje X a 45 grados para que no se sobrepongan
    plt.xticks(rotation=45)

    # Se ajusta el espaciado para que nada quede cortado
    plt.tight_layout()

    # Se construye la ruta completa del archivo y se guarda la imagen
    ruta_completa = os.path.join(ruta_destino, nombre_archivo)
    figura.savefig(ruta_completa)

    # Se cierra la figura para liberar memoria
    plt.close(figura)

    # Se imprime la ubicación donde quedó guardada la imagen
    print(f"Gráfico de líneas guardado en: {ruta_completa}")


def graficar_barras(datos_agrupados, columna_categorias, columna_valores,
                    titulo="Gráfico de barras", color_barras="#4CAF50",
                    nombre_archivo="barras.png", ruta_destino=RUTA_ASSETS):
    # Dibuja un gráfico de barras verticales, útil para comparar cantidades entre categorías
    # Recibe un DataFrame agrupado con una columna categórica y otra numérica

    # Se asegura de que la carpeta donde se guardará la imagen exista
    crear_ruta_si_no_existe(ruta_destino)

    # Se crea la figura y el área de dibujo con un tamaño de 10 de ancho por 5 de alto
    figura, area_dibujo = plt.subplots(figsize=(10, 5))

    # Se dibujan las barras con el color recibido y borde negro para mejor contraste
    area_dibujo.bar(
        datos_agrupados[columna_categorias],
        datos_agrupados[columna_valores],
        color=color_barras,
        edgecolor="black"
    )

    # Se coloca el título del gráfico con tamaño de fuente 14
    area_dibujo.set_title(titulo, fontsize=14)

    # Se coloca la etiqueta del eje horizontal con el nombre de la columna categórica
    area_dibujo.set_xlabel(columna_categorias, fontsize=12)

    # Se coloca la etiqueta del eje vertical con el nombre de la columna de valores
    area_dibujo.set_ylabel(columna_valores, fontsize=12)

    # Se rotan las etiquetas del eje X a 45 grados para evitar sobreposición
    plt.xticks(rotation=45)

    # Se ajusta el espaciado para que nada quede cortado
    plt.tight_layout()

    # Se construye la ruta completa del archivo y se guarda la imagen
    ruta_completa = os.path.join(ruta_destino, nombre_archivo)
    figura.savefig(ruta_completa)

    # Se cierra la figura para liberar memoria
    plt.close(figura)

    # Se imprime la ubicación donde quedó guardada la imagen
    print(f"Gráfico de barras guardado en: {ruta_completa}")


def graficar_torta(datos_agrupados, columna_etiquetas, columna_valores,
                   titulo="Gráfico de torta", lista_colores=None,
                   nombre_archivo="torta.png", ruta_destino=RUTA_ASSETS):
    # Dibuja un gráfico de torta con porcentajes, útil para mostrar la proporción de cada categoría
    # Recibe un DataFrame agrupado con etiquetas y valores numéricos

    # Se asegura de que la carpeta donde se guardará la imagen exista
    crear_ruta_si_no_existe(ruta_destino)

    # Si no se recibe una lista de colores, se usa una paleta predeterminada
    if lista_colores is None:
        lista_colores = ["#FF9800", "#2196F3", "#4CAF50", "#E91E63", "#9C27B0"]

    # Se crea la figura y el área de dibujo con tamaño cuadrado de 8 por 8
    figura, area_dibujo = plt.subplots(figsize=(8, 8))

    # Se obtiene la cantidad de categorías para recortar la lista de colores
    cantidad_categorias = len(datos_agrupados)

    # Se dibuja la torta con porcentajes, colores y borde negro en cada porción
    area_dibujo.pie(
        datos_agrupados[columna_valores],
        labels=datos_agrupados[columna_etiquetas],
        autopct="%1.1f%%",
        colors=lista_colores[:cantidad_categorias],
        startangle=90,
        wedgeprops={"edgecolor": "black", "linewidth": 0.5}
    )

    # Se coloca el título del gráfico con tamaño de fuente 14
    area_dibujo.set_title(titulo, fontsize=14)

    # Se ajusta el espaciado para que nada quede cortado
    plt.tight_layout()

    # Se construye la ruta completa del archivo y se guarda la imagen
    ruta_completa = os.path.join(ruta_destino, nombre_archivo)
    figura.savefig(ruta_completa)

    # Se cierra la figura para liberar memoria
    plt.close(figura)

    # Se imprime la ubicación donde quedó guardada la imagen
    print(f"Gráfico de torta guardado en: {ruta_completa}")


def graficar_mapa_calor(datos_agrupados, columna_filas, columna_columnas, columna_valores,
                        titulo="Mapa de calor", paleta_color="YlOrRd",
                        nombre_archivo="mapa_calor.png", ruta_destino=RUTA_ASSETS):
    # Dibuja un mapa de calor pivotando los datos en filas y columnas con intensidad por valor
    # Recibe un DataFrame con al menos tres columnas: una para filas, otra para columnas y otra para valores

    # Se asegura de que la carpeta donde se guardará la imagen exista
    crear_ruta_si_no_existe(ruta_destino)

    # Se construye una tabla pivote agrupando filas y columnas, sumando los valores coincidentes
    tabla_pivote = datos_agrupados.pivot_table(
        index=columna_filas,
        columns=columna_columnas,
        values=columna_valores,
        aggfunc="sum",
        fill_value=0
    )

    # Se crea la figura y el área de dibujo con un tamaño de 10 de ancho por 6 de alto
    figura, area_dibujo = plt.subplots(figsize=(10, 6))

    # Se dibuja el mapa de calor con valores anotados, paleta de color y líneas divisorias
    sns.heatmap(
        tabla_pivote,
        annot=True,
        fmt=".0f",
        cmap=paleta_color,
        ax=area_dibujo,
        linewidths=0.5,
        linecolor="gray"
    )

    # Se coloca el título del gráfico con tamaño de fuente 14
    area_dibujo.set_title(titulo, fontsize=14)

    # Se rotan las etiquetas del eje X a 45 grados para evitar sobreposición
    plt.xticks(rotation=45)

    # Se ajusta el espaciado para que nada quede cortado
    plt.tight_layout()

    # Se construye la ruta completa del archivo y se guarda la imagen
    ruta_completa = os.path.join(ruta_destino, nombre_archivo)
    figura.savefig(ruta_completa)

    # Se cierra la figura para liberar memoria
    plt.close(figura)

    # Se imprime la ubicación donde quedó guardada la imagen
    print(f"Mapa de calor guardado en: {ruta_completa}")