package main

import (
	"log"
	"net/http"
	"os"
	"strings"
)

func authHandler(next http.Handler) http.HandlerFunc {
	usersStr := os.Getenv("USERS")
	tokensAndUsers := map[string]string{}
	for _, userAndToken := range strings.Split(usersStr, ",") {
		parts := strings.Split(userAndToken, ":")
		if len(parts) != 2 {
			panic("invalid USERS env var")
		}
		log.Println("Allowing user", parts[0], "with token", parts[1])
		tokensAndUsers[parts[1]] = parts[0]
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token := r.Header.Get("token")
		if tokensAndUsers[token] == "" {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		log.Println("Got token for user", tokensAndUsers[token])
		next.ServeHTTP(w, r)
	})
}

func main() {
	fs := http.FileServer(http.Dir("/static"))
	http.Handle("/", fs)
	http.Handle("/api", authHandler(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

	})))
	http.ListenAndServe(":"+os.Getenv("PORT"), nil)
}
