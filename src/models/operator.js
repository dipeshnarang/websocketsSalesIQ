const db=require('./../databaseConnection/mariadb')
const schedule=require('node-schedule')
const {merge,calculateActiveTime,convertToReadableTime}=require('../helperFunction/helperFunction')

class Operator{
    constructor(id, operatorId ,name, departmentId, departmentName, email, status, lastLogin, lastOffline){
        this.id=id,
        this.operatorId=operatorId
        this.name=name,
        this.departmentId=departmentId,
        this.departmentName=departmentName,
        this.email=email,
        this.status=status,
        this.lastLogin=lastLogin,
        this.lastOffline=lastOffline,
        this.ongoingChats=0,
        this.chatsCompleted=0,
        this.chatsAttended=[],
        this.totalActiveTime=0,
        this.chatsOwned=0
    }
}

let operators=[]

function getOperatorDetails(callback){
    db.connectionPool.getConnection().then((conn)=>{
        let sql="SELECT operator.ID, operator.OPT_ID,operator.OPT_NAME, operator.OPT_DEPT_ID ,department.DEPT_NAME, operator.OPT_EMAIL, operator.STATUS, operator.LAST_LOGIN, operator.LAST_OFFLINE from operator inner join department on operator.OPT_DEPT_ID=department.ID;"
        console.log(sql)
        conn.query(sql).then((result)=>{
            // console.log(result)
            conn.release()
            callback(null,result)
        }).catch((err)=>{
            console.log(err)
            conn.release()
            callback(err,null)
        })
    }).catch((err)=>{
        callback(err,null)
    })
}

function getChatOperatorDetails(callback){
    let sql="Select chat_opt_details.OPTID, chat_opt_details.ATTENDED_TIME, chat_opt_details.END_TIME, chat_opt_details.CHATS_OWNED from chat_opt_details;"
    console.log(sql)
    db.connectionPool.getConnection().then((conn)=>{
        conn.query(sql).then((result)=>{
            conn.release()
            callback(null,result)
        }).catch((e)=>{
            conn.release()
            callback(e,null)
        })
    }).catch((err)=>{
        callback(err,null)
    })
}



function fetchData(){
    getOperatorDetails(function(err,result){
        if(err){
           return console.log(err)
        }

        getChatOperatorDetails(function(err,data){
            if(err){
                return console.log(err)
            }

            result.forEach((row)=>{
            
                let op=operators.find((op)=>{
                    return op.id==row.ID && op.operatorId==row.OPT_ID
                })
                if(op==null){
                    operators.push(new Operator(row.ID,row.OPT_ID,row.OPT_NAME,row.OPT_DEPT_ID,row.DEPT_NAME,row.OPT_EMAIL,row.STATUS,row.LAST_LOGIN,row.LAST_OFFLINE))
                }else{
                    if(op.name!=row.OPT_NAME){
                        op.name=row.OPT_NAME
                    }
    
                    if(op.departmentId!=row.OPT_DEPT_ID){
                        op.departmentId=row.OPT_DEPT_ID
                    }
    
                    if(op.departmentName!=row.DEPT_NAME){
                        op.departmentName=row.DEPT_NAME
                    }
    
                    if(op.email!=row.OPT_EMAIL){
                        op.email=row.OPT_EMAIL
                    }
    
                    op.status=row.STATUS
                    op.lastLogin=row.LAST_LOGIN
                    op.lastOffline=row.LAST_OFFLINE
                    op.chatsCompleted=0
                    op.ongoingChats=0
                    op.chatsAttended=[]
                    op.chatsOwned=0
                }
            })



            data.forEach((row)=>{
                console.log(row)
                const op=operators.find((operator)=>{
                    return operator.id===row.OPTID
                })
                console.log(typeof(row.END_TIME))
                if(op!=null){
                    
                    if(row.END_TIME!=null){
                        op.chatsCompleted++
                        let time=[]
                        time.push(parseInt(row.ATTENDED_TIME))
                        time.push(parseInt(row.END_TIME))
                        op.chatsAttended.push(time)
                    }else{
                        op.ongoingChats++
                    }

                    if(row.CHATS_OWNED){
                        op.chatsOwned++
                    }
                }
                
                
            })
        
            operators.forEach((op)=>{
                let timeframes=merge(op.chatsAttended)
                console.log(timeframes)
                op.totalActiveTime=convertToReadableTime(calculateActiveTime(timeframes))      
            })
        
            // console.log(operators)
        })
    })
}

schedule.scheduleJob('*/60 * * * * *',function(){
    fetchData()
})

fetchData()

function getAllOperators(){
    return operators
}

function getDeptOperators(){

}

module.exports={
    getAllOperators
}