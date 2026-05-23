const mysql = require('mysql');
const dotenv = require('dotenv');
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

}

module.exports = DBService;