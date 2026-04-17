
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
        return alert("Please enter a title")
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

    //call the title from the Id
    document.getElementById("selectedlisttitle").textContent = list.title

    const entriesContainer = document.getElementById("entriescontainer")
    entriesContainer.innerHTML = ""

    list.entries.forEach(entry => {
        const div = document.createElement("div")
        div.textContent = entry.text
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

document.getElementById("createlistbutton").addEventListener("click",createList)
fetchAllLists()