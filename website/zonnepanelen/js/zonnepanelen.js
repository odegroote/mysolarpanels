// Set up odometer for total produced
var totalKwh = $('#totalKwh').jOdometer({
                increment: 0, 
                counterStart:'0.0', 
                numbersImage: '/dashboard/zonnepanelen/images/odometer/jodometer-numbers-24pt.png', 
                widthNumber: 32,
                heightNumber: 54,
                spaceNumbers: 0, 
                offsetRight:-10,
                speed:1000,
                delayTime: 300,
                maxDigits: 10,
});

// Setup measurement statistics data

var today = new Date();
var currentPeriod = new Month(today.getFullYear(), today.getMonth());
var kwhChart = new KwhChart();
kwhChart.updateKwh(currentPeriod);


$("#stackchart").bind("plothover", function (event, pos, item) {
	kwhChart.hover(item);
});

$("#stackchart").bind("plotclick", function (event, pos, item) {
	kwhChart.click(currentPeriod, event, pos, item);
});

$("#prev-period").on("click", function(e) { 
					e.preventDefault();
					currentPeriod = currentPeriod.prev();
					kwhChart.updateKwh(currentPeriod); });
$("#next-period").on("click", function(e) { 
					e.preventDefault(); 
					currentPeriod = currentPeriod.next();
					kwhChart.updateKwh(currentPeriod); });
$("#zoomout").on("click", function(e) { 
					e.preventDefault(); 
					currentPeriod = currentPeriod.zoomout();
					kwhChart.updateKwh(currentPeriod); });

//tooltip
$("a#prev-period,a#zoomout,a#next-period").tooltip({"placement":"top",delay: { show: 400, hide: 200 }});

//tabs
$('#modaltabs a:first').tab('show');
$('#modaltabs a').click(function (e) {
  e.preventDefault();
  $(this).tab('show');
});

// Setup timer
setInterval(function() {kwhChart.updateKwh(currentPeriod);}, 60000);

// Setup production buttons
$('#bt-kwh').on('click', 
	function(e) {
		e.preventDefault();
		updateStatistics();
	});

$('#bt-euro').on('click', 
	function(e) {
		e.preventDefault();
		updateStatistics();
	});
