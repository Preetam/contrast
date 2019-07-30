FROM golang:alpine AS build-go

COPY ./serve /serve

RUN cd /serve && go build

FROM node AS build-node

COPY web /web

RUN cd /web/static && npm i
RUN cd /web/static && npm run build
RUN mkdir -p /web/static/css
RUN cd /web && node ./node_modules/clean-css-cli/bin/cleancss ./css/style.css -o ./static/css/style.min.css

FROM alpine
COPY --from=build-go /serve/serve /bin/serve
RUN chmod +x /bin/serve
COPY --from=build-node ./web/static /static/
CMD /bin/serve
