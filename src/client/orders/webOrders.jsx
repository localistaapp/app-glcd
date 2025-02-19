import React, { Component } from 'react';
import axios from 'axios';
import { render } from 'react-dom';
import { Link, withRouter } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

import LocalPizzaIcon from '@material-ui/icons/LocalPizza';
import RestaurantIcon from '@material-ui/icons/Business';
import RequestQuoteIcon from '@material-ui/icons/NotesSharp';
import OrdersIcon from '@material-ui/icons/ViewListSharp';
import InventoryIcon from '@material-ui/icons/ShoppingBasket';
import ChatIcon from '@material-ui/icons/ChatBubble';

import { questions, conditionalQuestions } from '../../data-source/mockDataQnA';
import { useHistory } from "react-router-dom";

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
  },
});

function TabPanel(props) {
  const { children, value, index } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
    >
      <Box p={3}>{children}</Box>
    </Typography>
  );
}

class ReviewContainer extends Component {

    constructor(props) {
        super(props);
        this.state = {activeIndex: 0, activeOptions: [], activeCrustIndex: 0, qty: 0};
        this.setActiveTopic = this.setActiveTopic.bind(this);
    }
    componentDidMount() {
    }
    setOpinionArray(topicName) {
        let reviewTopics = this.props.reviewTopics;
        let activeOpinions = [];
        reviewTopics.forEach((reviewTopic)=> {
            if(reviewTopic.topic == topicName) {
                activeOpinions = reviewTopic.opinions;
            }
        });
        this.setState({activeOpinions: activeOpinions});

    }
    setCrustPrice(crustIndex) {
        let itemId = this.props.itemId.replace('p','').replace('g','');
        let crust = this.props.crustOptions[crustIndex].topic;
        let item = this.props.item;
        console.log('::Size::', this.props.reviewTopics[this.state.activeIndex].topic);
        console.log('::Crust::', crust);
        console.log('::Price::', this.props.reviewTopics[this.state.activeIndex]["pricing"][crust]);
        document.getElementById('price'+itemId).innerHTML = this.props.reviewTopics[this.state.activeIndex]["pricing"][crust] * (this.state.qty > 0 ? this.state.qty : 1);
        let N = Math.round(this.props.reviewTopics[this.state.activeIndex]["pricing"][crust] * (this.state.qty > 0 ? this.state.qty : 1) * 0.85);
        document.getElementById('priceNew'+itemId).innerHTML = isValidCoupon() ? Math.ceil(N / 10) * 10 : Math.round(this.props.reviewTopics[this.state.activeIndex]["pricing"][crust] * (this.state.qty > 0 ? this.state.qty : 1));
        if(this.state.qty > 0){
            var event = new CustomEvent('basket-updated', { detail: {type: item.type, name: item.title, crust: this.props.crustOptions[crustIndex].topic, size: this.props.reviewTopics[this.state.activeIndex].topic, qty: this.state.qty, price: this.props.reviewTopics[this.state.activeIndex]["pricing"][crust] * this.state.qty, itemId: this.props.itemId}});
            document.dispatchEvent(event);
        }
    }
    setSizePrice(activeIndex) {
        let size = this.props.reviewTopics[activeIndex].topic;
        let item = this.props.item;
        let itemId = this.props.itemId.replace('p','').replace('g','');
        console.log('::Size::', size);
        console.log('::Crust::', this.props.crustOptions[this.state.activeCrustIndex].topic);
        console.log('::Price::', this.props.crustOptions[this.state.activeCrustIndex]["pricing"][size]);
        document.getElementById('price'+itemId).innerHTML = this.props.crustOptions[this.state.activeCrustIndex]["pricing"][size] * (this.state.qty > 0 ? this.state.qty : 1);
        let N = Math.round(this.props.crustOptions[this.state.activeCrustIndex]["pricing"][size] * (this.state.qty > 0 ? this.state.qty : 1) * 0.85);
        document.getElementById('priceNew'+itemId).innerHTML = isValidCoupon() ? Math.ceil(N / 10) * 10 : Math.round(this.props.crustOptions[this.state.activeCrustIndex]["pricing"][size] * (this.state.qty > 0 ? this.state.qty : 1));
        if(this.state.qty > 0){
            var event = new CustomEvent('basket-updated', { detail: {type: item.type, name: item.title, crust: this.props.crustOptions[this.state.activeCrustIndex].topic, size: this.props.reviewTopics[activeIndex].topic, qty: this.state.qty, price: this.props.crustOptions[this.state.activeCrustIndex]["pricing"][size] * this.state.qty, itemId: this.props.itemId}});
            document.dispatchEvent(event);
        }
    }
    setActiveCrust(item, indexCrust) {
        console.log('index: ', indexCrust);
        this.setState({activeCrustIndex: indexCrust});
        this.setOpinionArray(item.topic);
    }
    setActiveTopic(item, index) {
            console.log('index: ', index);
            this.setState({activeIndex: index});
            this.setOpinionArray(item.topic);
            let itemId = this.props.itemId.replace('p','').replace('g','');

            if(document.querySelector('#primaryImg'+itemId).className.indexOf('rotate') != -1) {
                document.querySelector('#primaryImg'+itemId).classList.remove('rotate');
            } else {
                document.querySelector('#primaryImg'+itemId).classList.add('rotate');
            }
            if (index == 1) {
                 document.querySelector('#primaryImg'+itemId).style.padding = '12px';
            } else if (index == 2) {
                 document.querySelector('#primaryImg'+itemId).style.padding = '21px';
            } else if (index == 0) {
                 document.querySelector('#primaryImg'+itemId).style.padding = '0px';
            }
        }
    showMore(e) {
        e.target.parentNode.classList.add('scrollable');
        e.target.style.display = 'none';
        e.target.parentNode.children[e.target.parentNode.children.length - 1].style.marginTop = '7px';
    }
    updatePrice(qty) {
        if(qty >= 1) {
            let size = this.props.reviewTopics[this.state.activeIndex].topic;
            let itemId = this.props.itemId.replace('p','').replace('g','');
            document.getElementById('price'+itemId).innerHTML = this.props.crustOptions[this.state.activeCrustIndex]["pricing"][size] * qty;
            let N = Math.round(this.props.crustOptions[this.state.activeCrustIndex]["pricing"][size] * qty * 0.85);
            document.getElementById('priceNew'+itemId).innerHTML = isValidCoupon() ? Math.ceil(N / 10) * 10 : Math.round(this.props.crustOptions[this.state.activeCrustIndex]["pricing"][size] * qty);
        }
    }
    getPrice(qty) {
        let size = this.props.reviewTopics[this.state.activeIndex].topic;
        return this.props.crustOptions[this.state.activeCrustIndex]["pricing"][size] * qty;
    }

    render() {
        let {reviewTopics, crustOptions, item, itemId, type} = this.props;
        let {activeIndex, activeCrustIndex, activeOpinions, qty} = this.state;
        let activeDefaultOpinions = [];
        console.log('reviewTopics[0]:', reviewTopics[0]);
        activeDefaultOpinions = reviewTopics[0].opinions;

        let extraClasses = '', incrementerClass = '';
        if(type == 'starters') {
            extraClasses = 'starter-height';
            incrementerClass = 'starter-bottom-inc';
        }

        return (
          <div className={`reviews-container ${extraClasses}`}>
              <div className="topic-container">
                {type != 'starters' && reviewTopics && reviewTopics.map((review, index) => {
                    return (
                        <React.Fragment>
                            <div className={activeIndex===index ? 'review-topic active': 'review-topic'} onClick={()=>{this.setActiveTopic(review, index);  this.setSizePrice(index); }}>
                                {review.topic}
                            </div>
                        </React.Fragment>
                    );
                })}
                </div>


                {type != 'starters' && <div className="topic-container" style={{height: '76px'}}>
                    <div className="card-mini-title">Select your crust:</div>
                    {crustOptions && crustOptions.map((crust, indexCrust) => {
                        return (
                            <React.Fragment>
                                <div className={activeCrustIndex===indexCrust ? 'review-topic active-crust': 'review-topic'} onClick={()=>{this.setActiveCrust(crust, indexCrust); this.setCrustPrice(indexCrust); }}>
                                    {crust.topic}
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>}

                {type == 'starters' && <div>
                    <div class="title starter-title">Freshly baked on arrival of your order</div>
                </div>}

                <div className={`incrementer sf-inc ${incrementerClass}`}>
                    <div class="card-mini-title" >Quantity:</div>
                    <div class="quantity">
                        <a className="quantity__minus"><span onClick={()=>{if(this.state.qty>0){this.setState({qty: this.state.qty - 1});}this.updatePrice(this.state.qty - 1);var event = new CustomEvent('basket-updated', { detail: {type: item.type, name: item.title, crust: crustOptions[this.state.activeCrustIndex].topic, size: reviewTopics[this.state.activeIndex].topic, qty: this.state.qty - 1, price: this.getPrice(this.state.qty - 1), itemId: itemId}});document.dispatchEvent(event);}} style={{fontSize: '25px', lineHeight: '0px', marginLeft: '2px'}}>-</span></a>
                        <input name="quantity" type="text" className="quantity__input" value={this.state.qty} />
                        <a className="quantity__plus"><span onClick={()=>{this.setState({qty: this.state.qty + 1});console.log('item:',item);var event = new CustomEvent('basket-updated', { detail: {type: item.type, name: item.title, crust: crustOptions[this.state.activeCrustIndex].topic, size: reviewTopics[this.state.activeIndex].topic, qty: this.state.qty + 1, price: this.getPrice(this.state.qty + 1), itemId: itemId}});document.dispatchEvent(event);this.updatePrice(this.state.qty + 1)}}>+</span></a>
                      </div>
                </div>
          </div>
        );
    }
}

class QuoteCard extends Component {

    constructor(props) {
        super(props);
        this.state = {};
    }
    componentDidMount() {
    }
    appendZero(number) {
        if (number > 0 && number < 10) {
            return '0' + number;
        }
        return number;
    }

    render() {
        let {index, data} = this.props;
        let prefix = 'p';
        let extraClasses = '';
        if(this.props.type && this.props.type == 'starters') {
         prefix = 'g';
         extraClasses = 'starter';
        }
        let defaultPrice = 235;
        return (
        <div className="card-container">
            <div className="section-one" style={{display: 'block'}}>
                <br/>
                <div className="usp-desc">Toppings of guest's choice</div>
                <div className="top">
                    <div className="top-left" style={{position:'absolute',margin:'0 auto',left:'0',right:'0'}}>
                        <img id={`primaryImg${index}`} className={`primary-img rotatable sf-img ${extraClasses}`} src={`../../../img/images/${prefix}${index+1}.png`} />
                    </div>
                    <div className="top-right">
                        <div className="usp-title"></div>

                    </div>
                </div>
            </div>
            <div className="section-two">
                <div className="pricing" style={{top: '-86px'}}><label className="price"><span className="slashed" id={`price${index}`}>{defaultPrice * parseInt(sessionStorage.getItem('qty'),10)}</span><span className="rupee" style={{marginLeft: '6px'}}>₹</span><span className="orig" id={`priceNew${index}`}>{Math.ceil(defaultPrice * parseInt(sessionStorage.getItem('qty'),10) * 0.85)}</span></label></div>
                <div className="top">
                </div>
            </div>
        </div>)
    }
}

class Card extends Component {

    constructor(props) {
        super(props);
        this.state = {};
    }
    componentDidMount() {
    }
    appendZero(number) {
        if (number > 0 && number < 10) {
            return '0' + number;
        }
        return number;
    }

    render() {
        let {index, data} = this.props;
        let prefix = 'p';
        let extraClasses = '';
        if(this.props.type && this.props.type == 'starters') {
         prefix = 'g';
         extraClasses = 'starter';
        }
        return (
        <div className="card-container">
            <div className="section-one">
                <br/>
                <div className="top">
                    <div className="top-left">
                        <img id={`primaryImg${index}`} className={`primary-img rotatable sf-img ${extraClasses}`} src={`../../../img/images/${prefix}${index+1}.png`} />
                    </div>
                    <div className="top-right">
                        <div className="usp-title"></div>
                        <div className="usp-desc">{data.usp[0]}</div>
                    </div>
                </div>
            </div>
            <div className="title">{data.title}</div>
            <hr className="line"/>
            <div className="section-two">
                <div className="pricing"><label className="price"><span className="slashed" id={`price${index}`}>{data.qna[0].defaultPrice}</span><span className="rupee" style={{marginLeft: '6px'}}>₹</span><span className="orig" id={`priceNew${index}`}>{isValidCoupon() ? Math.ceil(Math.round(data.qna[0].defaultPrice*0.85) / 10) * 10 : data.qna[0].defaultPrice}</span></label></div>
                <div className="top">
                    <ReviewContainer reviewTopics={data.qna[0].responses} crustOptions={data.qna[0].crust} itemId={`${prefix}${index}`} item={data} type={this.props.type} />
                </div>
            </div>
        </div>)
    }
}

class SummaryCard extends Component {

    constructor(props) {
        super(props);
        this.state = {};
    }
    componentDidMount() {
    }
    appendZero(number) {
        if (number > 0 && number < 10) {
            return '0' + number;
        }
        return number;
    }

    render() {
        let {index, data, summaryId, orderString, orderClicked} = this.props;
        let prefix = 'p';
        if(data.type && data.type == 'starter') {
            prefix = 'g';
        }
        return (
        <div className="card-container small" style={{padding: '0px 12px 0px 12px'}} onClick={()=>{orderClicked(data);}}>
            <div className="section-one">
                <div className="top">
                    <div className="top-left">
                            <img id={`primaryImg${index}`} className="primary-img rotatable" src={`../../../img/images/${summaryId}.png`} style={{width: '72px',paddingTop: '0px'}} />
                    </div>
                    <div className="top-right">
                        <div className="usp-title"><div className="title" style={{marginTop: '-10px',fontSize:'12px',lineHeight:'16px',textAlign:'left',left:'14px'}}>{orderString}</div></div>
                        {data.type == 'starter' ? <div className="usp-desc-wide usp-desc-wide">{data.qty} single starter(s)</div> : <div className="usp-desc usp-desc-wide">{data.name} - {data.mobile}</div>}
                    </div>
                </div>
            </div>

            <div className="section-two small">
                <div className="top">
                </div>
            </div>
        </div>)
    }
}


class Dashboard extends Component {

    constructor() {
        super();
        this.state = {
            value: 0,
            results: [],
            starters: [],
            activeStep: 1,
            showCoupon: false,
            couponApplied: false,
            showSlot: false,
            slotSelected: '',
            showList: 'hidden',
            showWizard: '',
            numVistors: 0,
            mobileNum: '',
            curStep: 1,
            redirect: false,
            enquiries: [],
            orders: [],
            orderCreatedAt: '',
            orderId: 0,
            orderName: '',
            orderMobile: '',
            orderAddress: '',
            orderPincode: '',
            orderPrice: '',
            orderSchedule: '',
            orderSlot: '',
            orderStatus: '',
            showOrderDetail: false
        };
        window.currSlotSelected = '';
        this.handleTabChange = this.handleTabChange.bind(this);
        this.onOrderClicked = this.onOrderClicked.bind(this);
        this.onCloseClick = this.onCloseClick.bind(this);
        this.onPaidClick = this.onPaidClick.bind(this);
        this.initializeEnquiries();
    }
    componentDidMount() {
        var winHeight = window.innerHeight;
        this.getWebOrders();
    }
    getWebOrders() {
        var franchiseId = JSON.parse(sessionStorage.getItem('user-profile'))[0].id;
        axios.get('/web-orders/'+franchiseId)
                .then(function (response) {
                if(response.data.indexOf('error') == -1) {
                    console.log('--store res--', response.data);
                    let res = response.data;
                    this.setState({orders: res});
                } else {
                    this.setState({orders: []});
                }
                }.bind(this));
      }
    updateEnquiry(orderId, status) {
            var http = new XMLHttpRequest();
            var url = '/updateEnquiry/'+orderId+'/'+status;
            http.open('POST', url, true);
            http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

            http.onreadystatechange = function() {//Call a function when the state changes.
                if(http.readyState == 4 && http.status == 200) {
                    console.log('confirmed order creation post response:', http.responseText);
                    var res = http.responseText;
                    if(res != null){
                        res = JSON.parse(res);
                        console.log('--event order id--', res);
                        window.location.reload();
                    }
                }
            }.bind(this);
            http.send();
      }
    initializeEnquiries(){
        let enquiriesArr = [];
        let location = '';
        let franchiseId = '';
        if (sessionStorage.getItem('user-profile') != null) {
            location = JSON.parse(sessionStorage.getItem('user-profile'))[0].city;
            franchiseId = JSON.parse(sessionStorage.getItem('user-profile'))[0].id;
        }
        
    }
    handleTabChange(event, newValue) {
        console.log('neValue: ', newValue);
        this.setState({value: newValue});
    }
    getQuote() {
        sessionStorage.setItem('quotePizzaQty',document.getElementById('quotePizzaQty').value);
        sessionStorage.setItem('quotePizzaSize',document.getElementById('quotePizzaSize').value);
        sessionStorage.setItem('quoteGarlicQty',document.getElementById('quoteGarlicQty').value == '' ? '0' : document.getElementById('quoteGarlicQty').value);
        sessionStorage.setItem('quoteWrapsQty',document.getElementById('quoteWrapsQty').value == '' ? '0' : document.getElementById('quoteWrapsQty').value);
        sessionStorage.setItem('quoteDistance',document.getElementById('quoteDistance').value == '' ? '0' : document.getElementById('quoteDistance').value);
        window.location.href='/dashboard-quote-res';
    }
    onOrderClicked(order){
        this.setState({showOrderDetail: true, orderId: order.id, orderName:order.name, orderStatus: order.status, orderMobile:order.mobile, orderAddress:order.address, orderPincode:order.delivery_pincode, orderPrice:order.price, orderSchedule:order.delivery_schedule, orderSlot: order.delivery_timeslot, orderCreatedAt: order.created_at});
    }
    onCloseClick() {
        this.setState({showOrderDetail: false});
    }
    onPaidClick(currWebOrderId) {
        var http = new XMLHttpRequest();
            var url = '/updateWebOrder/'+currWebOrderId+'/PAID';
            http.open('POST', url, true);
            http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

            http.onreadystatechange = function() {//Call a function when the state changes.
                if(http.readyState == 4 && http.status == 200) {
                    console.log('confirmed order creation post response:', http.responseText);
                    var res = http.responseText;
                    if(res != null){
                        alert('Order marked as Paid!');
                        location.reload();
                    }
                }
            }.bind(this);
            http.send();
    }
    render() {
        const {orders, enquiries, orderTitle, dateTime, booking, customer, toppings, extras, location, mapUrl, comments, showLoader, results, starters, orderSummary, showCoupon, showSlot, showList, showWizard, numVistors, curStep, redirect} = this.state;
        
        const ordersRendered = orders.map((item, i) => {
             let details = JSON.parse(item.order);
             let orderString = '';
             Object.entries(details).forEach((obj)=>{
                console.log('--obj--', obj);
                let o = Object.values(obj)[1];
                orderString = orderString + `${o.qty} ${o.name} ${o.size} ${o.type}, `;
                
             });
             orderString = orderString.substring(0,orderString.length-2);
             console.log('orderString: ', orderString.substring(0,orderString.length-2));
             console.log('Object.entries(details)[0]: ', Object.entries(details)[0]);
             /*return (

                
                <tr key={item.mobile}>
                   <td>{item.name}</td>
                   <td>{orderString}</td>
                   <td><a class="tel" href={`tel:${item.mobile}`}>{item.mobile}</a></td>
                   <td>{item.address}</td>
                   <td><a href={`https://wa.me/+91${item.mobile}`}>💬</a></td>
                   <td onClick={()=>{this.updateEnquiry(event.orderId, 'COMPLETED')}}>✅</td>
                   <td onClick={()=>{this.updateEnquiry(event.orderId, 'CANCELLED')}}>❎</td>
                 </tr>
                );*/
               
                    return (<SummaryCard index={i} data={item} orderString={orderString} summaryId={Object.entries(details)[0][0].replace('p0','p1')} orderClicked={this.onOrderClicked} />);
            
            
        });

        return (<div style={{marginTop: '84px'}}>
                    <img id="logo" className="logo-img" src="../img/images/logo_scr.jpg" style={{width: '142px'}} onClick={()=>{window.location.href='/store';}} />
                    <Paper>

                                              <TabPanel value={this.state.value} index={0}>
                                                   <span className="stage-heading" style={{top: '12px',background: '#f6f6f6',fontSize: '18px'}}>&nbsp;&nbsp;Web Orders</span>
                                                   <hr className="line-light" style={{visibility: 'hidden'}}/>

                                                   <div className="checkout-content">
                                                        {ordersRendered}
                                                    </div>
                                                   <br/><br/><br/><br/>
                                                   <div className="address-container" style={{display: this.state.showOrderDetail == true ? 'block' : 'none'}}>
                                                        <div className="close-icn" onClick={this.onCloseClick}><img src='../../../img/images/ic_close.png'></img></div>
                                                        <div className="cnt">
                                                            <div>Created At: {this.state.orderCreatedAt}</div>
                                                            <div>{this.state.orderName}</div>
                                                            <div>{this.state.orderMobile}</div>
                                                            <div>{this.state.orderAddress}</div>
                                                            <div>{this.state.orderPincode}</div>
                                                            <div className='price-lbl'>₹{this.state.orderPrice}</div>
                                                            {this.state.orderStatus != 'PAID'  && <a className='price-btn' href={`https://wa.me/${this.state.orderMobile}?text=Hello!%20Requesting%20payment%20for%20your%20slimcrust%20pizza%20order.Please%20make%20payment%20of%20₹${this.state.orderPrice}via%20UPI/GPay%20to9972908138.%20Thank%20You!`} style={{right: '123px', width: '189px'}}>Request Payment</a>}
                                                            {this.state.orderStatus != 'PAID' && <div className='price-btn' onClick={()=>{this.onPaidClick(this.state.orderId)}}>Paid</div>}
                                                            <div>{this.state.orderSchedule == 'now' ? 'DELIVER NOW' : ''}</div>
                                                            {this.state.orderSlot != 'unknown' && <div>{this.state.orderSlot}</div>}
                                                        </div>
                                                        
                                                   </div>

                                              </TabPanel>
                                              <TabPanel value={this.state.value} index={1}>



                                              </TabPanel>
                                            </Paper>
                </div>)
    }
}

export default withRouter(Dashboard);