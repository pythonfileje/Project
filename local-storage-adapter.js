/*
 * Local storage adapter
 * ---------------------
 * On Claude (the published artifact) the page receives a shared database and a
 * signed-in user from `window.claude`. Anywhere else (your computer, GitHub Pages)
 * `window.claude` does not exist, so this file provides the same small API using
 * the browser's localStorage. It does nothing when `window.claude` already exists.
 *
 * Data saved this way stays in the current browser only and is not shared.
 */
(function () {
  if (window.claude) return;

  var KEY = "barangay-local-db";
  var UID_KEY = "barangay-local-uid";
  var listeners = {};

  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }
  function snapshot(c) {
    var col = load()[c] || {};
    return { docs: Object.keys(col).map(function (id) { return { id: id, data: function () { return Object.assign({}, col[id]); } }; }) };
  }
  function emit(c) { (listeners[c] || []).forEach(function (f) { f(snapshot(c)); }); }
  function mutate(c, fn) { var d = load(); d[c] = d[c] || {}; fn(d[c]); save(d); emit(c); }

  var uid;
  try {
    uid = localStorage.getItem(UID_KEY);
    if (!uid) { uid = "local-" + Math.random().toString(36).slice(2, 10); localStorage.setItem(UID_KEY, uid); }
  } catch (e) { uid = "local-user"; }

  var db = {
    collection: function (c) {
      return {
        onSnapshot: function (cb) {
          (listeners[c] = listeners[c] || []).push(cb);
          setTimeout(function () { cb(snapshot(c)); }, 0);
          return function () { listeners[c] = listeners[c].filter(function (f) { return f !== cb; }); };
        },
        add: async function (data) {
          var id = "d" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
          mutate(c, function (x) { x[id] = data; });
          return { id: id };
        }
      };
    },
    doc: function (path) {
      var parts = path.split("/"), c = parts[0], id = parts[1];
      return {
        set: async function (v) { mutate(c, function (x) { x[id] = v; }); },
        update: async function (v) { mutate(c, function (x) { x[id] = Object.assign({}, x[id] || {}, v); }); },
        delete: async function () { mutate(c, function (x) { delete x[id]; }); }
      };
    }
  };

  window.claude = {
    use: async function (name) {
      if (name === "db") return db;
      if (name === "user") return { id: async function () { return uid; }, isOwner: async function () { return false; } };
      return null;
    }
  };
})();
