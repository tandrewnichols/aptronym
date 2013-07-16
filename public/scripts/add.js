(function($, aptronym, undefined){
	$(function(){
		$("#btn-reset").click(function(e){
			e.preventDefault();
			$.each(["name", "job"], function(i, k){
				$("#" + k).val('');
			});
			$("#name").focus();
		});
	});
})(jQuery, (window.aptronym = window.aptronym || {} ));
