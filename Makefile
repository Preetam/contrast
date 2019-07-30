.PHONY: docker-image
docker-image:
	docker build . -t preetamjinka/contrast-notes:latest


.PHONY: push-docker-image
push-docker-image: docker-image
	docker push preetamjinka/contrast-notes:latest
