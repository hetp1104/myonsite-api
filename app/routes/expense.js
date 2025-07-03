var expense = require('../controllers/expense');
var expenses = require('mongoose').model('Expense');
var session = require("express-session");
var admins = require('mongoose').model('admin');





module.exports = function(app) {

    // Route for submitting a new expense (POST request)
    // Author: Krina Shah
    // JIRA Ticket: ADMINPANEL-158
    app.route('/add_expense').post(expense.submitExpense);

    //app.route('/expensesdata').post(expense.addExpense);

    // Route for fetching expenses data (GET request)
    // Author: Krina Shah
    // JIRA Ticket: ADMINPANEL-176
    app.route('/expensesdata').get(expense.readExpense);

    // Route for updating expense status (POST request)
    // Author: Krina Shah
    app.route('/updateExpenseStatus').post(expense.updateExpenseStatus);

     // Route for fetching the list of expenses (GET request)
     //ADMINPANEL-158
    //ADMINPANEL-176
     app.route('/getExpenses').post(expense.getExpenses); // added by krina shah for show expense list  
     
         // Render the form for adding a new category
         // Author: Krina Shah
        app.route('/add_category').get(expense.add_category_form);

        // Render the form for editing a category
        app.route('/edit_category_form').post(expense.edit_category_form);

        // Update category details
        app.route('/update_category').post(expense.update_category);

        // Check if category is available
        app.route('/check_category_available').post(expense.check_category_available);

        // Fetch category details
        app.route('/fetch_category_detail').post(expense.fetch_category_detail);

        // Add a new category
        app.route('/add_category').post(expense.add_category);
        
        // Route for fetching a list of all categories (POST request)
       // Author: Krina Shah
      // JIRA Ticket: ADMINPANEL-172
      app.route('/GetCategoryList').post(expense.GetCategoryList);
        
          // Route for fetching expense documents for a provider
       //app.route('/getExpenseDocument').post(expense.getExpenseDocument);

      // Route for fetching expense documents for a provider (POST request)
      // Author: Krina Shah
      app.route('/getExpenseDocuments').post(expense.getExpenseDocuments);
    
     

};