const {getAllOperators}=require('./operator')
const {getDepartments}=require('./department')

function updatedData(){
    let operators=getAllOperators()
    let deparments=getDepartments()

    operators.forEach((op)=>{
        
        let dep=deparments.find((dep)=>{
            return dep.Id==op.departmentId
        })

        if(dep){
            dep.associatedOperators.push(op)
        }
    })
    return deparments
}

module.exports={
    updatedData
}