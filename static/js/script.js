/**

 * Redirects user to certain page. If no page is given, it will redirect user to home page (/).

 *

 * @param {string} to - Path to the page.

 *

 * @example

 * redirection("/quiz") //redirects to quiz page

 */
async function redirection(to = "/") {
    if (to === "/signup" && sessionStorage.getItem("token") !== null) {
        return
    }
    window.location.replace(to);
}


async function get_text_by_id(id) {
    let value = document.getElementById(id).value;
    if (value === "") {
        return null
    }
    return value
}


async function authentication(type) {
    let username = await get_text_by_id("name");
    let password = await get_text_by_id("password");
    let url;

    console.log(username, password);

    if (username === null) {
        await add_text_element_on_page("Username is required", "error_message");
        return null
    } else if (password === null) {
        await add_text_element_on_page("Password is required", "error_message");
        return null
    }
    
    if (type === "login") {
        url = "login/check";
    } else {
        url = "signup/check";
    }

    let response = await fetch(url, {
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
            return json
        })
        .catch(error => console.error(error));
    
    return response
}


async function add_text_element_on_page(text, id) {
    let element = document.createTextNode(text);
    let space_for_element = document.getElementById(id);

    space_for_element.appendChild(element);
}


async function clear_field(field_id) {
    let field = document.getElementById(field_id);
    field.innerHTML = "";
}


async function signup() {
    await clear_field("error_message");

    let response = await authentication("signup");

    if (response === null) {
        return
    }

    if (response["already present"] === 0) {
        await add_text_element_on_page("User with this username doesn't exist, log in firstly", "error_message");
    } else if (response["password"] === 0) {
        await add_text_element_on_page("Wrong password", "error_message");
    } else {
        sessionStorage.setItem("token", response["token"]);
        await redirection();
    }
}


async function add_video_on_page(path, id) {
    let video = document.createElement("video");
    video.src = path;
    video.autoplay = true;
    video.width = 500;

    let br = document.createElement("br");

    let space_for_element = document.getElementById(id);

    space_for_element.appendChild(br);

    space_for_element.appendChild(video);
}


async function login() {
    await clear_field("error_message");

    let response = await authentication("login");

    if (response === null) {
        return
    }
    
    if (response["created"] === 0) {
        await add_text_element_on_page("User with this username already exists", "error_message");
    } else {
        await redirection();
    }
}


async function get_chosen_answer_by_name_for_checkbox(name) {
    let element = document.getElementsByName(name);
    let chosen_answers = [];

    for (let checkbox of element) {
        if (checkbox.checked) {
            chosen_answers.push(checkbox.value);
        }
    }

    return chosen_answers
}


async function get_chosen_answer_by_name_for_radio(name) {
    let element = document.getElementsByName(name);

    for (let checkbox of element) {
        if (checkbox.checked) {
            return checkbox.value;
        }
    }

    return null
}


function load_results() {
    let token = sessionStorage.getItem('token');

    console.log(token);

    fetch("/results", {
        method: "GET",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            "token": token
        },
    })
        .then((response) => {
            document.write(response);
        })
        .catch(error => console.error(error));
}


async function submit_answers() {
    await clear_field("score");
    await clear_field("error_message");

    let first_answer = await get_text_by_id("selection-first");
    let second_answer = await get_chosen_answer_by_name_for_checkbox("compiled_lang");
    let third_answer = await get_chosen_answer_by_name_for_radio("rust");
    let forth_answer = await get_text_by_id("C");
    let fifth_answer = await get_chosen_answer_by_name_for_radio("book");
    let sixth_answer = await get_chosen_answer_by_name_for_radio("python");
    let seventh_answer = await get_chosen_answer_by_name_for_checkbox("functional_prog");
    let eight_answer = await get_text_by_id("layout");
    let ninth_answer = await get_chosen_answer_by_name_for_radio("best_girl");
    let tenth_answer =  await get_text_by_id("selection-last");

    let answers = [first_answer, second_answer, third_answer, forth_answer, fifth_answer,
    sixth_answer, seventh_answer, eight_answer, ninth_answer, tenth_answer]

    let present_answers = answers.map((element) => (!(element === null) && element.length != 0));

    let token = sessionStorage.getItem("token");

    if (present_answers.includes(false)) {
        await add_text_element_on_page("All quiz fields are required", "error_message");
        return
    }

    let response = await fetch("/quiz/check", {
        method: "POST",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Token": token
        },
        body: JSON.stringify({
            values: answers,
        })
    })
        .then(response => response.json())
        .then(json => {
            console.log(json);
            return json
        })
        .catch(error => console.error(error));

    if (response["sign in"] === 1) {
        await redirection("/signup_error");
        return
    }

    await add_text_element_on_page("Your score is " + response["score"], "score");

    if (response["score"] < 5) {
        await add_video_on_page("/static/videos/premitivniye.mp4", "score");
    } else if (response["score"] < 8) {
        await add_video_on_page("/static/videos/somnitelno.mp4", "score");
    } else {
        await add_video_on_page("/static/videos/kruto.mp4", "score");
    }
}
