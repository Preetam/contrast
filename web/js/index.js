var m = require("mithril");
var showdown = require("showdown");

var converter = new showdown.Converter()

var Editor = {
	oninit: function(vnode) {
		vnode.state.noteID = m.route.param("key");
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
							vnode.state.timer = 0;
							vnode.state.html = converter.makeHtml(vnode.state.md);
							vnode.state.status = "OK";

							m.redraw();
							vnode.state.status = "Saving...";
							vnode.state.timer = setTimeout(function() {
								vnode.state.html = converter.makeHtml(vnode.state.md);
								vnode.state.save();
								vnode.state.timer = 0;
								vnode.state.status = "OK";

								m.redraw();
							}, 10);
						}, 10);
					}
				}
			}, vnode.state.md),
			m("div.result", m.trust(vnode.state.html)),
			m("div.status", vnode.state.status)
		]
	}
}

var NotesList = {
	view: function(vnode) {
		let list = [];
		for (var i = 0; i < localStorage.length; i++) {
			let key = localStorage.key(i);
			if (key.startsWith("note-")) {
				let noteName = key.replace("note-", "");
				list.push(m("li", [
					m("a.sn-note-list-link", {oncreate: m.route.link, href: "/edit/"+noteName}, noteName),
					m("div", [
						m("a.sn-delete-link", {onclick: function() {
							if (confirm("Are you sure you want to delete this note?")) {
								localStorage.removeItem(key);
							}
						}}, "Delete"),
					])
				]));
			}
		}
		list.sort(function(a, b) {
			let x = a.children[0].text.toLowerCase();
			let y = b.children[0].text.toLowerCase();
			if (x < y) {return -1};
			if (x > y) {return 1};
			return 0;
		});
		return m("ul.sn-notes-list", list);
	}
}

var NewNoteForm = {
	oninit: function(vnode) {
		vnode.state.name = "";
		vnode.state.valid = false;
	},
	view: function(vnode) {
		let inputField = m("input.sn-create-input", {
			oninput: function(e) {
				vnode.state.name = e.target.value;
				vnode.state.valid = /^[a-zA-Z0-9-]+$/.test(vnode.state.name);
			}
		});
		let createButton = m("a", {
			class: vnode.state.valid ? "sn-create-link" : "sn-create-link sn-create-link-disabled",
			onclick: function() {
				if (!vnode.state.valid) {
					return;
				}
				m.route.set("/edit/:key", {key: vnode.state.name});
			},
		}, "Create");
		return m("div", [
			m("h3", "Create"),
			inputField, " ", createButton,
		])
	},
}

var EditorPage = {
	view: function(vnode) {
		return m("div.editor", m(Editor));
	}
}

var MainPage = {
	view: function(vnode) {
		return m("div.main-page", [
			m("h1", "Notes"),
			m(NotesList),
			m(NewNoteForm),
		]);
	},
}

m.route(document.getElementById("app"), "/", {
	"/": MainPage,
	"/edit/:key": EditorPage,
});
