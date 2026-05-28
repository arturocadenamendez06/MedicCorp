const mysql = require('mysql');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
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

//transporter para configurar el correo
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

//Clase para manejar la conexión a la base de datos y el envio de mensajes por correo
class EmailService {
    static getEmailServiceInstance() {
        return instance ? instance : new EmailService();
    }

    //conseguir correo de medico por medio del id de usuario
    async getMedicEmailByIdUsuario(idUsuario){
        try {            
            const response = await new Promise((resolve, reject) => {

                const query = `SELECT correo FROM medicos WHERE id_usuario = ?;`;

                connection.query(query, [idUsuario], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                });

            });

            if(response.length === 0){
                return{
                    isfound: false,
                    correo: ''
                }
            }

            return {
                isfound: true,
                correo: response[0].correo
            };

        } catch (error) {
            console.log(error);
            return{
                isfound: false,
                correo: ''
            };
        }
    }

    //conseguir el correo del paciente por medio del id del paciente
    async getEmailByIdPaciente(idPaciente){
        try {            
            const response = await new Promise((resolve, reject) => {

                const query = `SELECT correo FROM pacientes WHERE id_paciente = ?;`;

                connection.query(query, [idPaciente], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                });

            });

            if(response.length === 0){
                return{
                    isfound: false,
                    correo: ''
                }
            }

            return {
                isfound: true,
                correo: response[0].correo
            };

        } catch (error) {
            console.log(error);
            return{
                isfound: false,
                correo: ''
            };
        }
    }

    async enviarCorreo(destinatario, asunto, mensajeHTML) {
        try {
            const info = await transporter.sendMail({

                from: `"MedicCorp" <${process.env.EMAIL_USER}>`,

                to: destinatario,

                subject: asunto,

                html: mensajeHTML

            });

            console.log('Correo enviado:', info.response);

            return {
                success: true,
                message: "El correo fue enviado al paciente"
            };

        } catch (error) {

            console.log(error);
            return {
                success: false,
                message: "Error enviando correo al paciente..."
            };

        }

    }

    async enviarNotificacionReservaCita(correo, nombre, fecha, hora) {
        const mensaje = `
            <h2>Hola ${nombre}</h2>
            <p>Tiene una cita reservada para esta fecha:</p>
            <p>
                <b>-Fecha:</b> ${fecha}<br>
                <b>-Hora:</b> ${hora}
            </p>
            <p></p>
            <p>¡Esperamos verlo pronto en MedicCorp!</p>
        `;

        return await this.enviarCorreo(correo, `Cita reservada (${fecha}, ${hora})`, mensaje);

    }

}

module.exports = EmailService;