const mongoose = require('mongoose');
var ExpenseModel = require('../models/expense');
expenses = mongoose.model('Expense')
var fs = require("fs");
const path = require('path');
const Expense = require('mongoose').model('Expense');
const AuditLog = require('../models/auditlog');
var admin = require('mongoose').model('admin');
var Category = require('../models/Category'); // Adjust the import statement
const utils = require('./utils');
var Provider = require('mongoose').model('Provider');
var moment = require('moment');
express = require('express');
var app = express();


/*** 
 * submitExpense
 * Crated By: krina Shah
 * Created Date: 05-02-2024
 * ***/
 
exports.submitExpense = function(req, res) {
    console.log('Request body:', req.body);
    utils.check_request_params(req.body, [
        { name: 'amount', type: 'string' },
        { name: 'provider_id', type: 'string' },
        { name: 'expense_date', type: 'string' },
        { name: 'upload_date', type: 'string' },
        { name: 'category', type: 'string' }
    ], function(response) {
        if (response.success) {
            console.log('Parameters check successful');
            var description = req.body.description || '';
            var amount = parseFloat(req.body.amount); // Convert amount to a float
            var providerId = req.body.provider_id;
            var expenseDate = new Date(req.body.expense_date); // Convert to Date object
            var uploadDate = new Date(req.body.upload_date); // Convert to Date object
            var category = req.body.category;

            var newExpense = new Expense({
                description: description,
                amount: amount,
                provider_id: providerId,
                expense_date: expenseDate,
                upload_date: uploadDate,
                category: category
            });

            if (req.files && req.files.length > 0) {
                const file = req.files[0];

                // Define the document path on the server
                const documentPath = 'C:\\API\\newProdMyWork\\src\\data\\expense_document';                

                const image_name = newExpense._id + utils.tokenGenerator(4);
                const extension = path.extname(file.originalname);
                const fullPath = path.join(documentPath, image_name + extension);
                const relativePath = `expense_document/${image_name + extension}`; // Only save this relative pat

                // Move the uploaded file to the destination folder on server
                 fs.renameSync(file.path, fullPath);

                // Save photoUrl in the Expense model
                  newExpense.photo = relativePath;

                newExpense.save(function(err) {
                    if (err) {
                        console.error("Error saving expense:", err);
                        return res.json({ success: false, error_code: 'ErrorSavingExpense', error_description: 'Failed to save expense' });
                    }

                    res.json({
                        success: true,
                        message: "Expense submitted successfully",
                        data: {
                            description: description,
                            amount: amount,
                            provider_id: providerId,
                            expense_date: expenseDate,
                            upload_date: uploadDate,
                            photo: relativePath, 
                            category: category
                        }
                    });
                });
            } else {
                newExpense.save(function(err) {
                    if (err) {
                        console.error("Error saving expense:", err);
                        return res.json({ success: false, error_code: 'ErrorSavingExpense', error_description: 'Failed to save expense' });
                    }

                    res.json({
                        success: true,
                        message: "Expense submitted successfully",
                        data: {
                            description: description,
                            amount: amount,
                            provider_id: providerId,
                            expense_date: expenseDate,
                            upload_date: uploadDate,
                            category: category
                        }
                    });
                });
            }
        } else {
            res.json({
                success: false,
                error_code: response.error_code,
                error_description: response.error_description
            });
        }
    });
};

// exports.getExpenseDocument = function (req, res) {
//     // Validate request parameters
//     utils.check_request_params(req.body, [{ name: 'provider_id', type: 'string' }], function (response) {
//         if (response.success) {
//             // Find the provider
//             Provider.findOne({ _id: req.body.provider_id }).then((provider) => {
//                 if (provider) {
//                     // Find the expense documents associated with the provider
//                     Expense.find({ provider_id: req.body.provider_id }).then((expenses) => {
//                         if (expenses.length === 0) {
//                             res.json({ success: false, error_code: error_message.ERROR_CODE_DOCUMENT_NOT_FOUND });
//                         } else {
//                             // Filter out expenses with no photo
//                             const expenseDocuments = expenses.filter(expense => expense.photo);

//                             if (expenseDocuments.length === 0) {
//                                 res.json({ success: false, error_code: error_message.ERROR_CODE_DOCUMENT_NOT_FOUND });
//                             } else {
//                                 res.json({
//                                     success: true,
//                                     message: success_messages.MESSAGE_CODE_FOR_EXPENSE_GET_DOCUMENT_LIST_SUCCESSFULLY,
//                                     expenseDocuments: expenseDocuments.map(expense => ({
//                                         _id: expense._id,
//                                         provider_id: expense.provider_id,
//                                         amount: expense.amount,
//                                         description: expense.description,
//                                         expense_date: expense.expense_date,
//                                         upload_date: expense.upload_date,
//                                         photo: expense.photo,
//                                         status: expense.status,
//                                         category: expense.category,
//                                         updated_at: expense.updated_at,
//                                         //created_at: expense.created_at
//                                     }))
//                                 });
//                             }
//                         }
//                     }).catch((err) => {
//                         console.error('Error fetching expense documents:', err);
//                         res.status(500).json({ success: false, error_code: 'ERROR_CODE_INTERNAL_SERVER_ERROR', error_description: 'Internal server error' });
//                     });
//                 } else {
//                     res.json({ success: false, error_code: error_message.ERROR_CODE_PROVIDER_DETAIL_NOT_FOUND });
//                 }
//             }).catch((err) => {
//                 console.error('Error finding provider:', err);
//                 res.status(500).json({ success: false, error_code: 'ERROR_CODE_INTERNAL_SERVER_ERROR', error_description: 'Internal server error' });
//             });
//         } else {
//             res.json({
//                 success: false,
//                 error_code: response.error_code,
//                 error_description: response.error_description
//             });
//         }
//     });
// };


exports.getExpenseDocuments = async function(req, res) {
    try {
        const expenseId = req.body.id; // Get the expense ID from the request body

        // Fetch the specific expense document from the database using the expense ID
        const expense = await Expense.findById(expenseId);

        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        // Construct response data for the specific expense
        const expenseDocument = {
            description: expense.description,
            amount: expense.amount,
            expense_date: expense.expense_date,
            photo: expense.photo || 'default.png' // Use 'default.png' if photo URL is not provided
        };

        // Send the response as JSON
        res.render('expense_document', { moment: moment, detail: [expenseDocument] });
    } catch (error) {
        // Handle errors
        console.error('Failed to fetch expense document:', error);
        res.status(500).json({ error: 'Failed to fetch expense document' });
    }
};


/*** 
 * readExpense
 * Crated By: krina Shah
 * Created Date: 05-02-2024
 * ***/

// Function to read expense data
exports.readExpense = async function(req, res) {
    try {
        const { search = '', searchField = 'provider_name', startDate = '', endDate = '', sortField = 'expense_date', sortOrder = 'desc', status = '' } = req.query;

        let filter = {};
        if (search) {
            const searchFilter = {};
            searchFilter[searchField] = new RegExp(search, 'i');
            filter.$or = [searchFilter];
        }
        if (startDate) {
            filter.expense_date = { $gte: new Date(startDate) };
        }
        if (endDate) {
            filter.expense_date = filter.expense_date || {};
            filter.expense_date.$lte = new Date(endDate);
        }
        if (status) {
            filter.status = parseInt(status, 10);
        }

        let sort = {};
        if (sortField) {
            sort[sortField] = sortOrder === 'asc' ? 1 : -1;
        }

        const expenses = await ExpenseModel.find(filter).sort(sort);

        const expensesWithProviderNames = await Promise.all(expenses.map(async expense => {
            const provider = await Provider.findById(expense.provider_id);
            const providerName = provider ? `${provider.first_name} ${provider.last_name}` : 'Unknown';
            const getStatusResponse = exports.get_expense_status_text_and_bg(expense.status);

            return {
                ...expense.toObject(),
                provider_name: providerName,
                status_text: getStatusResponse.status_text,
                status_row_bg: getStatusResponse.status_row_bg,
                upload_date: expense.upload_date,
                approved_date: expense.status === 0 ? null : expense.updated_at,
                category_name: expense.category
            };
        }));

        function formatDate(dateStr) {
            const date = new Date(dateStr);
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            const yyyy = date.getFullYear();
            return `${mm}/${dd}/${yyyy}`;
        }

        res.render("expense", {
            data: expensesWithProviderNames,
            expense_page_type: '/add-expense',
            sortField: sortField,
            sortOrder: sortOrder,
            search: search,
            searchField: searchField,
            startDate: startDate,
            endDate: endDate,
            status: status,
            formatDate: formatDate
        });
    } catch (error) {
        console.error('Failed to retrieve expense data:', error);
        res.status(500).send('Failed to retrieve expense data');
    }
};


exports.get_expense_status_text_and_bg = function(expense_status_code) {
    let statusRowBg = '';     
    let statusText = '';

    switch (expense_status_code) {
        case 1:
            statusRowBg = "#FFA500"; // Approved
            statusText = "Approved";
            break;
        case 2:
            statusRowBg = "#d10000"; // Rejected
            statusText = "Rejected";
            break;
        case 3:
            statusRowBg = "#3D8C40"; // Paid
            statusText = "Paid";
            break;
        default:
            statusRowBg = "#276191"; // Pending
            statusText = "Pending";
            break;
    }

    return { status_row_bg: statusRowBg, status_text: statusText };
}

/*** 
 * Apprvoed Expense
 * Crated By: krina Shah
 * Created Date: 05-02-2024
 * ***/
exports.updateExpenseStatus = function(req, res) {
    // Check if the user is authenticated
    if (!req.session.userid) {
        return res.status(401).json({ error: 'Unauthorized: Please log in.' });
    }

    const { _id, status } = req.body;

    // Find the expense by ID
    ExpenseModel.findById(_id, (err, expense) => {
        if (err || !expense) {
            console.error('Error finding expense:', err);
            return res.status(404).json({ error: 'Expense not found' });
        }

        // Log the current status before updating
        console.log("Current Expense Status:", expense.status);

        // Prevent updating status to "Paid" without being "Approved" first
        if (status === 3 && expense.status !== 1) { // 3 is Paid, 1 is Approved
            return res.status(400).json({ error: 'Expense must be approved before it can be marked as paid' });
        }

        const updateFields = {
            status: status,
            updated_at: new Date(),
            approved_by: req.session.username // Store who approved the expense
        };

        // Update the expense status
        ExpenseModel.findByIdAndUpdate(_id, updateFields, { new: true }, (err, updatedExpense) => {
            if (err) {
                console.error('Error updating expense status:', err);
                return res.status(500).json({ error: 'Failed to update expense status' });
            }

            // Create an audit log entry
            const auditLog = new AuditLog({
                expense_id: _id,
                old_status: expense.status, // Capture the old status
                new_status: status,
                updated_by: req.session.username // Use username from session
            });

            // Save the audit log
            auditLog.save((err) => {
                if (err) {
                    console.error('Error saving audit log:', err);
                } else {
                    console.log('Audit log saved successfully.');
                }
            });

            res.status(200).json({ message: 'Expense status updated successfully', expense: updatedExpense });
        });
    });
};

// Endpoint to get audit logs for a specific expense
exports.getAuditLogs = function(req, res) {
    const { expense_id } = req.query; // Get expense_id from query params

    // Find audit logs based on expense_id
    AuditLog.find({ expense_id: expense_id }, (err, logs) => {
        if (err) {
            console.error('Error fetching audit logs:', err);
            return res.status(500).json({ error: 'Failed to fetch audit logs' });
        }

        res.status(200).json({ auditLogs: logs });
    });
};

/*** 
 * Expense list show
 * Crated By: krina Shah
 * Created Date: 05-02-2024
 * ***/
// Assuming you have ExpenseModel imported and required

exports.getExpenses = function (req, res) {
    console.log("API Request Received");

    // Validate the payload
    if (!req.query && !req.body) {
        return res.status(400).json({ success: false, error_description: 'Invalid payload. Query parameters or body are required.' });
    }

    // Extract providerId from either query or body
    const providerId = req.query.ProviderID || req.body.ProviderID;

    // Validate providerId
    if (!providerId) {
        return res.status(400).json({ success: false, error_description: 'ProviderID is required.' });
    }

    // Define a filter object to pass to the find method
    const filter = { provider_id: providerId };

    // Get the date range parameters from the request, either from the query parameters or the payload
    const startDate = req.query.startDate || req.body.startDate;
    const endDate = req.query.endDate || req.body.endDate;

    // If both startDate and endDate are provided, add them to the filter after validation
    if (startDate && endDate) {
        const parsedStartDate = new Date(startDate);
        const parsedEndDate = new Date(endDate);
        if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
            return res.status(400).json({ success: false, error_description: 'Invalid date format. Dates must be in a valid format.' });
        }
        // Add date range filter using expense_date
        filter.expense_date = { $gte: parsedStartDate, $lte: parsedEndDate };
    } else if (startDate || endDate) {
        return res.status(400).json({ success: false, error_description: 'Both startDate and endDate are required for date range filtering.' });
    }

    // Query the expenses table with the defined filter
    ExpenseModel.find(filter, (err, expenses) => {
        if (err) {
            console.error('Error fetching expenses:', err);
            return res.status(500).json({ success: false, error_description: 'Failed to fetch expenses' });
        }

        // If no expenses found, return an empty array with 200 status code
        if (!expenses || expenses.length === 0) {
            return res.status(200).json({ success: true, expenses: [] });
        }

        // Construct response data with approval status
        const expensesWithStatus = expenses.map(expense => {
            let expenseApprovedDate = expense.updated_at; // Default value for expenseApprovedDate
            
            // If the status is 0 (under review), set expenseApprovedDate to "null"
            if (expense.status === 0) {
                expenseApprovedDate = "null";
            }

            return {
                _id: expense._id,
                Description: expense.description,
                TotalAmount: expense.amount,
                expense_date: expense.expense_date, // Use expense_date in the response
                status: expense.status,
                provider_id: expense.provider_id,
                upload_date: expense.upload_date,
                photo: expense.photo, // Include photo URL in the response
                expenseApprovedDate: expenseApprovedDate,
                category: expense.category
            };
        });

        res.status(200).json({ success: true, expenses: expensesWithStatus });
    });
};


/*** 
 * add_category_form
 * Created By: Krina Shah
 * Created Date: 05-14-2024
 * API endpoint is used to render the form for adding a new category.
 * ADMINPANEL-173
 ***/
// Render the form for adding a new category
exports.add_category_form = function(req, res) {
    Category.find({})
        .then((categories) => {
            res.render('add_category', { categories: categories });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ error: 'Internal server error' });
        });
};

/*** 
 * edit_category_form
 * Created By: Krina Shah
 * Created Date: 05-14-2024
 * API endpoint is used to render the form for editing an existing category.
 * ADMINPANEL-173
 ***/
exports.edit_category_form = function(req, res) {
    var id = req.body.id;
    Category.findById(id)
        .then((category) => {
            res.render('edit_category', { category_data: category });
        })
        .catch((err) => {
            console.log(err);
            res.redirect('/admin');
        });
};

/*** 
 * update_category
 * Created By: Krina Shah
 * Created Date: 05-14-2024
 * used to update the details of an existing category.
 * ADMINPANEL-173
 ***/

exports.update_category = function(req, res) {
    var id = req.body.id;
    var updatedCategoryName = req.body.category_name;
    var isActive = req.body.active === 'on'; // Adjusted to handle checkbox value

    Category.findByIdAndUpdate(id, {
        category_name: updatedCategoryName,
        active: isActive
    }, { new: true })
        .then(updatedCategory => {
            if (!updatedCategory) {
                return res.status(404).json({ success: false, error: 'Category not found' });
            }
            res.redirect('/add_category'); // Redirect as needed
        })
        .catch(err => {
            console.error("Error updating category:", err);
            res.status(500).json({ success: false, error: 'Internal Server Error' });
        });
};




/*** 
 * check_category_available
 * Created By: Krina Shah
 * Created Date: 05-14-2024
 * Description: This API endpoint is used to check if a category name is available.
 * ADMINPANEL-173
 ***/
exports.check_category_available = function(req, res) {
    var categoryName = req.body.category_name;
    Category.countDocuments({ category_name: categoryName })
        .then((count) => {
            res.json({ available: count === 0 });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ error: 'Internal server error' });
        });
};
/*** 
 * fetch_category_detail
 * Created By: Krina Shah
 * Created Date: 05-14-2024
 * Description: This API endpoint is used to fetch details of a specific category.
 ***/
exports.fetch_category_detail = function(req, res) {
    var categoryName = req.body.category_name;
    Category.findOne({ category_name: categoryName })
        .then((category) => {
            res.json({ category: category });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ error: 'Internal server error' });
        });
};

/*** 
 * add_category
 * Created By: Krina Shah
 * Created Date: 05-14-2024
 * Description: This API endpoint is used to add a new category to the database.
 * ADMINPANEL-173
 ***/
exports.add_category = function(req, res) {
    var categoryName = req.body.category_name;

    // Validate for special characters
    var regex = /^[a-zA-Z0-9\s]+$/;
    if (!regex.test(categoryName)) {
        // If category name contains special characters, send an error response
        return res.status(400).json({ success: false, error: 'Category name should not contain special characters' });
    }

    // Check if category name already exists
    Category.findOne({ category_name: categoryName })
        .then((existingCategory) => {
            if (existingCategory) {
                // Category already exists, send an error response
                res.status(400).json({ success: false, error: 'Category name already exists' });
            } else {
                // Create a new category instance
                var newCategory = new Category({
                    category_name: categoryName
                });

                // Save the new category to the database
                newCategory.save()
                    .then((category) => {
                        // Fetch all categories from the database
                        Category.find({})
                            .then((categories) => {
                                // Render the add_category view with categories data
                                res.render('add_category', { categories: categories });
                            })
                            .catch((err) => {
                                console.log(err);
                                res.status(500).json({ success: false, error: 'Internal server error' });
                            });
                    })
                    .catch((err) => {
                        console.log(err);
                        res.status(500).json({ success: false, error: 'Internal server error' });
                    });
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ success: false, error: 'Internal server error' });
        });
};


exports.GetCategoryList = function(req, res) {
    // Extract the 'expense_categories' parameter from the request body
    const expense_categories = req.body.expense_categories;

    // Check if 'expense_categories' is exactly equal to 'true'
    if (expense_categories === 'true') {
        // Fetch only the category_name from all categories in the database
        Category.find({}, { category_name: 1, _id: 0 })
            .then((categories) => {
                // Return the list of category names as a JSON response
                const categoryNames = categories.map(category => category.category_name);
                res.status(200).json({ success: true, categories: categoryNames });
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json({ success: false, error: 'Internal server error' });
            });
    } else {
        // If 'expense_categories' is not exactly equal to 'true', return an empty response
        res.status(200).json({ success: true, categories: [] });
    }
};
