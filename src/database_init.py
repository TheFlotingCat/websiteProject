from sqlalchemy import create_engine, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship, Mapped
from sqlalchemy.schema import Column
from sqlalchemy.types import Integer, String


engine = create_engine('sqlite:///database.db', echo=True)

Session = sessionmaker(bind=engine)

session = Session()

Base = declarative_base()


class Users(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    name = Column('name', String(20))
    score = Column('score', Integer)
    password = Column('password', String(20))
    token: Mapped["Tokens"] = relationship(back_populates='user')

    def __str__(self):
        return f'{self.id}, {self.name}, {self.score}'


class Tokens(Base):
    __tablename__ = 'tokens'

    id = Column(Integer, primary_key=True)
    token = Column('token', String(100))
    user: Mapped["Users"] = relationship(back_populates='token')
    user_id = Column(ForeignKey('users.id'))

    def __str__(self):
        return f'{self.id}, {self.token}, {self.user_id}'


class QuizAnswers(Base):
    __tablename__ = 'answers'

    id = Column(Integer, primary_key=True)
    question_number = Column(Integer)
    answer = Column('answer', String(50))

    def __str__(self):
        return f'{self.question_number}: {self.answer}'


def add_quiz_answers_to_db():
    answers_in_db_type = [
        QuizAnswers(question_number=1, answer='20 to 24'),
        QuizAnswers(question_number=2, answer='rust cpp ada'),
        QuizAnswers(question_number=3, answer='no'),
        QuizAnswers(question_number=4, answer='1972'),
        QuizAnswers(question_number=5, answer='do androids dream of electric sheep'),
        QuizAnswers(question_number=6, answer='idk'),
        QuizAnswers(question_number=7, answer='states short lines classes'),
        QuizAnswers(question_number=8, answer='azerty'),
        QuizAnswers(question_number=9, answer='yennefer'),
        QuizAnswers(question_number=10, answer='obvious yes')
    ]
    session.add_all(answers_in_db_type)
    session.commit()


Base.metadata.create_all(engine)
add_quiz_answers_to_db()
