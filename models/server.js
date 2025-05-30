const express = require('express');
const cors = require('cors');
const { bdmysql } = require('../BD/SQLconnection.js');

//const app = express();

class Server {
    constructor(){
        this.app = express();
        this.port = process.env.PORT;

        this.pathMysql = {
            //prueba: '/api/prueba',
            auth: '/api/auth',
            usuarios: '/api/usuarios',
        };

        //Coneccion a la base de datos
        this.dbConnection();

        this.middlewares();

        this.routes();
    };

    async dbConnection(){
       await bdmysql();
    };

    routes(){
        //this.app.use(this.pathMysql.prueba, require('../routes'));
        this.app.use(this.pathsMongo.auth, require('../routes/auth.route'));
        this.app.use(this.pathsMongo.usuarios, require('../routes/mongoUsuario.route'));
    };

    middlewares(){
        this.app.use(cors());

        this.app.use(express.json());

        this.app.use(express.static('public'));
    };

    listen(){
        this.app.listen(this.port, ()=> {
            console.log('Servidor corriendo en puerto ',this.port);
        });
    };
};

module.exports = Server;