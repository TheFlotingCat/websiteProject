from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
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

    def __init__(self, name: str, score: int):
        presenting_ids = [element.id for element in session.query(Users).filter()]

        if not presenting_ids:
            new_id = 1
        else:
            new_id = max(presenting_ids) + 1

        self.id = new_id
        self.name = name
        self.score = score

    def __str__(self):
        return f'{self.id}, {self.name}, {self.score}'
