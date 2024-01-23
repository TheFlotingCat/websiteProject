import uvicorn
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from api_classes import TestAnswers, User
from fastapi import FastAPI
from database_init import Users
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI()

app.mount('/static', StaticFiles(directory='static', html=True), name='static')

ANSWERS = []

engine = create_engine('sqlite:///database.db', echo=True)
session = sessionmaker(bind=engine)()


@app.get('/')
async def home():
    return FileResponse('static/html/index.html')


@app.get('/auth')
async def authentication():
    return FileResponse('static/html/auth.html')


@app.post('/auth/check')
async def authentication(user: User):
    result = session.query(Users.name == user.name)

    if result.first() is not None:
        return {'info': f'{user.name} is already registered',
                'created': 0}
    else:
        user_in_database_type: Users = Users(user.name, user.score)
        session.add(user_in_database_type)
        return {'info': f'new user with {user.name} name was created',
                'created': 1}


@app.get('/quiz')
async def quiz():
    return FileResponse('static/html/quiz.html')


@app.post('/quiz/check')
async def check_answers(answers: TestAnswers, user: User):
    print(answers)
    pass


@app.get('/results')
async def results():
    return FileResponse('static/html/results.html')


if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=8001)
