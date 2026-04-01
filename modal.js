const modalOverlay = document.getElementById("modalOverlay")
const modal = document.getElementById("modal")

export function openModal(content){
    const overlay = document.getElementById("modalOverlay")
    const modal = document.getElementById("modal")
    modal.innerHTML = content
    overlay.classList.remove("hidden")
}

export function closeModal(){
    const overlay = document.getElementById("modalOverlay")
    overlay.classList.add("hidden")
}

modalOverlay.onclick = (e)=>{
    if(e.target === modalOverlay){
        closeModal()
    }
}