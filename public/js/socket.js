const socket=io()
const listDepartment=document.getElementById('listDepartment')

const list=[1,2,3,4,5]

socket.on('message',(msg)=>{
    console.log(msg)
})

list.forEach((item)=>{
    const p=document.createElement('p')
    p.textContent=item
    listDepartment.appendChild()
})