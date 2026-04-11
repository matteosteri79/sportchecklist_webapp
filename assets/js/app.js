
// ---------- Service Worker ----------
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("/service-worker.js");
    });
}

// ---------- Import ----------
import { openModal, closeModal } from "./modal.js"

// ---------- Elementi DOM ----------
const sportsList = document.getElementById("sportsList")
const title = document.getElementById("activeChecklistTitle")
const welcome = document.getElementById("welcomeScreen")
const activeChecklist = document.getElementById("activeChecklist")
const backToHome = document.getElementById("backToHomeBtn")

// ---------- Dati ----------
let Templates = []
async function loadTemplates(){
    const res = await fetch("assets/data/templates.json")
    const json = await res.json()
    Templates = json.templates
}
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

        // 1. CREA CHECKLIST
        const newChecklist = {
            name,
            categories: []
        }

        data.push(newChecklist)
        activeChecklistIndex = data.length - 1

        save()
        render()
        closeModal()

        addCategoryModalAfterCreate(activeChecklistIndex) // 2. APRI SUBITO CREAZIONE CATEGORIA
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
            <img src="assets/images/logo_sportchecklist.png" alt="Benvenuto">
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
    document.getElementById("checklistProgress").classList.add("hidden")

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
    document.getElementById("checklistProgress").classList.remove("hidden")

    renderCategories(checklist)
    updateChecklistProgress(checklist)
    updateActionMenuButtons()
}

// ---------- CATEGORIE ----------
function renderCategories(checklist){
    const fragment = document.createDocumentFragment()

    checklist.categories.forEach((cat,cIndex)=>{
        const done = cat.items.filter(i => i.done).length
        const total = cat.items.length
        const catBlock = document.createElement("li")
        catBlock.className = "category-block"

        if(total > 0 && done === total) {
            catBlock.classList.add("category-complete")
        }
        if(cat.open){
            catBlock.classList.add("open")
        }

        const icon = cat.open ? "keyboard_arrow_up" : "keyboard_arrow_down"

        // crea la categoria
        catBlock.innerHTML = `
<div class="category-header">

    <div class="category-left" data-action="toggleCategory" data-c="${cIndex}">
        <span>${cat.name}</span>
        <span class="category-count">${done}/${total}</span>
        <span class="material-icons arrow" data-action="toggleCategory" data-c="${cIndex}">${icon}</span>
    </div>

    <div class="category-actions">
        <span class="material-icons add" data-action="addItem" data-c="${cIndex}">add</span>
        <span class="material-icons delete" data-action="deleteCategory" data-c="${cIndex}">delete</span>
    </div>

</div>

<ul class="items"></ul>
`

        const itemsContainer = catBlock.querySelector(".items")

        // Popola gli oggetti solo se la categoria è aperta
        if(cat.open && cat.items.length){
            cat.items.forEach((item,iIndex)=>{
                const itemLi = document.createElement("li")
                itemLi.className = "item"
                itemLi.innerHTML = `
<div class="item-content ${item.done ? "done" : ""}">
    <input class="check"
    type="checkbox"
    ${item.done ? "checked":""}
    data-action="toggleItem"
    data-c="${cIndex}"
    data-i="${iIndex}">
    <span class="item-text">${item.name}</span>
</div>

<span class="material-icons delete"
data-action="deleteItem"
data-c="${cIndex}"
data-i="${iIndex}">
delete
</span>
`
                itemsContainer.appendChild(itemLi)
            })
        }

        fragment.appendChild(catBlock)
    })

    sportsList.appendChild(fragment)
}

function addCategoryModalAfterCreate(sIndex){

    openModal(`
        <h2>Crea prima categoria</h2>
        <input id="newCategoryName" placeholder="Nome categoria">
        <button id="modalAddCategoryBtn">Continua</button>
    `)

    document.getElementById("modalAddCategoryBtn")
        .addEventListener("click", ()=>{

            const name = capitalizeFirst(
                document.getElementById("newCategoryName").value.trim()
            )

            if(!name) return

            const newCategory = {
                name,
                items: [],
                open: true
            }

            data[sIndex].categories.push(newCategory)

            save()
            render()
            closeModal()

            // 3. ORA CREA PRIMO ITEM
            addFirstItemModal(sIndex, data[sIndex].categories.length - 1)
        })
}

function addFirstItemModal(sIndex, cIndex){

    openModal(`
        <h2>Aggiungi primo oggetto</h2>
        <input id="newItemName" placeholder="Nome oggetto">
        <button id="modalAddItemBtn">Crea</button>
    `)

    document.getElementById("modalAddItemBtn")
        .addEventListener("click", ()=>{

            const name = capitalizeFirst(
                document.getElementById("newItemName").value.trim()
            )

            if(!name) return

            data[sIndex].categories[cIndex].items.push({
                name,
                done: false
            })

            save()
            render()
            closeModal()
        })
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
    const category = data[s].categories[c]

    category.items[i].done = !category.items[i].done
    save()
    save()

    // 🔥 aggiorna UI item (barrato)
    const itemEl = document.querySelector(
        `.item input[data-c="${c}"][data-i="${i}"]`
    )?.closest(".item-content")

    if(itemEl){
        itemEl.classList.toggle("done", category.items[i].done)
    }

    // Aggiorna contatore della categoria
    const done = category.items.filter(it => it.done).length
    const total = category.items.length

    const catBlock = document.querySelector(`.category-block:nth-child(${c+1})`)
    if(catBlock){
        const counterSpan = catBlock.querySelector(".category-count")
        if(counterSpan){
            counterSpan.textContent = `${done}/${total}`
        }

        catBlock.classList.toggle(
            "category-complete",
            done === total && total > 0
        )
    }

    // Aggiorna progressbar totale checklist
    updateChecklistProgress(data[s])
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

    const templates = Templates.filter(t => t.visible)

    if(!templates.length){
        alert("Nessun template disponibile")
        return
    }

    const options = templates
        .map(t => `<option value="${t.id}">${t.name}</option>`)
        .join("")

    openModal(`
        <h2>Carica checklist</h2>
        <select id="templateSelect">${options}</select>
        <button id="modalLoadTemplateBtn">Carica</button>
    `)

    document.getElementById("modalLoadTemplateBtn").addEventListener("click", () => {
        const selected = document.getElementById("templateSelect").value
        const template = Templates.find(t => t.id === selected)

        if(!template) return

        const newChecklist = {
            name: template.name,
            categories: template.categories.map(cat => ({
                name: cat.name,
                open: true,
                items: cat.items.map(i => ({
                    name: i.name,
                    done: false
                }))
            }))
        }

        data.push(newChecklist)
        activeChecklistIndex = data.length - 1

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

function updateChecklistProgress(checklist){

    let total = 0
    let done = 0

    checklist.categories.forEach(cat=>{
        total += cat.items.length
        done += cat.items.filter(i=>i.done).length
    })

    const percent = total ? Math.round((done/total)*100) : 0
    if(percent === 100){
        document.getElementById("progressComplete").classList.remove("hidden")
        document.getElementById("progressFill").classList.add("progress-complete")
    }
    else
        document.getElementById("progressComplete").classList.add("hidden")

    document.getElementById("progressFill").style.width = percent + "%"

    document.getElementById("progressText").textContent =
        `${done} / ${total} oggetti presi`

    document.getElementById("progressPercent").textContent =
        percent + "%"
}

// ---------- Utility ----------
function capitalizeFirst(text){
    if(!text) return ""
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

// ---------- Init ----------
async function init(){
    await loadTemplates()
    render()
}

init()