var m = require("mithril");
var showdown = require("showdown");

var converter = new showdown.Converter()

var Editor = {
	oninit: function(vnode) {
		vnode.state.noteID = m.route.param("id");
		vnode.state.md = '';
		vnode.state.html = '';
		vnode.state.timer = 0;
		vnode.state.status = "OK";


		vnode.state.save = function() {
			localStorage.setItem("note-"+this.noteID, this.md);
		}.bind(vnode.state);

		vnode.state.load = function() {
			this.md = localStorage.getItem("note-"+this.noteID);
			this.html = converter.makeHtml(this.md);
		}.bind(vnode.state);

		vnode.state.load();
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
							vnode.state.status = "Saving...";
							vnode.state.timer = setTimeout(function() {
								vnode.state.save();
								vnode.state.timer = 0;
								vnode.state.status = "OK";

								m.redraw()
							}, 100);
						}, 100);
					}
				}
			}, vnode.state.md),
			m("div.result", m.trust(vnode.state.html)),
			m("div.status", vnode.state.status)
		]
	}
}

var EditorPage = {
	view: function(vnode) {
		return m("div.editor", m(Editor));
	}
}

var MainPage = {
	view: function(vnode) {
		let list = [];
		for (var i = 0; i < localStorage.length; i++) {
			let key = localStorage.key(i);
			if (key.startsWith("note-")) {
				let noteName = key.replace("note-", "");
				list.push(m("li", [
					m("a", {oncreate: m.route.link, href: "/edit/"+noteName}, noteName),
					" ",
					m("a", {onclick: function() {
						if (confirm("Are you sure you want to delete this note?")) {
							localStorage.removeItem(key);
						}
					}}, "Delete"),
				]));
			}
		}
		return [
			m("h1", "Notes"),
			m("ul", list.sort(function(a, b) {
				let x = a.children[0].text.toLowerCase();
				let y = b.children[0].text.toLowerCase();
				if (x < y) {return -1};
				if (x > y) {return 1};
				return 0;
			})),
		];
	},
}

m.route(document.getElementById("app"), "/", {
	"/": MainPage,
	"/edit/:id": EditorPage,
});
