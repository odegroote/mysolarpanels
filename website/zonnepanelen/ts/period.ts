///<reference path="jquery.d.ts" />

class Period {

	constructor() {
	}
	
	prev() {  
		}

	next() { 
		}

	zoomout(): Period {
		return this; 
		}

	zoomin(val: number): Period {
		return (new Year(val)).adjustTooltips(); 
		}

	getSelectionParameters(): Map<string, number> {
			var parameters: any = {};
			return parameters;
		}

	periodLabel(): string {
			return "";
		}

	label(extra: string, kwh: number): string {

			var label: string = extra;
			
			if (kwh < 1)
				return label + " " + (kwh*1000).toFixed(2) + " wH";
			else
				return label + " " + (kwh).toFixed(2) + " kWh";
		}

	avglabel(extra: string): string {

			return "kWh/kWp: ";

		}

	adjustTooltips(): Period {
		$("a#prev-period").hide();
		$("a#next-period").hide();
		$("#zoomout").hide();
			
		return this;
		}

	isDayView(): boolean {
			return false;
		}

	isMonthView(): boolean {
			return false;
		}

	isYearView(): boolean {
		return false;
	}

}

class Year extends Period {

	private year: number;
	
	constructor(dt: number) {
		super();
		this.year = dt;
	}
	
	getYear(): number {
		return this.year;
	}
	
	prev() {  
		this.year--;
	}

	next() { 
		this.year++;
	}

	zoomout(): Period {
		return (new Period()).adjustTooltips();
	}

	zoomin(val: number):Period { 
		return (new Month(this.getYear(), val)).adjustTooltips();
		}

	getSelectionParameters(): Map<string, number> {
			var parameters: any = {};
			parameters['year']=this.getYear();

			return parameters;
		}

	periodLabel(): string {
			var label = "";
			label += this.getYear();
			return label;
		}

	avglabel(extra: string): string {

			var label = "day average per month: ";

			return label + extra;
		}

	adjustTooltips():Period {
			$("a#prev-period").show();
			$("a#next-period").show();
			$("#zoomout").show();
			
			return this;
		}
		
	isYearView(): boolean {
		return true;
	}
}

class Month extends Year{

	private month: number;
	
	constructor(year: number, month: number) {
		super(year);
		this.month = month;
	}
	
	getYear(): number {
		return super.getYear();
	}
	
	getMonth(): number {
		return this.month;
	}
	
	prev() {  
			this.month--;
			if (this.month < 1) {
				this.month = 12;
				super.prev();
			}
		}

	next() { 
			this.month++;
			if (this.month > 12) {
				this.month = 1;
				super.next();
			}
		}

	zoomout():Period { 
		return (new Year(this.getYear())).adjustTooltips();
		}

	zoomin(val: number) { 
		return (new Day(this.getYear(), this.month,val)).adjustTooltips();
		}

	getSelectionParameters(): Map<string, number> {
			var parameters: any = {};

			parameters['year']=this.getYear();
			parameters['month']=this.month;

			return parameters;
		}

	periodLabel(): string {
			var label = "";
			label += this.getYear();
			label = this.month + "-" + label;
			return label;
		}

	avglabel(extra: string): string {

			return "day average: ";

		}

	isMonthView(): boolean {
			return true;
		}
}

class Day extends Month{

	private day: number;
	

	constructor(year: number, month: number, day: number) {
		super(year, month);
		this.day = day;
	}
	
	getYear(): number {
		return super.getYear();
	}
	
	getMonth(): number {
		return super.getMonth();
	}
	
	getDay(): number {
		return this.day;
	}

	prev() {  
			this.day--;
			if (this.day < 1) {
				this.day = 31;
				super.prev();
			}
		}

	next() { 
			this.day++;
			if (this.day > 31) {
				this.day = 1;
				super.next();
			}
		}

	zoomout():Period { 
		return (new Month(this.getYear(), this.getMonth())).adjustTooltips();
		}

	zoomin(val: number): Period {
		return this; 
		}

	getSelectionParameters(): Map<string, number> {
			var parameters: any = {};
			parameters['year']=this.getYear();
			parameters['month']=this.getMonth();
			parameters['day']=this.day;

			return parameters;
		}

	periodLabel(): string {
			var label = "";
			label += this.getYear();
			label = this.getMonth() + "-" + label;
			label = this.day + "-" + label;
			return label;
		}

	avglabel(extra: string): string {

			return "hour average: " + extra;

		}

	isDayView(): boolean {
			return false;
		}

	isMonthView(): boolean {
			return false;
		}
}