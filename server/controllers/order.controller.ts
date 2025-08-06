require('dotenv').config();
import { NextFunction,Request,Response } from "express";
import { catchAsyncErrors } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import OrderModel,{IOrder} from "../models/order.model";
import userModel from "../models/user.model";
import CourseModel, { ICourse } from "../models/course.model";
import path from "path";
import ejs from "ejs"
import sendMail from "../utils/sendMail";
import NotificationModel from "../models/notification.model";
import { getAllOrdersService, newOrder } from "../services/order.service";
import { redis } from "../utils/redis";
const stripe=require('stripe')(process.env.STRIPE_SECRET_KEY);
//create Model 
export const createOrder=catchAsyncErrors(async(req:Request,res:Response,next:NextFunction)=>{
 try {
    const {courseId,payment_info} =req.body as IOrder;
    //Verify Stripe Payment Intent if payment_info is provided
    if(payment_info){
        if('id' in payment_info)
        {
        const paymentIntentId=payment_info.id;
        const  paymentIntent=await stripe.paymentIntents.retrieve(paymentIntentId);
        if(paymentIntent.status!=='succeeded'){
            return next(new ErrorHandler("Payment not successfull!",400));
        }
        }
    }
    const user=await userModel.findById(req.user?._id);
    const courseExistInUser=user?.courses.some((course:any)=>course._id.toString()===courseId);
    if(courseExistInUser){
        return next(new ErrorHandler("You have already purchased this course.", 400));
    }
    const course=await CourseModel.findById(courseId) as any;
    if(!course){
        return next(new ErrorHandler("Course not found.", 404));
    }
    const data:any={
     courseId:course._id,
     userId:user?._id,
     payment_info
    }
    const mailData = {
    order: {
    _id: course._id.toString().slice(0, 6),
    name: course.name,
    price: course.price,
    date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    },
    };
    const html=await ejs.renderFile(path.join(__dirname, "../mails/order-confirmation.ejs"),{order: mailData});
    try {
        if(user){
            await sendMail({
                email:user.email,
                subject:"Order Confirmation!",
                template:'order-confirmation.ejs',
                data:mailData,
            })
        }
    }catch (error:any) {
    return next(new ErrorHandler(error.message, 400));
    } 
    user?.courses.push(course?._id);
    await redis.set(req.user!._id, JSON.stringify(user));
    await user?.save();
    course.purchased = (course.purchased || 0) + 1;
    await course.save();
    await NotificationModel.create({
        user:user?._id,
        title:"New Order",
        message:`You have a new Ordr from ${course.name}`
    })
    newOrder(data,res,next);
 }  catch (error:any) {
    return next(new ErrorHandler(error.message, 400));
}
});
// get all orders --- only Admin
export const getAllOrders = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
    getAllOrdersService(res);
    } catch (error:any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
// send stripe-publishable key
export const sendStripePublishableKey=catchAsyncErrors(async(req:Request,res:Response,next:NextFunction)=>{
    res.status(200).json({
    success:true,
    publishableKey:process.env.STRIPE_PUBLISHABLE_KEY
    })
})
//newPayment
export const newPayment=catchAsyncErrors(async(req:Request,res:Response,next:NextFunction)=>{
   try {
    const myPayment=await stripe.paymentIntents.create(
        {
            amount:req.body.amount,
            currency:'USD',
            metadata:{
                company:"ELearning",
            },
            automatic_payment_methods:{
                enabled:true,
            }
        }
    )
    res.status(201).json({
        client_secret:myPayment.client_secret,
        success:true
    })
   } catch (error:any) {
    return next(new ErrorHandler(error.message,500));
   } 
})