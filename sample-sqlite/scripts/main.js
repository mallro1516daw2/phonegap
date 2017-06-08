//Based on http://www.html5rocks.com/en/tutorials/webdatabase/todo/

document.addEventListener("deviceready", init, false);
//Activate :active state on device
document.addEventListener("touchstart", function() {}, false);

var app = {};
app.db = null;
      
app.openDb = function() {
   var dbName = "Todo.sqlite";
   if (window.navigator.simulator === true) {
        // For debugin in simulator fallback to native SQL Lite
        console.log("Use built in SQL Lite");
        app.db = window.openDatabase(dbName, "1.0", "Cordova Demo", 200000);
    }
    else {
        app.db = window.sqlitePlugin.openDatabase(dbName);
    }
}
      
app.createTable = function() {
	var db = app.db;
	db.transaction(function(tx) {
		tx.executeSql("CREATE TABLE IF NOT EXISTS todo(ID INTEGER PRIMARY KEY ASC, todo TEXT, added_on DATETIME)", []);
	});
}
      
app.addTodo = function(todoText) {
	var db = app.db;
	db.transaction(function(tx) {
		var addedOn = new Date();
		tx.executeSql("INSERT INTO todo(todo, added_on) VALUES (?,?)",
					  [todoText, addedOn],
					  app.onSuccess,
					  app.onError);
	});
}
      
app.onError = function(tx, e) {
	console.log("Error: " + e.message);
    app.hideOverlay();
} 

app.onSuccess = function(tx, r) {
	app.refresh();
    app.hideOverlay();
}

app.hideOverlay = function() {
    var overlay = document.getElementById("overlay");
    overlay.style.display = "none";    
}

app.showOverlay = function(id) {
    var overlay = document.getElementById("overlay");
	
    overlay.innerHTML = "<div class='row -justify-content-bottom'><div class='col'><button class='button -negative' onclick='app.deleteTodo(" + id + ");'>Delete</button>" + 
        "<button class='button' onclick='app.hideOverlay();'>Cancel</button></div></div>";
    
    overlay.style.display = "block";
}

app.deleteTodo = function(id) {
	var db = app.db;
	db.transaction(function(tx) {
		tx.executeSql("DELETE FROM todo WHERE ID=?", [id],
					  app.onSuccess,
					  app.onError);
	});
}

app.refresh = function() {
	var renderTodo = function (row) {
	    return "<li class='list__item'><i class='list__icon list__icon--check fa fa-check u-color-positive'></i><span class='list__text'>" + row.todo + "</span>" +
            "<a class='delete' href='javascript:void(0);' onclick='app.showOverlay(" + row.ID + ");'><i class='list__icon list__icon--delete fa fa-trash-o u-color-negative'></i></a></li>";
	}
    
	var render = function (tx, rs) {
		var rowOutput = "";
		var todoItems = document.getElementById("todoItems");
		for (var i = 0; i < rs.rows.length; i++) {
			rowOutput += renderTodo(rs.rows.item(i));
		}
      
		todoItems.innerHTML = rowOutput;
	}
    
	var db = app.db;
	db.transaction(function(tx) {
		tx.executeSql("SELECT * FROM todo", [], 
					  render, 
					  app.onError);
	});
}
      
function init() {
    navigator.splashscreen.hide();
	app.openDb();
	app.createTable();
	app.refresh();
}
      
function addTodo() {
	var todo = document.getElementById("todo");
	app.addTodo(todo.value);
	todo.value = "";
}