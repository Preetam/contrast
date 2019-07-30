package main

import (
	"net/http"
	"os"
)

func main() {
	fs := http.FileServer(http.Dir("/static"))
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Make sure we're on HTTPS
		if r.Header["X-Forwarded-Proto"][0] == "http" {
			http.Redirect(w, r, "https://"+r.Host+r.RequestURI, http.StatusMovedPermanently)
			return
		}
		fs.ServeHTTP(w, r)
	})
	panic(http.ListenAndServe(":"+os.Getenv("PORT"), nil))
}
