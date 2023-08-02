const asyncHandler = require('express-async-handler');
const APIError = require("../Helper/APIError");
const CreateResponse = require("../ResponseObject/responseObject");
const updatedFields = require("../Shared/updatedFields");
const {filter, select, sort, pagination} = require("../Shared/queryRequest");

exports.getAllDocuments = (model, searchFields, modelName = 'Items') => 
    asyncHandler(async (request, response) => {
        const filtedFields = filter(request, ...searchFields);
        const {page, limit, skip, totalPages} = await pagination(request, await model.countDocuments(filtedFields));
        const AllProducts = await model.find(filtedFields, select(request)).skip(skip).limit(limit).sort(sort(request));
        response.status(200).json(CreateResponse(true, `All ${modelName} are retrieved successfully`, AllProducts, page, limit, totalPages));
    })

exports.getDocumentById = (model, modelName = 'Item') => 
    asyncHandler(async (request, response, next) => {
        const document = await model.findById(request.params.id, select(request))
        if(!document) {
            next(new APIError(`This ${modelName} is not found`, 404));
            return;
        }
        response.status(200).json(CreateResponse(true, `The data of this ${modelName} is retrieved successfully`, [document]));
    })

exports.addDocument = (model, modelName = 'Item') => 
    asyncHandler(async (request, response) => {
        const document = await model.create(request.body);
        response.status(201).json(CreateResponse(true, `The ${modelName} is added successfully`, [document]));
    })

exports.updateDocument = (model, modelName = 'Item', ...properties) => 
    asyncHandler(async (request, response, next) => {        
        const targetFields = updatedFields(request, properties);
        const updatedDocument = await model.findOneAndUpdate({_id: request.params.id}, targetFields, {new: true})
        if(!updatedDocument) {
            next(new APIError(`This ${modelName} is not found`, 404));
            return;
        }
        response.status(200).json(CreateResponse(true, `This ${modelName} is updated successfully`, [updatedDocument]));
    })

exports.deleteDocument = (model, modelName = 'Item') =>
    asyncHandler(async (request, response, next) => {
        const deletedDocument = await model.findOneAndUpdate({_id: request.params.id}, {deleted: true, available: false})
        if(!deletedDocument) {
            next(new APIError(`This ${modelName} is not found`, 404));
            return;
        }
        response.status(204).json();
    })