
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
        //pass in to the func parameter if user clicks on a certain list 
        div.onclick = () => fetchById(list._id.toString())
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
    console.log("clicked list id:",id)


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

document.getElementById("createlistbutton").addEventListener("click",createList)
fetchAllLists()