package main

import (
	"net/http"
	"os"
)

func main() {
	fs := http.FileServer(http.Dir("/static"))
	http.Handle("/", fs)
	http.ListenAndServe(":"+os.Getenv("PORT"), nil)
}
