const schedule=require('node-schedule')
const db=require('./../databaseConnection/mariadb')
const {getDepartments}=require('./department')

class GraphObject{
    constructor(deptId,obj){
        this.deptId=deptId,
        this.graphData=[obj]
    }
}

let deptGraphData=[]

function queryDb(sql,endTime,callback){
    db.connectionPool.getConnection().then((conn)=>{
        conn.query(sql).then((data)=>{
            conn.release()
            let result={
                data:data,
                endTime:endTime
            }
            callback(null,result)
        }).catch((err)=>{
            conn.release()
            callback(err,null)
        })
    }).catch((err)=>{
        callback(err,null)
    })
}

function fetchGraphData(callback){
    let time=new Date()
    time.setMinutes(time.getMinutes()-30)
    let milis=time.getTime()
    let sql='select department.ID, COUNT(chat.DEPT_ID) as DEPT_CHATS from department left join' +
    ' (select * from chat where start_time >'+milis+' ) chat on department.ID=chat.DEPT_ID  group by department.ID;'
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
            return dep.id==group.ID
        })
        let halfHourData=[[]]
        let time=new Date()
        time.setMinutes(time.getMinutes()+330)
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

function lineGraphData(deptData){
    deptData.forEach((department)=>{
        console.log(department)
        let dep=deptGraphData.find((dep)=>{
            return dep.deptId==department.ID
        })

        let halfHourData=[[]]
        let time=new Date()
        time.setMinutes(time.getMinutes()+330)
        let hour=time.getHours()
        let minutes=time.getMinutes()
        halfHourData[0].push(hour,minutes,0)
        halfHourData.push(department.DEPT_CHATS)
        
        if(dep){
            dep.graphData.push(halfHourData)
        }else{
            deptGraphData.push(new GraphObject(department.ID,halfHourData))
        }

    })
    // console.log(deptGraphData)
}

schedule.scheduleJob('*/1 * * * *',function(){
    fetchGraphData(function(err,data){
        if(err){
            return console.log(err)
        }
        graphData(data)
        lineGraphData(data)
    })
})

fetchGraphData(function(err,data){
    if(err){
        return console.log(err)
    }
    graphData(data)
})


function generateGraphDataOnStartup(){
    let departments=getDepartments()
    const startTime=new Date()
    const endTime=new Date()
    startTime.setMinutes(startTime.getMinutes()-720)
    endTime.setMinutes(endTime.getMinutes()-690)
    const endTimes=[]

    for(i=1;i<25;i++){
        let begin=startTime.getTime()
        console.log("BEGIN: "+startTime.toLocaleString())
        let end=endTime.getTime()
        console.log("END:   "+endTime.toLocaleString())

        let sql='select department.ID, COUNT(chat.DEPT_ID) as DEPT_CHATS from department left join' +
            ' (select * from chat where start_time >'+begin+' and start_time <'+end + ' ) chat on department.ID=chat.DEPT_ID  group by department.ID;'
        
        queryDb(sql,endTime.getTime().toString(),function(err, result) {
            if (err) {
                return console.log(err)
            }
            console.log("Graph Data on Startup--------------------------------------------")
            console.log(result)


            let time = new Date(parseInt(result.endTime))
            console.log(time)
            // time.setMinutes(time.getMinutes()+330)
            let hour = time.getHours()
            console.log("HOUR:" + hour)
            let minutes = time.getMinutes()
            console.log("MINTUE:" + minutes)
            result.data.forEach((row) => {
                let dep = departments.find((department) => {
                    return department.id == row.ID
                })
                let halfHourData = [[]]

                halfHourData[0].push(hour, minutes, 0)
                halfHourData.push(row.DEPT_CHATS)
                if (dep) {
                    dep.barGraph.push(halfHourData)
                }
            })

        })
        startTime.setMinutes(startTime.getMinutes()+30)
        endTime.setMinutes(endTime.getMinutes()+30)
        

    
    }
}

setTimeout(function(){
    generateGraphDataOnStartup()
},2000)





