"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston = require("winston");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
    // winston.format.timestamp(),
    winston.format.json()),
    transports: [
        new winston.transports.File({ filename: "error.log", level: "error" }),
        new winston.transports.File({ filename: "combined.log" }),
    ],
});
if (process.env.NODE_ENV !== "production") {
    exports.logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}
// module.exports = logger;
