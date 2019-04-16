var m = require("mithril");
var showdown = require("showdown");

var converter = new showdown.Converter()

var Editor = {
	oninit: function(vnode) {
		vnode.state.md = '';
		vnode.state.html = '';
		vnode.state.timer = 0;
		vnode.state.status = "OK";
	},
	view: function(vnode) {
		return [
			m("textarea", {
				oninput: function(e) {
					vnode.state.md = e.target.value;
					if (vnode.state.timer === 0) {
						vnode.state.status = "Rendering...";
						vnode.state.timer = setTimeout(function() {
							vnode.state.html = converter.makeHtml(vnode.state.md);
							vnode.state.timer = 0;
							vnode.state.status = "OK";
							m.redraw()
						}, 100);
					}
				}
			}),
			m("div.result", m.trust(vnode.state.html)),
			m("div.status", vnode.state.status)
		]
	}
}

var MainPage = {
	view: function(vnode) {
		return m("div.editor", m(Editor));
	}
}

m.route(document.getElementById("app"), "/", {
	"/": MainPage
});
