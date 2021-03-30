const mariadb=require('mariadb')

const connectionPool = mariadb.createPool({
    host: 'localhost',
    user:'root', 
    password: 'root',
    database:'salesiq'
});

module.exports={
    connectionPool:connectionPool
}
