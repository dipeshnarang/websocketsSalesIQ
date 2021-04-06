const {updatedData,sendDeptData}=require('./models/sendData')
const http=require('http')
const express=require('express')
const socketio=require('socket.io')
const schedule=require('node-schedule')
const path=require('path')

const app=express()
const server=http.createServer(app)
const io=socketio(server)

const port=process.env.PORT || 4000
const publicDirPath=path.join( __dirname , './../public')

app.use(express.static(publicDirPath))
app.use(express.json())

io.on('connection',(socket)=>{

    socket.emit('deptList',updatedData())

    socket.emit('message',updatedData())

    schedule.scheduleJob('*/15 * * * * *',function(){
        socket.emit('message',updatedData())
    })

    socket.on('selectDepartment',(deptName)=>{
        socket.emit('departmentData',sendDeptData(deptName))
    })
})

server.listen(port,()=>{
    console.log('Running on port: '+port)
})