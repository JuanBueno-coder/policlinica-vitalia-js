// Clases que representan las tablas de la base de datos
// los atributos se llaman igual que las columnas pero en camelCase

class Especialidad {
    constructor(idEspecialidad, nombre, idPlanta, numConsultas, fechaApertura, activa, planta) {
        this.idEspecialidad = idEspecialidad;
        this.nombre = nombre;
        this.idPlanta = idPlanta;
        this.numConsultas = numConsultas;
        this.fechaApertura = fechaApertura;
        this.activa = activa;
        this.planta = planta;
    }
}

class Medico {
    constructor(idMedico, nombre, numColegiado, idEspecialidad, turno, aniosExperiencia, fechaAlta, enActivo, especialidad) {
        this.idMedico = idMedico;
        this.nombre = nombre;
        this.numColegiado = numColegiado;
        this.idEspecialidad = idEspecialidad;
        this.turno = turno;
        this.aniosExperiencia = aniosExperiencia;
        this.fechaAlta = fechaAlta;
        this.enActivo = enActivo;
        this.especialidad = especialidad;
    }
}

class Paciente {
    constructor(idPaciente, nombre, dni, telefono, idAseguradora, pesoKg, fechaNacimiento, recordatorioSms, aseguradora) {
        this.idPaciente = idPaciente;
        this.nombre = nombre;
        this.dni = dni;
        this.telefono = telefono;
        this.idAseguradora = idAseguradora;
        this.pesoKg = pesoKg;
        this.fechaNacimiento = fechaNacimiento;
        this.recordatorioSms = recordatorioSms;
        this.aseguradora = aseguradora;
    }

    // calcula la edad a partir de la fecha de nacimiento
    getEdad() {
        let hoy = new Date();
        let nacimiento = new Date(this.fechaNacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        let mes = hoy.getMonth() - nacimiento.getMonth();
        if (mes < 0 || (mes == 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        return edad;
    }
}

class Cita {
    constructor(idCita, idPaciente, idMedico, fechaHora, duracionMin, motivo, atendida, paciente, medico) {
        this.idCita = idCita;
        this.idPaciente = idPaciente;
        this.idMedico = idMedico;
        this.fechaHora = fechaHora;
        this.duracionMin = duracionMin;
        this.motivo = motivo;
        this.atendida = atendida;
        this.paciente = paciente;
        this.medico = medico;
    }

    // texto para los desplegables de pruebas
    get texto() {
        return "#" + this.idCita + " - " + formatearFechaHora(this.fechaHora) + " - " + this.paciente;
    }
}

class Prueba {
    constructor(idPrueba, idCita, tipo, fechaRealizacion, coste, resultado, urgente, paciente) {
        this.idPrueba = idPrueba;
        this.idCita = idCita;
        this.tipo = tipo;
        this.fechaRealizacion = fechaRealizacion;
        this.coste = coste;
        this.resultado = resultado;
        this.urgente = urgente;
        this.paciente = paciente;
    }

    get texto() {
        return "#" + this.idPrueba + " - " + this.tipo + " - " + this.paciente;
    }
}

// para plantas y aseguradoras (solo se usan en los desplegables)
class Auxiliar {
    constructor(id, nombre) {
        this.id = id;
        this.nombre = nombre;
    }
}
