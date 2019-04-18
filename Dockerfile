FROM alpine
COPY ./web/static /static/
COPY ./serve /bin/serve
CMD serve
