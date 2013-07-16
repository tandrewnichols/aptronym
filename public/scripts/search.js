(function($, aptronym, undefined){
	$(function(){
		var emps = {};
		// Initialize typeaheads for authors and other keys
		$("#search").typeahead({
			source: function(query, process){
				$.getJSON('/query/' + query, function(data){
					console.warn(data);
					_.each(data, function(element, index, list){
						emps[data[index].name] = element;
					});
					process(_.pluck(data, 'name'));
				});
			}
		});
		
		$("#btn-go").click(function(e){
			e.preventDefault();
			var val = $("#search").val();
			if (emps[val]) {
				var url = '/employee/' + emps[val].id;
				aptronym.ajaxRequest(url, 'GET');
			}
		});
	});
})(jQuery, (window.aptronym = window.aptronym || {} ));
