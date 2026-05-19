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

}

module.exports = DBService;