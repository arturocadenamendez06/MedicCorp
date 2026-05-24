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
        //console.log(req.session.cookie);
        
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

app.post('/medico/getAllPacientes', (req, res) => {
    const db = DBService.getDBServiceInstance();
    const resultadoPacientes = db.getAllPacientes();
    
    resultadoPacientes.then(data => res.json({data: data}))
    .catch(err => console.log(err));
});

app.post('/medico/deletePaciente/:id', (req, res) => {
    const db = DBService.getDBServiceInstance();
    const {id} = req.params;

    const result = db.deletePaciente(id);

    //Cuando la consulta a la BD se resuelva, se envía la respuesta al frontend, si no, se imprime el error
    result
    .then(data => res.json({success: data}))
    .catch(err => console.log(err));
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

//obtener medicos de la BD
app.get('/obtenerMedicos', async(req, res) => {
    const db = DBService.getDBServiceInstance();

    try {
        const medicos = await db.obtenerMedicos();
        res.json(medicos);

    } catch(error){
        console.log(error);
        res.status(500).json({
            error: 'Error obteniendo médicos'
        });
        
    }


});

//BORRAR!!!!!!, VOY A HACERLO MÁS GENERAL PARA QUE REVISE ROLES Y PUEDA PONERLO EN AMBAS INTERFACES
/* 
app.post('/paciente/reservarCita', async (req, res) => {
    try {
        
        const usuario = req.session.user.userId;
        console.log("Usuario: ", usuario);

        const { medico, diaCita, horaCita } = req.body;

        const db = DBService.getDBServiceInstance();

        const resultado = await db.reservarCita(
            usuario,
            medico,
            diaCita,
            horaCita
        );

        res.json(resultado);

    } catch(error){

        console.log(error);

        res.status(500).json({
            success: false,
            message: 'Error del servidor'
        });

    }

});
*/

app.post('/paciente/getAllCitas', (req, res) => {
    const db = DBService.getDBServiceInstance();
    const resultadoCitas = db.getAllCitasDePaciente(req.session.user.userId);
    
    resultadoCitas.then(data => res.json({data: data}))
    .catch(err => console.log(err));
});

app.post('/reservarCita', async (req, res) => {
    try {
        
        const usuario = req.session.user.userId;
        const rol = req.session.user.rol;

        //console.log("Usuario: ", usuario, " Rol: ", rol);

        const db = DBService.getDBServiceInstance();


        let resultado;

        if(rol === "paciente"){
            const { medico, diaCita, horaCita } = req.body;
            
            resultado = await db.reservarCita_paciente(
                usuario,
                medico,
                diaCita,
                horaCita
            );
        }

        else if (rol === "medico"){
            const { paciente, diaCita, horaCita } = req.body;

            resultado = await db.reservarCita_medico(
                paciente,
                usuario,
                diaCita,
                horaCita
            );
        }

        else {
            return res.status(403).json({
                success: false,
                message: "Rol no autorizado"
            });
        }

        res.json(resultado);

    } catch(error){

        console.log(error);

        res.status(500).json({
            success: false,
            message: 'Error del servidor'
        });

    }

});

app.listen(port, () => {
    console.log('The server is running...');
})