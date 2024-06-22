"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controllers_1 = __importDefault(require("./auth.controllers"));
const router = (0, express_1.Router)();
router.post('/sign-in', auth_controllers_1.default.loginUser);
router.post('/sign-up', auth_controllers_1.default.registerUser);
router.post('/logout', auth_controllers_1.default.logoutUser);
router.post('/refresh', auth_controllers_1.default.refreshToken);
router.post('/forgot', auth_controllers_1.default.forgotPassword);
router.get('/user', auth_controllers_1.default.authenticateToken, auth_controllers_1.default.getUser);
router.get('/get', auth_controllers_1.default.getRedisData);
router.post('/set', auth_controllers_1.default.postRedisData);
router.post('/set', auth_controllers_1.default.postRedisData);
// router.post('/send-sms', authControllers.sendSms);
exports.default = router;
