//bugetController module
var budgetController = (function () {

    function Expense(id, description, amount) {//constructor function to create many objects
        this.id = id;
        this.description = description;
        this.amount = amount;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {//this is for 'each' obj
        if (totalIncome > 0) {
            this.percentage = Math.round(this.amount / totalIncome * 100);
        } else {
            this.percentage = -1;
        }
    }

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };

    function Income(id, description, amount) {//constructor function //private function
        this.id = id;
        this.description = description;
        this.amount = amount;
    }

    var data = { // data structure to store all expense/income objects //'data' is an object. //private variable
        allItem: {
            expense: [], //array to store all the Expense objects
            income: []
        },
        total: {
            expense: 0,
            income: 0
        },
        budget: 0,
        percentage: -1
    }

    return {
        addItemToData: function (sign, description, amount) {//'addItemToData' function is public
            var newItem, ID;

            //create ID
            if ((data.allItem[sign]).length === 0) {
                ID = 0;
            } else {
                ID = data.allItem[sign][data.allItem[sign].length - 1].id + 1; //(The last ID + 1) is the id for a newly created item.
            }

            //create obj
            if (sign === 'expense') {
                newItem = new Expense(ID, description, amount);//create a new Expense object
                data.allItem[sign].push(newItem);//add that new itme to our data structure
            } else {
                newItem = new Income(ID, description, amount);
                data.allItem[sign].push(newItem);
            }
            return newItem;//so that other module or other function can access created item.
        },

        calculate: function (sign) {//public function. This will be used in appContoller 

            //calculate total income and expenses
            var total = 0;
            for (var i = 0; i < data.allItem[sign].length; i++) {
                total += data.allItem[sign][i].amount;
            }
            data.total[sign] = total;

            //calculate budget: total income - total expenses
            data.budget = data.total.income - data.total.expense;

            //calculate the percentage of income that we spent
            if (data.total.income > 0) {//show percentage onl when there was income already.
                data.percentage = Math.round((data.total.expense / data.total.income) * 100);
            } else {
                data.percentage = -1;
            }
        },

        getCalculatedValues: function () { //public function that only retrieve data = getter. (without it, private variables are not accessible from outside)
            return { //return an object because it needs to return multiple values
                budget: data.budget,
                totalIncome: data.total.income,
                totalExpense: data.total.expense,
                percentage: data.percentage
            }
        },

        calculatePercentages: function () {
            data.allItem.expense.forEach(function (current) {
                current.calcPercentage(data.total.income);//calculate and assign percentage for each and every expense obj
            })
        },

        getPercentagesArr: function () {
            var arrayOfPercentages = data.allItem.expense.map(function (current) {
                return current.getPercentage();
            });
            return arrayOfPercentages;
        },

        deleteItemFromData: function (itemSign, itemId) {//delete an item from data structure(array) //this will be called(used) in appController. appController needs to pass 'ID' and 'sign' as parameter to here. because both income object and expense object are uniquely identified by ID.

            var narr = data.allItem[itemSign].map(function (x) {
                return x.id; // narr is a new array of ids
            });

            var index = narr.indexOf(itemId);

            if (index !== -1) {
                data.allItem[itemSign].splice(index, 1)//now i'm ready to remove given element(one obj) from array
            }
        },

        test: function () {
            console.log(data)
        }
    }
})();

//UIController module
var UIController = (function () {

    var DOMstrings = {//private variable //all the dom element selecting happens here only //an object
        inputSign: '.input-sign',
        inputDescription: '.input-description',
        inputAmount: '.input-amount',
        inputBtn: '.input-btn',
        incomeContainer: '.income-list',
        expenseContainer: '.expense-list',
        budgetValue: '.budget-value',
        totalIncome: '.income-value',
        totalExpense: '.expenses-value',
        percentage: '.expenses-percentage',
        listContainer: '.list-container',
        expensePercentage: '.item__percentage',
        dateLabel: '.title-month'
    };

    var formatNumber = function (num, sign) {//num: number that we want to format, sign: either income or expense

        num = Math.abs(num);
        num = num.toFixed(2);//overriding the 'num' argument //toFixed is not a method of Math obj, it's a method of number's prototype.
        var splited = num.split('.');
        var integerPart = splited[0];//integerPart is a string
        if (integerPart >= 1000) {//add a comma if we have a thousand in this integerPart
            integerPart = integerPart.substr(0, integerPart.length - 3) + ',' + integerPart.substr(integerPart.length - 3, 3);
        }
        var decimalPart = splited[1];

        if (sign === 'expense') {
            sign = '-';
        } else {
            sign = '+';
        }

        return sign + ' ' + integerPart + '.' + decimalPart;
    };

    return {
        getUserInputFromUI: function () {//public function //selecting DOM elements and get user input values
            return {//return an object
                sign: document.querySelector(DOMstrings.inputSign).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                inputAmount: parseFloat(document.querySelector(DOMstrings.inputAmount).value) //document.querySelector(DOMstrings.inputAmount).value returns a string.
            };
        },

        displayAddedNewItemToUI: function (obj, sign) {//public function

            //create HTML string with placeholder text
            var html, newHtml, element;
            if (sign === 'income') {
                element = DOMstrings.incomeContainer;
                html = `
                    <div class="item1 clearfix" id="income-%id%">
                        <div class="item__description">%description%</div>
                        <div class="right clearfix">
                            <div class="item__value">%value%</div>
                            <div class="item__delete">
                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                            </div>
                        </div>
                    </div>`
            }
            else {
                element = DOMstrings.expenseContainer;
                html = `
                <div class="item2 clearfix" id="expense-%id%">
                    <div class="item__description">%description%</div>
                    <div class="right clearfix">
                        <div class="item__value">%value%</div>
                        <div class="item__percentage">%percentage%%</div>
                        <div class="item__delete">
                            <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                        </div>
                    </div>
                </div>`
            }

            //replace the placeholder text with actual ata that we received from the object.
            newHtml = html.replace('%id%', obj.id)//first replacement
            newHtml = newHtml.replace('%description%', obj.description);//repalce(overwrite) newHtml, not html
            newHtml = newHtml.replace('%value%', formatNumber(obj.amount, sign));
            if (sign === 'expense') {

                newHtml = newHtml.replace("%percentage%", obj.amount / budgetController.getCalculatedValues().totalIncome * 100);
            }

            //Insert HTML into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        clearInputsFromUI: function () {
            var inputs;
            inputs = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputAmount);
            for (var i = 0; i < inputs.length; i++) {
                inputs[i].value = "";
            }
            inputs[0].focus();//always put cursur on description after inputting
        },

        displayTopOnUI: function (obj) {

            if (obj.budget > 0) {
                sign = 'income';
            } else {
                sign = 'expense';
            }
            document.querySelector(DOMstrings.budgetValue).textContent = formatNumber(obj.budget, sign);
            document.querySelector(DOMstrings.totalIncome).textContent = formatNumber(obj.totalIncome, 'income');
            document.querySelector(DOMstrings.totalExpense).textContent = formatNumber(obj.totalExpense, 'expense');
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentage).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentage).textContent = '';
            }
        },

        displayToUIAfterDeletion: function (itemSelectorID) {//this will be called in appController

            var el = document.getElementById(itemSelectorID);
            el.parentNode.removeChild(el);//update UI by removing an object with that itemSelectorID 
        },

        displayExpensePercentages: function (percentages) {//takes an array as parameter
            var expensePercentages = document.querySelectorAll(DOMstrings.expensePercentage);

            for (var i = 0; i < expensePercentages.length; i++) {

                if (percentages[i] > 0) {
                    expensePercentages[i].textContent = percentages[i] + '%';

                } else {
                    expensePercentages[i].textContent = '';
                }
            }
        },

        displayMonthToUI: function () {

            var now, months, month, year;

            now = new Date();


            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();

            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;

        }
        ,
        getDOMString: function () {//public function
            return DOMstrings; //exposing our private DOMString to public (to other modules)
        },
    }
})();

//appController module
var appController = (function (budgetCtrl, UICtrl) {

    var setupEventListener = function () { //private function

        var DOMstr = UICtrl.getDOMString();

        document.querySelector(DOMstr.inputBtn).addEventListener('click', handleInputEvent); //set up event listenr for input button here because this is the central place

        document.addEventListener('keypress', function (event) {//set up event listner when user hits the return key
            //console.log(event);
            if (event.keyCode === 13 || event.which === 13) {
                handleInputEvent();
            }
        });

        document.querySelector(DOMstr.listContainer).addEventListener('click', deleteItem)//set up event listener when user clicks deletion button //set to common parent element, not the targeted one because it can reduce # of .addEventLisner to one. Otherwise, need to add addEventListner to all the elements we are targeting.
    };

    var updateExpensePercentages = function () {

        //1. Calculate percentages
        budgetCtrl.calculatePercentages();

        //2. read percentages from budget controller
        var percentages = budgetCtrl.getPercentagesArr();

        //3. update UI with new percentages
        UICtrl.displayExpensePercentages(percentages);
    };

    var handleInputEvent = function () { //private function

        //1. Get input data
        var input = UICtrl.getUserInputFromUI(); //read input and store it into 'input' variable

        //only when user inptu something, not blank.
        if (input.description !== "" && input.inputAmount !== NaN && input.inputAmount > 0) {

            //2. Add the item to budgetController
            var newItem = budgetCtrl.addItemToData(input.sign, input.description, input.inputAmount);//create a new item(obj) and return that item and store it in 'newItem' variable

            //3. Add item to UI
            UICtrl.displayAddedNewItemToUI(newItem, input.sign);

            //4. Clear the input values
            UICtrl.clearInputsFromUI();

            //5. Calculate totals and budget and returns the result to here and pass that to UIController.
            budgetCtrl.calculate(input.sign);

            var calculatedObj = budgetCtrl.getCalculatedValues();

            //6. Display top part (budget, total income, total expense) on UI 
            UICtrl.displayTopOnUI(calculatedObj);

            //7. Update percentage of expense object using for loop when income is added or deleted
            // if (input.sign === 'income') {//when a new income is added
            //     for (var i = 0; i < budgetCtrl.data.)
            // }
            updateExpensePercentages();
        }
    };

    var deleteItem = function (event) { //item means an object
        //console.log(event.target);
        var itemID, splited, splitedSign, splitedID; //all the ingredients that I need for deletion from both UI and budgetController

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id; //what we need to delete is an entire object, not just deletion button

        if (itemID) {//if clicked thing has itemID
            splited = itemID.split('-');
            splitedSign = splited[0];
            splitedID = parseInt(splited[1]);

            //1. first, delete item from data structure
            budgetCtrl.deleteItemFromData(splitedSign, splitedID);

            //2. then, delete item from UI
            UICtrl.displayToUIAfterDeletion(itemID);

            //3. then, recalculate data and display new budget, totals
            budgetCtrl.calculate(splitedSign);
            var recalculatedObj = budgetCtrl.getCalculatedValues();
            UICtrl.displayTopOnUI(recalculatedObj);

            //4.
            updateExpensePercentages();
        }
    };

    return {
        init: function () {
            console.log('init function is executed')
            UICtrl.displayMonthToUI();
            UICtrl.displayTopOnUI({//display 0 when user opened the webpage for the first time
                budget: 0,
                totalIncome: 0,
                totalExpense: 0,
                percentage: -1
            })
            setupEventListener();
        }
    };
})(budgetController, UIController);

appController.init();//init() is public by using 'return' keyword, so we can call here.

