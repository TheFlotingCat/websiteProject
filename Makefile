all: build run

build:
	pip install -r requirements.txt

run:
	python3 src/main.py

clear:
	rm src/database.db
