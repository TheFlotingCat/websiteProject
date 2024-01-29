from typing import Annotated
import uvicorn
from sqlalchemy.orm import sessionmaker
from api_classes import TestAnswers, User
from fastapi import FastAPI, Header
from database_init import Users, Tokens, engine, QuizAnswers
from fastapi.responses import FileResponse, JSONResponse, HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from jinja2 import Environment, PackageLoader, select_autoescape
from uuid import uuid4


app = FastAPI()

app.mount('/static', StaticFiles(directory='static', html=True), name='static')

ANSWERS = []

session = sessionmaker(bind=engine)()

environment = Environment(
    loader=PackageLoader('static'),
    autoescape=select_autoescape()
)


@app.get('/')
async def home():
    return FileResponse('static/html/index.html')


@app.get('/favicon.ico')
async def favicon():
    return FileResponse('static/images/favicon.ico')


@app.get('/signup')
async def signin():
    return FileResponse('static/html/signup.html')


@app.get('/login')
async def signin():
    return FileResponse('static/html/login.html')


@app.post('/signup/check')
async def authentication(user: User):
    result = session.query(Users).filter(Users.name == user.name).all()

    if not result:
        return JSONResponse({'info': f'User {user.name} not registered, cannot sign up.', 'token': 0,
                             'already present': 1})

    found_user = result[0]

    if user.password != found_user.password:
        return JSONResponse({'info': 'Wrong password.', 'token': 0})

    if found_user.token:
        return JSONResponse({'info': f'User {user.name} already have token.', 'token': 0, 'already present': 0})

    token = uuid4().hex

    found_user.token = Tokens(token=token, user_id=found_user.id)
    session.commit()

    return JSONResponse({'info': 'Generated token for user', 'token': token, 'already present': 0})


@app.post('/login/check')
async def authentication(user: User):
    result = session.query(Users).filter(Users.name == user.name).all()

    if result:
        return JSONResponse({'info': 'User already present, error.', 'created': 0})

    user_in_database_type: Users = Users(
        name=user.name,
        score=user.score,
        password=user.password
    )
    session.add(user_in_database_type)
    session.commit()

    return JSONResponse({'info': f'User {user.name} created.', 'created': 1})


@app.get('/quiz')
async def quiz():
    return FileResponse('static/html/quiz.html')


@app.get('/signup_error')
async def signup_error():
    return FileResponse('static/html/not_signed_up.html')


@app.post('/quiz/check')
async def check_answers(answers: TestAnswers, token: Annotated[str | None, Header()] = None):
    token_result = session.query(Tokens).filter(Tokens.token == token).first()

    print(token_result)

    if token_result is None:
        return RedirectResponse()

    score: int = 0

    for question_number, user_answer in enumerate(answers.values, 1):
        right_answer = str(session.query(QuizAnswers).filter(QuizAnswers.question_number == question_number).first())
        right_or_wrong = True

        if isinstance(user_answer, list):
            for element_of_user_answer in user_answer:
                if element_of_user_answer not in right_answer:
                    right_or_wrong = False
                    break
        else:
            if user_answer not in right_answer:
                right_or_wrong = False

        if right_or_wrong:
            score += 1

    return JSONResponse({'info': 'Test completed', 'score': score})


@app.get('/results')
async def load_results():
    # token_result = session.query().filter(Token.token == token).first()

    # if token_result is None:
    #     return HTMLResponse('/html/not_signed_up.html')

    query_results = session.query(Users).all()

    template = environment.get_template('results.html')

    return HTMLResponse(template.render(users=query_results))


if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=8001)
