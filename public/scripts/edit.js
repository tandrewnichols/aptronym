(function($, aptronym, undefined){
	$(function(){		
		$("#btn-revert").click(function(e){
			e.preventDefault();
			$.each(["name", "job"], function(i, k){
				$("#" + k).val($("#" + k).attr("data-orig"));
			});
			$("#name").focus();
		});
		
		$("#new-emp-form").on('xhr-complete', function(e, data){
			$.each(["name", "job"], function(i, k){
				$("#" + k).attr("data-orig", data[k]);
				$("#" + k).attr("value", data[k]);
			});
			$("#name").focus();
			
			aptronym.changeState = false;
			var state = History.getState().data;
			var template = $("html").html();
			state.template = template;
			History.replaceState(state);
		});
	});
})(jQuery, (window.aptronym = window.aptronym || {}));
