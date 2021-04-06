const db=require('./../databaseConnection/mariadb')
const schedule=require('node-schedule')
const { merge, convertToReadableTime, calculateActiveTime } = require('../helperFunction/helperFunction')

class Department{
    constructor(id,uniqueName,name,deptId){
        this.id=id,
        this.uniqueName=uniqueName
        this.name=name,
        this.deptId=deptId,
        this.ongoingChats=0,
        this.completedChats=0,
        this.associatedOperators=[],
        this.deptChats=[]
        this.chatDuration=0,
        this.barGraph=[]
    }
}

let departments=[]

function fetchDepartments(callback){
    let date=new Date()
    date.setHours(date.getHours()-24)
    let time=date.getTime()
    let sql="select department.ID, department.DEPT_NAME, department.DEPT_ID"+
            " from department;"
    console.log(sql)
    db.connectionPool.getConnection().then((conn)=>{
        conn.query(sql).then((data)=>{
            conn.release()
            callback(null,data)
        }).catch((err)=>{
            conn.release()
            callback(err,null)
        })
    }).catch((err)=>{
        callback(err,null)
    })
}

function fetchChatData(callback){
    let date=new Date()
    date.setHours(date.getHours()-24)
    let time=date.getTime()
    let sql="select START_TIME, END_TIME, DEPT_ID from chat where START_TIME>"+"0"+";"
    console.log(sql)
    db.connectionPool.getConnection().then((conn)=>{
        conn.query(sql).then((data)=>{
            conn.release()
            callback(null,data)
        }).catch((err)=>{
            conn.release()
            callback(err,null)
        })
    }).catch((err)=>{
        callback(err,null)
    })
}


function fetchDepartmentsData(){
    fetchDepartments(function(err,departmentData){
        if(err){
            console.log(err)
        }
        fetchChatData(function(err,chatData){
            if(err){
                console.log(err)
            }
            let i=0;
            departmentData.forEach((row)=>{
                let department=departments.find((dep)=>{
                    return dep.id==row.ID
                })
                
                if(!department){
                    departments.push(new Department(row.ID,"deaprtment"+i,row.DEPT_NAME,row.DEPT_ID))
                }else{
                    department.completedChats=0
                    department.ongoingChats=0
                    department.deptChats=[]
                }
                i++
            })

            chatData.forEach((chat)=>{
                let department=departments.find((dep)=>{
                    return dep.id==chat.DEPT_ID
                })
                
                if(department){
                   if(chat.END_TIME!=null){
                        department.completedChats++
                        let time=[]
                        time.push(parseInt(chat.START_TIME))
                        time.push(parseInt(chat.END_TIME))
                        department.deptChats.push(time)
                   }else{
                       department.ongoingChats++
                   }
                }

            })

            departments.forEach((dep)=>{
                let timeframes=merge(dep.deptChats)
                dep.chatDuration=convertToReadableTime(calculateActiveTime(timeframes))
            })

        })
    })
}

schedule.scheduleJob('*/60 * * * * *',function(){
    fetchDepartmentsData()
})

fetchDepartmentsData()

function getDepartments(){
    return departments
}

module.exports={
    getDepartments
}





