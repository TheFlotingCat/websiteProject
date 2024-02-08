# Website built with FastAPI #

### Tools used for backend ###
- FastAPI - backend logic
- SQLite - database
- SQLalchemy - database management

### Tools used for frontend ###
- Vanila JS (with HTML and CSS) - frontend
- Jinja templates (with HTML) - for creating HTML templates


### To enter virtual environment and install dependencies ###
```shell
python -m venv .venv
source .venv/bin/activate
make build
```

### To run backend ###
```shell
make run
```

### To clear db after run (recommended after every run) ###
```shell
make clear
```
