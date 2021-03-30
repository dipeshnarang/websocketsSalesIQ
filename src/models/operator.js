const db=require('./../databaseConnection/mariadb')
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
        this.totalActiveTime=0
    }
}

let operators=[]

function getOperatorDetails(callback){
    operators=[]
    db.connectionPool.getConnection().then((conn)=>{
        let sql="SELECT operator.ID, operator.OPT_ID,operator.OPT_NAME, operator.OPT_DEPT_ID ,department.DEPT_NAME, operator.OPT_EMAIL, operator.STATUS, operator.LAST_LOGIN, operator.LAST_OFFLINE from operator inner join department on operator.OPT_DEPT_ID=department.ID;"
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
    let sql="Select chat_opt_details.OPTID, chat_opt_details.ATTENDED_TIME, chat_opt_details.END_TIME from chat_opt_details;"
    db.connectionPool.getConnection().then((conn)=>{
        conn.query(sql).then((result)=>{
            conn.release()
            callback(null,result)
        }).catch((e)=>{
            conn.release()
            callback(err,null)
        })
    }).catch((err)=>{
        callback(err,null)
    })
}

getOperatorDetails(function(err,result){
    if(err){
       return console.log(err)
    }
    result.forEach((row)=>{
        operators.push(new Operator(row.ID,row.OPT_ID,row.OPT_NAME,row.OPT_DEPT_ID,row.DEPT_NAME,row.OPT_EMAIL,row.STATUS,row.LAST_LOGIN,row.LAST_OFFLINE))
    })
})

getChatOperatorDetails(function(err,data){
    if(err){
        return console.log(err)
    }
    data.forEach((row)=>{
        console.log(row)
        const op=operators.find((operator)=>{
            return operator.id===row.OPTID
        })
        console.log(typeof(row.END_TIME))
        if(row.END_TIME!=null){
            op.chatsCompleted++
            let time=[[]]
            time[0].push(row.ATTENDED_TIME)
            time[0].push(row.END_TIME)
            op.chatsAttended.push(time)
        }else{
            op.ongoingChats++
        }
        
    })

    operators.forEach((op)=>{
        let activeTime=
    })
})




