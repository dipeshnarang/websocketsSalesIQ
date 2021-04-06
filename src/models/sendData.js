const {getAllOperators}=require('./operator')
const {getDepartments}=require('./department')
require('./graph')

function updatedData(){
    let operators=getAllOperators()
    let deparments=getDepartments()

    deparments.forEach((dep)=>{
        dep.associatedOperators=[]
    })
    operators.forEach((op)=>{
        
        let dep=deparments.find((dep)=>{
            return dep.id==op.departmentId
        })

        if(dep){
            dep.associatedOperators.push(op)
        }
    })
    return deparments

}

function sendDeptData(deptName){
    let deptData=deparments.find((dep)=>{
        return dep.name==deptName
    })

    return deptData
}

module.exports={
    updatedData,
    sendDeptData
}