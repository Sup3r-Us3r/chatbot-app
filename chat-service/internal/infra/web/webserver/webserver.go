package webserver

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

type WebServer struct {
	Router        chi.Router
	Handlers      map[string]http.HandlerFunc
	WebServerPort string
}

func NewWebServer(webServerPort string) *WebServer {
	return &WebServer{
		WebServerPort: webServerPort,
		Router:        chi.NewRouter(),
		Handlers:      make(map[string]http.HandlerFunc),
	}
}

func (w *WebServer) AddHandler(path string, handler http.HandlerFunc) {
	w.Handlers[path] = handler
}

func (w *WebServer) Start() {
	w.Router.Use(middleware.Logger)

	for path, handler := range w.Handlers {
		w.Router.Handle(path, handler)
	}

	if err := http.ListenAndServe(w.WebServerPort, w.Router); err != nil {
		panic(err.Error())
	}
}
