default: test

start:
	docker-compose up

stop:
	docker-compose down

test:
	node_modules/.bin/lab -a @hapi/code -t 100

install:
	npm install

.PHONY: test install start stop