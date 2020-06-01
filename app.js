// ***********************
//**** About this project:
// We are building this app using the module pattern and Seperation of cencerns

// Budget module using IIFE // Deals with the budget calculations
var budgetController = (function() {
  // budgetController function constructor - Created so we can create multiple objects
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  }
  // Breadcrumb
  // calculatePercentages - l.115
  Expense.prototype.calcPercentage = function(totalIncome) {
    if(totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    }
    else {
      this.percentage = -1;
    }
  }
  Expense.prototype.getPercentage = function() {
    return this.percentage;
  }
  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  }
  // Breadcrumb
  // 1. CalculateBudget - l.85
  var calculateTotal = function(type) {
    var sum = 0;
    // Add up the totals
    data.allItems[type].forEach(function(current){
      sum += current.value;
      data.totals[type] = sum;
    });
  };
  // The globals
  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };
  return {
    addItem: function(type, des, val) {
      var newItem, ID;
      // Create new ID based on the last id in the array
      if(data.allItems[type].length > 0) {
        // get the last id in the data array for the type and add + 1
        var ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      }
      else {
        ID = 0;
      }

      // Create new item based on 'inc' or 'exp' type
      if(type === 'exp') {
        newItem = new Expense(ID, des, val);
      }
      else {
        newItem = new Income(ID, des, val);
      }
      // Push it into our data structure
      data.allItems[type].push(newItem);
      // Return the new element
      return newItem;
    },

    // Return the position of the id in the data array
    deleteItem: function(type, id) {
      var ids, index;
      // Return the id from the object for the type
      ids = data.allItems[type].map(function(current) {
        return current.id;
      });
      // Get the position of the id passed in
      index = ids.indexOf(id);
      // Remove the data from the array
      if(index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },
    // Breadcrumb:
    // 1. Update budget - l.223
    calculateBudget: function() {
      // Calculate total income and expenses
      calculateTotal('exp');
      calculateTotal('inc');
      // Calculate the budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;
      // Calculate the percentage of income that we spent
      if(data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      }
      else {
        data.percentage = -1;
      }
    },
    // Breadcrumb:
    // updatePercentages - l.262
    calculatePercentages: function() {
      data.allItems.exp.forEach(function(current) { // l.14
        current.calcPercentage(data.totals.inc);
      });
    },
    getPercentages: function() {
      var allPerc = data.allItems.exp.map(function(current) {
        return current.getPercentage();
      });
      return allPerc;
    },
    // Breadcrum:
    // 1. UpdateBudget - l.229
    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      }
    },
  };
})();








// User interface module using IIFE // Deals with the user interface
var UIController = (function() {

  var DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  }

  var formatNumber = function(num, type) {
    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');
    int = numSplit[0];
    if(int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    }
    dec = numSplit[1];
    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
  };
  // Abstract function
  var nodeListForEach = function(list, callback) {
    for(var i = 0; i < list.length; i++) {
      callback(list[i], i);
    };
  };
  // Has to be returned to make it publicy accessible
  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
      }; // /return
    }, // /getInput

    addListItem: function(obj, type) {
      var html, newHtml, element;
      // Create HTML string with placeholder text
      if(type === 'inc') {
        // Select the element in which we will add the below code to
        element = DOMstrings.incomeContainer;
        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }
      else {
        // Select the element in which we will add the below code to
        element = DOMstrings.expensesContainer;
        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }
      // Replace the placeholder text with some actual data
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
      // Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    deleteListItem: function(selectorID) {
      var element = document.getElementById(selectorID);
      element.parentNode.removeChild(element);
    },

    clearFields: function() {
      var fields, fieldsArray;
      // Get all the fields
      fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
      // Convert the list into an array using the below trick
      fieldsArray = Array.prototype.slice.call(fields);
      // Loop through the new array with a foreach loop and set each of the fields to empty
      fieldsArray.forEach(function(current, index, array) {
        current.value = "";
      });
      fieldsArray[0].focus();
    },

    displayBudget: function(obj) {
      var type;
      obj.budget > 0 ? type = 'inc' : type = 'exp';
      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
      if(obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
      }
      else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';
      }
    },

    displayPercentages: function(percentages) {
      var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
      nodeListForEach(fields, function(current, index) {
        if(percentages[index] > 0) {
          current.textContent = percentages[index] + '%';
          } else {
            current.textContent = '---';
          }
      });
    },

    displayMonth: function() {
      var now, year, month, months;
      now = new Date();
      year = now.getFullYear();
      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      month = now.getMonth();
      document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' +year;
    },

    changedType: function() {
      var fields = document.querySelectorAll(
        DOMstrings.inputType + ',' +
        DOMstrings.inputDescription + ',' +
        DOMstrings.inputValue
      );
      nodeListForEach(fields, function(current) {
        current.classList.toggle('red-focus');
      });
      document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
    },

    getDomStrings: function() {
      return DOMstrings;
    }
  };
})();








// Controller module using IIFE // Talks to both the other modules
var controller = (function(budgetCtrl, UICtrl) {
  var setupEventListeners = function() {
    var DOM = UICtrl.getDomStrings();
    // When the submit / tick button is clicked
    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    // If the user submits the data buy pressing enter
    document.addEventListener('keypress', function(event) {
      // If the enter button was pressed / which is for older browsers
      if(event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });
    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
  }
  // Breadcrumb:
  // 1. ctrlDeleteItem - l.226
  // 2. ctrlAddItem - l.251
  var updateBudget = function() {
    // 1. Calculate the budget
    budgetCtrl.calculateBudget();
    // 2. Return the budget
    var budget = budgetCtrl.getBudget();
    // 3. Display the budget
    UICtrl.displayBudget(budget);
  }
  // Breadcrumb:
  // 1. ctrlAddItem - l.282
  // 2. ctrlDeleteItem - l.302
  var updatePercentages = function() {
    // 1. Calculate percentages
    budgetCtrl.calculatePercentages(); // l.111
    // 2. Read percentages from the budget Controller
    var percentages = budgetCtrl.getPercentages(); // l.116
    // 3. Update the UI with the new percentages
    UICtrl.displayPercentages(percentages);
  }

  var ctrlAddItem = function() {
    var input, newItem;
    // 1. Get the field input data
    input = UICtrl.getInput();
    // If the input fields are filled out correctly
    if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // 2. Add the item to the budget Controller and return an object
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      // 3. Add the new item to the UI
      UICtrl.addListItem(newItem, input.type);
      // 4. Clear the fieldsArray
      UICtrl.clearFields();
      // 5. Calculate and update the budget
      updateBudget();
      // 6. Calculate and update percentages
      updatePercentages(); // l.262
    }
  }
  // Splits the item id by the type and the id / example - (income-0)
  var ctrlDeleteItem = function(event) {
    var itemID, splitID, type, ID;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if(itemID) {
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);
      // 1. Delete the item from the data structure
      budgetCtrl.deleteItem(type, ID);
      // 2. Delete the item from the UI
      UICtrl.deleteListItem(itemID);
      // 3. Update the budget
      updateBudget();
      // 4. Calculate and update percentages
      updatePercentages();
    }
  };

  return {
    init: function() {
      console.log('Application has started');
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: 0
      });
      setupEventListeners();
    }
  };

})(budgetController, UIController);
// Start the application
controller.init();
