FROM alpine
COPY ./web/static /static/
COPY ./serve/serve /bin/serve
CMD serve
