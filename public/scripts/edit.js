$(function(){
	$("#btn-revert").click(function(e){
		e.preventDefault();
		$.each(["name", "job"], function(i, k){
			$("#" + k).val($("#" + k).attr("data-orig"));
		});
		$("#name").focus();
	});
});
