"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const currency_1 = __importDefault(require("./routes/currency"));
async function app(server, opts) {
    server.register(currency_1.default);
}
exports.default = app;
