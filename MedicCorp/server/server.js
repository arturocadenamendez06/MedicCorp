const express = require('express');
const session = require('express-session');
const cors = require('cors');
const bcryptjs = require('bcryptjs');
const app = express();
const port = 5000; //Puerto del backend, modificar si es necesario
const dotenv = require('dotenv');

dotenv.config();
const DBService = require('./DBService');

app.use(cors({
    origin: ['http://localhost:5500','http://127.0.0.1:5500','http://localhost'],
    credentials: true
}));

app.use(express.urlencoded({ extended: false }));// Permitir leer formularios HTML
app.use(express.json());

//Sesiones
app.use(session({
    secret: 'secreto',//Para este podemos generar una clave aleatorio con JS
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        sameSite: 'lax'
    }
}))


//-------------SERVICIOS DEL SERVIDOR------------------

//Registrar un nuevo usuario/paciente
app.post('/registrarPaciente', (req, res) => {
    const { nombre, edad, sexo, email, telefono, direccion, contrasena } = req.body;
    //console.log('Received data:', nombre, edad, sexo, email, telefono, direccion, contrasena);
    
    const db = DBService.getDBServiceInstance();
    const resultadoUsuario = db.registrarUsuario(nombre, contrasena, direccion, email, telefono, edad, sexo);
    
    resultadoUsuario
    .then(data => res.json({success : data}))
    .catch(err => console.log(err));

});

//Iniciar sesión
app.post('/iniciarSesion', async (req, res) => {
    const { usuario, contrasena } = req.body;
    //console.log('Received data:'+ usuario + ' ' + contrasena);

    const db = DBService.getDBServiceInstance();
    const resultadoAuth = await db.buscarUsuario(usuario, contrasena);
    let result = false

    if(resultadoAuth.isfound == true){
        //Guardar información de sesión
        req.session.user = {
            username: usuario,
            loggedIn: true,
            rol: resultadoAuth.rol,
            userId: resultadoAuth.id
        };

        console.log(req.session.user);
        console.log(req.session.cookie);
        
        let userRol = '';
        switch(req.session.user.rol){
            case 'medico':
                userRol = 'medico'
                break;
            case 'paciente':
                userRol = 'paciente'
                break;
        }
        console.log(userRol);
        res.json({
            success : true,
            rol : userRol
        });

    }else{
        res.json({
            success : false,
            rol: ''
        });
    }
    
});

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if(err){
            return res.status(500).json({
                success: false,
                message: 'Error al cerrar sesión'
            });
        }

        res.clearCookie('connect.sid');
        res.json({
            success: true,
            message: 'Sesión cerrada'
        });
    });
});

//Probar que la sesión este activa **BORRAR DESPUÉS
app.get('/session', (req, res) => {
    //console.log(req.session.user.rol);
    res.json(req.session.user);
});

/*
app.get('/medico', (req, res) => {
    console.log(req.session.user.rol);
    if (req.session.user.rol === 'medico') {
        //res.json({success : true});
    } else {
        //res.status(403).send('Acceso denegado');
    }

});
*/
app.listen(port, () => {
    console.log('The server is running...');
})