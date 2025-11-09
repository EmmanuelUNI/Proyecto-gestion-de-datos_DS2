import re
from datetime import datetime

class ValidadorPersona:
    
    @staticmethod
    def validar_nombre(nombre, max_chars=30):
        if not nombre or len(nombre) > max_chars:
            return False, f"Nombre debe tener entre 1 y {max_chars} caracteres"
        if nombre.isdigit():
            return False, "Nombre no puede ser solo números"
        return True, ""
    
    @staticmethod
    def validar_apellidos(apellidos, max_chars=60):
        if not apellidos or len(apellidos) > max_chars:
            return False, f"Apellidos deben tener entre 1 y {max_chars} caracteres"
        if apellidos.isdigit():
            return False, "Apellidos no pueden ser solo números"
        return True, ""
    
    @staticmethod
    def validar_email(email):
        patron = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(patron, email):
            return False, "Formato de correo inválido"
        return True, ""
    
    @staticmethod
    def validar_celular(celular):
        if not celular or not celular.isdigit() or len(celular) != 10:
            return False, "Celular debe ser 10 dígitos"
        return True, ""
    
    @staticmethod
    def validar_documento(nro_doc):
        if not nro_doc or not nro_doc.isdigit() or len(nro_doc) > 10:
            return False, "Número de documento inválido (máx 10 dígitos)"
        return True, ""
    
    @staticmethod
    def validar_tipo_doc(tipo_doc):
        tipos_validos = ["Tarjeta de identidad", "Cédula"]
        if tipo_doc not in tipos_validos:
            return False, f"Tipo de documento debe ser: {', '.join(tipos_validos)}"
        return True, ""
    
    @staticmethod
    def validar_genero(genero):
        generos_validos = ["Masculino", "Femenino", "No binario", "Prefiero no reportar"]
        if genero not in generos_validos:
            return False, f"Género debe ser uno de: {', '.join(generos_validos)}"
        return True, ""
    
    @staticmethod
    def validar_fecha_nacimiento(fecha_str):
        try:
            # Espera formato dd-mmm-yyyy, ej: 25-ene-1990
            datetime.strptime(fecha_str, "%d-%b-%Y")
            return True, ""
        except ValueError:
            return False, "Formato de fecha debe ser dd-mmm-yyyy"