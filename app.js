import { ChecklistTemplates } from "./checklistTemplates.js"
import { openModal, closeModal } from "./modal.js"

// ---------- Dati ----------
let data = JSON.parse(localStorage.getItem("sportsData")) || []
let activeChecklistIndex = null // null = home, numero = checklist aperta

// ---------- FAB + Action Menu ----------
const fab = document.getElementById("fab")
const actionMenu = document.getElementById("actionMenu")
fab.addEventListener("click", () => {
    actionMenu.classList.toggle("hidden")
})

// ---------- Creazione nuova checklist ----------
document.getElementById("createChecklistBtn").addEventListener("click", () => {
    openModal(`
        <h2>Crea checklist</h2>
        <input id="newChecklistName" placeholder="Nome sport">
        <button id="modalCreateBtn">Crea</button>
    `)

    document.getElementById("modalCreateBtn").addEventListener("click", () => {
        const name = capitalizeFirst(
            document.getElementById("newChecklistName").value.trim()
        )
        if(!name) return
        data.push({ name, categories: [] })
        save()
        render()
        closeModal()
    })
})

// ---------- Salvataggio ----------
function save(){
    localStorage.setItem("sportsData", JSON.stringify(data))
}

// ---------- Rendering ----------
function render(){
    const sportsList = document.getElementById("sportsList")
    sportsList.innerHTML = ""

    // Se non c'è checklist attiva → home
    if(activeChecklistIndex === null){
        renderHome()
        return
    }
    const backToHome = document.getElementById("backToHomeBtn")
    if(backToHome){
        if(activeChecklistIndex !== null){
            backToHome.classList.remove("hidden");
        } else {
            backToHome.classList.add("hidden");
        }

        backToHome.onclick = () => {
            activeChecklistIndex = null;
            render();
        }
    }

    // ---------- Rendering checklist attiva ----------
    const checklist = data[activeChecklistIndex]
    const title = document.getElementById("activeChecklistTitle")
    const welcome = document.getElementById("welcomeScreen")
    title.style.display = "block"
    title.textContent = "📋 Checklist: " + checklist.name
    welcome.style.display = "none"

    updateActionMenuButtons()

    const fragment = document.createDocumentFragment()
    checklist.categories.forEach((cat,cIndex)=>{
        const catLi = document.createElement("li")
        catLi.className = "category"
        const icon = cat.open ? "keyboard_arrow_up" : "keyboard_arrow_down"

        catLi.innerHTML = `
<div class="category-left" data-action="toggleCategory" data-c="${cIndex}">
    <span>${cat.name}</span>
    <span class="material-icons arrow">${icon}</span>
</div>
<div>
    <span class="material-icons add" data-action="addItem" data-c="${cIndex}">add</span>
    <span class="material-icons delete" data-action="deleteCategory" data-c="${cIndex}">delete</span>
</div>
`
        fragment.appendChild(catLi)

        if(cat.open){
            cat.items.forEach((item,iIndex)=>{
                const itemLi = document.createElement("li")
                itemLi.className = "item"
                itemLi.innerHTML = `
<div>
<input class="check" type="checkbox" ${item.done ? "checked":""} data-action="toggleItem" data-c="${cIndex}" data-i="${iIndex}">
${item.name}
</div>
<div>
<span class="material-icons delete" data-action="deleteItem" data-c="${cIndex}" data-i="${iIndex}">delete</span>
</div>
`
                fragment.appendChild(itemLi)
            })
        }
    })

    sportsList.appendChild(fragment)

    // ---------- Eventi checklist attiva ----------
    sportsList.addEventListener("click", (e)=>{
        const button = e.target.closest("[data-action]")
        if(!button) return
        const action = button.dataset.action
        const cIndex = Number(button.dataset.c)
        const iIndex = Number(button.dataset.i)

        if(action === "addItem") addItemModal(activeChecklistIndex, cIndex)
        if(action === "deleteCategory") deleteCategory(activeChecklistIndex, cIndex)
        if(action === "toggleCategory") toggleCategory(activeChecklistIndex, cIndex)
        if(action === "toggleItem") toggleItem(activeChecklistIndex, cIndex, iIndex)
        if(action === "deleteItem") deleteItem(activeChecklistIndex, cIndex, iIndex)
    })

    document.getElementById("backToHomeBtn").addEventListener("click", ()=>{
        activeChecklistIndex = null
        renderHome()
    })
}

// ---------- Rendering Home ----------
function renderHome(){
    const sportsList = document.getElementById("sportsList")
    const title = document.getElementById("activeChecklistTitle")
    const welcome = document.getElementById("welcomeScreen")
    const activeChecklist = document.getElementById("activeChecklist")
    const backToHome = document.getElementById("backToHomeBtn")

    title.style.display = "none"
    welcome.style.display = "block"
    activeChecklist.innerHTML = "<h2 id=\"activeChecklistTitle\" class=\"checklist-title\">Le tue checklist</h2>"
    if(backToHome) backToHome.style.display = "none"

    if(data.length === 0){
        welcome.innerHTML += "<p>Nessuna checklist presente</p>"
        return
    }

    const ul = document.createElement("ul")
    data.forEach((checklist, index)=>{
        const li = document.createElement("li")
        li.innerHTML = `
<div class="checklist-row">
    <span class="checklist-name">${checklist.name}</span>

    <div class="checklist-actions">
<button class="icon-btn" data-action="openChecklist" data-s="${index}">
        <span class="material-icons play" data-action="openChecklist" data-s="${index}">play_arrow</span>
</button>
<button class="icon-btn" data-action="deleteChecklist" data-s="${index}">
        <span class="material-icons delete" data-action="deleteChecklist" data-s="${index}">delete</span>
    </button>
    </div>
</div>
`
        ul.appendChild(li)
    })
    welcome.appendChild(ul)

    // Eventi home
    ul.addEventListener("click",(e)=>{
        const button = e.target.closest("button")
        if(!button) return
        const sIndex = Number(button.dataset.s)
        const action = button.dataset.action

        if(action === "openChecklist"){
            activeChecklistIndex = sIndex
            render()
        }
        if(action === "deleteChecklist"){
            data.splice(sIndex,1)
            if(activeChecklistIndex === sIndex) activeChecklistIndex = null
            save()
            render()
        }
    })
}

// ---------- Funzioni FAB ----------
function updateActionMenuButtons() {
    const hasActiveChecklist = activeChecklistIndex !== null
    const addCatBtn = document.getElementById("addCategoryBtn")
    const addItemBtn = document.getElementById("addItemBtn")
    const backToHomeBtn = document.getElementById("backToHomeBtn")
    if(addCatBtn) addCatBtn.style.display = hasActiveChecklist ? "inline-block" : "none"
    if(addItemBtn) addItemBtn.style.display = hasActiveChecklist ? "inline-block" : "none"
    if(backToHomeBtn) backToHomeBtn.style.display = hasActiveChecklist ? "flex" : "none"
}

// ---------- Modali dinamiche ----------
function addCategoryModal(sIndex){
    openModal(`
        <h2>Aggiungi categoria</h2>
        <input id="newCategoryName" placeholder="Nome categoria">
        <button id="modalAddCategoryBtn">Aggiungi</button>
    `)
    document.getElementById("modalAddCategoryBtn").addEventListener("click", ()=>{
        const name = capitalizeFirst(
            document.getElementById("newCategoryName").value.trim()
        )
        if(!name) return
        data[sIndex].categories.push({ name, items: [], open:true })
        save()
        render()
        closeModal()
    })
}

function addItemModal(sIndex, cIndex){
    openModal(`
        <h2>Aggiungi oggetto</h2>
        <input id="newItemName" placeholder="Nome oggetto">
        <button id="modalAddItemBtn">Aggiungi</button>
    `)
    document.getElementById("modalAddItemBtn").addEventListener("click", ()=>{
        const name = capitalizeFirst(
            document.getElementById("newItemName").value.trim()
        )
        if(!name) return
        data[sIndex].categories[cIndex].items.push({ name, done:false })
        save()
        render()
        closeModal()
    })
}

// ---------- Operazioni su sport/categoria/oggetti ----------
function toggleCategory(sIndex,cIndex){ data[sIndex].categories[cIndex].open = !data[sIndex].categories[cIndex].open; save(); render() }
function deleteCategory(sIndex,cIndex){ data[sIndex].categories.splice(cIndex,1); save(); render() }
function toggleItem(sIndex,cIndex,iIndex){ data[sIndex].categories[cIndex].items[iIndex].done = !data[sIndex].categories[cIndex].items[iIndex].done; save() }
function deleteItem(sIndex,cIndex,iIndex){ data[sIndex].categories[cIndex].items.splice(iIndex,1); save(); render() }

// ---------- Eventi FAB per checklist attiva ----------
document.getElementById("addCategoryBtn").addEventListener("click", ()=>{
    if(activeChecklistIndex !== null) addCategoryModal(activeChecklistIndex)
})

function capitalizeFirst(text){
    if(!text) return ""
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}





// ---------- Inizializzazione ----------
render()