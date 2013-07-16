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
			});
			$("#name").focus();
		});
	});
})(jQuery, (window.aptronym = window.aptronym || {}));
