


import { Response, Router } from "express";

import { IRequest, responseError, User } from "../../../common";
import { ISubscriptionFormCreate, Subscriptions, Interval, SubscriptionTransactionss, SubscriptionType } from "../models";
import * as dollarsToCents from 'dollars-to-cents';
const stripe = require("stripe")(process.env.STRIPE_DETAILS);

export function subscriptionRouter(route: Router) {

  route.post("/subscriptions/product", createProduct);
  route.post("/subscriptions/plan", createPlan);
  route.delete("/subscriptions/deleteProduct", deleteStripeProduct);
  route.delete("/subscriptions/deletePlan", deleteStripePlan);
  route.get("/subscriptions/listPlans", listAllPlans);
  route.get("/subscriptions/listSubscriptionPackages", listSubscriptionPackages);
  route.post("/subscriptions/purchaseProduct", purchaseProduct);
  route.post("/subscriptions/subscribe", subscribe);
  route.get("/subscriptions/isSuperSurfActivated", isSuperSurfActivated);
}

async function createProduct(req: IRequest, res: Response) {
  try {
  const currentUserId = req.context.currentUser._id;
  console.log("Req Body is ", req.body);
  const form : ISubscriptionFormCreate = req.body;
  form.type = SubscriptionType.PRODUCT;
  form.createdBy = currentUserId;
  console.log("Form is : ", form);
  

  const stripeForm = {
    name: form.name,
    type: 'good',
    description: form.benefits + " - " + form.amount
  }
  console.log("Stripe product form is: ", stripeForm);
  const stripeProduct = await stripe.products.create(stripeForm);
  
  form.stripeId = stripeProduct.id;
  const subscription = await Subscriptions.create(form);
  console.log("subscription created is : ", subscription);
  
  return res.json(
    {
      stripeProduct: stripeProduct,
      subscriptions: subscription
    });

  
  } catch(error) {
    return responseError(req, res, error);
  }
}

async function createPlan(req: IRequest, res: Response) {
  try {
  const currentUserId = req.context.currentUser._id;
  console.log("Req Body is ", req.body);
  
  const form : ISubscriptionFormCreate = req.body;
  const cents = dollarsToCents(form.amount);
  form.type = SubscriptionType.PLAN;
  form.createdBy = currentUserId;
  console.log("Form is : ", form);
  

  var interval = "";
  if(form.interval.toString() === Interval.MONTHLY) {
    interval = "month";
  } else if(form.interval.toString() === Interval.WEEKLY) {
    interval = "week";
  }

  const stripeForm = {
    interval: interval,
    interval_count: form.duration,
    product: {
      name: form.name
    },
    amount: cents,
    currency: "usd"
  }
  console.log("Stripe plan form is: ", stripeForm);
  const stripePlan = await stripe.plans.create(stripeForm);

  console.log("Stripe plan created: ", stripePlan);

  form.stripeId = stripePlan.id;
  const subscription = await Subscriptions.create(form);
  console.log("subscription created is : ", subscription);
  
  
  return res.json(
    {
      stripeProduct: stripePlan,
      subscriptions: subscription
    });

  
  } catch(error) {
    return responseError(req, res, error);
  }
}

async function listAllPlans(req:IRequest, res: Response) {
  try {
    const plans  = await stripe.plans.list(
      { limit: 3 });
      return res.json({plans: plans});
  } catch (error) {
    return responseError(req, res, error);
  }
}
async function deleteStripeProduct(req:IRequest, res: Response) {
  try {
    const productId = req.body.productId;
    console.log("Stripe product ID: ", productId);
    const delProduct = await stripe.products.del(productId);
    if(delProduct && delProduct.deleted === true) {
      await Subscriptions.findOneAndDelete({stripeId: productId});
    }
    return res.json({response: delProduct});
  } catch(error) {
    return res.json(responseError(req, res, error));
  }
}

async function deleteStripePlan(req:IRequest, res: Response) {
  try {
    const planId = req.body.planId;
    console.log("Stripe product ID: ", planId);
    const delProduct = await stripe.plans.del(planId);
    if(delProduct && delProduct.deleted === true) {
      await Subscriptions.findOneAndDelete({stripeId: planId});
    }
    return res.json({response: delProduct});
  } catch(error) {
    return res.json(responseError(req, res, error));
  }
}

async function listSubscriptionPackages(req: IRequest, res: Response) {
  try{
    const subscriptions = await Subscriptions.find({});
    var plans = [];
    var products = [];
    if(typeof subscriptions != 'undefined' && subscriptions && subscriptions.length > 0) {
      for(var i = 0; i < subscriptions.length; i++) {
        const subscription = subscriptions[i];
        if(subscription.type.toString() === SubscriptionType.PRODUCT.toString()) {
          products.push(subscription);
        } else if(subscription.type.toString() === SubscriptionType.PLAN.toString()) {
          plans.push(subscription);
        }
      }
    }
    return res.json({
      "surfLite" : products,
      "superSurf" : plans
    });
  } catch (error) {
    return responseError(req, res, error);
  }
}

async function purchaseProduct(req:IRequest, res: Response) {
  try {
    const id = req.body.description;
    const cents = dollarsToCents(req.body.amount);
    const chargeForm = {
      amount: cents,
      currency: "usd",
      source: req.body.source,
      description: req.body.description
    }

    const stripeCharge = await stripe.charges.create(chargeForm);
    const subscription = await Subscriptions.findById(id);
    
    const freeSurfs = subscription.freeSurfs;
    if(stripeCharge && typeof stripeCharge != 'undefined') {
      const subscriptionTransaction = {
        transactionDate: new Date(),
        transactionAmount: req.body.amount,
        transactionReceipt: stripeCharge,
        userId: req.context.currentUser._id,
        paymentType: stripeCharge.payment_method_details,
        paymentGatewayInput: chargeForm,
        subscriptionName: req.body.description,
        stripeId: req.body.stripeId,
        subscriptionId: req.body.subscriptionId,
        createdBy: req.context.currentUser._id
      }
      const transaction = await SubscriptionTransactionss.create(subscriptionTransaction);
      console.log("Transaction recorded: ", transaction);
    }
    return res.json({"freeSurfs": freeSurfs, "stripeCharge": stripeCharge});
  } catch (error) {
    return responseError(req, res, error);
  }
}

async function subscribe(req: IRequest, res: Response) {
  try {
    const currentUser = req.context.currentUser;
    const planId = req.body.planId;
    const description = req.body.description;
    const source = req.body.source;
    const subscriptionId = req.body.subscriptionId;
    var customerId = "";
    var customerDetails = {};
    
    if(typeof currentUser.stripeCustomerId != 'undefined') {
      customerId = currentUser.stripeCustomerId;
      customerDetails = await stripe.customers.retrieve(customerId);
    } else {
      const customerForm = {
        description: description,
        source: source
      }
      const stripeCustomer = await stripe.customers.create (customerForm);
      if(typeof stripeCustomer != 'undefined') {
        customerId = stripeCustomer.id;
        customerDetails = stripeCustomer;
      
        const user = await User.findByIdAndUpdate(currentUser._id, {stripeCustomerId: customerId}, {new: true});
        console.log("Updated User: ", user);
      }
      
    }
    
    const subscriptionForm = {
      customer: customerId,
      items: [
        {
          plan: planId
        },
      ]
    }
    const stripeSubscription = await stripe.subscriptions.create(subscriptionForm);
    console.log("Subscription created: ", stripeSubscription);
    if(stripeSubscription && typeof stripeSubscription != 'undefined') {
      const subscriptionTransaction = {
        transactionDate: new Date(),
        transactionAmount: stripeSubscription.plan.amount,
        transactionReceipt: stripeSubscription,
        userId: req.context.currentUser._id,
        paymentType: customerDetails,
        paymentGatewayInput: subscriptionForm,
        subscriptionName: stripeSubscription.plan.id,
        stripeId: planId,
        subscriptionId: subscriptionId,
        createdBy: req.context.currentUser._id
      }
      const transaction = await SubscriptionTransactionss.create(subscriptionTransaction);
      console.log("Transaction recorded: ", transaction);
    }
    return res.json({"stripeSubscription": stripeSubscription});
    
  } catch (error) {
    return responseError(req, res, error);
  }
}

async function isSuperSurfActivated(req:IRequest, res: Response) {
  try {
    const currentUserId = req.context.currentUser._id;
    var isSuperSurfActivated = false;
    const transactions = await SubscriptionTransactionss.find({createdBy: currentUserId}).sort({createdAt: -1});
    console.log("Transactions: ", transactions);
    if(null != transactions && transactions.length >0 ) {
      for(var i=0; i<transactions.length; i++) {
        var transaction = transactions[i];
        var subscriptionId = transaction.subscriptionId;
        var subscription = await Subscriptions.findById(subscriptionId);
        console.log("Subscription: ", subscription);
        if(null != subscription && subscription.type.toString() === SubscriptionType.PLAN.toString()) {
          var interval = subscription.interval;
          var subscriptionDate = <any>subscription.createdAt;
          var currentDate  = <any>new Date();
          var diffInDays = Math.floor((currentDate-subscriptionDate)/(1000 * 60 * 60 * 24));
          console.log("Diff in days: ", diffInDays); 
          if(interval.toString() === Interval.MONTHLY.toString()) {
            var months = <any>subscription.duration;
            var days = months * 30;
            console.log("Days: ", days);
            if(diffInDays < days) {
              isSuperSurfActivated = true;
              break;
            }
          } else if(interval.toString() === Interval.WEEKLY.toString()) {
            var duration = <any>subscription.duration;
            var daysCount = duration * 7;
            console.log("daysCount: ", daysCount);
            if(diffInDays < daysCount) {
              isSuperSurfActivated = true;
              break;
            }
          }
        }
      }
    } 
    return res.json({isSuperSurfActivated: isSuperSurfActivated});
  } catch(error) {
    return responseError(req, res, error);
  }
}