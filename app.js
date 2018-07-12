
//BUDGET CONTROLLER MODULE
let budgetController = (function(){
    let Expense = function(id , description , value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    Expense.prototype.calcPercentage = function(totalIncome){
          if(totalIncome>0){
              this.percentage = Math.round((this.value/totalIncome)*100);
          }else{
              this.percentage = -1;
          }
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }

    let Income = function(id , description , value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    let calculateTotal = function(type){
        let sum = 0;
        data.allItems[type].forEach(function(current){
            sum += current.value;
        });
        data.totalItem[type] = sum;
    }
    let data = {
        allItems:{
            exp:[],
            inc:[]
        },
        totalItem:{
            exp:0,
            inc:0
        },
        budget:0,
        percentage:0

    };
    return{
        addItem:function(type , desc , val){
            let newItem,ID;

            //Create New ID
            if(data.allItems[type].length>0){
                ID = data.allItems[type][data.allItems[type].length-1].id+1;
            }else{
                ID = 0;
            }
            
            if(type == 'exp'){
            newItem = new Expense(ID,desc,val);
            }else if(type == 'inc'){
            newItem = new Income(ID,desc,val);
            }
             //Push All item to data structure
             data.allItems[type].push(newItem);

             //return it
             return newItem;
        },
        deleteItem:function(type , id){
            //map out all ids of certain type
            let ids = data.allItems[type].map(function(current){
                return current.id;
            });
            //get the id index number 
            let index = ids.indexOf(id);
            if(index !== -1){
                data.allItems[type].splice(index,1);
            }
              
        },
        calculateBudget: function(){
           //Calculate Total inc and expense
           calculateTotal('exp');
           calculateTotal('inc');
           //calculate the Budget
           data.budget = data.totalItem.inc - data.totalItem.exp;
           //calculate the percentage of income that spent
           if(data.totalItem.inc > 0){
             data.percentage = Math.round((data.totalItem.exp / data.totalItem.inc)*100);
           }else{
              data.percentage = -1;
           }
           
        },
        calculatePercentage:function(){
            data.allItems.exp.forEach(function(current){
                current.calcPercentage(data.totalItem.inc);
            });
        },
        getPercentages:function(){
            let allPerc = data.allItems.exp.map(function(current){
                  return current.getPercentage();
            });

            return allPerc;
        },
        getBudget:function(){
            return{
               budget:data.budget,
               totalINC:data.totalItem.inc,
               totalEXP:data.totalItem.exp,
               percentage:data.percentage
            }
        },
        testingData : function(){
        console.log(data);
        }
    };
   
})();

//UI CONTROLLER MODULE
let UIController = (function(){
    let DOMstrings = {
        inputType : '.add__type',
        inputDescription : '.add__description',
        inputValue : '.add__value',
        inputBtn : '.add__btn',
        expenseContainer : '.expenses__list',
        incomeContainer : '.income__list',
        budgetLabel : '.budget__value',
        incomeLabel : '.budget__income--value',
        expenseLabel : '.budget__expenses--value',
        percentageLabel : '.budget__expenses--percentage',
        container : '.container',
        expensePercentageLabel : '.item__percentage',
        dateLabel : '.budget__title--month'
    };
    let numberFormatter = function(number , type){
         let num = Math.abs(number);
         num = num.toFixed(2);
         numSplit = num.split('.');
         int = numSplit[0];
         if(int.length>3){
             int = int.substr(0,int.length - 3) + ',' + int.substr(int.length-3,3);
             //input 1113 output=1,113
         }
         dec = numSplit[1];
         return (type==='exp'? '-':'+') + ' ' + int +'.'+ dec;
    };
    return{
        getInput:function(){
            return{
                type : document.querySelector(DOMstrings.inputType).value,
                description : document.querySelector(DOMstrings.inputDescription).value,
                value : parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }    
        },
        addListItem:function(item,type){
            //Create The Html with placeholder text
            let html , element;
            if(type == 'exp'){
                element = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%<</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';   
            }else if(type == 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            //Replace The Html with actual data
            newHtml = html.replace('%id%',item.id);
            newHtml = newHtml.replace('%description%',item.description);
            newHtml = newHtml.replace('%value%',numberFormatter(item.value,type));

            //insert html into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },
        deleteListItem:function(selectID){
           let element = document.getElementById(selectID);
           element.parentNode.removeChild(element);
        },
        clearInputFields:function(){
           let fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
           let fieldsArray = Array.prototype.slice.call(fields);
           fieldsArray.forEach(function(current,index,array){
                current.value = "";
           });
           fieldsArray[0].focus();
        },
        displayBudget:function(obj){
             let type;
             obj.budget>0 ? type='inc':type='exp';
             document.querySelector(DOMstrings.budgetLabel).textContent = numberFormatter(obj.budget,type);
             document.querySelector(DOMstrings.incomeLabel).textContent =  numberFormatter(obj.totalINC,'inc');
             document.querySelector(DOMstrings.expenseLabel).textContent =  numberFormatter(obj.totalEXP,'exp');
             if(obj.percentage>0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
             }else{
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
             }

             
        },
        displayPercentages:function(percentages){
           let fields = document.querySelectorAll(DOMstrings.expensePercentageLabel);
           let nodeListforEach = function(list,callback){
               for(let i = 0 ; i < list.length ; i++){
                   callback(list[i],i);
               }
           }
           nodeListforEach(fields,function(current,index){
                if(percentages[index]>0){
                    current.textContent = percentages[index] + '%';
                }else{
                    current.textContent = '---';
                }
           });
        },
        displayDate:function(){
           let now = new Date();
           let year = now.getFullYear();
           let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
           let month = now.getMonth();
           document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' '+year;
        },
        getDOMstrings:function(){
            return DOMstrings;
        }

       
    };
})();


//GLOBAL APP CONTROLLER
let controller = (function(budgetCtrl,UICtrl){
    
    let setEventListener = function(){
        let DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);
        document.addEventListener('keypress',function(event){
        if(event.keyCode === 13 || event.which === 13){
            ctrlAddItem();
         }
        });
        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
    
    };
    let updateBuget = function(){
       // 1. Calculate the budget
         budgetCtrl.calculateBudget();
       // 2. Return budget
         let budget = budgetCtrl.getBudget();
       // 3. Display budget in UI
         UICtrl.displayBudget(budget);
    };
    let updatePercentages = function(){
        //calculate percentage
        budgetCtrl.calculatePercentage()
        //read percentage from ui
        let percentages = budgetCtrl.getPercentages();
        //update UI with new Percentage
        //console.log(percentages);
        UICtrl.displayPercentages(percentages);
    };
    let ctrlAddItem = function(){
        //console.log('ctrlAddItem');   
        // 1. Get input data
        let input = UICtrl.getInput();

        if(input.description !="" && !isNaN(input.value) && input.value>0){
             // 2. Add the item to budget controller
            let newItem = budgetController.addItem(input.type,input.description,input.value);    
            // 3. Add the item to UI
            UICtrl.addListItem(newItem , input.type);
            // 4. Clear Input Fields
            UICtrl.clearInputFields();
            // 5. Calculate and update budget
            updateBuget();
            //6.Calculate And Update Percentage
            updatePercentages();

         
        }           
    };
    let ctrlDeleteItem = function(event){
          let itemID = event.target.parentNode.parentNode.parentNode.id;
          if(itemID){
            //income-1
            let splitID = itemID.split('-');
            type = splitID[0];
            id = parseInt(splitID[1]);
            

            //1.Delete The item from Data Structure
            budgetCtrl.deleteItem(type,id);
            //2.Update The item from UI
            UICtrl.deleteListItem(itemID);
            //3.Update and show new Budget
            updateBuget();
            
          }
          
          
    };
    return{
        init:function(){
            console.log('App Started..');
            UIController.displayDate();
            UICtrl.displayBudget({
               budget:0,
               totalINC:0,
               totalEXP:0,
               percentage:-1
            });
            setEventListener();

        }
    };

})(budgetController,UIController);

//START APP
controller.init();