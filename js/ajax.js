// Clase Policlinica: hace las peticiones al servidor (php) con fetch
class Policlinica {
    constructor() {
        this.ruta = "php/";
    }

    // manda los datos por POST al archivo php y devuelve la respuesta en json
    async enviar(archivo, datos) {
        let formData = new FormData();
        for (let clave in datos) {
            formData.append(clave, datos[clave]);
        }
        console.log("peticion a " + archivo, datos);
        let respuesta = await fetch(this.ruta + archivo, {
            method: "POST",
            body: formData
        });
        return await respuesta.json();
        // let texto = await respuesta.text();
        // return JSON.parse(texto);
    }

    // ---------- ESPECIALIDADES (Gabriel Vigo Rodríguez) ----------

    async altaEspecialidad(esp) {
        return await this.enviar("especialidades.php", {
            accion: "alta",
            nombre: esp.nombre,
            id_planta: esp.idPlanta,
            num_consultas: esp.numConsultas,
            fecha_apertura: esp.fechaApertura,
            activa: esp.activa ? 1 : 0
        });
    }

    async modificarEspecialidad(esp) {
        return await this.enviar("especialidades.php", {
            accion: "modificar",
            id_especialidad: esp.idEspecialidad,
            nombre: esp.nombre,
            id_planta: esp.idPlanta,
            num_consultas: esp.numConsultas,
            fecha_apertura: esp.fechaApertura,
            activa: esp.activa ? 1 : 0
        });
    }

    async borrarEspecialidad(criterio, valor) {
        if (criterio == "id") {
            return await this.enviar("especialidades.php", { accion: "borrar", criterio: "id", id: valor });
        } else {
            return await this.enviar("especialidades.php", { accion: "borrar", criterio: "alternativo", valor: valor });
        }
    }

    async buscarEspecialidades(texto) {
        let respuesta = await this.enviar("especialidades.php", { accion: "buscar", texto: texto });
        if (respuesta.exito) {
            respuesta.datos = respuesta.datos.map(f => new Especialidad(f.id_especialidad, f.nombre, f.id_planta, f.num_consultas, f.fecha_apertura, f.activa, f.planta));
        }
        return respuesta;
    }

    async listarEspecialidades() {
        let respuesta = await this.enviar("especialidades.php", { accion: "listar" });
        if (respuesta.exito) {
            respuesta.datos = respuesta.datos.map(f => new Especialidad(f.id_especialidad, f.nombre, f.id_planta, f.num_consultas, f.fecha_apertura, f.activa, f.planta));
        }
        return respuesta;
    }

    async filtrarEspecialidades(filtros) {
        filtros.accion = "filtrar";
        let respuesta = await this.enviar("especialidades.php", filtros);
        if (respuesta.exito) {
            respuesta.datos = respuesta.datos.map(f => new Especialidad(f.id_especialidad, f.nombre, f.id_planta, f.num_consultas, f.fecha_apertura, f.activa, f.planta));
        }
        return respuesta;
    }

    // ---------- MEDICOS (Alejandro Gómez Izquierdo) ----------

    async altaMedico(med) {
        return await this.enviar("medicos.php", {
            accion: "alta",
            nombre: med.nombre,
            num_colegiado: med.numColegiado,
            id_especialidad: med.idEspecialidad,
            turno: med.turno,
            anios_experiencia: med.aniosExperiencia,
            fecha_alta: med.fechaAlta,
            en_activo: med.enActivo ? 1 : 0
        });
    }

    async modificarMedico(med) {
        return await this.enviar("medicos.php", {
            accion: "modificar",
            id_medico: med.idMedico,
            nombre: med.nombre,
            num_colegiado: med.numColegiado,
            id_especialidad: med.idEspecialidad,
            turno: med.turno,
            anios_experiencia: med.aniosExperiencia,
            fecha_alta: med.fechaAlta,
            en_activo: med.enActivo ? 1 : 0
        });
    }

    async borrarMedico(criterio, valor) {
        if (criterio == "id") {
            return await this.enviar("medicos.php", { accion: "borrar", criterio: "id", id: valor });
        } else {
            return await this.enviar("medicos.php", { accion: "borrar", criterio: "alternativo", valor: valor });
        }
    }

    async buscarMedicos(texto) {
        let respuesta = await this.enviar("medicos.php", { accion: "buscar", texto: texto });
        if (respuesta.exito) {
            respuesta.datos = respuesta.datos.map(f => new Medico(f.id_medico, f.nombre, f.num_colegiado, f.id_especialidad, f.turno, f.anios_experiencia, f.fecha_alta, f.en_activo, f.especialidad));
        }
        return respuesta;
    }

    async listarMedicos() {
        let respuesta = await this.enviar("medicos.php", { accion: "listar" });
        if (respuesta.exito) {
            respuesta.datos = respuesta.datos.map(f => new Medico(f.id_medico, f.nombre, f.num_colegiado, f.id_especialidad, f.turno, f.anios_experiencia, f.fecha_alta, f.en_activo, f.especialidad));
        }
        return respuesta;
    }

    async filtrarMedicos(filtros) {
        filtros.accion = "filtrar";
        let respuesta = await this.enviar("medicos.php", filtros);
        if (respuesta.exito) {
            respuesta.datos = respuesta.datos.map(f => new Medico(f.id_medico, f.nombre, f.num_colegiado, f.id_especialidad, f.turno, f.anios_experiencia, f.fecha_alta, f.en_activo, f.especialidad));
        }
        return respuesta;
    }

    // ---------- PACIENTES (David Jiménez Martín) ----------

    async altaPaciente(pac) {
        return await this.enviar("pacientes.php", {
            accion: "alta",
            nombre: pac.nombre,
            dni: pac.dni,
            telefono: pac.telefono,
            id_aseguradora: pac.idAseguradora,
            peso_kg: pac.pesoKg,
            fecha_nacimiento: pac.fechaNacimiento,
            recordatorio_sms: pac.recordatorioSms ? 1 : 0
        });
    }

    async modificarPaciente(pac) {
        return await this.enviar("pacientes.php", {
            accion: "modificar",
            id_paciente: pac.idPaciente,
            nombre: pac.nombre,
            dni: pac.dni,
            telefono: pac.telefono,
            id_aseguradora: pac.idAseguradora,
            peso_kg: pac.pesoKg,
            fecha_nacimiento: pac.fechaNacimiento,
            recordatorio_sms: pac.recordatorioSms ? 1 : 0
        });
    }

    async borrarPaciente(criterio, valor) {
        if (criterio == "id") {
            return await this.enviar("pacientes.php", { accion: "borrar", criterio: "id", id: valor });
        } else {
            return await this.enviar("pacientes.php", { accion: "borrar", criterio: "alternativo", valor: valor });
        }
    }

    async buscarPacientes(texto) {
        let respuesta = await this.enviar("pacientes.php", { accion: "buscar", texto: texto });
        if (respuesta.exito) {
            respuesta.datos = respuesta.datos.map(f => new Paciente(f.id_paciente, f.nombre, f.dni, f.telefono, f.id_aseguradora, f.peso_kg, f.fecha_nacimiento, f.recordatorio_sms, f.aseguradora));
        }
        return respuesta;
    }

    async listarPacientes() {
        let respuesta = await this.enviar("pacientes.php", { accion: "listar" });
        if (respuesta.exito) {
            respuesta.datos = respuesta.datos.map(f => new Paciente(f.id_paciente, f.nombre, f.dni, f.telefono, f.id_aseguradora, f.peso_kg, f.fecha_nacimiento, f.recordatorio_sms, f.aseguradora));
        }
        return respuesta;
    }

    async filtrarPacientes(filtros) {
        filtros.accion = "filtrar";
        let respuesta = await this.enviar("pacientes.php", filtros);
        if (respuesta.exito) {
            respuesta.datos = respuesta.datos.map(f => new Paciente(f.id_paciente, f.nombre, f.dni, f.telefono, f.id_aseguradora, f.peso_kg, f.fecha_nacimiento, f.recordatorio_sms, f.aseguradora));
        }
        return respuesta;
    }

    // ---------- CITAS (Juan Antonio Bueno Rodríguez) ----------

    async altaCita(cit) {
        return await this.enviar("citas.php", {
            accion: "alta",
            id_paciente: cit.idPaciente,
            id_medico: cit.idMedico,
            fecha_hora: cit.fechaHora,
            duracion_min: cit.duracionMin,
            motivo: cit.motivo,
            atendida: cit.atendida ? 1 : 0
        });
    }

    async modificarCita(cit) {
        return await this.enviar("citas.php", {
            accion: "modificar",
            id_cita: cit.idCita,
            id_paciente: cit.idPaciente,
            id_medico: cit.idMedico,
            fecha_hora: cit.fechaHora,
            duracion_min: cit.duracionMin,
            motivo: cit.motivo,
            atendida: cit.atendida ? 1 : 0
        });
    }

    async borrarCita(criterio, valor) {
        if (criterio == "id") {
            return await this.enviar("citas.php", { accion: "borrar", criterio: "id", id: valor });
        } else {
            return await this.enviar("citas.php", { accion: "borrar", criterio: "alternativo", valor: valor });
        }
    }

    async buscarCitas(texto) {
        let respuesta = await this.enviar("citas.php", { accion: "buscar", texto: texto });
        if (respuesta.exito) {
            respuesta.datos = respuesta.datos.map(f => new Cita(f.id_cita, f.id_paciente, f.id_medico, f.fecha_hora, f.duracion_min, f.motivo, f.atendida, f.paciente, f.medico));
        }
        return respuesta;
    }

    async listarCitas() {
        let respuesta = await this.enviar("citas.php", { accion: "listar" });
        if (respuesta.exito) {
            respuesta.datos = respuesta.datos.map(f => new Cita(f.id_cita, f.id_paciente, f.id_medico, f.fecha_hora, f.duracion_min, f.motivo, f.atendida, f.paciente, f.medico));
        }
        return respuesta;
    }

    async filtrarCitas(filtros) {
        filtros.accion = "filtrar";
        let respuesta = await this.enviar("citas.php", filtros);
        if (respuesta.exito) {
            respuesta.datos = respuesta.datos.map(f => new Cita(f.id_cita, f.id_paciente, f.id_medico, f.fecha_hora, f.duracion_min, f.motivo, f.atendida, f.paciente, f.medico));
        }
        return respuesta;
    }

    // ---------- PRUEBAS (Juan Antonio Bueno Rodríguez) ----------

    async altaPrueba(pru) {
        return await this.enviar("pruebas.php", {
            accion: "alta",
            id_cita: pru.idCita,
            tipo: pru.tipo,
            fecha_realizacion: pru.fechaRealizacion,
            coste: pru.coste,
            resultado: pru.resultado,
            urgente: pru.urgente ? 1 : 0
        });
    }

    async modificarPrueba(pru) {
        return await this.enviar("pruebas.php", {
            accion: "modificar",
            id_prueba: pru.idPrueba,
            id_cita: pru.idCita,
            tipo: pru.tipo,
            fecha_realizacion: pru.fechaRealizacion,
            coste: pru.coste,
            resultado: pru.resultado,
            urgente: pru.urgente ? 1 : 0
        });
    }

    async borrarPrueba(criterio, valor) {
        if (criterio == "id") {
            return await this.enviar("pruebas.php", { accion: "borrar", criterio: "id", id: valor });
        } else {
            return await this.enviar("pruebas.php", { accion: "borrar", criterio: "alternativo", valor: valor });
        }
    }

    async buscarPruebas(texto) {
        let respuesta = await this.enviar("pruebas.php", { accion: "buscar", texto: texto });
        if (respuesta.exito) {
            respuesta.datos = respuesta.datos.map(f => new Prueba(f.id_prueba, f.id_cita, f.tipo, f.fecha_realizacion, f.coste, f.resultado, f.urgente, f.paciente));
        }
        return respuesta;
    }

    async listarPruebas() {
        let respuesta = await this.enviar("pruebas.php", { accion: "listar" });
        if (respuesta.exito) {
            respuesta.datos = respuesta.datos.map(f => new Prueba(f.id_prueba, f.id_cita, f.tipo, f.fecha_realizacion, f.coste, f.resultado, f.urgente, f.paciente));
        }
        return respuesta;
    }

    async filtrarPruebas(filtros) {
        filtros.accion = "filtrar";
        let respuesta = await this.enviar("pruebas.php", filtros);
        if (respuesta.exito) {
            respuesta.datos = respuesta.datos.map(f => new Prueba(f.id_prueba, f.id_cita, f.tipo, f.fecha_realizacion, f.coste, f.resultado, f.urgente, f.paciente));
        }
        return respuesta;
    }

    // ---------- TABLAS AUXILIARES ----------

    async listarPlantas() {
        let respuesta = await this.enviar("auxiliares.php", { tabla: "plantas" });
        return respuesta.datos.map(f => new Auxiliar(f.id, f.nombre));
    }

    async listarAseguradoras() {
        let respuesta = await this.enviar("auxiliares.php", { tabla: "aseguradoras" });
        return respuesta.datos.map(f => new Auxiliar(f.id, f.nombre));
    }
}
