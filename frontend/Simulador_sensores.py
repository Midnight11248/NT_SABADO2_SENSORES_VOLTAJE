"""
================================================================
SENSORESVOLT — Simulador de Sensores ESP
Versión actualizada — backend sin seguridad JWT
================================================================
ANTES DE CORRER:
  1. Crea los sensores desde la UI en "Mis Sensores" con el usuario Pruebas
     O ejecuta en Postman:
       POST http://localhost:8080/sensores
       Body: {"sensorName":"Panel_Solar_Norte","sensorToken":"tok-prueba-001",
              "descripcion":"Panel norte","mUsuario":{"idusuario": ID_DE_PRUEBAS}}

  2. Actualiza los tokens abajo para que coincidan con los registrados en la BD.

  3. Para encontrar el idusuario de Pruebas:
       GET http://localhost:8080/usuarios/username/Pruebas

DETENER: Ctrl + C
================================================================
"""

import requests
import random
import time
import threading
from datetime import datetime

# ================================================================
# CONFIGURACION
# ================================================================

SERVIDOR_URL       = "http://localhost:8080/mediciones/ingresar"
INTERVALO_SEGUNDOS = 15    # Cada 10 segundos para ver datos rápido en el dashboard
VOLTAJE_MINIMO     = 9.0
VOLTAJE_MAXIMO     = 36.0

# *** ACTUALIZA ESTOS TOKENS con los que registraste en la UI o en Postman ***
SENSORES = [
    {
        "nombre":       "Panel_Solar_Norte",
        "token":        "tok-prueba-001",   # ← debe existir en la tabla user_sensors
        "voltaje_base": 24.0,
        "variacion":    2.5,
    },
    {
        "nombre":       "Bateria_Inversor_01",
        "token":        "tok-prueba-002",
        "voltaje_base": 12.5,
        "variacion":    1.5,
    },
    {
        "nombre":       "Regulador_Carga_01",
        "token":        "tok-prueba-003",
        "voltaje_base": 14.4,
        "variacion":    1.0,
    },
]

# ================================================================
# COLORES ANSI
# ================================================================
C_RESET  = "\033[0m"
C_CYAN   = "\033[96m"
C_GREEN  = "\033[92m"
C_YELLOW = "\033[93m"
C_RED    = "\033[91m"
C_GRAY   = "\033[90m"
C_BOLD   = "\033[1m"
C_WHITE  = "\033[97m"

stats  = {s["token"]: {"enviados": 0, "errores": 0, "ultimo_v": 0.0} for s in SENSORES}
lock   = threading.Lock()
activo = True

def generar_voltaje(sensor):
    v = random.gauss(sensor["voltaje_base"], sensor["variacion"] / 2)
    return round(max(VOLTAJE_MINIMO, min(VOLTAJE_MAXIMO, v)), 4)

def enviar_medicion(sensor):
    voltaje = generar_voltaje(sensor)
    try:
        response = requests.post(
            SERVIDOR_URL,
            data={"sensor_token": sensor["token"], "voltaje": voltaje},
            timeout=5
        )
        with lock:
            stats[sensor["token"]]["ultimo_v"] = voltaje
            if response.status_code in (200, 201):
                stats[sensor["token"]]["enviados"] += 1
                return True, voltaje
            else:
                stats[sensor["token"]]["errores"] += 1
                # Mostrar el error del servidor para diagnosticar
                print(f"  {C_RED}[Servidor] {response.status_code}: {response.text[:80]}{C_RESET}")
                return False, voltaje
    except requests.exceptions.ConnectionError:
        with lock:
            stats[sensor["token"]]["errores"] += 1
        return False, 0.0
    except requests.exceptions.Timeout:
        with lock:
            stats[sensor["token"]]["errores"] += 1
        return False, 0.0

def hilo_sensor(sensor):
    global activo
    while activo:
        ok, voltaje = enviar_medicion(sensor)
        hora = datetime.now().strftime("%H:%M:%S")
        with lock:
            enviados = stats[sensor["token"]]["enviados"]
            errores  = stats[sensor["token"]]["errores"]

        if ok:
            color_v = C_RED if voltaje < 11.0 else C_YELLOW if voltaje < 13.0 else C_GREEN
            print(
                f"  {C_GRAY}[{hora}]{C_RESET} "
                f"{C_CYAN}{sensor['nombre']:<22}{C_RESET}  "
                f"{color_v}{voltaje:>7.4f} V{C_RESET}  "
                f"{C_GRAY}✓ enviados: {enviados}  errores: {errores}{C_RESET}"
            )
        else:
            print(
                f"  {C_GRAY}[{hora}]{C_RESET} "
                f"{C_CYAN}{sensor['nombre']:<22}{C_RESET}  "
                f"{C_RED}ERROR — token no registrado o backend caído{C_RESET}  "
                f"{C_GRAY}errores: {errores}{C_RESET}"
            )

        for _ in range(INTERVALO_SEGUNDOS * 10):
            if not activo:
                break
            time.sleep(0.1)

def imprimir_encabezado():
    print()
    print(f"  {C_BOLD}{C_WHITE}{'='*65}{C_RESET}")
    print(f"  {C_BOLD}{C_CYAN}  ⚡  SENSORESVOLT — Simulador  {C_RESET}")
    print(f"  {C_BOLD}{C_WHITE}{'='*65}{C_RESET}")
    print(f"  {C_GRAY}Servidor  : {C_WHITE}{SERVIDOR_URL}{C_RESET}")
    print(f"  {C_GRAY}Intervalo : {C_WHITE}{INTERVALO_SEGUNDOS} segundos{C_RESET}")
    print(f"  {C_GRAY}Sensores  : {C_WHITE}{len(SENSORES)}{C_RESET}")
    print(f"  {C_BOLD}{C_WHITE}{'='*65}{C_RESET}")
    print(f"  {C_YELLOW}Tokens configurados:{C_RESET}")
    for s in SENSORES:
        print(f"    · {C_CYAN}{s['nombre']:<24}{C_RESET}  token: {C_GRAY}{s['token']}{C_RESET}")
    print(f"  {C_BOLD}{C_WHITE}{'='*65}{C_RESET}")
    print(f"  {C_YELLOW}Ctrl+C para detener{C_RESET}")
    print(f"  {C_GRAY}{'─'*60}{C_RESET}")
    print()

def imprimir_resumen():
    print(f"\n  {C_BOLD}{C_WHITE}{'='*65}{C_RESET}")
    print(f"  {C_BOLD}{C_CYAN}  RESUMEN FINAL{C_RESET}")
    print(f"  {C_BOLD}{C_WHITE}{'='*65}{C_RESET}")
    total_ok = total_err = 0
    for sensor in SENSORES:
        s = stats[sensor["token"]]
        total_ok  += s["enviados"]
        total_err += s["errores"]
        print(
            f"  {C_CYAN}{sensor['nombre']:<26}{C_RESET}"
            f"enviados: {C_GREEN}{s['enviados']:>4}{C_RESET}  "
            f"errores: {C_RED}{s['errores']:>3}{C_RESET}  "
            f"último: {C_YELLOW}{s['ultimo_v']:.4f} V{C_RESET}"
        )
    print(f"  {C_GRAY}{'─'*60}{C_RESET}")
    print(f"  Total enviados: {C_GREEN}{total_ok}{C_RESET}  —  errores: {C_RED}{total_err}{C_RESET}")
    print(f"  {C_BOLD}{C_WHITE}{'='*65}{C_RESET}\n")

if __name__ == "__main__":
    imprimir_encabezado()
    hilos = []
    for sensor in SENSORES:
        t = threading.Thread(target=hilo_sensor, args=(sensor,), daemon=True)
        t.start()
        hilos.append(t)
        time.sleep(0.3)
    try:
        while True:
            time.sleep(0.5)
    except KeyboardInterrupt:
        activo = False
        print(f"\n  {C_YELLOW}Deteniendo...{C_RESET}")
        for t in hilos:
            t.join(timeout=2)
        imprimir_resumen()