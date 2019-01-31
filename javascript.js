class PortfolioPopupForm extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.add = this.add.bind(this);
    }

    add(evt) {
        var list, portfolio, portField;
        portField = document.getElementById("name_id");
        portfolio = document.getElementById("name_id").value;
        if (portfolio.length === 0) {
            alert("The portfolio name is mandatory");
            return;
        }
        if(typeof(Storage) !== "undefined") {
            if (localStorage.portfolios) { // if list already exists
                list = JSON.parse(localStorage.getItem("portfolios")); // retrieves the list (string) from the local storage and parses it into Javascript array

                if (list.length >= 10) { // if list has 10 or more elements
                    alert("You can create only 10 portfolios");
                    return;
                } else if (list.includes(portfolio)) { // already includes the same portfolio
                    portField.value = "";
                    portField.focus();
                    alert("This portfolio already exists");
                    evt.preventDefault();
                    return;
                } else {
                    list.push(portfolio); // adds new element to the end of the list
                }
                localStorage.setItem("portfolios", JSON.stringify(list)); // converts Javascript array (list) into string and stores it into local storage
            } else { // if list does not exist
                //list.unshift(portfolio); // first element of the list
                localStorage.setItem("portfolios", JSON.stringify([portfolio]));
            }
        } else {
            document.getElementById("container").innerHTML = "Sorry, your browser does not support web storage...";
        }
    }
    render() {

        var self = this;
        //this.show();
        var buttonStyle = {};
        if (this.props.disabled) {
            buttonStyle = {cursor: 'none', opacity: 0.3};
        }
        return (
            <div className={this.props.class}>
                <button style={buttonStyle} className="open-button port" disabled={this.props.disabled} data-toggle="modal" data-target="#exampleModalCenter">Add new portfolio</button>
                <div className="modal fade" id="exampleModalCenter" tabIndex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalCenterTitle">Portfolio</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <form className="form-container" id="form1">
                                    <label htmlFor="name_id"><b>name</b></label>
                                    <input type="text" placeholder="Enter portfolio" id="name_id" required/>
                                    <button type="submit" className="btn" onClick={this.add}>Add</button>
                                    <button type="button" className="btn cancel" data-dismiss="modal">Close</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

class StockPopupForm extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.add = this.add.bind(this);
    }

    add(evt) {
        var symbol, quantity, unitvalue, request, numOfPort;
        var portfolio = this.props.portfolio;
        var num = this.props.num;
        var symbolField = document.getElementById("symbol_id"+num);
        symbol = document.getElementById("symbol_id"+num).value.toUpperCase();
        if ( !(/^[a-zA-Z]+$/.test(symbol)) || symbol.length > 4) {
            document.getElementById("symbol_id"+num).focus();
            alert("The symbol must have 1, 2, 3 or 4 letters and only letters");
            evt.preventDefault();
            return true;
        }
        var quantityField = document.getElementById("quantity_id"+num);
        quantity = document.getElementById("quantity_id"+num).value;
        if (!(/^\d+$/.test(quantity))) {
            document.getElementById("quantity_id"+num).focus();
            alert("The quantity must have only digits");
            evt.preventDefault();
            return true;
        }
        quantity = Number(quantity);
        request = "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=" + symbol + "&apikey=37AAP0WVUKV2LA7I";
        var client = new XMLHttpRequest();
        client.open("GET", request, true);
        var list, stock, checklist;
        var key = portfolio;
        if (typeof(Storage) !== "undefined") {
            if (localStorage[key]) { // if list already exists
                list = JSON.parse(localStorage.getItem(key)); // retrieves the list (string) from the local storage and parses it into Javascript array
                checklist = list.map(a => a.symbol);
                if (list.length >= 50) { // if list has 50 or more elements
                    alert("You can create only 50 different stocks in the same portfolio");
                    return;
                } else if (checklist.includes(symbol)) { // already includes the same stock
                    symbolField.value = "";
                    quantityField.value = "";
                    symbolField.focus();
                    alert("This stock already exists");
                    evt.preventDefault();
                    return;
                } else {
                    client.onreadystatechange = function () {
                        if (client.readyState === 4) {
                            var obj = JSON.parse(client.responseText); // Parses the data with JSON.parse(), and the data becomes a JavaScript object.
                            if (!obj || !obj['Global Quote'] || typeof(obj['Global Quote']['02. open']) === "undefined") {
                                alert("There is no stock for the given symbol " + symbol);
                                return;
                            }
                            unitvalue = Number(obj['Global Quote']['02. open']);
                            stock = {};
                            stock["symbol"] = symbol; // creates new element of the list
                            stock["unitvalue"] = unitvalue;
                            stock["quantity"] = quantity;
                            stock["totalvalue"] = unitvalue * quantity;
                            list.push(stock); // adds new element to the end of the list
                            localStorage.setItem(key, JSON.stringify(list)); // converts Javascript array (list) into string and stores it into local storage
                        }
                    };
                }
            } else { // if list does not exist
                client.onreadystatechange = function () {
                    if (client.readyState === 4) {
                        var obj = JSON.parse(client.responseText); // Parses the data with JSON.parse(), and the data becomes a JavaScript object.
                        if (!obj || !obj['Global Quote'] || typeof(obj['Global Quote']['02. open']) === "undefined") {
                            alert("There is no stock for the given symbol " + symbol);
                            return;
                        }
                        unitvalue = Number(obj['Global Quote']['02. open']);
                        stock = {};
                        stock["symbol"] = symbol; // first element of the list
                        stock["unitvalue"] = unitvalue;
                        stock["quantity"] = quantity;
                        stock["totalvalue"] = unitvalue * quantity;
                        localStorage.setItem(key, JSON.stringify([stock]));
                    }
                };
            }
            client.send();
            for (var i = 0; i < 1000000000; i++) ;
        } else {
            document.getElementById("container").innerHTML = "Sorry, your browser does not support web storage...";
        }
    }


    render() {
        var self = this;
        //this.show();
        var num = this.props.num;
        var buttonStyle = {};
        if (this.props.disabled) {
            buttonStyle = {cursor: 'none', opacity: 0.3};
        }
        return (
            <div className={this.props.class}>
                <button style={buttonStyle} className="open-button" disabled={this.props.disabled} data-toggle="modal" data-target={"#exampleModalCenterStock"+num}>Add stock</button>
                <div className="modal fade" id={"exampleModalCenterStock"+num} tabIndex="-1" role="dialog" aria-labelledby={"exampleModalCenterTitleStock"+num} aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id={"exampleModalCenterTitleStock"+num}>Stock</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <form className="form-container" id="formStock">
                                    <label htmlFor="symbol_id"><b>symbol</b></label>
                                    <input type="text" placeholder="Enter stock" id={"symbol_id"+num} required/>
                                    <label htmlFor="quantity_id"><b>quantity</b></label>
                                    <input type="text" placeholder="Enter quantity" id={"quantity_id"+num} required/>
                                    <button type="submit" className="btn" onClick={this.add}>Add</button>
                                    <button type="button" className="btn cancel" data-dismiss="modal">Close</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

class Performance extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.perf = this.perf.bind(this);
    }
    datasets;
    list = [];
    perf(evt){
        var  symbol, quantity, unitvalue, request, numOfPort;
        numOfPort = this.props.num;
        var portfolio = this.props.portfolio;
        //var symbols=["NOK","MSFT","AAPL","MIN","MIC","MIL","MIX","BMV","DAX","SAR","SAS","SIM"];
        var date1=document.getElementById("date1"+numOfPort);
        var date2=document.getElementById("date2"+numOfPort);
        var symbols=this.props.symbols;//["NOK","MSFT","AAPL"];
        var portfolio = this.props.portfolio;
        var d1;//=new Date("2018-12-25");
        var d2;//=new Date("2019-01-02");
        var i;
        document.getElementById("myLargeModalLabel"+numOfPort).innerHTML = portfolio+ " performance";
        d1= date1.value ? date1.value : startDate;
        d2= date2.value ? date2.value : today;
        if (d1 > d2) {
            alert("Starting date must be less than or equal to Ending date");
            evt.preventDefault();
            return;
        }
        //self=this;
        self.datasets=[];
        for(i=0; i<symbols.length; i++) {
            symbol = symbols[i];
            request = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=" + symbol + "&outputsize=full&apikey=37AAP0WVUKV2LA7I";
            var client = new XMLHttpRequest();
            client.open("GET", request, true);
            client.onreadystatechange = (function(client, symbol, i)
            {
                return function () {
                    if (client.readyState === 4) {
                        var obj = JSON.parse(client.responseText); // Parses the data with JSON.parse(), and the data becomes a JavaScript array.
                        if (!obj || !obj['Time Series (Daily)'] || obj['Time Series (Daily)'] === "undefined") {
                            alert("There is no history for symbol " + symbol);
                            return;
                        }
                        var dates = Object.keys(obj["Time Series (Daily)"]).reverse();
                        //var dates = keys.map(a => new Date(a));
                        var dateRange = dates.slice();
                        for (var k = dateRange.length - 1; k >= 0; k--) {
                            if (dateRange[k] > d2 || dateRange[k] < d1) {
                                dateRange.splice(k, 1);
                            }
                        }
                        var first = dates.indexOf(dateRange[0]);
                        var last = dates.indexOf(dateRange[dateRange.length - 1]);
                        var values = Object.values(obj["Time Series (Daily)"]).reverse();
                        var prices = values.map(a => a["4. close"]);
                        var priceRange = prices.slice(first, last + 1);
                        var rgb = "rgb(" + parseInt(255/symbols.length) * i + ", " + parseInt(255/symbols.length) * (symbols.length - i) + ", " + parseInt(255/symbols.length) * i + ")";
                        var dataset = {
                            label: symbol,
                            backgroundColor: rgb,
                            borderColor: rgb,
                            data: priceRange,
                            fill: false
                        };
                        self.datasets.push(dataset);
                        if (self.datasets.length === symbols.length) {
                            Performance.show(dateRange, self.datasets, numOfPort);
                        }
                    }
                };
            }(client, symbol, i));
            client.send();
        }
    }
    static show(dateRange, datasets, numOfPort) {
        var labels = dateRange.map(a => moment(a));
        //document.getElementById("myLargeModalLabel").innerHTML = portfolio;
        var ctx = document.getElementById('myChart'+numOfPort).getContext('2d');
        var chart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'line',

            // The data for our dataset
            data: {
                labels: labels,
                datasets: datasets,
            },
            // Configuration options go here
            options: {
                animation: {
                    duration: 0, // general animation time
                },
                scales: {
                    xAxes: [{
                        type: 'time',
                        /*time: {
                            unit: 'day'
                        }*/
                    }]
                }
            }
        });
    }

    static formatDate(date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    }

    render() {
        var num = this.props.num;
        var today = Performance.formatDate(new Date());
        var startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        startDate = Performance.formatDate(startDate);
        var buttonStyle = {};
        if (this.props.disabled) {
            buttonStyle = {cursor: 'none', opacity: 0.3};
        }
        return (
            <div className={this.props.class}>
                <button type="button" style={buttonStyle} className="open-button perf" disabled={this.props.disabled} data-toggle="modal" data-target={"#myLargeModal"+num} onClick={this.perf}>Perf data</button>

                <div className="modal fade bd-example-modal-xl" id={"myLargeModal"+num} tabIndex="-1" role="dialog" aria-labelledby={"myLargeModalLabel"+num} aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered modal-xl">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id={"myLargeModalLabel"+num}></h5>
                                <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                            </div>
                            <div className="modal-body">
                                <canvas id={"myChart"+num}></canvas>
                            </div>
                            <div className="container">
                                <div className="row justify-content-center">
                                    <div className="col-9 offset-3 col-md-5 offset-md-0 form-check form-check-inline py-1 py-md-0">
                                        <label className="form-check-label" htmlFor={"date1"+num}>Starting time</label>&nbsp;
                                        <input className="form-check-input" type="date" id={"date1"+num} defaultValue={startDate} min="1998-01-02" max={today}/>
                                    </div>
                                    <div className="col-9 offset-3 col-md-5 offset-md-0 form-check form-check-inline py-1 py-md-0">
                                        <label className="form-check-label" htmlFor={"date2"+num}>Ending time&nbsp;</label>&nbsp;
                                        <input className="form-check-input" type="date" id={"date2"+num} defaultValue={today} min="1998-01-02" max={today}/>
                                    </div>
                                    <div className="py-1 py-md-0">
                                        <button type="button" className="btn btn-primary" onClick={this.perf}>Show</button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

class Portfolio extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            selectedStocks: [],
            list: [],
            rate: 1,
            //portfolio: ""
        };
        this.removeSelected = this.removeSelected.bind(this);
        this.checked = this.checked.bind(this);
        this.rateClick = this.rateClick.bind(this);
        this.sortBy = this.sortBy.bind(this);
        this.compareBy = this.compareBy.bind(this);
        //this.add = this.add.bind(this);
    }
    count = 0;
    portfolios =[];
    flag = false;
    showPort() {
        var key = this.props.portfolio;
        if(typeof(Storage) !== "undefined") {
            if (localStorage[key]) { // if list exists in the local storage
                this.state.list = JSON.parse(localStorage.getItem(key)); // retrieves the list (string) from the local storage and parses it into Javascript array
            }
        } else {
            document.getElementById("container").innerHTML = "Sorry, your browser does not support web storage...";
        }
    }

    checked(e) {
        var id = e.target.id.substring(1);
        this.state.selectedStocks[id] = e.target.checked;
        for(var j=0; j<this.state.list.length && !this.state.selectedStocks[j]; j++ );
        if(j < this.state.list.length) {
            this._remove.disabled = false;
            this._remove.style.cursor = 'pointer';
            this._remove.style.opacity = '0.8';
            var self=this;
            $(this._remove).hover(function(){self._remove.style.opacity = '1';}, function(){self._remove.style.opacity = '0.8';});
        } else {
            this._remove.disabled = true;
            this._remove.style.cursor = 'none';
            this._remove.style.opacity = '0.3';
            $(this._remove).hover(function(){});
        }
    }
    removeSelected(e) {
        this._remove.disabled = true;
        this._remove.style.cursor = 'none';
        this._remove.style.opacity = '0.3';
        $(this._remove).hover(function(){});
        var key = this.props.portfolio;
        var newlist=[];
        for(var i=0; i<this.state.list.length; i++) {
            if (!this.state.selectedStocks[i]) {
                newlist.push(this.state.list[i]);
            }
            $('#'+this.props.num+i).prop('checked', false);
        }
        this.state.list = newlist.slice();
        this.setState({selectedStocks: this.state.selectedStocks});
        if(typeof(Storage) !== "undefined") {
            if (localStorage[key]) { // if list exists in the local storage
                localStorage.setItem(key, JSON.stringify(this.state.list));  // converts Javascript array (list) into string and stores it into local storage
            }
        } else {
            document.getElementById("container").innerHTML = "Sorry, your browser does not support web storage...";
        }
    }

    rateClick(e) {
        if (this._euro.checked === true) {
            this.state.rate = 1;
            this.setState({rate: this.state.rate});
        } else {
            this.findRate();
            this.setState({rate: this.rate});
        }
    }

    findRate() {
        if(typeof(Storage) !== "undefined") {
            if (sessionStorage["rate"]) { // if list exists in the local storage
                this.rate = sessionStorage.getItem("rate"); // retrieves the list (string) from the local storage and parses it into Javascript array
            }
        } else {
            document.getElementById("container").innerHTML = "Sorry, your browser does not support web storage...";
        }
    }

    compareBy = (key) => {
        return function(a, b) {
            if (a[key] < b[key]) return -1;
            if (a[key] > b[key]) return 1;
            return 0;
        };
    };

    sortBy = (key) => {
        let arrayCopy = this.state.list.slice();
        arrayCopy.sort(this.compareBy(key));
        this.setState({list: arrayCopy});
    };

    componentWillMount() {
        this.showPort();
    }
    componentDidMount() {
        this._euro.checked = true;
    }

    render() {
        var tdc={colSpan: 5};
        var self=this;
        var stocks = [];
        var totalvalue=0;
        var symbols = [];
        var currency = "&euro;";
        if(this.state.rate === 1) {
            currency = '\u20AC';
        } else {
            currency = '$';//\u0024';
        }
        for (var ii = 0; ii < this.state.list.length; ii++) {
            var symbol = this.state.list[ii]["symbol"];
            symbols.push(symbol);
            var unitvalue = parseFloat(this.state.list[ii]["unitvalue"]*this.state.rate).toFixed(2);
            var quantity = this.state.list[ii]["quantity"];
            var totalvalueStock = parseFloat(this.state.list[ii]["totalvalue"]*this.state.rate).toFixed(2);
            var stock = (
                <tr key={ii}>
                    <td>{symbol}</td>
                    <td>{unitvalue+currency}</td>
                    <td>{quantity}</td>
                    <td>{totalvalueStock+currency}</td>
                    <td><input id={this.props.num.toString()+ii} type="checkbox" onChange={this.checked}/></td>
                </tr>
            );
            totalvalue += Number(totalvalueStock);
            stocks.push(stock);
        }
        totalvalue = parseFloat(totalvalue.toString()).toFixed(2);
        var disabled = this.state.list.length === 0;
        var disabledAddingStocks = this.state.list.length === 50;

        return (
            <div className={"col portfolio rel"}>
                <div className="row">
                    <div className="col-12 col-sm-4 title">
                        <p>{this.props.portfolio}</p>
                    </div>
                    <div className="col col-sm-7">
                        <p>
                            Show in &euro;&nbsp;<input type="radio" disabled={disabled} name={this.props.portfolio} ref={function(e4){self._euro = e4;}}  onChange={this.rateClick} />&ensp;
                            Show in $&nbsp;<input type="radio" disabled={disabled} name={this.props.portfolio} ref={function(e5){self._checked = e5;}} onChange={this.rateClick} />
                        </p>
                    </div>
                    <div className="col-1 px-1">
                        <p><button id={this.props.num} type="submit" className="button" onClick={this.props.removePort} key={(this.count++).toString()}>x</button></p>
                    </div>
                </div>
                <div className="row horizscroll">
                    <div className="col-12">
                        <table className="portfoliotable" id={"table"+this.props.num}>
                            <thead id={"thead"+this.props.num}>
                            <tr>
                                <th onClick={() => this.sortBy("symbol")}>Name</th>
                                <th onClick={() => this.sortBy("unitvalue")}>Unit value</th>
                                <th onClick={() => this.sortBy("quantity")}>Quantity</th>
                                <th onClick={() => this.sortBy("totalvalue")}>Total value</th>
                                <th>Select</th>
                            </tr>
                            </thead>
                            <tbody id={"thead"+this.props.num} ref={function(e7){self["_table"] = e7;}}>
                                {stocks}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="row py-1">
                    <div className="col-12 title">
                        <p>Total value of {this.props.portfolio}: {totalvalue+currency}</p>
                    </div>
                </div>
                <div className="row"><br/><br/></div>
                <div className="row down">
                    <StockPopupForm num={this.props.num} portfolio={this.props.portfolio} disabled={disabledAddingStocks} class="col-6 col-md"/>
                    <Performance num={this.props.num} portfolio={this.props.portfolio} symbols={symbols} class="col-6 col-md" disabled={disabled}/>
                    <div className="col-6 col-md">
                        <button className="open-button-remove downbut3" ref={function(e6){self._remove = e6;}} onClick={this.removeSelected}>Remove selected</button>
                    </div>
                </div>
            </div>
        );
    }
}
class SPMS extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            list: []
        };
        this.removePortfolio = this.removePortfolio.bind(this);
    }
    count = 0;
    list = [];
    show() {
        if(typeof(Storage) !== "undefined") {
            if (localStorage.portfolios) { // if list exists in the local storage
                this.list = JSON.parse(localStorage.getItem("portfolios")); // retrieves the list (string) from the local storage and parses it into Javascript array
            }
        } else {
            document.getElementById("container").innerHTML = "Sorry, your browser does not support web storage...";
        }
    }
    rateInit() {
        var request = "https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=EUR&to_currency=USD&apikey=85YZX4JTG68SG4B2";
        var client = new XMLHttpRequest();
        client.open("GET", request, true);
        self=this;
        client.onreadystatechange = function() {
            if (client.readyState === 4) {
                var obj = JSON.parse(client.responseText); // Parses the data with JSON.parse(), and the data becomes a JavaScript object.
                if (!obj || !obj['Realtime Currency Exchange Rate'] || typeof(obj['Realtime Currency Exchange Rate']['5. Exchange Rate']) === "undefined") {
                    alert("The exchange rate service is not responding. Wait 30 seconds and try again or reload the page");
                    setTimeout(self.rateInit, 30000);
                    return;
                }
                var rate = Number(obj['Realtime Currency Exchange Rate']['5. Exchange Rate']);
                SPMS.showRate(rate);
            }
        };
        client.send();
    }
    static showRate(rate) {
        if(typeof(Storage) !== "undefined") {
            if (!sessionStorage["rate"]) { // if list exists in the local storage
                sessionStorage.setItem("rate", rate);
            }
        } else {
            document.getElementById("container").innerHTML = "Sorry, your browser does not support web storage...";
        }
    }

    removePortfolio(e) {
        var key = "portfolios";
        var id = Number(e.target.id);
        var portfolio = this.list[id];
        var newlist = [];
        for(var i=0; i<this.list.length; i++) {
            if (i !== id) {
                newlist.push(this.list[i]);
            }
        }
        this.list = newlist.slice();
        this.setState({list: newlist});
        if(typeof(Storage) !== "undefined") {
            if (localStorage[portfolio]) { // if list exists in the local storage
                localStorage.removeItem(portfolio);  // converts Javascript array (list) into string and stores it into local storage
            }
            if (localStorage[key]) { // if list exists in the local storage
                localStorage.setItem(key, JSON.stringify(this.list));  // converts Javascript array (list) into string and stores it into local storage
            }
        } else {
            document.getElementById("container").innerHTML = "Sorry, your browser does not support web storage...";
        }
    }
    componentWillMount() {
        this.rateInit();
    }

    render() {
        this.show();
        var portfolios = [];
        for (var ii = 0; ii < this.list.length; ii++) {
            if (ii % 3 === 0 && ii < this.list.length-2 ){
                portfolios.push(<div className="row" key={ii}><Portfolio num={ii} portfolio={this.list[ii]} rate={this.rate} removePort={this.removePortfolio} key={ii}/><Portfolio num={ii+1} portfolio={this.list[ii+1]}  rate={this.rate} removePort={this.removePortfolio} key={ii+1}/><Portfolio num={ii+2} portfolio={this.list[ii+2]} rate={this.rate} removePort={this.removePortfolio} key={ii+2}/></div>);
            } else if ((ii % 3 === 0) && (ii === this.list.length-2)) {
                portfolios.push(<div className="row" key={ii}><Portfolio num={ii} portfolio={this.list[ii]} rate={this.rate} removePort={this.removePortfolio} key={ii}/><Portfolio num={ii+1} portfolio={this.list[ii+1]} rate={this.rate} removePort={this.removePortfolio} key={ii+1}/></div>);
            } else if ((ii % 3 === 0) && (ii === this.list.length-1)) {
                portfolios.push(<div className="row" key={ii}><Portfolio num={ii} portfolio={this.list[ii]} rate={this.rate} removePort={this.removePortfolio} key={ii}/></div>);
            }
        }
        var disabledAddingPortfolios = this.list.length === 10;
        return(
            <div>
                <div className="row abs">
                    <PortfolioPopupForm disabled={disabledAddingPortfolios} class="col-12 py-3"/>
                </div>
                <div>{portfolios}</div>
            </div>
        )
    }
}
ReactDOM.render(
    <SPMS/>,
    document.getElementById('container')
);