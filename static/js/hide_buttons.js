let token = sessionStorage.getItem("token");

console.log(token);

if (token !== null && token !== undefined) {
    document.getElementById("authorisation").innerHTML = "";
}