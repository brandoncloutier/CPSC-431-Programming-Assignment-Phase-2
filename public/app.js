
//variable to keep track of the selected list
let selectedListId = null

//precondition: call the route first
//postcondition: returns all the list the user fetches
async function fetchAllLists() {
    //call the lists to get all the information
    const response = await fetch("/api/lists")
    const lists = await response.json()
    
    const container = document.getElementById("listscontainer")
    container.innerHTML = ""

    //add the data to the listcontainer
    lists.forEach(list => {
        const div = document.createElement("div")
        div.textContent = list.title

        //delete button
        const deleteButton = document.createElement("button")
        deleteButton.textContent = "Delete"
        deleteButton.classList.add("deletebutton")
        deleteButton.onclick = (event) => {
            event.stopPropagation()
            //call function and pass in the parameter
            deleteList(list._id)
        }
        //pass in to the func parameter if user clicks on a certain list 
        div.onclick = () => fetchById(list._id)
        div.onclick = () => {
            const detail = document.getElementById("listdetail")


            if(selectedListId == list._id){
                detail.style.display = "none"
                selectedListId = null
            }
            else {
                document.querySelectorAll("#listcontainer div").forEach(d => {
                    d.classList.remove("selected")
                })
                div.classList.add("selected")
                fetchById(list._id)
            }
        }

        div.appendChild(deleteButton)
        container.appendChild(div)
    })
}

//precondition: user must enter an input
//postcondition: returns a new list that user created
async function createList() {
    const input = document.getElementById("listtitleinput")
    const title = input.value.trim()

    //if user enters nothing then error
    if(!title) {
        return alert("Please enter a title...")
    }

    await fetch("/api/lists", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title
        })
    })

    //once user is done typing put it back to empty
    input.value = ""
    fetchAllLists()
}

//precondition: takes in parameter to retrieve from Db
//postcondition: returns a single list
async function fetchById(id) {
    //TEST: if clicked should show
    console.log("fetching list id:",id)

    //call the lists to only get the Id
    const response = await fetch(`/api/lists/${id}`)
    const list = await response.json()
    //call selectedbyid here to pass in the function addEntry
    selectedListId = id

    //call the title from the Id
    document.getElementById("selectedlisttitle").textContent = list.title

    const entriesContainer = document.getElementById("entriescontainer")
    entriesContainer.innerHTML = ""

    list.entries.forEach(entry => {
        const div = document.createElement("div")

        //status information check (true or false)
        const checkbox = document.createElement("input")
        checkbox.type = "checkbox"
        checkbox.checked = entry.status
        checkbox.classList.add("entrycheckbox")
        checkbox.onclick = () => updateStatus(entry.id, entry.status)

        const text = document.createElement("span")
        text.textContent = entry.text
        text.classList.add("entrytext")

        //once completed check it out
        if(entry.status){
            text.style.textDecoration = "line-through"
            text.style.color = "#aaa"
        }

        //delete button per entry
        const deleteEntryButton = document.createElement("button")
        deleteEntryButton.textContent = "Delete"
        deleteEntryButton.classList.add("deleteentrybutton")
        //calls the function to delete the specific entry id
        deleteEntryButton.onclick = () => deleteEntry(entry.id)


        //div will have two child
        div.appendChild(checkbox)
        div.appendChild(text)
        div.appendChild(deleteEntryButton)

        entriesContainer.appendChild(div)
    })

    document.getElementById("listdetail").style.display = "block"
}

//precondition: takes in parameter to retrieve list they want to delete
//postcondition: returns success
async function deleteList(id) {
    //TEST: if clicked should show
    console.log("deleted list id:",id)

    //call the lists to only get the Id and then the HTTP method delete
    await fetch(`/api/lists/${id}`, {
        method: "DELETE"
    })

    document.getElementById("listdetail").style.display = "none"
    //refresh the lists
    fetchAllLists()
}

//precondition: selectedListId will be used here 
//postcondition: returns the selectedListId information and allows to add entry
async function addEntry() {
    //TEST: if no entry selected then error
    if(!selectedListId){
        return alert("Please select a list first...")
    }

    const input = document.getElementById("entryinput")
    const text = input.value.trim()

    //if they enter an empty text then error
    if(!text){
        return alert("Please enter an entry...")
    }

    //call entries from the Db
    await fetch(`/api/lists/${selectedListId}/entries`, {
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify({
            text
        })
    })

    //reset the input to be empty and call the fetchbyid function to get information for only that Id
    input.value = ""
    fetchById(selectedListId)
}

//precondition: takes in two parameters to get the entry id and the status
//postcondition: returns the updated if it was done or not
async function updateStatus(entryId, currentStatus) {
    //TEST: if no entry selected then error
    if(!selectedListId){
        return alert("Please select a list first...")
    }
    //calling the lists --> entries Id
    await fetch(`/api/lists/${selectedListId}/entries/${entryId}`, {
        method: "PATCH",
        headers: {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify({
            status: !currentStatus
        })
    })
    //call the fetchbyid function
    fetchById(selectedListId)
}

//precondition: takes in one parameter to check for the entry id only
//postcondition: returns the success deletion and the updated entry lists
async function deleteEntry(entryId) {
     //TEST: if clicked should show
    console.log("deleted list id:",entryId)

    //call the lists to only get the Id and then the HTTP method delete
    await fetch(`/api/lists/${selectedListId}/entries/${entryId}`, {
        method: "DELETE"
    })

    //call the fetchbyid function to show only the entries of that list
    fetchById(selectedListId)
}
//whenever these are called, you are now activating the functions
document.getElementById("createlistbutton").addEventListener("click",createList)
document.getElementById("addentrybutton").addEventListener("click",addEntry)
fetchAllLists()