const socket=io()
// const listDepartment=document.getElementById('listDepartment')
// const dropdownDept=document.getElementById('dropdownept')

const list=[1,2,3,4,5]
const data=[]

socket.on('message',(msg)=>{
    console.log(msg)
    // listDepartment.innerHTML=''

    // msg.forEach((item)=>{
    //     const li=document.createElement('LI')
    //     li.textContent=item.name
    //     listDepartment.appendChild(li)
    // })
})

