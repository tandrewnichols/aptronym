(function($, aptronym, undefined){
	
	// Setup vars
	var History = window.History,
		current = 0,
		highest = 0
		aptronym.changeState = true;;
	
	// Make sure the browser is compatible with History API	
	if (!History.enabled) {
		return false;
	}
	
	$(function(){
		
		/*
		 * Push initial state to history. This is important to ensure that the back
		 * button transitions content in the correct direction. This does NOT trigger
		 * a second load of the page, so we don't have to mess with detection in the
		 * statechange handler.
		 */
		History.pushState({
			template: $("html").html(), 
			swig: {
				active: $("#top-nav ul li.active").length ? $("#top-nav ul li.active").attr('id').replace('nav-', '') : '',
				title: $("title").html(),
				scripts: $("#main-inner").attr("data-scripts").split(',')
			}, 
			id: 0
		}, $("title").html(), window.location.href);
		
		/*
		 * Handles rendering of templates and decides on the correct slide direction,
		 * based on the history id, when loading 'new' pages. 
		 */
		$(window).bind('statechange', function(e){
			if (!aptronym.changeState) {
				aptronym.changeState = true;
				return;
			}
			var dir = 'left';
			var reverse = 'right';
			var data = History.getState().data;
			if (data.id < current) {
				dir = 'right';
				reverse = 'left';
			}
			current = data.id;
			render(data, {direction: dir}, {direction: reverse});
		});
		
		/*
		 * When any ajax button is clicked, we want to navigate to the appropriate page
		 * via ajax content loading and history.js. So we get the url and method, see if
		 * there's a deferred form, and then either submit the form with a redirect to
		 * the new page, or get the template and push the new state to history.
		 */
		$(document).on('click', '.ajax-btn', function(e){
			e.preventDefault();
			var url = $(this).attr('data-url') || $(this).attr('href');
			var method = $(this).attr('data-method') || 'GET';
			ajaxRequest(url, method.toUpperCase());
		});
		
		/*
		 * Generalized handler for ajax requests.
		 */	
		var ajaxRequest = window.aptronym.ajaxRequest = function (url, method, data, opts) {
			if (!url || !method) return;
			var defaults = {
				url: url,
				type: method,
				dataType: 'json',
				success: function(data){
					data.id = ++highest;
					History.pushState(data, data.swig.title, url);
				},
				error: function(data) {
					console.log(data);
				},
				data: {}
			};
			var options = $.extend({}, defaults, opts);
			$.ajax(options);
		};
		
		/*
		 * Render a template returned by the server.
		 */
		var render = aptronym.render = function (data, hide, show) {
			// First, hide the existing template
			$('#main-inner').hide('slide', hide, 500, function(){
				// jQueryify the new template
				var template = $(data.template);
				// Find the content we want to display. Sometimes the entirety of the template
				// is the #main-inner div, but if it's not, we select only that
				var inner = template.attr('id') == "main-inner" ? template : template.find("#main-inner");
				
				var upload = inner.find("#upload-complete");
				if (upload.length) upload.remove();
				// Hide that div so we can transition it in
				inner.hide();
				// Remove the existing template
				$('#main').empty().append(inner);
				// Fade in the new template
				$("#main-inner").show('slide', show, 500, function(){
					// Important to do this here as a callback, otherwise,
					// the content isn't ready when all the events are bound
					// by the script
					if (data.swig.scripts) {
						$.each(data.swig.scripts, function(i, s){
							$.getScript(s);
						});
					}
				});
				// Update the top navigation
				if ($("#top-nav ul li.active").length) $("#top-nav ul li.active").removeClass("active");
				$("#nav-" + data.swig.active).addClass("active");
			});
		};
		
		/*
		 * When an ajax form is submitted, we want to do it via ajax if possible.
		 * Some browsers can't handle files via ajax, so in those cases, we'll just
		 * submit the form (or a pending deferred form) per normal.
		 */
		$(document).on('submit', '.ajax-form', function(e){
			// If we can, submit the form through ajax; otherwise, let it submit normally
			if (window.FormData) {
				e.preventDefault();
				xhrRequest($(this));
			}
		});
		
		/*
		 * Generalized handler for xhr requests
		 */
		var xhrRequest = aptronym.xhrRequest = function (form, opts) {
			if (!form) return;
			var defaults = {
				method: 'POST',
				async: true,
				action: form.attr('action'),
				callback: function(data) {
					var content, alert;
					if (data.success) {
						content = "Data was successfully uploaded to the server.";
						alert = "alert-info";
					} else {
						content = "Office down! " + data.error;
						alert = "alert-danger";
					}
					
					var info = $("<div />", {
						id: "upload-complete",
						"class": "alert " + alert,
					}).append($("<button />", {
						type: "button",
						"class": "close",
						"data-dismiss": "alert",
						html: "&times;"
					})).append(content).insertBefore(form)
					setTimeout(function(){
						$("#upload-complete").fadeOut('slow', function(){
							$("#upload-complete").remove();
						});
					}, 3000);
					
					var reset = form.find("#btn-reset");
					if (reset.length) reset.click();
					$(window).scrollTop(0);
					form.trigger('xhr-complete', data);
				}
			};
			var options = $.extend({}, defaults, opts);
			var data = new FormData(form[0]);
			var xhr = new XMLHttpRequest();
			xhr.open(options.method, options.action, options.async);
			xhr.send(data);
			xhr.onreadystatechange = function() {
				if (xhr.readyState === 4) options.callback(JSON.parse(xhr.responseText));
			}
		}
	});
})(jQuery, (window.aptronym = window.aptronym || {} ));
