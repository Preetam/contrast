# GCP

action "Setup Google Cloud" {
  uses = "actions/gcloud/auth@master"
  secrets = ["GCLOUD_AUTH"]
}

action "Push image to GCR" {
  needs = ["Setup Google Cloud"]
  uses = "actions/gcloud/cli@master"
  runs = "sh -c"
  args = ["docker push gcr.io/infinitynorm-001/contrast"]
}

action "Setup Cloud Run CLI" {
  needs = ["Push image to GCR"]
  uses = "actions/gcloud/cli@master"
  runs = "sh -c"
  args = ["gcloud components install beta && gcloud components update"]
}

action "Deploy Cloud Run Service" {
  needs = ["Setup Cloud Run CLI"]
  uses = "actions/gcloud/cli@master"
  runs = "sh -c"
  args = ["gcloud beta run deploy contrast --image gcr.io/infinitynorm-001/contrast:latest --platform managed --region us-central1 --memory 128Mi"]
}

# Docker

action "Docker login" {
  uses = "actions/docker/login@master"
  args = ["DOCKER_USERNAME", "DOCKER_PASSWORD"]
  secrets = ["DOCKER_USERNAME", "DOCKER_PASSWORD"]
}

action "Docker build" {
  uses = "actions/docker/cli@86ff551d26008267bb89ac11198ba7f1d807b699"
  args = "build -t preetamjinka/contrast-notes:latest -t gcr.io/infinitynorm-001/contrast:latest ."
  needs = ["Docker login"]
}

action "Docker push" {
  uses = "actions/docker/cli@86ff551d26008267bb89ac11198ba7f1d807b699"
  args = "push preetamjinka/contrast-notes:latest"
  needs = ["Docker build"]
}

workflow "Build and push" {
  on = "push"
  resolves = ["Docker push", "Deploy Cloud Run Service"]
}
