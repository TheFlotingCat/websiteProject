import uvicorn
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from api_classes import TestAnswers, User
from fastapi import FastAPI
from database_init import Users, Tokens, engine
from fastapi.responses import FileResponse, JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from jinja2 import Environment, PackageLoader, select_autoescape


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


@app.get('/auth')
async def authentication():
    return FileResponse('static/html/auth.html')


@app.post('/auth/check')
async def authentication(user: User):
    result = session.query(Users).filter(Users.name == user.name).all()

    for element in result:
        print(element)

    if result:
        found_user = result[0]
        token_result = session.query(Tokens).filter(Tokens.user_id == found_user.id)

        print('Token result is:')
        for element in token_result:
            print(element)

        if token_result:
            pass
        else:
            Tokens(
                user_id=found_user.id
            )
            token_result = session.query(Tokens).filter(Tokens.user_id == found_user.id).all()
            print('Second token result is:')
            for element in token_result:
                print(token_result)

        return JSONResponse(content={'info': f'User with {user.name} name already present',
                                     'created': 0, 'token': token_result[0].token})
    else:
        user_in_database_type: Users = Users(user.name, user.score, user.password)
        session.add(user_in_database_type)
        session.commit()

        found_user = result = session.query(Users).filter(Users.name == user.name).all()[0]

        Tokens(
            user_id=found_user.id
        )

        token_result = session.query(Tokens).filter(Tokens.user_id == found_user.id).all()

        print('Non registered token result is:')
        for element in token_result:
            print(token_result)

        return JSONResponse(content={'info': f'new user with {user.name} name was created',
                                     'created': 1})


@app.get('/quiz')
async def quiz():
    return FileResponse('static/html/quiz.html')


@app.post('/quiz/check')
async def check_answers(answers: TestAnswers, user: User):
    print(answers)
    pass


@app.get('/results')
async def load_results():
    query_results = session.query(Users).all()

    template = environment.get_template('results.html')

    return HTMLResponse(template.render(users=query_results))


if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=8001)
