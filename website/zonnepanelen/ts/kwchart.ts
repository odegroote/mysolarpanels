///<reference path="jquery.d.ts" />
///<reference path="period.ts" />

class KwhChart {

	private kwhServiceUrl: string = "http://88.159.81.19/dashboard/data/kwh.php";
	private plt: any;
	private produced: any
	private previousPoint: any = null;

	updateKwh(cp: Period) {
		var kwhchart = this;
		$.getJSON(this.kwhServiceUrl, cp.getSelectionParameters())
			.done(function(data) { 
						kwhchart.plt = kwhchart.plotWithOptions(kwhchart.getSeries(cp.label(" total: ", data.total), cp.avglabel(""), data, cp));
						$("#graphheader").html(" kWh " + cp.periodLabel());
					     })
			.fail(function() { 
						console.log(kwhchart.kwhServiceUrl + " failed");
					     })
		cp.adjustTooltips();
		$("#tooltip").remove();
		this.previousPoint = null;
	}
	
	hover(item: any) {
		if (item ) {
			if (this.previousPoint != item.dataIndex) {
				$("#tooltip").remove();
				this.previousPoint = item.dataIndex;
				var x = item.datapoint[0].toFixed(0), y = item.datapoint[1];
	
				this.showTooltip(item.pageX, item.pageY,
						"<span style='color:black'>" + item.series.label.slice(0, item.series.label.indexOf(':'))  + " = " + y.toFixed(2) + "</span>");
			} else {
			}
		} else {
			$("#tooltip").remove();
			this.previousPoint = null;
		}
	}

	click (cp: Period, event: any, pos: any, item: any) {
		var xas = this.plt.getAxes().xaxis.c2p(pos.x1);
		if (pos.x >= 0) {
			if (!cp.isDayView() == null) {
				cp.zoomin(Math.floor(pos.x));
				this.updateKwh(cp);
			} else {
				$.getJSON("data/dayusage.php", cp.getSelectionParameters())
					.done(function(data) { 	
						var plot: any = $.plot($("#usagechart"), [ 
						{	label: " power draw ",
							data: data.watts,
							yaxis: 1, 
							lines: { show: true, fill: false, steps: false }
						}
						,{	label: "cummulative energy draw( " + data.total + " Wh ):",
							data: data.cumm,
							yaxis: 2, 
							lines: { show: true, fill: false, steps: false }
						}
						], 
						{
							legend: {position: "nw"},
							grid: {clickable: true, hoverable: true},
							xaxes: [ {tickSize: 60, tickFormatter: function (val: number, axis: number) { 
													return val/60 + ":00";}} ],
							yaxes: [ { position: "left"}, { min: this.minCumm(data.cumm)-100, position: "right"} ]
						});
						plot.getYAxes()[1].min = plot.getYAxes()[0].min;
            			plot.draw();
 					})
					.fail(function() { console.log("data/dayusage failed");});
				$('#myModal').modal('show');
			}	
		}
   	}

	private minCumm(cumm: any): number {
		var min = 0;
		for (var i = 0; i< cumm.length; i++) {
			if (cumm[i][1] < min) {
				min = cumm[i][1];
			}
		}

		return min;
	}

	private getSeries(lbl: string, avglbl: string, data: any, cp: Period) {

		var ds = new Array();

		ds.push(
			{	label: lbl,
				stack: (cp.isMonthView() ? true : null),
				data: data.kwh,
				lines: { shows: true, fill: true, steps: true }
			}
			);

		ds.push(
			{	label: avglbl,
				data: data.avgkwh,
				yaxis: (data.month == null ? 2 : 1), 
				lines: { show: true, fill: false, steps: true }
			}
			);

		if (cp.isMonthView()) {
			ds.push(
				{	label: "energy draw:",
					stack: (cp.isMonthView() ? true : null),
					data: data.used,
					lines: { shows: true, fill: true, steps: true }
				}
			);
		}

		return ds;
	}

	private plotWithOptions(series: any) {
		
		return $.plot($("#stackchart"), series, 
		{ 
			grid: {clickable: true, hoverable: true},
			xaxes: [ {tickSize: 1, tickFormatter: function (val: number, axis: number) { return val.toFixed(0)}} ],
			yaxes: [ { min:0, position: "left"}, { min:0, position: "right"} ]
	   	});
	}
	
	private showTooltip(x: number, y: number, contents: string) {
		$('<div id="tooltip">' + contents + '</div>').css( {
			position: 'absolute',
			display: 'none',
			top: y + 5,
			left: x + 5,
			border: '1px solid #fdd',
			padding: '2px',
			'background-color': '#dfeffc',
			opacity: 0.80
		}).appendTo("body").fadeIn(200);
	}
	
}
