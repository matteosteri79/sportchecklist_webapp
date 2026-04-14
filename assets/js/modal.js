const modalOverlay = document.getElementById("modalOverlay")
const modal = document.getElementById("modal")

export function openModal(content){
    modal.innerHTML = content
    modalOverlay.classList.remove("hidden")
    document.body.classList.add("modal-open")
}

export function closeModal(){
    modalOverlay.classList.add("hidden")
    document.body.classList.remove("modal-open")
}

modalOverlay.onclick = (e)=>{
    if(e.target === modalOverlay){
        closeModal()
    }
}