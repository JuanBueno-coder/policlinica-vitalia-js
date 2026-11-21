// Codigo principal de la aplicacion
// Grupo 5 - Policlinica Vitalia

const policlinica = new Policlinica();

// aqui se guardan los resultados de la ultima busqueda de cada tabla
// para poder rellenar el formulario de modificar
let resultadosEspecialidades = [];
let resultadosMedicos = [];
let resultadosPacientes = [];
let resultadosCitas = [];
let resultadosPruebas = [];

// funcion que se ejecuta cuando confirmas el borrado en el modal
let funcionBorrar = null;

window.addEventListener("load", inicio);

function inicio() {
    // formularios de especialidades
    document.getElementById("formEspAlta").addEventListener("submit", altaEspecialidad);
    document.getElementById("formEspBuscar").addEventListener("submit", buscarEspecialidades);
    document.getElementById("formEspMod").addEventListener("submit", modificarEspecialidad);
    document.getElementById("formEspBorrarId").addEventListener("submit", borrarEspecialidadPorId);
    document.getElementById("formEspBorrarAlt").addEventListener("submit", borrarEspecialidadPorAlt);
    document.getElementById("formEspFiltro").addEventListener("submit", filtrarEspecialidades);

    // formularios de medicos
    document.getElementById("formMedAlta").addEventListener("submit", altaMedico);
    document.getElementById("formMedBuscar").addEventListener("submit", buscarMedicos);
    document.getElementById("formMedMod").addEventListener("submit", modificarMedico);
    document.getElementById("formMedBorrarId").addEventListener("submit", borrarMedicoPorId);
    document.getElementById("formMedBorrarAlt").addEventListener("submit", borrarMedicoPorAlt);
    document.getElementById("formMedFiltro").addEventListener("submit", filtrarMedicos);

    // formularios de pacientes
    document.getElementById("formPacAlta").addEventListener("submit", altaPaciente);
    document.getElementById("formPacBuscar").addEventListener("submit", buscarPacientes);
    document.getElementById("formPacMod").addEventListener("submit", modificarPaciente);
    document.getElementById("formPacBorrarId").addEventListener("submit", borrarPacientePorId);
    document.getElementById("formPacBorrarAlt").addEventListener("submit", borrarPacientePorAlt);
    document.getElementById("formPacFiltro").addEventListener("submit", filtrarPacientes);

    // formularios de citas
    document.getElementById("formCitAlta").addEventListener("submit", altaCita);
    document.getElementById("formCitBuscar").addEventListener("submit", buscarCitas);
    document.getElementById("formCitMod").addEventListener("submit", modificarCita);
    document.getElementById("formCitBorrarId").addEventListener("submit", borrarCitaPorId);
    document.getElementById("formCitFiltro").addEventListener("submit", filtrarCitas);

    // formularios de pruebas
    document.getElementById("formPruAlta").addEventListener("submit", altaPrueba);
    document.getElementById("formPruBuscar").addEventListener("submit", buscarPruebas);
    document.getElementById("formPruMod").addEventListener("submit", modificarPrueba);
    document.getElementById("formPruBorrarId").addEventListener("submit", borrarPruebaPorId);
    document.getElementById("formPruFiltro").addEventListener("submit", filtrarPruebas);

    // boton del modal de confirmar
    document.getElementById("btnConfirmarBorrar").addEventListener("click", function () {
        bootstrap.Modal.getInstance(document.getElementById("modalBorrar")).hide();
        if (funcionBorrar != null) {
            funcionBorrar();
        }
    });

    cargarDesplegables();

    // al entrar se ve el listado de especialidades
    mostrar("espListado");
    listarEspecialidades();
}

// muestra una seccion y oculta las demas (SPA)
function mostrar(id) {
    let secciones = document.querySelectorAll(".seccion");
    for (let i = 0; i < secciones.length; i++) {
        secciones[i].style.display = "none";
    }
    document.getElementById(id).style.display = "block";

    // en el movil cerramos el menu al elegir una opcion
    let menu = document.getElementById("menu");
    if (menu.classList.contains("show")) {
        bootstrap.Collapse.getInstance(menu).hide();
    }
    window.scrollTo(0, 0);
}

// ---------- utilidades ----------

function mostrarToast(mensaje, exito) {
    let toast = document.getElementById("toast");
    let cuerpo = document.getElementById("toastMensaje");
    cuerpo.textContent = mensaje;
    // alert(mensaje); // antes lo haciamos con alert pero hay que usar toast
    if (exito) {
        toast.classList.remove("bg-error");
        toast.classList.add("bg-ok");
    } else {
        toast.classList.remove("bg-ok");
        toast.classList.add("bg-error");
    }
    bootstrap.Toast.getOrCreateInstance(toast).show();
}

function pedirConfirmacion(texto, funcion) {
    document.getElementById("textoBorrar").textContent = texto;
    funcionBorrar = funcion;
    bootstrap.Modal.getOrCreateInstance(document.getElementById("modalBorrar")).show();
}

// comprueba el formulario con la validacion de bootstrap
function formularioValido(form) {
    if (!form.checkValidity()) {
        form.classList.add("was-validated");
        mostrarToast("Revisa los campos en rojo", false);
        return false;
    }
    form.classList.remove("was-validated");
    return true;
}

// 2026-11-21 -> 21/11/2026
function formatearFecha(fecha) {
    if (fecha == null || fecha == "") return "";
    let partes = fecha.substring(0, 10).split("-");
    return partes[2] + "/" + partes[1] + "/" + partes[0];
}

function formatearFechaHora(fechaHora) {
    if (fechaHora == null || fechaHora == "") return "";
    return formatearFecha(fechaHora) + " " + fechaHora.substring(11, 16);
}

function siNo(valor) {
  if (valor == 1) {
      return '<span class="badge bg-vitalia">Sí</span>';
  }
  else {
      return '<span class="badge bg-coral">No</span>';
  }
}

// vacia una tabla (al final no la hemos usado)
function limpiarTabla(id) {
    document.getElementById(id).innerHTML = "";
}

// rellena un select con una lista de objetos
function rellenarSelect(idSelect, lista, campoId, campoTexto, primeraOpcion) {
    var select = document.getElementById(idSelect);
    var valorAnterior = select.value;
    select.innerHTML = "<option value=''>" + primeraOpcion + "</option>";
    for (let x of lista) {
        let opcion = document.createElement("option");
        opcion.value = x[campoId];
        opcion.textContent = x[campoTexto];
        select.appendChild(opcion);
    }
    select.value = valorAnterior;
}

// carga todos los desplegables desde la base de datos
async function cargarDesplegables() {
    try {
        let plantas = await policlinica.listarPlantas();
        rellenarSelect("espAltaIdPlanta", plantas, "id", "nombre", "Selecciona una opción");
        rellenarSelect("espModIdPlanta", plantas, "id", "nombre", "Selecciona una opción");
        rellenarSelect("espFilId_planta", plantas, "id", "nombre", "Todos");
        let especialidades = (await policlinica.listarEspecialidades()).datos;
        rellenarSelect("espBorrarId", especialidades, "idEspecialidad", "nombre", "Selecciona una opción");
        rellenarSelect("medAltaIdEspecialidad", especialidades, "idEspecialidad", "nombre", "Selecciona una opción");
        rellenarSelect("medModIdEspecialidad", especialidades, "idEspecialidad", "nombre", "Selecciona una opción");
        rellenarSelect("medFilId_especialidad", especialidades, "idEspecialidad", "nombre", "Todos");
        let medicos = (await policlinica.listarMedicos()).datos;
        rellenarSelect("medBorrarId", medicos, "idMedico", "nombre", "Selecciona una opción");
        rellenarSelect("citAltaIdMedico", medicos, "idMedico", "nombre", "Selecciona una opción");
        rellenarSelect("citModIdMedico", medicos, "idMedico", "nombre", "Selecciona una opción");
        rellenarSelect("citFilId_medico", medicos, "idMedico", "nombre", "Todos");
        let aseguradoras = await policlinica.listarAseguradoras();
        rellenarSelect("pacAltaIdAseguradora", aseguradoras, "id", "nombre", "Selecciona una opción");
        rellenarSelect("pacModIdAseguradora", aseguradoras, "id", "nombre", "Selecciona una opción");
        rellenarSelect("pacFilId_aseguradora", aseguradoras, "id", "nombre", "Todos");
        let pacientes = (await policlinica.listarPacientes()).datos;
        rellenarSelect("pacBorrarId", pacientes, "idPaciente", "nombre", "Selecciona una opción");
        rellenarSelect("citAltaIdPaciente", pacientes, "idPaciente", "nombre", "Selecciona una opción");
        rellenarSelect("citModIdPaciente", pacientes, "idPaciente", "nombre", "Selecciona una opción");
        rellenarSelect("citFilId_paciente", pacientes, "idPaciente", "nombre", "Todos");
        let citas = (await policlinica.listarCitas()).datos;
        rellenarSelect("citBorrarId", citas, "idCita", "texto", "Selecciona una opción");
        rellenarSelect("pruAltaIdCita", citas, "idCita", "texto", "Selecciona una opción");
        rellenarSelect("pruModIdCita", citas, "idCita", "texto", "Selecciona una opción");
        let pruebas = (await policlinica.listarPruebas()).datos;
        rellenarSelect("pruBorrarId", pruebas, "idPrueba", "texto", "Selecciona una opción");
    } catch (error) {
        mostrarToast("No se han podido cargar los desplegables", false);
    }
}

// =====================================================
// ESPECIALIDADES - Gabriel Vigo Rodríguez
// =====================================================

async function altaEspecialidad(evento) {
    evento.preventDefault();
    let form = document.getElementById("formEspAlta");
    if (!formularioValido(form)) return;

    let esp = new Especialidad(
        null,
        document.getElementById("espAltaNombre").value,
        document.getElementById("espAltaIdPlanta").value,
        document.getElementById("espAltaNumConsultas").value,
        document.getElementById("espAltaFechaApertura").value,
        document.getElementById("espAltaActiva").checked,
        ""
    );

    let respuesta = await policlinica.altaEspecialidad(esp);
    mostrarToast(respuesta.mensaje, respuesta.exito);
    if (respuesta.exito) {
        form.reset();
        cargarDesplegables();
    }
}

async function buscarEspecialidades(evento) {
    evento.preventDefault();
    let texto = document.getElementById("espBuscarTexto").value;
    let respuesta = await policlinica.buscarEspecialidades(texto);
    if (!respuesta.exito) {
        mostrarToast(respuesta.mensaje, false);
        return;
    }
    resultadosEspecialidades = respuesta.datos;
    document.getElementById("formEspMod").classList.add("d-none");

    let tbody = document.getElementById("espTablaBuscar");
    tbody.innerHTML = "";
    if (resultadosEspecialidades.length == 0) {
        tbody.innerHTML = "<tr><td colspan='7'>No se ha encontrado nada</td></tr>";
        return;
    }
    for (let i = 0; i < resultadosEspecialidades.length; i++) {
        let x = resultadosEspecialidades[i];
        tbody.innerHTML += "<tr>" +
            "<td>" + x.idEspecialidad + "</td>" +
            "<td>" + x.nombre + "</td>" +
            "<td>" + x.planta + "</td>" +
            "<td>" + x.numConsultas + "</td>" +
            "<td>" + formatearFecha(x.fechaApertura) + "</td>" +
            "<td>" + siNo(x.activa) + "</td>" +
            "<td><button class='btn btn-sm btn-vitalia' onclick='seleccionarEspecialidad(" + i + ")'>Modificar</button></td>" +
            "</tr>";
    }
}

// rellena el formulario de modificar con el resultado elegido
function seleccionarEspecialidad(posicion) {
    let x = resultadosEspecialidades[posicion];
    document.getElementById("espModId").value = x.idEspecialidad;
    document.getElementById("espModNombre").value = x.nombre;
    document.getElementById("espModIdPlanta").value = x.idPlanta;
    document.getElementById("espModNumConsultas").value = x.numConsultas;
    document.getElementById("espModFechaApertura").value = x.fechaApertura;
    document.getElementById("espModActiva").checked = x.activa == 1;
    let form = document.getElementById("formEspMod");
    form.classList.remove("d-none");
    form.classList.remove("was-validated");
    form.scrollIntoView({ behavior: "smooth" });
}

async function modificarEspecialidad(evento) {
    evento.preventDefault();
    let form = document.getElementById("formEspMod");
    if (!formularioValido(form)) return;

    let esp = new Especialidad(
        document.getElementById("espModId").value,
        document.getElementById("espModNombre").value,
        document.getElementById("espModIdPlanta").value,
        document.getElementById("espModNumConsultas").value,
        document.getElementById("espModFechaApertura").value,
        document.getElementById("espModActiva").checked,
        ""
    );

    let respuesta = await policlinica.modificarEspecialidad(esp);
    mostrarToast(respuesta.mensaje, respuesta.exito);
    if (respuesta.exito) {
        form.classList.add("d-none");
        cargarDesplegables();
        // repetimos la busqueda para ver los cambios
        document.getElementById("formEspBuscar").requestSubmit();
    }
}

async function borrarEspecialidadPorId(evento) {
    evento.preventDefault();
    let select = document.getElementById("espBorrarId");
    if (select.value == "") {
        mostrarToast("Elige una especialidad de la lista", false);
        return;
    }
    let texto = select.options[select.selectedIndex].text;
    pedirConfirmacion("¿Seguro que quieres borrar " + texto + "?", async function () {
        let respuesta = await policlinica.borrarEspecialidad("id", select.value);
        mostrarToast(respuesta.mensaje, respuesta.exito);
        if (respuesta.exito) {
            cargarDesplegables();
        }
    });
}

async function borrarEspecialidadPorAlt(evento) {
    evento.preventDefault();
    let valor = document.getElementById("espBorrarAlt").value.trim();
    if (valor == "") {
        mostrarToast("Escribe el nombre exacto", false);
        return;
    }
    pedirConfirmacion("¿Seguro que quieres borrar la especialidad con nombre exacto " + valor + "?", async function () {
        let respuesta = await policlinica.borrarEspecialidad("alternativo", valor);
        mostrarToast(respuesta.mensaje, respuesta.exito);
        if (respuesta.exito) {
            document.getElementById("formEspBorrarAlt").reset();
            cargarDesplegables();
        }
    });
}

async function listarEspecialidades() {
    let respuesta = await policlinica.listarEspecialidades();
    pintarTablaEspecialidades(respuesta.datos, "espTablaListado");
    document.getElementById("espTotal").textContent = respuesta.datos.length;
}

async function filtrarEspecialidades(evento) {
    evento.preventDefault();
    let filtros = {
        id_planta: document.getElementById("espFilId_planta").value,
        activa: document.getElementById("espFilActiva").value,
        consultas_min: document.getElementById("espFilConsultas_min").value
    };
    let respuesta = await policlinica.filtrarEspecialidades(filtros);
    if (respuesta.exito) {
        pintarTablaEspecialidades(respuesta.datos, "espTablaFiltro");
        mostrarToast(respuesta.mensaje, true);
    } else {
        mostrarToast(respuesta.mensaje, false);
    }
}

function pintarTablaEspecialidades(lista, idTbody) {
    let tbody = document.getElementById(idTbody);
    tbody.innerHTML = "";
    if (lista.length == 0) {
        tbody.innerHTML = "<tr><td colspan='6'>No hay registros</td></tr>";
        return;
    }
    for (let x of lista) {
        tbody.innerHTML += "<tr>" +
            "<td>" + x.idEspecialidad + "</td>" +
            "<td>" + x.nombre + "</td>" +
            "<td>" + x.planta + "</td>" +
            "<td>" + x.numConsultas + "</td>" +
            "<td>" + formatearFecha(x.fechaApertura) + "</td>" +
            "<td>" + siNo(x.activa) + "</td>" +
            "</tr>";
    }
}

// =====================================================
// MEDICOS - Alejandro Gómez Izquierdo
// =====================================================

async function altaMedico(evento) {
    evento.preventDefault();
    let form = document.getElementById("formMedAlta");
    if (!formularioValido(form)) return;

    let med = new Medico(
        null,
        document.getElementById("medAltaNombre").value,
        document.getElementById("medAltaNumColegiado").value,
        document.getElementById("medAltaIdEspecialidad").value,
        document.getElementById("medAltaTurno").value,
        document.getElementById("medAltaAniosExperiencia").value,
        document.getElementById("medAltaFechaAlta").value,
        document.getElementById("medAltaEnActivo").checked,
        ""
    );

    let respuesta = await policlinica.altaMedico(med);
    mostrarToast(respuesta.mensaje, respuesta.exito);
    if (respuesta.exito) {
        form.reset();
        cargarDesplegables();
    }
}

async function buscarMedicos(evento) {
    evento.preventDefault();
    let texto = document.getElementById("medBuscarTexto").value;
    let respuesta = await policlinica.buscarMedicos(texto);
    if (!respuesta.exito) {
        mostrarToast(respuesta.mensaje, false);
        return;
    }
    resultadosMedicos = respuesta.datos;
    document.getElementById("formMedMod").classList.add("d-none");

    let tbody = document.getElementById("medTablaBuscar");
    tbody.innerHTML = "";
    if (resultadosMedicos.length == 0) {
        tbody.innerHTML = "<tr><td colspan='9'>No se ha encontrado nada</td></tr>";
        return;
    }
    for (let i = 0; i < resultadosMedicos.length; i++) {
        let x = resultadosMedicos[i];
        tbody.innerHTML += "<tr>" +
            "<td>" + x.idMedico + "</td>" +
            "<td>" + x.nombre + "</td>" +
            "<td>" + x.numColegiado + "</td>" +
            "<td>" + x.especialidad + "</td>" +
            "<td>" + x.turno + "</td>" +
            "<td>" + x.aniosExperiencia + "</td>" +
            "<td>" + formatearFecha(x.fechaAlta) + "</td>" +
            "<td>" + siNo(x.enActivo) + "</td>" +
            "<td><button class='btn btn-sm btn-vitalia' onclick='seleccionarMedico(" + i + ")'>Modificar</button></td>" +
            "</tr>";
    }
}

// rellena el formulario de modificar con el resultado elegido
function seleccionarMedico(posicion) {
    let x = resultadosMedicos[posicion];
    document.getElementById("medModId").value = x.idMedico;
    document.getElementById("medModNombre").value = x.nombre;
    document.getElementById("medModNumColegiado").value = x.numColegiado;
    document.getElementById("medModIdEspecialidad").value = x.idEspecialidad;
    document.getElementById("medModTurno").value = x.turno;
    document.getElementById("medModAniosExperiencia").value = x.aniosExperiencia;
    document.getElementById("medModFechaAlta").value = x.fechaAlta;
    document.getElementById("medModEnActivo").checked = x.enActivo == 1;
    let form = document.getElementById("formMedMod");
    form.classList.remove("d-none");
    form.classList.remove("was-validated");
    form.scrollIntoView({ behavior: "smooth" });
}

async function modificarMedico(evento) {
    evento.preventDefault();
    let form = document.getElementById("formMedMod");
    if (!formularioValido(form)) return;

    let med = new Medico(
        document.getElementById("medModId").value,
        document.getElementById("medModNombre").value,
        document.getElementById("medModNumColegiado").value,
        document.getElementById("medModIdEspecialidad").value,
        document.getElementById("medModTurno").value,
        document.getElementById("medModAniosExperiencia").value,
        document.getElementById("medModFechaAlta").value,
        document.getElementById("medModEnActivo").checked,
        ""
    );

    let respuesta = await policlinica.modificarMedico(med);
    mostrarToast(respuesta.mensaje, respuesta.exito);
    if (respuesta.exito) {
        form.classList.add("d-none");
        cargarDesplegables();
        // repetimos la busqueda para ver los cambios
        document.getElementById("formMedBuscar").requestSubmit();
    }
}

async function borrarMedicoPorId(evento) {
    evento.preventDefault();
    let select = document.getElementById("medBorrarId");
    if (select.value == "") {
        mostrarToast("Elige un médico de la lista", false);
        return;
    }
    let texto = select.options[select.selectedIndex].text;
    pedirConfirmacion("¿Seguro que quieres borrar " + texto + "?", async function () {
        let respuesta = await policlinica.borrarMedico("id", select.value);
        mostrarToast(respuesta.mensaje, respuesta.exito);
        if (respuesta.exito) {
            cargarDesplegables();
        }
    });
}

async function borrarMedicoPorAlt(evento) {
    evento.preventDefault();
    let valor = document.getElementById("medBorrarAlt").value.trim();
    if (valor == "") {
        mostrarToast("Escribe el nº de colegiado", false);
        return;
    }
    pedirConfirmacion("¿Seguro que quieres borrar el médico con nº de colegiado " + valor + "?", async function () {
        let respuesta = await policlinica.borrarMedico("alternativo", valor);
        mostrarToast(respuesta.mensaje, respuesta.exito);
        if (respuesta.exito) {
            document.getElementById("formMedBorrarAlt").reset();
            cargarDesplegables();
        }
    });
}

async function listarMedicos() {
    let respuesta = await policlinica.listarMedicos();
    pintarTablaMedicos(respuesta.datos, "medTablaListado");
    document.getElementById("medTotal").textContent = respuesta.datos.length;
}

async function filtrarMedicos(evento) {
    evento.preventDefault();
    let filtros = {
        id_especialidad: document.getElementById("medFilId_especialidad").value,
        turno: document.getElementById("medFilTurno").value,
        en_activo: document.getElementById("medFilEn_activo").value,
        experiencia_min: document.getElementById("medFilExperiencia_min").value
    };
    let respuesta = await policlinica.filtrarMedicos(filtros);
    if (respuesta.exito) {
        pintarTablaMedicos(respuesta.datos, "medTablaFiltro");
        mostrarToast(respuesta.mensaje, true);
    } else {
        mostrarToast(respuesta.mensaje, false);
    }
}

function pintarTablaMedicos(lista, idTbody) {
    let tbody = document.getElementById(idTbody);
    tbody.innerHTML = "";
    if (lista.length == 0) {
        tbody.innerHTML = "<tr><td colspan='8'>No hay registros</td></tr>";
        return;
    }
    for (let x of lista) {
        tbody.innerHTML += "<tr>" +
            "<td>" + x.idMedico + "</td>" +
            "<td>" + x.nombre + "</td>" +
            "<td>" + x.numColegiado + "</td>" +
            "<td>" + x.especialidad + "</td>" +
            "<td>" + x.turno + "</td>" +
            "<td>" + x.aniosExperiencia + "</td>" +
            "<td>" + formatearFecha(x.fechaAlta) + "</td>" +
            "<td>" + siNo(x.enActivo) + "</td>" +
            "</tr>";
    }
}

// =====================================================
// PACIENTES - David Jiménez Martín
// =====================================================

// TODO: comprobar que la letra del DNI es correcta
async function altaPaciente(evento) {
    evento.preventDefault();
    let form = document.getElementById("formPacAlta");
    if (!formularioValido(form)) return;

    let pac = new Paciente(
        null,
        document.getElementById("pacAltaNombre").value,
        document.getElementById("pacAltaDni").value,
        document.getElementById("pacAltaTelefono").value,
        document.getElementById("pacAltaIdAseguradora").value,
        document.getElementById("pacAltaPesoKg").value,
        document.getElementById("pacAltaFechaNacimiento").value,
        document.getElementById("pacAltaRecordatorioSms").checked,
        ""
    );

    let respuesta = await policlinica.altaPaciente(pac);
    mostrarToast(respuesta.mensaje, respuesta.exito);
    if (respuesta.exito) {
        form.reset();
        cargarDesplegables();
    }
}

async function buscarPacientes(evento) {
    evento.preventDefault();
    let texto = document.getElementById("pacBuscarTexto").value;
    let respuesta = await policlinica.buscarPacientes(texto);
    if (!respuesta.exito) {
        mostrarToast(respuesta.mensaje, false);
        return;
    }
    resultadosPacientes = respuesta.datos;
    document.getElementById("formPacMod").classList.add("d-none");

    let tbody = document.getElementById("pacTablaBuscar");
    tbody.innerHTML = "";
    if (resultadosPacientes.length == 0) {
        tbody.innerHTML = "<tr><td colspan='9'>No se ha encontrado nada</td></tr>";
        return;
    }
    for (let i = 0; i < resultadosPacientes.length; i++) {
        let x = resultadosPacientes[i];
        tbody.innerHTML += "<tr>" +
            "<td>" + x.idPaciente + "</td>" +
            "<td>" + x.nombre + "</td>" +
            "<td>" + x.dni + "</td>" +
            "<td>" + x.telefono + "</td>" +
            "<td>" + x.aseguradora + "</td>" +
            "<td>" + x.pesoKg + "</td>" +
            "<td>" + formatearFecha(x.fechaNacimiento) + "</td>" +
            "<td>" + siNo(x.recordatorioSms) + "</td>" +
            "<td><button class='btn btn-sm btn-vitalia' onclick='seleccionarPaciente(" + i + ")'>Modificar</button></td>" +
            "</tr>";
    }
}

// rellena el formulario de modificar con el resultado elegido
function seleccionarPaciente(posicion) {
    let x = resultadosPacientes[posicion];
    document.getElementById("pacModId").value = x.idPaciente;
    document.getElementById("pacModNombre").value = x.nombre;
    document.getElementById("pacModDni").value = x.dni;
    document.getElementById("pacModTelefono").value = x.telefono;
    document.getElementById("pacModIdAseguradora").value = x.idAseguradora;
    document.getElementById("pacModPesoKg").value = x.pesoKg;
    document.getElementById("pacModFechaNacimiento").value = x.fechaNacimiento;
    document.getElementById("pacModRecordatorioSms").checked = x.recordatorioSms == 1;
    let form = document.getElementById("formPacMod");
    form.classList.remove("d-none");
    form.classList.remove("was-validated");
    form.scrollIntoView({ behavior: "smooth" });
}

async function modificarPaciente(evento) {
    evento.preventDefault();
    let form = document.getElementById("formPacMod");
    if (!formularioValido(form)) return;

    let pac = new Paciente(
        document.getElementById("pacModId").value,
        document.getElementById("pacModNombre").value,
        document.getElementById("pacModDni").value,
        document.getElementById("pacModTelefono").value,
        document.getElementById("pacModIdAseguradora").value,
        document.getElementById("pacModPesoKg").value,
        document.getElementById("pacModFechaNacimiento").value,
        document.getElementById("pacModRecordatorioSms").checked,
        ""
    );

    let respuesta = await policlinica.modificarPaciente(pac);
    mostrarToast(respuesta.mensaje, respuesta.exito);
    if (respuesta.exito) {
        form.classList.add("d-none");
        cargarDesplegables();
        // repetimos la busqueda para ver los cambios
        document.getElementById("formPacBuscar").requestSubmit();
    }
}

async function borrarPacientePorId(evento) {
    evento.preventDefault();
    let select = document.getElementById("pacBorrarId");
    if (select.value == "") {
        mostrarToast("Elige un paciente de la lista", false);
        return;
    }
    let texto = select.options[select.selectedIndex].text;
    pedirConfirmacion("¿Seguro que quieres borrar " + texto + "?", async function () {
        let respuesta = await policlinica.borrarPaciente("id", select.value);
        mostrarToast(respuesta.mensaje, respuesta.exito);
        if (respuesta.exito) {
            cargarDesplegables();
        }
    });
}

async function borrarPacientePorAlt(evento) {
    evento.preventDefault();
    let valor = document.getElementById("pacBorrarAlt").value.trim();
    if (valor == "") {
        mostrarToast("Escribe el dni", false);
        return;
    }
    pedirConfirmacion("¿Seguro que quieres borrar el paciente con dni " + valor + "?", async function () {
        let respuesta = await policlinica.borrarPaciente("alternativo", valor);
        mostrarToast(respuesta.mensaje, respuesta.exito);
        if (respuesta.exito) {
            document.getElementById("formPacBorrarAlt").reset();
            cargarDesplegables();
        }
    });
}

async function listarPacientes() {
    let respuesta = await policlinica.listarPacientes();
    pintarTablaPacientes(respuesta.datos, "pacTablaListado");
    document.getElementById("pacTotal").textContent = respuesta.datos.length;
}

async function filtrarPacientes(evento) {
    evento.preventDefault();
    let filtros = {
        id_aseguradora: document.getElementById("pacFilId_aseguradora").value,
        recordatorio_sms: document.getElementById("pacFilRecordatorio_sms").value,
        nacido_desde: document.getElementById("pacFilNacido_desde").value,
        nacido_hasta: document.getElementById("pacFilNacido_hasta").value
    };
    let respuesta = await policlinica.filtrarPacientes(filtros);
    if (respuesta.exito) {
        pintarTablaPacientes(respuesta.datos, "pacTablaFiltro");
        mostrarToast(respuesta.mensaje, true);
    } else {
        mostrarToast(respuesta.mensaje, false);
    }
}

function pintarTablaPacientes(lista, idTbody) {
    let tbody = document.getElementById(idTbody);
    tbody.innerHTML = "";
    if (lista.length == 0) {
        tbody.innerHTML = "<tr><td colspan='8'>No hay registros</td></tr>";
        return;
    }
    for (let x of lista) {
        tbody.innerHTML += "<tr>" +
            "<td>" + x.idPaciente + "</td>" +
            "<td>" + x.nombre + "</td>" +
            "<td>" + x.dni + "</td>" +
            "<td>" + x.telefono + "</td>" +
            "<td>" + x.aseguradora + "</td>" +
            "<td>" + x.pesoKg + "</td>" +
            "<td>" + formatearFecha(x.fechaNacimiento) + "</td>" +
            "<td>" + siNo(x.recordatorioSms) + "</td>" +
            "</tr>";
    }
}

// =====================================================
// CITAS - Juan Antonio Bueno Rodríguez
// =====================================================

async function altaCita(evento) {
    evento.preventDefault();
    let form = document.getElementById("formCitAlta");
    if (!formularioValido(form)) return;

    let cit = new Cita(
        null,
        document.getElementById("citAltaIdPaciente").value,
        document.getElementById("citAltaIdMedico").value,
        document.getElementById("citAltaFechaHora").value,
        document.getElementById("citAltaDuracionMin").value,
        document.getElementById("citAltaMotivo").value,
        document.getElementById("citAltaAtendida").checked,
        "",
        ""
    );

    let respuesta = await policlinica.altaCita(cit);
    mostrarToast(respuesta.mensaje, respuesta.exito);
    if (respuesta.exito) {
        form.reset();
        cargarDesplegables();
    }
}

async function buscarCitas(evento) {
    evento.preventDefault();
    let texto = document.getElementById("citBuscarTexto").value;
    let respuesta = await policlinica.buscarCitas(texto);
    if (!respuesta.exito) {
        mostrarToast(respuesta.mensaje, false);
        return;
    }
    resultadosCitas = respuesta.datos;
    document.getElementById("formCitMod").classList.add("d-none");

    let tbody = document.getElementById("citTablaBuscar");
    tbody.innerHTML = "";
    if (resultadosCitas.length == 0) {
        tbody.innerHTML = "<tr><td colspan='8'>No se ha encontrado nada</td></tr>";
        return;
    }
    for (let i = 0; i < resultadosCitas.length; i++) {
        let x = resultadosCitas[i];
        tbody.innerHTML += "<tr>" +
            "<td>" + x.idCita + "</td>" +
            "<td>" + formatearFechaHora(x.fechaHora) + "</td>" +
            "<td>" + x.paciente + "</td>" +
            "<td>" + x.medico + "</td>" +
            "<td>" + x.motivo + "</td>" +
            "<td>" + x.duracionMin + "</td>" +
            "<td>" + siNo(x.atendida) + "</td>" +
            "<td><button class='btn btn-sm btn-vitalia' onclick='seleccionarCita(" + i + ")'>Modificar</button></td>" +
            "</tr>";
    }
}

// rellena el formulario de modificar con el resultado elegido
function seleccionarCita(posicion) {
    let x = resultadosCitas[posicion];
    document.getElementById("citModId").value = x.idCita;
    document.getElementById("citModIdPaciente").value = x.idPaciente;
    document.getElementById("citModIdMedico").value = x.idMedico;
    document.getElementById("citModFechaHora").value = x.fechaHora.replace(" ", "T").substring(0, 16);
    document.getElementById("citModDuracionMin").value = x.duracionMin;
    document.getElementById("citModMotivo").value = x.motivo;
    document.getElementById("citModAtendida").checked = x.atendida == 1;
    let form = document.getElementById("formCitMod");
    form.classList.remove("d-none");
    form.classList.remove("was-validated");
    form.scrollIntoView({ behavior: "smooth" });
}

async function modificarCita(evento) {
    evento.preventDefault();
    let form = document.getElementById("formCitMod");
    if (!formularioValido(form)) return;

    let cit = new Cita(
        document.getElementById("citModId").value,
        document.getElementById("citModIdPaciente").value,
        document.getElementById("citModIdMedico").value,
        document.getElementById("citModFechaHora").value,
        document.getElementById("citModDuracionMin").value,
        document.getElementById("citModMotivo").value,
        document.getElementById("citModAtendida").checked,
        "",
        ""
    );

    let respuesta = await policlinica.modificarCita(cit);
    mostrarToast(respuesta.mensaje, respuesta.exito);
    if (respuesta.exito) {
        form.classList.add("d-none");
        cargarDesplegables();
        // repetimos la busqueda para ver los cambios
        document.getElementById("formCitBuscar").requestSubmit();
    }
}

async function borrarCitaPorId(evento) {
    evento.preventDefault();
    let select = document.getElementById("citBorrarId");
    if (select.value == "") {
        mostrarToast("Elige una cita de la lista", false);
        return;
    }
    let texto = select.options[select.selectedIndex].text;
    pedirConfirmacion("¿Seguro que quieres borrar " + texto + "?", async function () {
        let respuesta = await policlinica.borrarCita("id", select.value);
        mostrarToast(respuesta.mensaje, respuesta.exito);
        if (respuesta.exito) {
            cargarDesplegables();
        }
    });
}

async function listarCitas() {
    let respuesta = await policlinica.listarCitas();
    pintarTablaCitas(respuesta.datos, "citTablaListado");
    document.getElementById("citTotal").textContent = respuesta.datos.length;
}

async function filtrarCitas(evento) {
    evento.preventDefault();
    let filtros = {
        id_medico: document.getElementById("citFilId_medico").value,
        id_paciente: document.getElementById("citFilId_paciente").value,
        atendida: document.getElementById("citFilAtendida").value,
        desde: document.getElementById("citFilDesde").value,
        hasta: document.getElementById("citFilHasta").value
    };
    let respuesta = await policlinica.filtrarCitas(filtros);
    if (respuesta.exito) {
        pintarTablaCitas(respuesta.datos, "citTablaFiltro");
        mostrarToast(respuesta.mensaje, true);
    } else {
        mostrarToast(respuesta.mensaje, false);
    }
}

function pintarTablaCitas(lista, idTbody) {
    let tbody = document.getElementById(idTbody);
    tbody.innerHTML = "";
    if (lista.length == 0) {
        tbody.innerHTML = "<tr><td colspan='7'>No hay registros</td></tr>";
        return;
    }
    for (let x of lista) {
        tbody.innerHTML += "<tr>" +
            "<td>" + x.idCita + "</td>" +
            "<td>" + formatearFechaHora(x.fechaHora) + "</td>" +
            "<td>" + x.paciente + "</td>" +
            "<td>" + x.medico + "</td>" +
            "<td>" + x.motivo + "</td>" +
            "<td>" + x.duracionMin + "</td>" +
            "<td>" + siNo(x.atendida) + "</td>" +
            "</tr>";
    }
}

// =====================================================
// PRUEBAS - Juan Antonio Bueno Rodríguez
// =====================================================

async function altaPrueba(evento) {
    evento.preventDefault();
    let form = document.getElementById("formPruAlta");
    if (!formularioValido(form)) return;

    let pru = new Prueba(
        null,
        document.getElementById("pruAltaIdCita").value,
        document.getElementById("pruAltaTipo").value,
        document.getElementById("pruAltaFechaRealizacion").value,
        document.getElementById("pruAltaCoste").value,
        document.getElementById("pruAltaResultado").value,
        document.getElementById("pruAltaUrgente").checked,
        ""
    );

    let respuesta = await policlinica.altaPrueba(pru);
    mostrarToast(respuesta.mensaje, respuesta.exito);
    if (respuesta.exito) {
        form.reset();
        cargarDesplegables();
    }
}

async function buscarPruebas(evento) {
    evento.preventDefault();
    let texto = document.getElementById("pruBuscarTexto").value;
    let respuesta = await policlinica.buscarPruebas(texto);
    if (!respuesta.exito) {
        mostrarToast(respuesta.mensaje, false);
        return;
    }
    resultadosPruebas = respuesta.datos;
    document.getElementById("formPruMod").classList.add("d-none");

    let tbody = document.getElementById("pruTablaBuscar");
    tbody.innerHTML = "";
    if (resultadosPruebas.length == 0) {
        tbody.innerHTML = "<tr><td colspan='9'>No se ha encontrado nada</td></tr>";
        return;
    }
    for (let i = 0; i < resultadosPruebas.length; i++) {
        let x = resultadosPruebas[i];
        tbody.innerHTML += "<tr>" +
            "<td>" + x.idPrueba + "</td>" +
            "<td>" + x.tipo + "</td>" +
            "<td>" + x.paciente + "</td>" +
            "<td>" + x.idCita + "</td>" +
            "<td>" + formatearFecha(x.fechaRealizacion) + "</td>" +
            "<td>" + x.coste + " €</td>" +
            "<td>" + siNo(x.urgente) + "</td>" +
            "<td>" + x.resultado + "</td>" +
            "<td><button class='btn btn-sm btn-vitalia' onclick='seleccionarPrueba(" + i + ")'>Modificar</button></td>" +
            "</tr>";
    }
}

// rellena el formulario de modificar con el resultado elegido
function seleccionarPrueba(posicion) {
    let x = resultadosPruebas[posicion];
    document.getElementById("pruModId").value = x.idPrueba;
    document.getElementById("pruModIdCita").value = x.idCita;
    document.getElementById("pruModTipo").value = x.tipo;
    document.getElementById("pruModFechaRealizacion").value = x.fechaRealizacion;
    document.getElementById("pruModCoste").value = x.coste;
    document.getElementById("pruModResultado").value = x.resultado;
    document.getElementById("pruModUrgente").checked = x.urgente == 1;
    let form = document.getElementById("formPruMod");
    form.classList.remove("d-none");
    form.classList.remove("was-validated");
    form.scrollIntoView({ behavior: "smooth" });
}

async function modificarPrueba(evento) {
    evento.preventDefault();
    let form = document.getElementById("formPruMod");
    if (!formularioValido(form)) return;

    let pru = new Prueba(
        document.getElementById("pruModId").value,
        document.getElementById("pruModIdCita").value,
        document.getElementById("pruModTipo").value,
        document.getElementById("pruModFechaRealizacion").value,
        document.getElementById("pruModCoste").value,
        document.getElementById("pruModResultado").value,
        document.getElementById("pruModUrgente").checked,
        ""
    );

    let respuesta = await policlinica.modificarPrueba(pru);
    mostrarToast(respuesta.mensaje, respuesta.exito);
    if (respuesta.exito) {
        form.classList.add("d-none");
        cargarDesplegables();
        // repetimos la busqueda para ver los cambios
        document.getElementById("formPruBuscar").requestSubmit();
    }
}

async function borrarPruebaPorId(evento) {
    evento.preventDefault();
    let select = document.getElementById("pruBorrarId");
    if (select.value == "") {
        mostrarToast("Elige una prueba de la lista", false);
        return;
    }
    let texto = select.options[select.selectedIndex].text;
    pedirConfirmacion("¿Seguro que quieres borrar " + texto + "?", async function () {
        let respuesta = await policlinica.borrarPrueba("id", select.value);
        mostrarToast(respuesta.mensaje, respuesta.exito);
        if (respuesta.exito) {
            cargarDesplegables();
        }
    });
}

async function listarPruebas() {
    let respuesta = await policlinica.listarPruebas();
    pintarTablaPruebas(respuesta.datos, "pruTablaListado");
    document.getElementById("pruTotal").textContent = respuesta.datos.length;
}

async function filtrarPruebas(evento) {
    evento.preventDefault();
    let filtros = {
        tipo: document.getElementById("pruFilTipo").value,
        urgente: document.getElementById("pruFilUrgente").value,
        coste_max: document.getElementById("pruFilCoste_max").value,
        desde: document.getElementById("pruFilDesde").value,
        hasta: document.getElementById("pruFilHasta").value
    };
    let respuesta = await policlinica.filtrarPruebas(filtros);
    if (respuesta.exito) {
        pintarTablaPruebas(respuesta.datos, "pruTablaFiltro");
        mostrarToast(respuesta.mensaje, true);
    } else {
        mostrarToast(respuesta.mensaje, false);
    }
}

function pintarTablaPruebas(lista, idTbody) {
    let tbody = document.getElementById(idTbody);
    tbody.innerHTML = "";
    if (lista.length == 0) {
        tbody.innerHTML = "<tr><td colspan='8'>No hay registros</td></tr>";
        return;
    }
    for (let x of lista) {
        tbody.innerHTML += "<tr>" +
            "<td>" + x.idPrueba + "</td>" +
            "<td>" + x.tipo + "</td>" +
            "<td>" + x.paciente + "</td>" +
            "<td>" + x.idCita + "</td>" +
            "<td>" + formatearFecha(x.fechaRealizacion) + "</td>" +
            "<td>" + x.coste + " €</td>" +
            "<td>" + siNo(x.urgente) + "</td>" +
            "<td>" + x.resultado + "</td>" +
            "</tr>";
    }
}
