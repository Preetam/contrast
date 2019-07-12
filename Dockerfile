FROM alpine
COPY ./serve/serve /bin/serve
COPY ./web/static /static/
CMD serve
