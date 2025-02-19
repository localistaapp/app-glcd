import React, { Component } from 'react';
import { render } from 'react-dom';

import OrdersList from './ordersList.jsx';
import OrderDetail from './orderDetail.jsx';
import Inventory from './inventory.jsx';
import Dashboard from './dashboard.jsx';
import Quote from './quote.jsx';
import QuoteRes from './quoteRes.jsx';
import CreateOrder from './createOrder.jsx';
import CreateStore from './createStore.jsx';
import CreateStoreOrder from './createStoreOrder.jsx';
import PayStoreOrder from './payStoreOrder.jsx';
import StoreInventory from './storeInventory.jsx';
import StoreChecklist from './storeChecklist.jsx';
import StoreOnboarding from './storeOnboarding.jsx';
import CreateEnquiry from './createEnquiry.jsx';
import CreateSampleOrder from'./createSampleOrder.jsx';
import StoreLocationPlanner from'./storeLocationPlanner.jsx';
import StoreMenu from'./storeMenu.jsx';
import Enquiries from './enquiries.jsx';
import WebOrders from './webOrders.jsx';
import { BrowserRouter as Router, Route, Link, withRouter } from 'react-router-dom';


var OrdersWithRouter = withRouter(OrdersList);
var OrderDetailWithRouter = withRouter(OrderDetail);
var InventoryWithRouter = withRouter(Inventory);
var DashboardWithRouter = withRouter(Dashboard);
var QuoteWithRouter = withRouter(Quote);
var QuoteResWithRouter = withRouter(QuoteRes);
var CreateOrderWithRouter = withRouter(CreateOrder);
var CreateEnquiryWithRouter = withRouter(CreateEnquiry);
var CreateSampleOrderWithRouter = withRouter(CreateSampleOrder);
var StoreLocationPannerWithRouter = withRouter(StoreLocationPlanner);
var StoreMenuWithRouter = withRouter(StoreMenu);
var EnquiriesWithRouter = withRouter(Enquiries);
var CreateStoreWithRouter = withRouter(CreateStore);
var CreateStoreOrderWithRouter = withRouter(CreateStoreOrder);
var PayStoreOrderWithRouter = withRouter(PayStoreOrder);
var StoreInventoryWithRouter = withRouter(StoreInventory);
var StoreChecklistWithRouter = withRouter(StoreChecklist);
var StoreOnboardingWithRouter =  withRouter(StoreOnboarding);
var WebOrdersWithRouter = withRouter(WebOrders);

render(<Router>
    <div>
        <Route path="/" render={() => (
            <div className="results">
                    <Route exact path="/" component={OrdersWithRouter} />
                <Route path="/orders/" component={OrdersWithRouter} />
            </div>)} />
        <Route path="/order-detail" exact render={() => (
                    <div className="results">
                            <Route exact path="/" component={OrderDetailWithRouter} />
                        <Route  path="/order-detail" component={OrderDetailWithRouter} />
                    </div>)} />
        <Route path="/inventory" exact render={() => (
                    <div className="results">
                            <Route exact path="/" component={InventoryWithRouter} />
                        <Route  path="/inventory" component={InventoryWithRouter} />
                    </div>)} />
        <Route path="/dashboard" exact render={() => (
                    <div className="results">
                            <Route exact path="/" component={DashboardWithRouter} />
                        <Route  path="/dashboard" component={DashboardWithRouter} />
                    </div>)} />
        <Route path="/dashboard-quote" exact render={() => (
                    <div className="results">
                            <Route exact path="/" component={QuoteWithRouter} />
                        <Route  path="/dashboard-quote" component={QuoteWithRouter} />
                    </div>)} />
        <Route path="/dashboard-quote-res" exact render={() => (
                    <div className="results">
                            <Route exact path="/" component={QuoteResWithRouter} />
                        <Route  path="/dashboard-quote-res" component={QuoteResWithRouter} />
                    </div>)} />
        <Route path="/dashboard-create-order" exact render={() => (
                    <div className="results">
                            <Route exact path="/" component={CreateOrderWithRouter} />
                        <Route  path="/dashboard-create-order" component={CreateOrderWithRouter} />
                    </div>)} />
        <Route path="/dashboard-create-enquiry" exact render={() => (
                            <div className="results">
                                    <Route exact path="/" component={CreateEnquiryWithRouter} />
                                <Route  path="/dashboard-create-enquiry" component={CreateEnquiryWithRouter} />
                            </div>)} />
        <Route path="/dashboard-create-sample-order" exact render={() => (
                    <div className="results">
                            <Route exact path="/" component={CreateSampleOrderWithRouter} />
                        <Route  path="/dashboard-create-sample-order" component={CreateSampleOrderWithRouter} />
                    </div>)} />
        <Route path="/dashboard-enquiries" exact render={() => (
                    <div className="results">
                            <Route exact path="/" component={EnquiriesWithRouter} />
                        <Route  path="/dashboard-enquiries" component={EnquiriesWithRouter} />
                    </div>)} />
        <Route path="/web-orders" exact render={() => (
                    <div className="results">
                            <Route exact path="/" component={WebOrdersWithRouter} />
                        <Route  path="/web-orders" component={WebOrdersWithRouter} />
                    </div>)} />
        <Route path="/store-location-planner" exact render={() => (
                    <div className="results">
                            <Route exact path="/" component={StoreLocationPannerWithRouter} />
                        <Route  path="/store-location-planner" component={StoreLocationPannerWithRouter} />
                    </div>)} />
        <Route path="/dashboard-create-store" exact render={() => (
        <div className="results">
                <Route exact path="/" component={CreateStoreWithRouter} />
            <Route  path="/dashboard-create-store" component={CreateStoreWithRouter} />
        </div>)} />
        <Route path="/dashboard-create-store-order" exact render={() => (
        <div className="results">
                <Route exact path="/" component={CreateStoreOrderWithRouter} />
            <Route  path="/dashboard-create-store-order" component={CreateStoreOrderWithRouter} />
        </div>)} />
        <Route path="/dashboard-pay-store-order" exact render={() => (
        <div className="results">
                <Route exact path="/" component={PayStoreOrderWithRouter} />
            <Route  path="/dashboard-pay-store-order" component={PayStoreOrderWithRouter} />
        </div>)} />
        <Route path="/dashboard-store-inventory" exact render={() => (
        <div className="results">
                <Route exact path="/" component={StoreInventoryWithRouter} />
            <Route  path="/dashboard-store-inventory" component={StoreInventoryWithRouter} />
        </div>)} />
        <Route path="/dashboard-store-checklist" exact render={() => (
        <div className="results">
                <Route exact path="/" component={StoreChecklistWithRouter} />
            <Route  path="/dashboard-store-checklist" component={StoreChecklistWithRouter} />
        </div>)} />
        <Route path="/dashboard-store-onboarding" exact render={() => (
        <div className="results">
                <Route exact path="/" component={StoreOnboardingWithRouter} />
            <Route  path="/dashboard-store-onboarding" component={StoreOnboardingWithRouter} />
        </div>)} />

        <Route path="/store" exact render={() => (
        <div className="results">
                <Route exact path="/" component={StoreMenuWithRouter} />
            <Route  path="/store" component={StoreMenuWithRouter} />
        </div>)} />
    </div>
</Router>, document.getElementById('containerWiz'));