var neo4j = require('neo4j')
  , db = new neo4j.GraphDatabase('http://localhost:7474')
  , async = require('async');

module.exports = {
	
	dashboard: function(req, res, next) {
		var swig = {
			title: "Dashboard",
			active: "dashboard",
			employees: []
		};
		
		var cypher = [
			"START n=node(*)",
			"RETURN n"
		].join("\n");
		
		db.query(cypher, {}, function(err, results){
			if (err) next(err);
			async.each(results, function(node, f){
				var emp = node.n.data;
				emp.id = node.n.id;
				swig.employees.push(emp);
				f();
			}, function(err){
				if (err) next(err);
				res.render('dashboard.html', swig);
			});
		});
	},
	
	create: function(req, res, next) {
		var employee = db.createNode({name: req.body.name, job: req.body.job, lunchAndLearn: true});
		employee.save(function(err, n){
			if (err) next(err);
			var swig = {
				title: "Add Employee",
				scripts: ["/scripts/add.js"],
				active: "add"
			};
			res.render('add.html', swig);
		});
	},
	
	add: function(req, res, next) {
		var swig = {
			title: "Add Employee",
			active: "add",
			scripts: ["/scripts/add.js"]
		};
		res.render('add.html', swig);
	},
	
	view: function(req, res, next) {
		var swig = {
			title: "View Employee",
			active: "view",
			scripts: ["/scripts/edit.js", "/scripts/search.js"]
		}
		if (req.params.id) {
			db.getNodeById(req.params.id, function(err, node){
				if (err) next(err);
				var emp = node.data;
				emp.id = node.id;
				swig.employee = emp;
				res.render('view.html', swig);
			});
		} else {
			res.render('view.html', swig);
		}
	},
	
	edit: function(req, res, next) {
		db.getNodeById(req.params.id, function(err, node){
			var data = node.data
			data.id = node.id;
			async.each(Object.keys(data), function(prop, f){
				if (req.body[prop]) data[prop] = req.body[prop];
				node.save(function(err, n){
					if (err) next(err);
					f();
				});
			}, function(err){
				if (err) next(err);
				var swig = {
					title: "View Employee",
					active: "view",
					scripts: ["/scripts/edit.js", "/scripts/search.js"],
					employee: data
				};
				res.render('view.html', swig);
			});
		});
	},
	
	query: function(req, res, next) {
		var cypher = [
			"START n=node(*)",
			"WHERE n.name =~ '" + req.params.name + ".*'",
			"RETURN n"
		].join("\n");
		var employees = [];
		
		db.query(cypher, {}, function(err, results){
			if (err) next(err);
			async.each(results, function(node, f){
				var emp = node.n.data;
				emp.id = node.n.id;
				employees.push(emp);
				f();
			}, function(err){
				if (err) next(err);
				res.send(200, employees);
			});
		});
	}
	
}
