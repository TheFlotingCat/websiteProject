/**

 * Redirects user to certain page. If no page is given, it will redirect user to home page (/).

 *

 * @param {string} to - Path to the page.

 *

 * @example

 * redirection("/quiz") //redirects to quiz page

 */
function redirection(to = "/") {
    window.location.replace(to);
}


/**

 * Returns text in HTML element by its ID

 *

 * @param {string} id - Element's ID

 *

 * @example

 * get_text_by_id("quiz") //returns text of element with ID "quiz"

 */
function get_text_by_id(id) {
    let value = document.getElementById(id).value;
    if (value === "") {
        return null
    }
    return value
}


/**

 * Sends sign in/sign up request to server.

 *

 * @param {('signup'|'signin')} type - Sets url for request.

 */
function authentication(type) {
    let username = get_text_by_id("name");
    let password = get_text_by_id("password");
    let url;
    let response;

    console.log(username, password);

    if (username === null) {
        clear_field("error_message");
        add_text_element_on_page("Username is required", "error_message");
        return null
    } else if (password === null) {
        clear_field("error_message");
        add_text_element_on_page("Password is required", "error_message");
        return null
    }
    
    if (type === "signin") {
        url = "/signin/check";
    } else {
        url = "/signup/check";
    }
    console.log(url);
    fetch(url, {
        method: "POST",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
            name: username,
            score: 0,
            password: password,
        })
    })
        .then(response => response.json())
        .then(response_text => {
            console.log(response_text);
            response = response_text;
        })
        .catch(error => console.error(error));

    console.log("auth "+response);
    return JSON.parse(response)
}


/**

 * Adds text to HTML element by its ID.

 *

 * @param {string} id - Element's ID.
 * @param {string} text - Text to add into element.

 *

 * @example

 * add_text_element_on_page("hi", "hello_field") //adds "hi" into element with "hello_field" ID

 */
function add_text_element_on_page(text, id) {
    let element = document.createTextNode(text);
    let space_for_element = document.getElementById(id);

    space_for_element.appendChild(element);
}


/**

 * Fully clears HTML element by ID.

 *

 * @param {string} field_id - Element's ID.

 *

 * @example

 * clear_field("field_to_clear") //deletes all elements in element with "field_to_clear" ID

 */
function clear_field(field_id) {
    let field = document.getElementById(field_id);
    field.innerHTML = "";
}


/**

 * Signs in user to website.

 */
function signin() {
    clear_field("error_message");

    let username = get_text_by_id("name");
    let password = get_text_by_id("password");

    console.log(username, password);

    if (username === null) {
        clear_field("error_message");
        add_text_element_on_page("Username is required", "error_message");
        return null
    } else if (password === null) {
        clear_field("error_message");
        add_text_element_on_page("Password is required", "error_message");
        return null
    }
    
    fetch("/signin/check", {
        method: "POST",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
            name: username,
            score: 0,
            password: password,
        })
    })
        .then(response => response.json())
        .then(json => {
            if (json === null) {
                return
            }

            if (json["present"] === 0) {
                add_text_element_on_page("User with this username doesn't exist, sign up firstly", "error_message");
            } else if (json["password"] === 0) {
                add_text_element_on_page("Wrong password", "error_message");
            } else {
                sessionStorage.setItem("token", json["token"]);
                redirection();
            }
        })
        .catch(error => console.error(error));
}


/**

 * Adds video on /quiz page to enhance user's experience by truthful and splendid commentaries by Oleg Tinkoff

 *

 * @param {string} path - Path to video file.
 * @param {string} id - Element's ID.

 *

 */
function add_video_on_page(path, id) {
    let video = document.createElement("video");
    video.src = path;
    video.autoplay = true;
    video.width = 500;

    let br = document.createElement("br");

    let space_for_element = document.getElementById(id);

    space_for_element.appendChild(br);

    space_for_element.appendChild(video);
}


/**

 * Signs up user to website

 */
function signup() {
    clear_field("error_message");

    let username = get_text_by_id("name");
    let password = get_text_by_id("password");

    console.log(username, password);

    if (username === null) {
        clear_field("error_message");
        add_text_element_on_page("Username is required", "error_message");
        return null
    } else if (password === null) {
        clear_field("error_message");
        add_text_element_on_page("Password is required", "error_message");
        return null
    }

    fetch("/signup/check", {
        method: "POST",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
            name: username,
            score: 0,
            password: password,
        })
    })
        .then(response => response.json())
        .then(json => {
            if (json === null) {
                return
            }

            if (json["created"] === 0) {
                add_text_element_on_page("User with this username already exists", "error_message");
            } else {
                redirection();
            }
        })
        .catch(error => console.error(error));
}


/**

 * Gets HTML checkbox answer(s) by element's name.

 *

 * @param {string} name - Element's name.

 *

 * @example

 * get_chosen_answer_by_name_for_checkbox("quiz") //returns list of answers for checkbox with "quiz" name (can possibly be empty)

 */
function get_chosen_answer_by_name_for_checkbox(name) {
    let element = document.getElementsByName(name);
    let chosen_answers = [];

    for (let checkbox of element) {
        if (checkbox.checked) {
            chosen_answers.push(checkbox.value);
        }
    }

    return chosen_answers
}


/**

 * Gets HTML radio answer by element's name. Returns null if there is no answer.

 *

 * @param {string} name - Element's name.

 *

 * @example

 * get_chosen_answer_by_name_for_radio("quiz") //returns answer for "quiz" element or null if there is no answer

 */
function get_chosen_answer_by_name_for_radio(name) {
    let element = document.getElementsByName(name);

    for (let checkbox of element) {
        if (checkbox.checked) {
            return checkbox.value;
        }
    }

    return null
}


/**

 * Gets and loads results table from server. Or loads not-signed-in page if user is not signed in (has no token)

 */
function get_results() {
    let token = sessionStorage.getItem('token');

    console.log(token);

    if (token === null) {
        console.log('not defined');
        redirection("/signin_error");
    }

    fetch("/results", {
        method: "GET",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            "token": token,
            // "Access-Control-Allow-Origin": "*",
        },
    })
        .then(response => {
            console.log(response);
            return response.text()
        })
        .then(html => {
            console.log(html);
            document.write(html);
        })
        .catch(error => console.error(error));
}


/**

 * Submits answers for quiz, and sends them in server. Then adds result on a screen and adds video commentary to it.

 */
function submit_answers() {
    clear_field("score");
    clear_field("error_message");

    let first_answer = get_text_by_id("selection-first");
    let second_answer = get_chosen_answer_by_name_for_checkbox("compiled_lang");
    let third_answer = get_chosen_answer_by_name_for_radio("rust");
    let forth_answer = get_text_by_id("C");
    let fifth_answer = get_chosen_answer_by_name_for_radio("book");
    let sixth_answer = get_chosen_answer_by_name_for_radio("python");
    let seventh_answer = get_chosen_answer_by_name_for_checkbox("functional_prog");
    let eight_answer = get_text_by_id("layout").toLocaleLowerCase();
    let ninth_answer = get_chosen_answer_by_name_for_radio("best_girl");
    let tenth_answer =  get_text_by_id("selection-last");

    let answers = [first_answer, second_answer, third_answer, forth_answer, fifth_answer,
    sixth_answer, seventh_answer, eight_answer, ninth_answer, tenth_answer]

    console.log(answers);

    let present_answers = answers.map((element) => (!(element === null) && element.length != 0));

    let token = sessionStorage.getItem("token");

    if (present_answers.includes(false)) {
        add_text_element_on_page("All quiz fields are required", "error_message");
        return
    }

    fetch("/quiz/check", {
        method: "POST",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            "token": token,
            "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
            values: answers,
        })
    })
        .then(response => response.json())
        .then(json => {
            console.log(json);

            if (json["signin"] === 1) {
                redirection("/signup_error");
                return
            }

            add_text_element_on_page("Your score is " + json["score"], "score");

            if (json["score"] < 5) {
                add_video_on_page("/static/videos/premitivniye.mp4", "score");
            } else if (json["score"] < 8) {
                add_video_on_page("/static/videos/somnitelno.mp4", "score");
            } else {
                add_video_on_page("/static/videos/kruto.mp4", "score");
            }
        })
        .catch(error => console.error(error));
}
