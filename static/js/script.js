/**

 * Redirects user to certain page. If no page is given, it will redirect user to home page (/).

 *

 * @param {string} to - Path to the page.

 *

 * @example

 * redirection("/quiz") //redirects to quiz page

 */
async function redirection(to = "/") {
    window.location.replace(to);
}


/**

 * Gets username from auth/check page. Sends request with name to server.

 */
async function get_username() {
    let username = document.getElementById("name").value;
    let password = document.getElementById("password").value;
    sessionStorage.setItem("name", username);

    let response;

    fetch("/auth/check", {
        method: "POST",
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify({
            name: username,
            score: 0,
            password: password,
        })
    })
        .then(response => response.json())
        .then(json => {
            console.log(json);
            response = json;
        })
        .catch(error => console.error(error));

    // if (response["created"] === 1) {
    //     await redirection();
    // } else {
    // //     handle user-already-present case
    // }
}


/**

 * Submits answers from quiz/check page and submits it on server.

 */
async function submit_answers() {
    let answers = document.getElementsByClassName("submit");

    if (name == null) {
        await redirection();
    } else if (answers != null && answers.results != null && answers.results.length === number_of_questions) {
        fetch("/quiz/check", {
            method: "POST",
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            },
            body: JSON.stringify({
                values: answers,
                name: name
            })
        })
            .then(response => response.json())
            .then(json => console.log(json))
            .catch(error => console.error(error));
    } else {
        console.log("Not all fields were filled.");
    }
}
