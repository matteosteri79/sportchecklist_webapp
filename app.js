
import { ChecklistTemplates } from "./checklistTemplates.js"
import { openModal, closeModal } from "./modal.js"

// ---------- Elementi DOM ----------
const sportsList = document.getElementById("sportsList")
const title = document.getElementById("activeChecklistTitle")
const welcome = document.getElementById("welcomeScreen")
const activeChecklist = document.getElementById("activeChecklist")
const backToHome = document.getElementById("backToHomeBtn")

// ---------- Dati ----------
let data = JSON.parse(localStorage.getItem("sportsData")) || []
let activeChecklistIndex = null

// ---------- FAB ----------
const fab = document.getElementById("fab")
const actionMenu = document.getElementById("actionMenu")

fab.addEventListener("click", () => {
    actionMenu.classList.toggle("hidden")
})

// ---------- Creazione checklist ----------
document.getElementById("createChecklistBtn").addEventListener("click", () => {
    closeActionMenu()
    
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
        
        data.push({
            name,
            categories:[]
        })
    
        save()
        render()
        closeModal()
    })
})

function closeActionMenu(){
    actionMenu.classList.add("hidden")
}

// ---------- Salvataggio ----------
function save(){
    localStorage.setItem("sportsData", JSON.stringify(data))
}

// ---------- Rendering principale ----------
function render(){
    actionMenu.classList.add("hidden")
    if(activeChecklistIndex === null){
        renderHome()
        return
    }

    renderChecklist()
}

// ---------- HOME ----------
function renderHome(){
    sportsList.innerHTML = ""
    updateActionMenuButtons()

    // HOME senza checklist
    if(data.length === 0){
        activeChecklist.style.display = "none"
        title.style.display = "none"

        welcome.style.display = "block"
        welcome.innerHTML = `
            <img src="images/logo_sportchecklist.png" alt="Benvenuto">
            <p>Benvenuto in Sport Checklist</p>
            <p>Crea la tua prima checklist dal menu in basso.</p>
            `
        return
    }

    // HOME con checklist
    welcome.style.display = "none"
    activeChecklist.style.display = "block"
    title.style.display = "block"
    title.textContent = "Le tue checklist"

    const ul = document.createElement("ul")

    data.forEach((checklist,index)=>{
        const li = document.createElement("li")
        li.innerHTML = `
            <div class="checklist-row">
                <span class="checklist-name">${checklist.name}</span>
                <div class="checklist-actions">
                    <button class="icon-btn" data-action="openChecklist" data-s="${index}">
                        <span class="material-icons play">play_arrow</span>
                    </button>
                    <button class="icon-btn" data-action="deleteChecklist" data-s="${index}">
                        <span class="material-icons delete">delete</span>
                    </button>
                </div>
            </div>
            `
        ul.appendChild(li)
    })

    sportsList.appendChild(ul)
    ul.addEventListener("click",(e)=>{
        const button = e.target.closest("button")
        if(!button) return

        const action = button.dataset.action
        const sIndex = Number(button.dataset.s)

        if(action === "openChecklist"){
            activeChecklistIndex = sIndex
            render()
        }

        if(action === "deleteChecklist"){
            data.splice(sIndex,1)
            save()
            render()
        }
    })
}

// ---------- CHECKLIST APERTA ----------
function renderChecklist(){
    const checklist = data[activeChecklistIndex]

    welcome.style.display = "none"
    activeChecklist.style.display = "block"
    title.style.display = "block"
    title.textContent = "📋 Checklist: " + checklist.name
    sportsList.innerHTML = ""

    renderCategories(checklist)
    updateActionMenuButtons()
}

// ---------- CATEGORIE ----------
function renderCategories(checklist){
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
                    <input class="check"
                    type="checkbox"
                    ${item.done ? "checked":""}
                    data-action="toggleItem"
                    data-c="${cIndex}"
                    data-i="${iIndex}">
                    ${item.name}
                </div>

                <div>
                    <span class="material-icons delete"
                    data-action="deleteItem"
                    data-c="${cIndex}"
                    data-i="${iIndex}">
                    delete
                    </span>
                </div>
                `
            fragment.appendChild(itemLi)
        })
    }
})

    sportsList.appendChild(fragment)
}

// ---------- Eventi lista ----------
    sportsList.addEventListener("click", (e)=>{

    const button = e.target.closest("[data-action]")
    if(!button) return

    const action = button.dataset.action
    const cIndex = Number(button.dataset.c)
    const iIndex = Number(button.dataset.i)

    if(action === "toggleCategory") toggleCategory(activeChecklistIndex,cIndex)
    if(action === "deleteCategory") deleteCategory(activeChecklistIndex,cIndex)
    if(action === "addItem") addItemModal(activeChecklistIndex,cIndex)
    if(action === "toggleItem") toggleItem(activeChecklistIndex,cIndex,iIndex)
    if(action === "deleteItem") deleteItem(activeChecklistIndex,cIndex,iIndex)

})

// ---------- Back Home ----------
    backToHome.onclick = () => {

    activeChecklistIndex = null
    render()

}

// ---------- Operazioni ----------
function toggleCategory(s,c){
    data[s].categories[c].open = !data[s].categories[c].open
    save()
    render()
}

function deleteCategory(s,c){
    data[s].categories.splice(c,1)
    save()
    render()
}

function toggleItem(s,c,i){
    data[s].categories[c].items[i].done =
        !data[s].categories[c].items[i].done
    save()
}

function deleteItem(s,c,i){
    data[s].categories[c].items.splice(i,1)
    save()
    render()
}

// ---------- Modali ----------
function addCategoryModal(sIndex){
    closeActionMenu()
    openModal(`
        <h2>Aggiungi categoria</h2>
        <input id="newCategoryName" placeholder="Nome categoria">
        <button id="modalAddCategoryBtn">Aggiungi</button>
    `)

    document.getElementById("modalAddCategoryBtn")
    .addEventListener("click", ()=>{
        const name = capitalizeFirst(
            document.getElementById("newCategoryName").value.trim()
        )

        if(!name) return

        data[sIndex].categories.push({
            name,
            items:[],
            open:true
        })

        save()
        render()
        closeModal()
    })
}

function addItemModal(sIndex,cIndex){

    closeActionMenu()
    openModal(`
    <h2>Aggiungi oggetto</h2>
    <input id="newItemName" placeholder="Nome oggetto">
    <button id="modalAddItemBtn">Aggiungi</button>
    `)

    document.getElementById("modalAddItemBtn")
    .addEventListener("click", ()=>{
        const name = capitalizeFirst(
            document.getElementById("newItemName").value.trim()
        )

        if(!name) return

        data[sIndex].categories[cIndex].items.push({
            name,
            done:false
        })

        save()
        render()
        closeModal()
    })
}

function loadTemplateModal(){
    closeActionMenu()

    const templateNames = Object.keys(ChecklistTemplates)
    const options = templateNames.map(name =>
        `<option value="${name}">${name}</option>`
    ).join("")

    openModal(`
        <h2>Carica template</h2>
        <select id="templateSelect">
            ${options}
        </select>
        <button id="modalLoadTemplateBtn">Carica</button>
    `)

    document.getElementById("modalLoadTemplateBtn").addEventListener("click", ()=>{
        const selected = document.getElementById("templateSelect").value
        const template = ChecklistTemplates[selected]

        if(!template) return
        data.push(JSON.parse(JSON.stringify(template)))

        save()
        render()
        closeModal()
    })
}

// ---------- Pulsanti FAB ----------
document.getElementById("addCategoryBtn").addEventListener("click", ()=>{
    if(activeChecklistIndex !== null){
        addCategoryModal(activeChecklistIndex)
    }
})
document.getElementById("loadTemplateBtn").addEventListener("click", ()=>{
    loadTemplateModal()
})

// ---------- UI ----------
function updateActionMenuButtons(){

    const hasActiveChecklist = activeChecklistIndex !== null

    const addCatBtn = document.getElementById("addCategoryBtn")
    const addItemBtn = document.getElementById("addItemBtn")
    const backToHomeBtn = document.getElementById("backToHomeBtn")

    if(addCatBtn)
    addCatBtn.classList.toggle("hidden", !hasActiveChecklist)

    if(addItemBtn)
    addItemBtn.classList.toggle("hidden", !hasActiveChecklist)

    if(backToHomeBtn)
    backToHomeBtn.classList.toggle("hidden", !hasActiveChecklist)
}

// ---------- Utility ----------
function capitalizeFirst(text){
    if(!text) return ""
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

// ---------- Init ----------
    render()