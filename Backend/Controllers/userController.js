const bcrypt = require("bcrypt");
const asyncHandler = require("express-async-handler");
const CreateResponse = require("../ResponseObject/responseObject");
const APIError = require("../Helper/APIError");
const userModel = require("../Models/userModel");
const {getAllDocuments, getDocumentById, addDocument, updateDocument, softDeleteDocument} = require("./baseController");

// @desc    Create All users
// @route   GET /user
// @access  Public
const searchFields = ["firstName", "lastName", "email", "mobilePhone", "role"];
exports.getAllUsers = getAllDocuments(userModel, 'Users', ...searchFields);

// @desc    Create User by ID
// @route   GET /user/:id
// @access  Public
exports.getUserById = getDocumentById(userModel, 'User');

// @desc    Signup
// @route   POST /User
// @access  Public
exports.addUser = addDocument(userModel, 'User');

// @desc    Update User
// @route   PATCH /user/:id
// @access  Private
const properties = ["firstName", "lastName", "profileImage", "mobilePhone", "available"];
exports.updateUser = updateDocument(userModel, 'User', ...properties);

// @desc    Update User
// @route   PATCH /user/:id/role
// @access  Private
exports.updateUserRole = updateDocument(userModel, 'User', "role");

// @desc    Block User
// @route   POST /user/:id
// @access  Private
exports.blockUser = updateDocument(userModel, 'User', "blocked");

// @desc    Change Email
// @route   PATCH /user/:id/changeemail
// @access  Private
exports.changeEmail = asyncHandler(async (request, response, next) => {
    const user = await userModel.findOne({email: request.body.currentEmail});
    if(user && await bcrypt.compare(request.body.password, user.password)) {
        user.password = request.body.newEmail;
        await user.save();
        response.status(200).json(CreateResponse(true, 'Your Email is updated successfully, please login again.')); // generate token and send it
        return;
    }
    next(new APIError('Your email or password may be incorrect', 401));
})

// @desc    Change Password
// @route   PATCH /user/:id/changepassword
// @access  Private
exports.changePassword = asyncHandler(async (request, response, next) => {
    const user = await userModel.findOne({email: request.body.email});
    if(user && await bcrypt.compare(request.body.currentPassword, user.password)) {
        user.password = request.body.newPassword;
        user.passwordUpdatedTime = Date.now();
        await user.save();
        response.status(200).json(CreateResponse(true, 'Your Password is updated successfully, please login again.')); // generate token and send it
        return;
    }
    next(new APIError('Your email or password may be incorrect', 401));
})

// @desc    Delete User
// @route   DELETE /user/:id
// @access  Private
exports.deleteUser = softDeleteDocument(userModel, 'User');