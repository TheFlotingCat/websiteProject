from typing import Annotated
import uvicorn
from sqlalchemy.orm import sessionmaker
from api_classes import TestAnswers, User
from fastapi import FastAPI, Header, Request
from database_init import Users, Tokens, engine, QuizAnswers
from fastapi.responses import FileResponse, JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from uuid import uuid4


app = FastAPI()

app.mount('/static', StaticFiles(directory='static', html=True), name='static')

ANSWERS = []

session = sessionmaker(bind=engine)()

templates = Jinja2Templates(directory="static/templates")


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
async def login():
    return FileResponse('static/html/login.html')


@app.post('/signup/check')
async def signup_authentication(user: User):
    result = session.query(Users).filter(Users.name == user.name).all()

    if not result:
        return JSONResponse({'info': f'User {user.name} not registered, cannot sign up.',
                             'already present': 0})

    found_user = result[0]

    if user.password != found_user.password:
        return JSONResponse({'info': 'Wrong password.', 'password': 0})

    token = uuid4().hex

    found_user.token = Tokens(token=token, user_id=found_user.id)
    session.add(found_user)
    session.commit()

    return JSONResponse({'info': 'Generated token for user', 'token': token})


@app.post('/login/check')
async def login_authentication(user: User):
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
    print(token)
    token_result = session.query(Tokens).filter(Tokens.token == token).first()

    print(token_result)

    if token_result is None:
        return JSONResponse({'info': 'User is not signed up', 'signup': 1})

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

    user = session.query(Users).join(Tokens).filter(Tokens.token == token).first()

    user.score = score

    return JSONResponse({'info': 'Test completed', 'score': score})


@app.get('/results', response_class=HTMLResponse)
async def load_results(request: Request, token: Annotated[str | None, Header()] = None):
    print('hi')
    print(token)
    print(request)
    token_result = session.query(Tokens).filter(Tokens.token == token).first()

    print(token_result)

    if token_result is None:
        return FileResponse('static/html/not_signed_up.html')

    query_results = session.query(Users).all()

    return templates.TemplateResponse(
        request=request, name='results.html', context={'users': query_results}
    )


if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=8001)
