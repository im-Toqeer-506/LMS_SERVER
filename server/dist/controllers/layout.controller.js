"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLayoutByType = exports.editLayout = exports.createLayout = void 0;
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const layout_model_1 = __importDefault(require("../models/layout.model"));
const cloudinary_1 = __importDefault(require("cloudinary"));
//create layout
exports.createLayout = (0, catchAsyncErrors_1.catchAsyncErrors)(async (req, res, next) => {
    try {
        const { type } = req.body;
        const isTypeExist = await layout_model_1.default.findOne({ type });
        if (isTypeExist) {
            return next(new ErrorHandler_1.default(`${type} already exists`, 400));
        }
        if (type == "Banner") {
            const { image, title, subTitle } = req.body;
            const myCloud = await cloudinary_1.default.v2.uploader.upload(image, {
                folder: "Banner",
            });
            const banner = {
                type: "Banner",
                banner: {
                    image: {
                        public_id: myCloud.public_id,
                        url: myCloud.secure_url,
                    },
                    title,
                    subTitle,
                },
            };
            await layout_model_1.default.create(banner);
        }
        if (type === 'FAQ') {
            const { faq } = req.body;
            // Validate faq structure
            const faqItems = faq.map((item) => ({
                question: item.question,
                answer: item.answer
            }));
            await layout_model_1.default.create({ type: 'FAQ', faq: faqItems });
        }
        if (type === 'Categories') {
            const { categories } = req.body;
            const categoriesItems = await Promise.all(categories.map(async (item) => {
                return {
                    title: item.title
                };
            }));
            await layout_model_1.default.create({ type: 'Categories', categories: categoriesItems });
        }
        res.status(201).json({
            success: true,
            message: "Layout created successfully",
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
//Edit layouot 
exports.editLayout = (0, catchAsyncErrors_1.catchAsyncErrors)(async (req, res, next) => {
    try {
        const { type } = req.body;
        if (type == "Banner") {
            const bannerData = await layout_model_1.default.findOne({ type: 'Banner' });
            if (!bannerData) {
                return next(new ErrorHandler_1.default("Banner not found", 404));
            }
            const { image, title, subTitle } = req.body;
            const data = image.startsWith('https') ? bannerData : await cloudinary_1.default.v2.uploader.upload(image, {
                folder: "Banner",
            });
            const banner = {
                type: "Banner",
                image: {
                    public_id: image.startsWith('https') ? bannerData.banner.image.public_id : data.public_id,
                    url: image.startsWith('https') ? bannerData.banner.image.url : data.secure_url,
                },
                title,
                subTitle,
            };
            await layout_model_1.default.findByIdAndUpdate(bannerData._id, { banner });
        }
        if (type === 'FAQ') {
            const { faq } = req.body;
            const faqData = await layout_model_1.default.findOne({ type: 'FAQ' });
            if (!faqData) {
                return next(new ErrorHandler_1.default("FAQ not found", 404));
            }
            // Validate faq structure
            const faqItems = await Promise.all(faq.map(async (item) => {
                return {
                    question: item.question,
                    answer: item.answer
                };
            }));
            await layout_model_1.default.findByIdAndUpdate(faqData._id, { type: 'FAQ', faq: faqItems });
        }
        if (type === 'Categories') {
            const { categories } = req.body;
            const categoriesData = await layout_model_1.default.findOne({ type: 'Categories' });
            if (!categoriesData) {
                return next(new ErrorHandler_1.default("Categories not found", 404));
            }
            const categoriesItems = await Promise.all(categories.map(async (item) => {
                return {
                    title: item.title
                };
            }));
            await layout_model_1.default.findByIdAndUpdate(categoriesData._id, {
                type: 'Categories',
                categories: categoriesItems
            });
        }
        res.status(201).json({
            success: true,
            message: "Layout Updated successfully",
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
//get layout by type 
exports.getLayoutByType = (0, catchAsyncErrors_1.catchAsyncErrors)(async (req, res, next) => {
    try {
        const { type } = req.params;
        const layout = await layout_model_1.default.findOne({ type });
        res.status(200).json({
            success: true,
            layout
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
