const mysql = require('mysql');
const dotenv = require('dotenv');
const EncryptionService = require('./encryption');
let instance = null;//para que no se repita la instancia del objeto DBservice cada vez que se corra este servicio
dotenv.config();

//Crear la conexión a la base de datos con los datos del archivo .env
const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DB_PORT
});

//Verificar su la conexión a la base de datos es exitosa, si no, se imprime el error
connection.connect((err) => {
    if (err) {
        console.log(err.message);
    }
    console.log('Database is ' + connection.state + '.');
});

//Clase para manejar la conexión a la base de datos y las consultas
class DBService {
    static getDBServiceInstance() {
        return instance ? instance : new DBService();
    }

    async registrarUsuario(nombre, contrasena, direccion, email, telefono, edad, sexo) {
        try {

            //Insertar un nuevo usuario a MySQL
            const usuarioResult = await new Promise((resolve, reject) => {
                const query = "INSERT INTO usuarios (estado_usuario, nombre_usuario, contrasena, rol) VALUES (?, ?, ?, ?);";

                connection.query(query, ["activo", nombre, contrasena, "paciente"], (err, result) => {
                    if (err) reject(new Error(err.message));
                    resolve(result);
                })
            });

            let affectedRows = usuarioResult.affectedRows;//Número de filas afectadas por la consulta
            const idUsuario = usuarioResult.insertId;//ID del nuevo usuario registrado

            //Insertar un nuevo paciente a MySQL
            const pacienteResult = await new Promise((resolve, reject) => {
                const queryPaciente = "INSERT INTO pacientes(id_usuario, nombre_paciente, direccion, correo, telefono, edad, sexo) VALUES (?, ?, ?, ?, ?, ?, ?);";

                connection.query(queryPaciente, [idUsuario, nombre, direccion, email, telefono, edad, sexo], (err, result) => {
                    if (err) reject(new Error(err.message));
                    resolve(result);
                })
            });

            affectedRows += pacienteResult.affectedRows;//Agregar filas afectadas por la consulta de pacientes
            console.log(affectedRows);

            //Si se afectaron 2 filas (una para usuarios y otra para pacientes), se devuelve true, 
            //de lo contrario, false.
            return affectedRows === 2 ? true : false;

        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async buscarUsuario(usuario, contrasena) {
        try {
            //Buscar un usuario en MySQL con el nombre de usuario y contraseña proporcionados
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM usuarios WHERE nombre_usuario = ? AND contrasena = ? AND estado_usuario = 'activo';";

                connection.query(query, [usuario, contrasena], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });

            //Si no se encuentra ningún usuario que coincida con los datos proporcionados, se devuelve "false"
            if (response.length == 0) {
                //return false;
                return {
                    isfound: false,
                    rol: '',
                    id: ''
                };
            }

            //console.log("Usuario encontrado: " + response[0].nombre_usuario);
            return {
                isfound: true,
                rol: response[0].rol,
                id: response[0].id_usuario
            };
            //return true;

        } catch (error) {
            console.log(error);
            return {
                isfound: false,
                rol: '',
                id: ''
            };
        }
    }

    /* ----- MEDICOS ----- */

    async getAllCitasDeMedico(idUsuario) {
        try {
            //Buscar las citas "Reservada" y "Completada" de un paciente
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT c.id_cita, c.id_paciente, c.id_medico, c.dia, c.hora, c.estado_cita FROM usuarios u INNER JOIN medicos m ON u.id_usuario = m.id_usuario INNER JOIN citas c ON m.id_medico = c.id_medico WHERE c.estado_cita IN ('reservada', 'completada') AND u.id_usuario = ?;";

                connection.query(query, [idUsuario], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });
            //console.log(response);
            return response;

        } catch (error) {
            console.log(error);
        }
    }

    async obtenerMedicos() {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = `
                    SELECT m.id_medico, m.nombre_medico
                    FROM medicos m
                    JOIN usuarios u 
                        ON m.id_usuario = u.id_usuario
                    WHERE u.estado_usuario = 'activo';
                `;

                connection.query(query, (err, results) => {
                    if (err) {
                        reject(new Error(err.message));
                    }

                    resolve(results);
                });
            });

            return response;

        } catch (error) {
            console.log(error);
            return [];
        }

    }

    /* ----- CITAS ----- */

    /* 
    async reservarCita(idUsuario, idMedico, diaCita, horaCita) {
        try {
            //encontrar id de paciente apartir del id de usuario
            await new Promise((resolve, reject) => {
                connection.beginTransaction(err => {
                    if (err) return reject(err);

                    resolve();
                });
            });

            const idPaciente = await new Promise((resolve, reject) => {

                const query = `
                    SELECT id_paciente
                    FROM pacientes
                    WHERE id_usuario = ?
                `;

                connection.query(
                    query,
                    [idUsuario],
                    (err, results) => {
                        if (err) return reject(err);

                        // Verificar si existe paciente
                        if (results.length === 0) {
                            return reject(new Error('Paciente no encontrado'));
                        }

                        resolve(results[0].id_paciente);
                    }
                );
            });

            // Intentar insertar cita
            await new Promise((resolve, reject) => {
                const query = `
                    INSERT INTO citas(
                        id_paciente,
                        id_medico,
                        dia,
                        hora,
                        estado_cita
                    )
                    VALUES (?, ?, ?, ?, ?)
                `;

                connection.query(
                    query,
                    [
                        idPaciente,
                        idMedico,
                        diaCita,
                        horaCita,
                        'reservada'
                    ],
                    (err, results) => {
                        if (err) reject(err);

                        resolve(results);

                    }
                );

            });

            await new Promise((resolve, reject) => {

                connection.commit(err => {
                    if (err) reject(err);

                    resolve();
                });
            });

            return {
                success: true
            };

        } catch (error) {
            console.log(error);

            await new Promise(resolve => {
                connection.rollback(() => resolve());
            });

            // Error duplicate key
            if (error.code === 'ER_DUP_ENTRY') {
                return {
                    success: false,
                    message: 'La cita ya fue reservada'
                };
            }

            return {
                success: false,
                message: error.message || 'Error reservando cita'
            };

        }

    }
    */
    async reservarCita_paciente(idUsuario, idMedico, diaCita, horaCita) {
        try {
            //encontrar id de paciente apartir del id de usuario
            await new Promise((resolve, reject) => {
                connection.beginTransaction(err => {
                    if (err) return reject(err);

                    resolve();
                });
            });

            const idPaciente = await new Promise((resolve, reject) => {

                const query = `
                    SELECT id_paciente
                    FROM pacientes
                    WHERE id_usuario = ?
                `;

                connection.query(
                    query,
                    [idUsuario],
                    (err, results) => {
                        if (err) return reject(err);

                        // Verificar si existe paciente
                        if (results.length === 0) {
                            return reject(new Error('Paciente no encontrado'));
                        }

                        resolve(results[0].id_paciente);
                    }
                );
            });

            // Intentar insertar cita
            await new Promise((resolve, reject) => {
                const query = `
                    INSERT INTO citas(
                        id_paciente,
                        id_medico,
                        dia,
                        hora,
                        estado_cita
                    )
                    VALUES (?, ?, ?, ?, ?)
                `;

                connection.query(
                    query,
                    [
                        idPaciente,
                        idMedico,
                        diaCita,
                        horaCita,
                        'reservada'
                    ],
                    (err, results) => {
                        if (err) reject(err);

                        resolve(results);

                    }
                );

            });

            await new Promise((resolve, reject) => {

                connection.commit(err => {
                    if (err) reject(err);

                    resolve();
                });
            });

            return {
                success: true
            };

        } catch (error) {
            console.log(error);

            await new Promise(resolve => {
                connection.rollback(() => resolve());
            });

            // Error duplicate key
            if (error.code === 'ER_DUP_ENTRY') {
                return {
                    success: false,
                    message: 'La cita ya fue reservada'
                };
            }

            return {
                success: false,
                message: error.message || 'Error reservando cita'
            };

        }

    }

    async reservarCita_medico(idPaciente, idUsuario, diaCita, horaCita) {
        try {

            //console.log("Paciente: ", idPaciente, " Usuario(medico): ", idUsuario);

            //encontrar id de medico apartir del id de usuario
            await new Promise((resolve, reject) => {
                connection.beginTransaction(err => {
                    if (err) return reject(err);

                    resolve();
                });
            });

            const idMedico = await new Promise((resolve, reject) => {

                const query = `
                    SELECT id_medico
                    FROM medicos
                    WHERE id_usuario = ?
                `;

                connection.query(
                    query,
                    [idUsuario],
                    (err, results) => {
                        if (err) return reject(err);

                        // Verificar si existe paciente
                        if (results.length === 0) {
                            return reject(new Error('Medico no encontrado'));
                        }

                        resolve(results[0].id_medico);
                    }
                );
            });

            //console.log("Medico: ", idMedico);

            // Intentar insertar cita
            await new Promise((resolve, reject) => {
                const query = `
                    INSERT INTO citas(
                        id_paciente,
                        id_medico,
                        dia,
                        hora,
                        estado_cita
                    )
                    VALUES (?, ?, ?, ?, ?)
                `;

                connection.query(
                    query,
                    [
                        idPaciente,
                        idMedico,
                        diaCita,
                        horaCita,
                        'reservada'
                    ],
                    (err, results) => {
                        if (err) reject(err);

                        resolve(results);

                    }
                );

            });

            await new Promise((resolve, reject) => {

                connection.commit(err => {
                    if (err) reject(err);

                    resolve();
                });
            });

            return {
                success: true
            };

        } catch (error) {
            console.log(error);

            await new Promise(resolve => {
                connection.rollback(() => resolve());
            });

            // Error duplicate key
            if (error.code === 'ER_DUP_ENTRY') {
                return {
                    success: false,
                    message: 'La cita ya fue reservada'
                };
            }

            return {
                success: false,
                message: error.message || 'Error reservando cita'
            };

        }

    }

    async getAllCitasDePaciente(idUsuario) {
        try {
            //Buscar las citas "Reservada" y "Completada" de un paciente
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT c.id_cita, c.id_paciente, c.id_medico, c.dia, c.hora, c.estado_cita FROM usuarios u INNER JOIN pacientes p ON u.id_usuario = p.id_usuario INNER JOIN citas c ON p.id_paciente = c.id_paciente WHERE c.estado_cita IN ('reservada', 'completada') AND u.id_usuario = ?;";

                connection.query(query, [idUsuario], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });
            //console.log(response);
            return response;

        } catch (error) {
            console.log(error);
        }
    }

    async getAllPacientes() {
        try {
            //Buscar un usuario en MySQL con el nombre de usuario y contraseña proporcionados
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT pacientes.id_paciente, pacientes.nombre_paciente, pacientes.correo, pacientes.telefono FROM usuarios INNER JOIN pacientes ON usuarios.id_usuario = pacientes.id_usuario WHERE usuarios.estado_usuario = 'activo';";

                connection.query(query, (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });
            //console.log(response);
            return response;

        } catch (error) {
            console.log(error);
        }
    }

    async deletePaciente(id) {
        try {
            id = parseInt(id, 10);//convertir el id a un número entero

            const reponse = await new Promise((resolve, reject) => {
                const query = "UPDATE usuarios INNER JOIN pacientes ON usuarios.id_usuario = pacientes.id_usuario SET usuarios.estado_usuario = 'inactivo' WHERE pacientes.id_paciente = ?;";

                connection.query(query, [id], (err, result) => {
                    if (err) reject(new Error(err.message));
                    resolve(result.affectedRows);
                })
            });

            //Si se editó una fila (affectedRows=1), se devuelve true, si no, false
            return reponse === 1 ? true : false;

        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async deleteCita(id) {
        try {
            id = parseInt(id, 10);//convertir el id a un número entero

            const response = await new Promise((resolve, reject) => {
                const query = "DELETE FROM citas WHERE id_cita = ?;";

                connection.query(query, [id], (err, result) => {
                    if (err) reject(new Error(err.message));
                    resolve(result.affectedRows);
                })
            });

            //Si se eliminó una fila (affectedRows=1), se devuelve true, si no, false
            return response === 1 ? true : false;

        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async getCita(id) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM citas WHERE id_cita = ?";

                connection.query(query, [id], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                });
            });

            //si no encuentra la cita, devuelve una lista vacía
            if (response.length === 0) {
                return [];
            }

            console.log("Respuesta del DB: ", response);
            return response;

        } catch (error) {
            console.log(error);
            return [];
        }
    }

    // DBService.js - Reemplazar el método guardarReporteConsulta con este
    async guardarReporteConsulta(id_cita, temperatura, peso, altura, presion_arterial, diagnostico, prescripcion, resultado_analisis) {
        try {
            // Validar que se proporcionó el id_cita
            if (!id_cita) {
                return {
                    success: false,
                    message: 'ID de cita es requerido'
                };
            }
            
            // Encriptar datos sensibles
            const encryptedTemperatura = temperatura ? EncryptionService.encrypt(temperatura) : null;
            const encryptedPeso = peso ? EncryptionService.encrypt(peso) : null;
            const encryptedAltura = altura ? EncryptionService.encrypt(altura) : null;
            const encryptedPresionArterial = presion_arterial ? EncryptionService.encrypt(presion_arterial) : null;
            const encryptedDiagnostico = diagnostico ? EncryptionService.encrypt(diagnostico) : null;
            const encryptedPrescripcion = prescripcion ? EncryptionService.encrypt(prescripcion) : null;
            const encryptedResultados = resultado_analisis ? EncryptionService.encrypt(resultado_analisis) : null;
            
            // Usar una transacción para asegurar que ambas operaciones se completen
            const result = await new Promise((resolve, reject) => {
                connection.beginTransaction(async (err) => {
                    if (err) return reject(err);

                    try {
                        // 1. Insertar el registro de consulta
                        const insertQuery = `
                            INSERT INTO registros_consulta (
                                id_cita, 
                                temperatura,
                                peso, 
                                altura, 
                                presion_arterial, 
                                diagnostico, 
                                prescripcion, 
                                resultados_analisis
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        `;
                        
                        connection.query(
                            insertQuery, 
                            [
                                id_cita, 
                                encryptedTemperatura,
                                encryptedPeso,
                                encryptedAltura,
                                encryptedPresionArterial,
                                encryptedDiagnostico,
                                encryptedPrescripcion,
                                encryptedResultados
                            ], 
                            (err, insertResult) => {
                                if (err) {
                                    return connection.rollback(() => reject(err));
                                }
                                
                                // 2. Actualizar el estado de la cita a 'completada'
                                const updateQuery = `
                                    UPDATE citas 
                                    SET estado_cita = 'completada' 
                                    WHERE id_cita = ?
                                `;
                                
                                connection.query(updateQuery, [id_cita], (err, updateResult) => {
                                    if (err) {
                                        return connection.rollback(() => reject(err));
                                    }
                                
                                    // Confirmar la transacción
                                    connection.commit((err) => {
                                        if (err) {
                                            return connection.rollback(() => reject(err));
                                        }
                                        
                                        resolve({
                                            insertResult: insertResult,
                                            updateResult: updateResult
                                        });
                                    });
                                });
                            }
                        );
                    } catch (error) {
                        connection.rollback(() => reject(error));
                    }
                });
            });
            
            // Verificar si ambas operaciones fueron exitosas
            if (result.insertResult.affectedRows === 1 && result.updateResult.affectedRows === 1) {
                return {
                    success: true,
                    message: 'Reporte guardado y cita marcada como completada',
                    id_consulta: result.insertResult.insertId
                };
            } else if (result.insertResult.affectedRows === 1 && result.updateResult.affectedRows === 0) {
                // Esto no debería ocurrir si la cita existe
                return {
                    success: false,
                    message: 'Reporte guardado pero no se pudo actualizar el estado de la cita'
                };
            } else {
                return {
                    success: false,
                    message: 'No se pudo guardar el reporte'
                };
            }
        
        } catch (error) {
            console.log(error);
            return {
                success: false,
                message: error.message || 'Error guardando el reporte'
            };
        }
    }

    async getConsultaConDesencriptacion(id_cita) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = `
                    SELECT * FROM registros_consulta 
                    WHERE id_cita = ?
                `;
                
                connection.query(query, [id_cita], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                });
            });
            
            if (response.length === 0) {
                return null;
            }
            
            // Desencriptar los datos sensibles
            const consulta = response[0];
            const decryptedConsulta = EncryptionService.decryptMedicalRecord(consulta);
            
            return decryptedConsulta;
        
        } catch (error) {
            console.log(error);
            return null;
        }
    }
    async editCita(idCita, diaCita, horaCita) {
        try {
            idCita = parseInt(idCita, 10);
            
            await new Promise((resolve, reject) => {
                connection.beginTransaction(err => {
                    if (err) return reject(err);

                    resolve();
                });
            });

            // Intentar editar cita
            const result = await new Promise((resolve, reject) => {
                const query = "UPDATE citas SET dia = ?, hora = ? WHERE id_cita = ?;";

                connection.query(
                    query,
                    [diaCita, horaCita, idCita],
                    (err, results) => {
                        if (err) reject(err);

                        resolve(results);

                    }
                );

            });

            // se verifica si existe la cita
            if (result.affectedRows === 0) {
                await new Promise(resolve => {
                    connection.rollback(() => resolve());
                });
                
                return {
                    success: false,
                    message: 'La cita no existe'
                };
            }

            await new Promise((resolve, reject) => {

                connection.commit(err => {
                    if (err) reject(err);

                    resolve();
                });
            });

            return {
                success: true
            };

        } catch (error) {
            console.log(error);

            await new Promise(resolve => {
                connection.rollback(() => resolve());
            });

            // Error duplicate key
            if (error.code === 'ER_DUP_ENTRY') {
                return {
                    success: false,
                    message: 'La cita ya fue tomada, intente agendarla en otra fecha'
                };
            }

            return {
                success: false,
                message: error.message || 'Error editando cita'
            };

        }
    }
    
    async getPacienteById(idPaciente) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = `
                    SELECT p.id_paciente, p.nombre_paciente, p.direccion, p.correo, p.telefono, p.edad, p.sexo
                    FROM pacientes p
                    INNER JOIN usuarios u ON p.id_usuario = u.id_usuario
                    WHERE p.id_paciente = ? AND u.estado_usuario = 'activo'
                `;
                
                connection.query(query, [idPaciente], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });
            
            if (response.length === 0) {
                return null;
            }
            
            return response[0];
        
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async getPacienteByUserId(idUsuario) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = `SELECT p.id_paciente, p.nombre_paciente, p.direccion, p.correo, p.telefono, p.edad, p.sexo FROM pacientes p INNER JOIN usuarios u ON p.id_usuario = u.id_usuario WHERE p.id_usuario = ? AND u.estado_usuario = 'activo'`;
                
                connection.query(query, [idUsuario], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });
            
            if (response.length === 0) {
                return null;
            }
            
            return response[0];
        
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    // Agrega este método después del método getPacienteById 
    async getConsultasByPacienteId(idPaciente) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = `
                    SELECT rc.*, c.dia, c.hora 
                    FROM registros_consulta rc
                    INNER JOIN citas c ON rc.id_cita = c.id_cita
                    WHERE c.id_paciente = ?
                    ORDER BY c.id_cita DESC
                `;
                
                connection.query(query, [idPaciente], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                });
            });
            
            if (response.length === 0) {
                return [];
            }
            
            // Desencriptar cada consulta
            const decryptedConsultas = response.map(consulta => {
                return EncryptionService.decryptMedicalRecord(consulta);
            });
            
            return decryptedConsultas;
        
        } catch (error) {
            console.log(error);
            return [];
        }
    }
}

module.exports = DBService;