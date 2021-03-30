const http=require('http')
const express=require('express')
const socketio=require('socket.io')
const path=require('path')

const app=express()
const server=http.createServer(app)
const io=socketio(server)

const port=process.env.PORT || 3000
const publicDirPath=path.join( __dirname , './../public')

app.use(express.static(publicDirPath))
app.use(express.json())

io.on('connection',(socket)=>{
    console.log('Hello')

    socket.emit('message',"Hello World!g")
})

server.listen(port,()=>{
    console.log('Running on port: '+port)
})