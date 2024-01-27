from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, relationship, Mapped
from sqlalchemy.schema import Column
from sqlalchemy.types import Integer, String
from uuid import uuid4


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

    def __init__(self, name: str, score: int, password: str):
        presenting_ids = [element.id for element in session.query(Users).all()]

        if not presenting_ids:
            new_id = 1
        else:
            new_id = max(presenting_ids) + 1

        self.id = new_id
        self.name = name
        self.score = score
        self.password = password

    def __str__(self):
        return f'{self.id}, {self.name}, {self.score}'


class Tokens(Base):
    __tablename__ = 'tokens'

    id = Column(Integer, primary_key=True)
    token = Column('token', String(30))
    user_id: Mapped["Users"] = relationship(back_populates='id')

    def __init__(self, user_id: int):
        all_elements = session.query(Tokens).all()
        presenting_ids = [element.id for element in all_elements]
        presenting_tokens = [element.token for element in all_elements]

        if not presenting_ids:
            new_id = 1
        else:
            new_id = max(presenting_ids) + 1

        while (token := uuid4()) in presenting_tokens:
            pass

        self.id = new_id
        self.token = token
        self.user_id = user_id

    def __str__(self):
        return f'{self.id}, {self.token}, {self.user_id}'


if __name__ == '__main__':
    Base.metadata.create_all(engine)
