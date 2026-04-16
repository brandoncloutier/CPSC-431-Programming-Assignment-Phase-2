
//precondition: call the route first
//postcondition: returns all the list the user fetches
async function fetchAllLists() {
    //call the lists to get all the information
    const response = await fetch("/api/lists")
    const lists = await response.json()
    
    const container = document.getElementById("listscontainer")
    container.innerHTML = " "

    lists.forEach(list => {
        const div = document.createElement("div")
        div.textContent = list.title
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
        header: {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify({
            title
        })
    })

    //once user is done typing put it back to empty
    input.value = " "
    fetchAllLists()
}

document.getElementById("createlistbutton").addEventListener("click",createList)
fetchAllLists()