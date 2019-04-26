serve/serve: serve/main.go
	GOARCH=amd64 GOOS=linux go build -o serve/serve serve/main.go

web/static/js/app.min.js:
	cd web/static && npm i
	cd web/static && npm run build

web/static/css/style.min.css: web/static/js/app.min.js
	mkdir -p web/static/css
	cd web && node ./node_modules/clean-css-cli/bin/cleancss ./css/style.css -o ./static/css/style.min.css

.PHONY: docker-image
docker-image: serve/serve web/static/js/app.min.js web/static/css/style.min.css
	docker build . -t preetamjinka/shadow-notes:latest


.PHONY: push-docker-image
push-docker-image: docker-image
	docker push preetamjinka/shadow-notes:latest
