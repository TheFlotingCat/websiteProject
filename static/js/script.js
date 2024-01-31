/**

 * Redirects user to certain page. If no page is given, it will redirect user to home page (/).

 *

 * @param {string} to - Path to the page.

 *

 * @example

 * redirection("/quiz") //redirects to quiz page

 */
function redirection(to = "/") {
    if (to === "/signup" && sessionStorage.getItem("token") !== null) {
        return
    }
    window.location.replace(to);
}


function get_text_by_id(id) {
    let value = document.getElementById(id).value;
    if (value === "") {
        return null
    }
    return value
}


function authentication(type) {
    let username = get_text_by_id("name");
    let password = get_text_by_id("password");
    let url;

    console.log(username, password);

    if (username === null) {
        add_text_element_on_page("Username is required", "error_message");
        return null
    } else if (password === null) {
        add_text_element_on_page("Password is required", "error_message");
        return null
    }
    
    if (type === "login") {
        url = "login/check";
    } else {
        url = "signup/check";
    }

    fetch(url, {
        method: "POST",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
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
            sessionStorage.setItem("response", json);
        })
        .catch(error => console.error(error));
}


function add_text_element_on_page(text, id) {
    let element = document.createTextNode(text);
    let space_for_element = document.getElementById(id);

    space_for_element.appendChild(element);
}


function clear_field(field_id) {
    let field = document.getElementById(field_id);
    field.innerHTML = "";
}


function signup() {
    clear_field("error_message");

    authentication("signup");

    let response = sessionStorage.getItem("response");

    if (response === null) {
        return
    }

    if (response["already present"] === 0) {
        add_text_element_on_page("User with this username doesn't exist, log in firstly", "error_message");
    } else if (response["password"] === 0) {
        add_text_element_on_page("Wrong password", "error_message");
    } else {
        sessionStorage.setItem("token", response["token"]);
        redirection();
    }
}


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


function login() {
    clear_field("error_message");

    authentication("login");

    let response = sessionStorage.getItem("response");

    if (response === null) {
        return
    }
    
    if (response["created"] === 0) {
        add_text_element_on_page("User with this username already exists", "error_message");
    } else {
        redirection();
    }
}


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


function get_chosen_answer_by_name_for_radio(name) {
    let element = document.getElementsByName(name);

    for (let checkbox of element) {
        if (checkbox.checked) {
            return checkbox.value;
        }
    }

    return null
}


function get_results() {
    let token = sessionStorage.getItem('token');

    console.log(token);

    if (token === undefined) {
        console.log('not defined');
        redirection("/signup_error");
    }

    fetch("http://0.0.0.0:8001/results", {
        method: "GET",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            "token": token
        },
    })
        .then((response) => {
            console.log(response);
            document.write(response);
        })
        .catch(error => console.error(error));
}


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
    let eight_answer = get_text_by_id("layout");
    let ninth_answer = get_chosen_answer_by_name_for_radio("best_girl");
    let tenth_answer =  get_text_by_id("selection-last");

    let answers = [first_answer, second_answer, third_answer, forth_answer, fifth_answer,
    sixth_answer, seventh_answer, eight_answer, ninth_answer, tenth_answer]

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
            "Token": token
        },
        body: JSON.stringify({
            values: answers,
        })
    })
        .then(response => response.text())
        .then(json => {
            console.log(json);
            sessionStorage.setItem("json", json);
        })
        .catch(error => console.error(error));

    let response = JSON.parse(sessionStorage.getItem("json"));

    console.log("response: " + response["signup"]);

    if (response["signup"] === 1) {
        redirection("/signup_error");
        return
    }

    add_text_element_on_page("Your score is " + response["score"], "score");

    if (response["score"] < 5) {
        add_video_on_page("/static/videos/premitivniye.mp4", "score");
    } else if (response["score"] < 8) {
        add_video_on_page("/static/videos/somnitelno.mp4", "score");
    } else {
        add_video_on_page("/static/videos/kruto.mp4", "score");
    }
}
