"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Events = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
// Define the Event schema
const eventSchema = new mongoose_1.default.Schema({
    city: {
        type: String,
        required: true
    },
    event: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    venue: {
        type: String,
        required: true
    }
}, { collection: 'events' });
// Create the Event model
const Events = mongoose_1.default.model('Event', eventSchema);
exports.Events = Events;
// Also export as default for backwards compatibility
exports.default = Events;
