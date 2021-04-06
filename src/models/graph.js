const schedule=require('node-schedule')
const db=require('./../databaseConnection/mariadb')
const {getDepartments}=require('./department')

function fetchGraphData(callback){
    let time=new Date()
    time.setMinutes(time.getMinutes()-30)
    let milis=time.getTime()
    let sql='select department.ID, COUNT(chat.DEPT_ID) as DEPT_CHATS from department left join chat on department.ID=chat.DEPT_ID'+
            'where chat.START_TIME>'+milis+'or START_TIME is null group by department.ID;'
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

function graphData(chatData){
    let departments=getDepartments()
    
    chatData.forEach((group)=>{
        let dep=departments.find((dep)=>{
            return dep.id==group.DEPT_ID
        })
        console.log(dep)
        let halfHourData=[[]]
        let time=new Date()
        let hour=time.getHours()
        let minutes=time.getMinutes()
        halfHourData[0].push(hour,minutes,0)
        halfHourData.push(group.DEPT_CHATS)
        
        if(dep){
            dep.barGraph.push(halfHourData)
            if(dep.barGraph.length>24){
                dep.barGraph.shift()
            }
        }
    })
    
    
    
}

schedule.scheduleJob('*/1 * * * *',function(){
    fetchGraphData(function(err,data){
        if(err){
            return console.log(err)
        }
        graphData(data)
    })
})

fetchGraphData(function(err,data){
    if(err){
        return console.log(err)
    }
    graphData(data)
})



