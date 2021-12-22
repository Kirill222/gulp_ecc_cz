const toggleButton = document.getElementsByClassName("sandwich")[0]
const navigation = document.getElementsByClassName("header-middle")[0]

toggleButton.addEventListener("click", ()=> {   
    navigation.classList.toggle('toggle-menu')
})