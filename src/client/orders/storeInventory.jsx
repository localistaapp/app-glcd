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

import StoreIcon from '@material-ui/icons/Store';
import WarningIcon from '@material-ui/icons/Warning'

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
        let {index, data, summaryId} = this.props;
        let prefix = 'p';
        if(data.type && data.type == 'starter') {
            prefix = 'g';
        }
        return (
        <div className="card-container small" style={{padding: '0px 12px 0px 12px'}}>
            <div className="section-one">
                <div className="top">
                    <div className="top-left">
                            <img id={`primaryImg${index}`} className="primary-img rotatable" src={`../../../img/images/${prefix}${summaryId}.png`} style={{width: '72px',paddingTop: '0px'}} />
                    </div>
                    <div className="top-right">
                        <div className="usp-title"><div className="title" style={{marginTop: '10px'}}>{data.name}</div></div>
                        {data.type == 'starter' ? <div className="usp-desc">{data.qty} single starter(s)</div> : <div className="usp-desc">{data.qty} {data.size} pizza(s)</div>}
                    </div>
                </div>
            </div>

            <div className="section-two small">
                <div className="pricing"><label className="price"><span className="slashed" id={`price${index}`}>{data.price}</span><span className="rupee" style={{marginLeft: '6px'}}>₹</span><span className="orig" id={`priceNew${index}`}>{isValidCoupon() ? Math.ceil(Math.round(data.price*0.85) / 10) * 10 : Math.ceil(Math.round(data.price) / 10) * 10}</span></label></div>
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
            franchises: [],
            status: window.location.href.indexOf('?status=success') >= 0 ? 'success' :'default',
            pizzaMixQty: 0,
            cheeseQty: 0,
            pSauceQty: 0,
            tomatoSauceQty: 0,
            whiteSauceQty: 0,
            periPeriQty: 0,
            oreganoQty: 0,
            olivesQty: 0,
            paneerQty: 0,
            capsicumQty: 0,
            tomatoQty: 0,
            redChilliQty: 0,
            onionQty: 0,
            jalapenosQty: 0,
            sweetCornQty: 0,
            mushroomQty: 0,
            basilQty: 0,
            handCoverQty: 0,
            takeawayBoxQty: 0,
            wastebinCoverQty: 0
        };
        window.currSlotSelected = '';
        this.handleTabChange = this.handleTabChange.bind(this);
    }
    getInventory() {
        let franchiseId = -1;
        if (sessionStorage.getItem('user-profile') != null) {
            franchiseId = JSON.parse(sessionStorage.getItem('user-profile'))[0].id;
        }
        axios.get('/store/inventory/'+franchiseId)
          .then(function (response) {
            console.log('--response.data--', response.data);
            this.setState({basilQty: response.data.basil_qty});
            this.setState({capsicumQty: response.data.capsicum_qty});
            this.setState({tomatoQty: response.data.tomato_qty});
            this.setState({redChilliQty: response.data.red_chilli_qty});
            this.setState({cheeseQty: response.data.cheese_qty});
            this.setState({handCoverQty: response.data.hand_cover_qty});
            this.setState({jalapenosQty: response.data.jalapenos_qty});
            this.setState({mushroomQty: response.data.mushroom_qty});
            this.setState({olivesQty: response.data.olives_qty});
            this.setState({onionQty: response.data.onion_qty});
            this.setState({oreganoQty: response.data.oregano_qty});
            this.setState({paneerQty: response.data.paneer_qty});
            this.setState({periPeriQty: response.data.peri_peri_qty});
            this.setState({pizzaMixQty: response.data.pizza_mix_qty});
            this.setState({pSauceQty: response.data.pizza_sauce_qty});
            this.setState({sweetCornQty: response.data.sweet_corn_qty});
            this.setState({takeawayBoxQty: response.data.takeaway_box_qty});
            this.setState({tomatoSauceQty: response.data.tomato_sauce_qty});
            this.setState({wastebinCoverQty: response.data.wastebin_cover_qty});
            this.setState({whiteSauceQty: response.data.white_sauce_qty});
          }.bind(this));
    }
    componentDidMount() {
        var winHeight = window.innerHeight;
        this.getInventory();
    }
    handleTabChange(event, newValue) {
        console.log('neValue: ', newValue);
        this.setState({value: newValue});
    }
    updateInventory() {
        var basil_qty = this.state.basilQty;
        var capsicum_qty = this.state.capsicumQty;
        var tomato_qty = this.state.tomatoQty;
        var red_chilli_qty = this.state.redChilliQty;
        var cheese_qty = this.state.cheeseQty;
        var hand_cover_qty = this.state.handCoverQty;
        var jalapenos_qty = this.state.jalapenosQty;
        var mushroom_qty = this.state.mushroomQty;
        var olives_qty = this.state.olivesQty;
        var onion_qty = this.state.onionQty;
        var oregano_qty = this.state.oreganoQty;
        var paneer_qty = this.state.paneerQty;
        var peri_peri_qty = this.state.periPeriQty;
        var pizza_mix_qty = this.state.pizzaMixQty;
        var pizza_sauce_qty = this.state.pSauceQty;
        var sweet_corn_qty = this.state.sweetCornQty;
        var takeaway_box_qty = this.state.takeawayBoxQty;
        var tomato_sauce_qty = this.state.tomatoSauceQty;
        var wastebin_cover_qty = this.state.wastebinCoverQty;
        var white_sauce_qty = this.state.whiteSauceQty;

        let franchiseId = -1;
        if (sessionStorage.getItem('user-profile') != null) {
            franchiseId = JSON.parse(sessionStorage.getItem('user-profile'))[0].id;
        }

        //create store
        var http = new XMLHttpRequest();
        var url = '/updateStoreInventory';
        var params = 'basil_qty='+basil_qty+'&capsicum_qty='+capsicum_qty+'&cheese_qty='+cheese_qty+'&tomato_qty='+tomato_qty+'&red_chilli_qty='+red_chilli_qty;
        params += '&hand_cover_qty='+hand_cover_qty+'&jalapenos_qty='+jalapenos_qty+'&mushroom_qty='+mushroom_qty;
        params += '&olives_qty='+olives_qty+'&onion_qty='+onion_qty+'&oregano_qty='+oregano_qty;
        params += '&paneer_qty='+paneer_qty+'&peri_peri_qty='+peri_peri_qty+'&pizza_mix_qty='+pizza_mix_qty;
        params += '&pizza_sauce_qty='+pizza_sauce_qty+'&sweet_corn_qty='+sweet_corn_qty+'&takeaway_box_qty='+takeaway_box_qty;
        params += '&tomato_sauce_qty='+tomato_sauce_qty+'&wastebin_cover_qty='+wastebin_cover_qty+'&white_sauce_qty='+white_sauce_qty;
        params += '&franchiseId='+franchiseId;
        console.log('--params--', params);
        http.open('POST', url, true);
        http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

        http.onreadystatechange = function() {//Call a function when the state changes.
            if(http.readyState == 4 && http.status == 200) {
                console.log('confirmed order creation post response:', http.responseText);
                var res = http.responseText;
                if(res.indexOf('error-not-in-vicinity') >= 0) {
                    alert('There was an issue processing your order. Please contact the franchisor.');
                } else if(res.indexOf('error') >= 0){
                    alert('Sorry! Unable to process to your order.');
                } else if(res != null){
                    res = JSON.parse(res);
                    window.location.href='/dashboard-store-inventory?success=true';
                }
            }
        }.bind(this);
        http.send(params);
    }

    render() {
        const {franchises, status, orderTitle, dateTime, booking, customer, toppings, extras, location, mapUrl, comments, showLoader, results, starters, orderSummary, showCoupon, showSlot, showList, showWizard, numVistors, curStep, redirect} = this.state;

        return (<div style={{marginTop: '84px'}}>
                    <img id="logo" className="logo-img" src="../img/images/logo_scr.jpg" style={{width: '142px'}} onClick={()=>{window.location.href='/store';}} />
                    {status == 'success' && <span className="stage-heading status-success">Inventory updated successfully</span>}
                    <Paper>

                                              <TabPanel value={this.state.value} index={0}>
                                                   <span className="stage-heading" style={{top: '12px'}}><StoreIcon />&nbsp;&nbsp;Store Inventory</span>
                                                   <hr className="line-light" style={{visibility: 'hidden'}}/>
                                                   <span className="stage-desc" >Pizza Mix (kg): 
                                                        <div class="quantity inv">
                                                            <a className="quantity__minus"><span onClick={()=>{if(this.state.pizzaMixQty>0){this.setState({pizzaMixQty: this.state.pizzaMixQty - 0.5});}}} style={{fontSize: '25px', lineHeight: '0px', marginLeft: '2px'}}>-</span></a>
                                                            <input name="quantity" type="text" className="quantity__input" value={this.state.pizzaMixQty} />
                                                            <a className="quantity__plus"><span onClick={()=>{this.setState({pizzaMixQty: this.state.pizzaMixQty + 0.5});}}>+</span></a>
                                                        </div>
                                                   </span>
                                                   <hr className="line-light" style={{marginTop: '18px'}}/>
                                                   <span className="stage-desc" >Cheese (kg): 
                                                        <div class="quantity inv" style={{marginTop: '-35px'}}>
                                                            <a className="quantity__minus"><span onClick={()=>{if(this.state.cheeseQty>0){this.setState({cheeseQty: this.state.cheeseQty - 0.5});}}} style={{fontSize: '25px', lineHeight: '0px', marginLeft: '2px'}}>-</span></a>
                                                            <input name="quantity" type="text" className="quantity__input" value={this.state.cheeseQty} />
                                                            <a className="quantity__plus"><span onClick={()=>{this.setState({cheeseQty: this.state.cheeseQty + 0.5});}}>+</span></a>
                                                        </div>
                                                   </span>
                                                   <hr className="line-light" style={{marginTop: '18px'}}/>
                                                   <span className="stage-desc" >Pizza sauce (bottle): 
                                                        <div class="quantity inv" style={{marginTop: '-35px'}}>
                                                            <a className="quantity__minus"><span onClick={()=>{if(this.state.pSauceQty>0){this.setState({pSauceQty: this.state.pSauceQty - 0.5});}}} style={{fontSize: '25px', lineHeight: '0px', marginLeft: '2px'}}>-</span></a>
                                                            <input name="quantity" type="text" className="quantity__input" value={this.state.pSauceQty} />
                                                            <a className="quantity__plus"><span onClick={()=>{this.setState({pSauceQty: this.state.pSauceQty + 0.5});}}>+</span></a>
                                                        </div>
                                                   </span>
                                                   <hr className="line-light" style={{marginTop: '18px'}}/>
                                                   <span className="stage-desc" >Tomato sauce (bottle): 
                                                        <div class="quantity inv" style={{marginTop: '-35px'}}>
                                                            <a className="quantity__minus"><span onClick={()=>{if(this.state.tomatoSauceQty>0){this.setState({tomatoSauceQty: this.state.tomatoSauceQty - 0.5});}}} style={{fontSize: '25px', lineHeight: '0px', marginLeft: '2px'}}>-</span></a>
                                                            <input name="quantity" type="text" className="quantity__input" value={this.state.tomatoSauceQty} />
                                                            <a className="quantity__plus"><span onClick={()=>{this.setState({tomatoSauceQty: this.state.tomatoSauceQty + 0.5});}}>+</span></a>
                                                        </div>
                                                   </span>
                                                   {/*<hr className="line-light" style={{marginTop: '18px'}}/>
                                                   <span className="stage-desc" >White sauce (325g bot): 
                                                        <div class="quantity inv" style={{marginTop: '-35px'}}>
                                                            <a className="quantity__minus"><span onClick={()=>{if(this.state.whiteSauceQty>0){this.setState({whiteSauceQty: this.state.whiteSauceQty - 0.5});}}} style={{fontSize: '25px', lineHeight: '0px', marginLeft: '2px'}}>-</span></a>
                                                            <input name="quantity" type="text" className="quantity__input" value={this.state.whiteSauceQty} />
                                                            <a className="quantity__plus"><span onClick={()=>{this.setState({whiteSauceQty: this.state.whiteSauceQty + 0.5});}}>+</span></a>
                                                        </div>
                                                    </span>*/}
                                                   <hr className="line-light" style={{marginTop: '18px'}}/>
                                                   <span className="stage-desc" >Peri peri (box): 
                                                        <div class="quantity inv" style={{marginTop: '-35px'}}>
                                                            <a className="quantity__minus"><span onClick={()=>{if(this.state.periPeriQty>0){this.setState({periPeriQty: this.state.periPeriQty - 0.5});}}} style={{fontSize: '25px', lineHeight: '0px', marginLeft: '2px'}}>-</span></a>
                                                            <input name="quantity" type="text" className="quantity__input" value={this.state.periPeriQty} />
                                                            <a className="quantity__plus"><span onClick={()=>{this.setState({periPeriQty: this.state.periPeriQty + 0.5});}}>+</span></a>
                                                        </div>
                                                   </span>
                                                   <hr className="line-light" style={{marginTop: '18px'}}/>
                                                   <span className="stage-desc" >Oregano (box): 
                                                        <div class="quantity inv" style={{marginTop: '-35px'}}>
                                                            <a className="quantity__minus"><span onClick={()=>{if(this.state.oreganoQty>0){this.setState({oreganoQty: this.state.oreganoQty - 0.5});}}} style={{fontSize: '25px', lineHeight: '0px', marginLeft: '2px'}}>-</span></a>
                                                            <input name="quantity" type="text" className="quantity__input" value={this.state.oreganoQty} />
                                                            <a className="quantity__plus"><span onClick={()=>{this.setState({oreganoQty: this.state.oreganoQty + 0.5});}}>+</span></a>
                                                        </div>
                                                   </span>
                                                   <hr className="line-light" style={{marginTop: '18px'}}/>
                                                   <span className="stage-desc" >Olives (bottle): 
                                                        <div class="quantity inv" style={{marginTop: '-35px'}}>
                                                            <a className="quantity__minus"><span onClick={()=>{if(this.state.olivesQty>0){this.setState({olivesQty: this.state.olivesQty - 0.5});}}} style={{fontSize: '25px', lineHeight: '0px', marginLeft: '2px'}}>-</span></a>
                                                            <input name="quantity" type="text" className="quantity__input" value={this.state.olivesQty} />
                                                            <a className="quantity__plus"><span onClick={()=>{this.setState({olivesQty: this.state.olivesQty + 0.5});}}>+</span></a>
                                                        </div>
                                                   </span>
                                                   <hr className="line-light" style={{marginTop: '18px'}}/>
                                                   <span className="stage-desc" >Paneer (200g): 
                                                        <div class="quantity inv" style={{marginTop: '-35px'}}>
                                                            <a className="quantity__minus"><span onClick={()=>{if(this.state.paneerQty>0){this.setState({paneerQty: this.state.paneerQty - 0.5});}}} style={{fontSize: '25px', lineHeight: '0px', marginLeft: '2px'}}>-</span></a>
                                                            <input name="quantity" type="text" className="quantity__input" value={this.state.paneerQty} />
                                                            <a className="quantity__plus"><span onClick={()=>{this.setState({paneerQty: this.state.paneerQty + 0.5});}}>+</span></a>
                                                        </div>
                                                   </span>
                                                   <hr className="line-light" style={{marginTop: '18px'}}/>
                                                   <span className="stage-desc" >Capsicum (250g): 
                                                        <div class="quantity inv" style={{marginTop: '-35px'}}>
                                                            <a className="quantity__minus"><span onClick={()=>{if(this.state.capsicumQty>0){this.setState({capsicumQty: this.state.capsicumQty - 0.5});}}} style={{fontSize: '25px', lineHeight: '0px', marginLeft: '2px'}}>-</span></a>
                                                            <input name="quantity" type="text" className="quantity__input" value={this.state.capsicumQty} />
                                                            <a className="quantity__plus"><span onClick={()=>{this.setState({capsicumQty: this.state.capsicumQty + 0.5});}}>+</span></a>
                                                        </div>
                                                   </span>
                                                   <hr className="line-light" style={{marginTop: '18px'}}/>
                                                   <span className="stage-desc" >Onion (250g): 
                                                        <div class="quantity inv" style={{marginTop: '-35px'}}>
                                                            <a className="quantity__minus"><span onClick={()=>{if(this.state.onionQty>0){this.setState({onionQty: this.state.onionQty - 0.5});}}} style={{fontSize: '25px', lineHeight: '0px', marginLeft: '2px'}}>-</span></a>
                                                            <input name="quantity" type="text" className="quantity__input" value={this.state.onionQty} />
                                                            <a className="quantity__plus"><span onClick={()=>{this.setState({onionQty: this.state.onionQty + 0.5});}}>+</span></a>
                                                        </div>
                                                   </span>
                                                   <hr className="line-light" style={{marginTop: '18px'}}/>
                                                   <span className="stage-desc" >Tomato (250g): 
                                                        <div class="quantity inv" style={{marginTop: '-35px'}}>
                                                            <a className="quantity__minus"><span onClick={()=>{if(this.state.tomatoQty>0){this.setState({tomatoQty: this.state.tomatoQty - 0.5});}}} style={{fontSize: '25px', lineHeight: '0px', marginLeft: '2px'}}>-</span></a>
                                                            <input name="quantity" type="text" className="quantity__input" value={this.state.tomatoQty} />
                                                            <a className="quantity__plus"><span onClick={()=>{this.setState({tomatoQty: this.state.tomatoQty + 0.5});}}>+</span></a>
                                                        </div>
                                                   </span>
                                                   <hr className="line-light" style={{marginTop: '18px'}}/>
                                                   <span className="stage-desc" >Red Chilli (pack): 
                                                        <div class="quantity inv" style={{marginTop: '-35px'}}>
                                                            <a className="quantity__minus"><span onClick={()=>{if(this.state.redChilliQty>0){this.setState({redChilliQty: this.state.redChilliQty - 0.5});}}} style={{fontSize: '25px', lineHeight: '0px', marginLeft: '2px'}}>-</span></a>
                                                            <input name="quantity" type="text" className="quantity__input" value={this.state.redChilliQty} />
                                                            <a className="quantity__plus"><span onClick={()=>{this.setState({redChilliQty: this.state.redChilliQty + 0.5});}}>+</span></a>
                                                        </div>
                                                   </span>
                                                   {/*<hr className="line-light" style={{marginTop: '18px'}}/>
                                                   <span className="stage-desc" >Jalapenos (bot): 
                                                        <div class="quantity inv" style={{marginTop: '-35px'}}>
                                                            <a className="quantity__minus"><span onClick={()=>{if(this.state.jalapenosQty>0){this.setState({jalapenosQty: this.state.jalapenosQty - 0.5});}}} style={{fontSize: '25px', lineHeight: '0px', marginLeft: '2px'}}>-</span></a>
                                                            <input name="quantity" type="text" className="quantity__input" value={this.state.jalapenosQty} />
                                                            <a className="quantity__plus"><span onClick={()=>{this.setState({jalapenosQty: this.state.jalapenosQty + 0.5});}}>+</span></a>
                                                        </div>
                                                   </span>
                                                   <hr className="line-light" style={{marginTop: '18px'}}/>
                                                   <span className="stage-desc" >Sweet corn (500g): 
                                                        <div class="quantity inv" style={{marginTop: '-35px'}}>
                                                            <a className="quantity__minus"><span onClick={()=>{if(this.state.sweetCornQty>0){this.setState({sweetCornQty: this.state.sweetCornQty - 0.5});}}} style={{fontSize: '25px', lineHeight: '0px', marginLeft: '2px'}}>-</span></a>
                                                            <input name="quantity" type="text" className="quantity__input" value={this.state.sweetCornQty} />
                                                            <a className="quantity__plus"><span onClick={()=>{this.setState({sweetCornQty: this.state.sweetCornQty + 0.5});}}>+</span></a>
                                                        </div>
                                                   </span>
                                                   <hr className="line-light" style={{marginTop: '18px'}}/>
                                                   <span className="stage-desc" >Mushroom (200g): 
                                                        <div class="quantity inv" style={{marginTop: '-35px'}}>
                                                            <a className="quantity__minus"><span onClick={()=>{if(this.state.mushroomQty>0){this.setState({mushroomQty: this.state.mushroomQty - 0.5});}}} style={{fontSize: '25px', lineHeight: '0px', marginLeft: '2px'}}>-</span></a>
                                                            <input name="quantity" type="text" className="quantity__input" value={this.state.mushroomQty} />
                                                            <a className="quantity__plus"><span onClick={()=>{this.setState({mushroomQty: this.state.mushroomQty + 0.5});}}>+</span></a>
                                                        </div>
                                                   </span>
                                                   <hr className="line-light" style={{marginTop: '18px'}}/>
                                                   <span className="stage-desc" >Basil (25g): 
                                                        <div class="quantity inv" style={{marginTop: '-35px'}}>
                                                            <a className="quantity__minus"><span onClick={()=>{if(this.state.basilQty>0){this.setState({basilQty: this.state.basilQty - 0.5});}}} style={{fontSize: '25px', lineHeight: '0px', marginLeft: '2px'}}>-</span></a>
                                                            <input name="quantity" type="text" className="quantity__input" value={this.state.basilQty} />
                                                            <a className="quantity__plus"><span onClick={()=>{this.setState({basilQty: this.state.basilQty + 0.5});}}>+</span></a>
                                                        </div>
                                                   </span>
                                                   <hr className="line-light" style={{marginTop: '18px'}}/>
                                                   <span className="stage-desc" >Handcover (50): 
                                                        <div class="quantity inv" style={{marginTop: '-35px'}}>
                                                            <a className="quantity__minus"><span onClick={()=>{if(this.state.handCoverQty>0){this.setState({handCoverQty: this.state.handCoverQty - 0.5});}}} style={{fontSize: '25px', lineHeight: '0px', marginLeft: '2px'}}>-</span></a>
                                                            <input name="quantity" type="text" className="quantity__input" value={this.state.handCoverQty} />
                                                            <a className="quantity__plus"><span onClick={()=>{this.setState({handCoverQty: this.state.handCoverQty + 0.5});}}>+</span></a>
                                                        </div>
                                                   </span>*/}
                                                   <hr className="line-light" style={{marginTop: '18px'}}/>
                                                   <span className="stage-desc" >Takeaway box (25): 
                                                        <div class="quantity inv" style={{marginTop: '-35px'}}>
                                                            <a className="quantity__minus"><span onClick={()=>{if(this.state.takeawayBoxQty>0){this.setState({takeawayBoxQty: this.state.takeawayBoxQty - 0.5});}}} style={{fontSize: '25px', lineHeight: '0px', marginLeft: '2px'}}>-</span></a>
                                                            <input name="quantity" type="text" className="quantity__input" value={this.state.takeawayBoxQty} />
                                                            <a className="quantity__plus"><span onClick={()=>{this.setState({takeawayBoxQty: this.state.takeawayBoxQty + 0.5});}}>+</span></a>
                                                        </div>
                                                   </span>
                                                   <hr className="line-light" style={{marginTop: '18px'}}/>
                                                   <span className="stage-desc" >Wastebin cover (25): 
                                                        <div class="quantity inv" style={{marginTop: '-35px'}}>
                                                            <a className="quantity__minus"><span onClick={()=>{if(this.state.wastebinCoverQty>0){this.setState({wastebinCoverQty: this.state.wastebinCoverQty - 0.5});}}} style={{fontSize: '25px', lineHeight: '0px', marginLeft: '2px'}}>-</span></a>
                                                            <input name="quantity" type="text" className="quantity__input" value={this.state.wastebinCoverQty} />
                                                            <a className="quantity__plus"><span onClick={()=>{this.setState({wastebinCoverQty: this.state.wastebinCoverQty + 0.5});}}>+</span></a>
                                                        </div>
                                                   </span>
                                                   

                                                   <br/><br/>
                                                   <div class="bottom-bar"></div>
                                                   <a className="button" onClick={()=>{this.updateInventory();}} style={{position:'fixed', bottom: '12px'}}>Update Inventory →</a>
                                                   <br/><br/><br/><br/>

                                              </TabPanel>
                                              <TabPanel value={this.state.value} index={1}>



                                              </TabPanel>
                                            </Paper>
                </div>)
    }
}

export default withRouter(Dashboard);