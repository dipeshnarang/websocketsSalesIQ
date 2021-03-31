const db=require('./../databaseConnection/mariadb')
const schedule=require('node-schedule')

class Department{
    constructor(Id,name,deptId,ongoingChats,completedChats){
        this.Id=Id,
        this.name=name,
        this.deptId=deptId,
        this.ongoingChats=ongoingChats,
        this.completedChats=completedChats,
        this.associatedOperators=[]
    }
}

let departments=[]

function fetchDepartments(callback){
    let date=new Date()
    date.setHours(date.getHours()-2400)
    let time=date.getMilliseconds().toString()
    let sql="select department.ID, department.DEPT_NAME, department.DEPT_ID,COUNT(chat.START_TIME) as TOTAL_CHAT, COUNT(chat.END_TIME) as COMPLETED_CHAT"+
            " from department left outer join chat"+
            " on department.ID=chat.DEPT_ID where chat.START_TIME>"+time+" OR START_TIME IS NULL"+
            " group by ID;"
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

schedule.scheduleJob('*/60 * * * * *',function(){
    fetchDepartments(function(err,data){
        if(err){
            console.log(e)
        }
        
        departments=[]
        data.forEach((row)=>{
            departments.push(new Department(row.ID,row.DEPT_NAME,row.DEPT_ID,row.TOTAL_CHAT-row.COMPLETED_CHAT,row.COMPLETED_CHAT))
            console.log(row)
        })
    })
})

function getDepartments(){
    return departments
}

module.exports={
    getDepartments
}





