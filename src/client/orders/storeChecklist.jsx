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

class Accordion extends React.Component {
    updateChecklist(checkedColumn, isChecked) {
        let franchiseId = -1;
        const doneForTheDayColumn = 'check16checked';
        if (sessionStorage.getItem('user-profile') != null) {
            franchiseId = JSON.parse(sessionStorage.getItem('user-profile'))[0].id;
        }

        //create store
        var http = new XMLHttpRequest();
        var url = '/updateStoreChecklist';
        var params = 'checkedColumn='+checkedColumn+'&isChecked='+isChecked;
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
                    if (checkedColumn == doneForTheDayColumn) {
                        window.location.href = '/dashboard';
                    } else {
                        window.location.reload();
                    }
                }
            }
        }.bind(this);
        http.send(params);
    }
    toggleCheck(elemId) {
        console.log('--elemId--', elemId);
        console.log('--checked--',  document.getElementById(elemId).checked);
        this.updateChecklist(elemId, document.getElementById(elemId).checked ? 'y' : 'n');
    }
    render() {
      const { id, title, expand, onClick, check1Checked, check2Checked, check3Checked, check4Checked, check5Checked, check6Checked, check7Checked, check8Checked, check9Checked, check10Checked, check11Checked, check12Checked, check13Checked, check14Checked, check15Checked, check16Checked } = this.props;
      
      return (
        <div>
          <dt className={expand ? 'title is-expanded' : 'title'} onClick={onClick} dangerouslySetInnerHTML={title}>
          </dt>
          <dd className={expand ? 'content is-expanded' : 'content'} >
            {id==0 && <p>
                <input type="checkbox" id="check1checked" checked={check1Checked} defaultChecked={check1Checked} onClick={()=>{this.toggleCheck('check1checked');}}></input><label for="check1">Take cheese out for thawing</label><span className="divider"/>
                <input type="checkbox" id="check2checked" checked={check2Checked} defaultChecked={check2Checked} onClick={()=>{this.toggleCheck('check2checked');}}></input><label for="check2">Clean Dough box, Screen & Pizza Material </label>
            </p>}
            {id==1 && <p>
                <input type="checkbox" id="check3checked" checked={check3Checked} defaultChecked={check3Checked} onClick={()=>{this.toggleCheck('check3checked');}}></input><label for="check3">Wash hands & wear apron</label><span className="divider"/>
                <input type="checkbox" id="check4checked" checked={check4Checked} defaultChecked={check4Checked} onClick={()=>{this.toggleCheck('check4checked');}}></input><label for="check4">Prepare mix (warm water & mix) & Upload pic</label><span className="divider"/>
                <input type="checkbox" id="check5checked" checked={check5Checked} defaultChecked={check5Checked} onClick={()=>{this.toggleCheck('check5checked');}}></input><label for="check5">Chop vegetables, Pre-heat oven</label><span className="divider"/>
                <input type="checkbox" id="check6checked" checked={check6Checked} defaultChecked={check6Checked} onClick={()=>{this.toggleCheck('check6checked');}}></input><label for="check6">Update inventory & order ingredients</label>
            </p>}
            {id==2 && <p>
                <input type="checkbox" id="check7checked" checked={check7Checked} defaultChecked={check7Checked} onClick={()=>{this.toggleCheck('check7checked');}}></input><label for="check7">Parbake & store base</label><span className="divider"/>
                <input type="checkbox" id="check8checked" checked={check8Checked} defaultChecked={check8Checked} onClick={()=>{this.toggleCheck('check8checked');}}></input><label for="check8">Store toppings in red topping container</label>
            </p>}
            {id==3 && <p>
                <input type="checkbox" id="check9checked" checked={check9Checked} defaultChecked={check9Checked} onClick={()=>{this.toggleCheck('check9checked');}}></input><label for="check9">Ready to Serve - Service with a smile & greet customers!</label><span className="divider"/>
                <input type="checkbox" id="check10checked" checked={check10Checked} defaultChecked={check10Checked} onClick={()=>{this.toggleCheck('check10checked');}}></input><label for="check10">Provide a snappy experience!</label>
            </p>}
            {id==4 && <p>
                <input type="checkbox" id="check11checked" checked={check11Checked} defaultChecked={check11Checked} onClick={()=>{this.toggleCheck('check11checked');}}></input><label for="check11">Prepare mix (warm water & mix) & Upload pic</label><span className="divider"/>
                <input type="checkbox" id="check12checked" checked={check12Checked} defaultChecked={check12Checked} onClick={()=>{this.toggleCheck('check12checked');}}></input><label for="check12">Chop vegetables, Pre-heat oven</label><span className="divider"/>
                <input type="checkbox" id="check13checked" checked={check13Checked} defaultChecked={check13Checked} onClick={()=>{this.toggleCheck('check13checked');}}></input><label for="check13">Parbake bases & store toppings in red topping container</label>
            </p>}
            {id==5 && <p>
                <input type="checkbox" id="check14checked" checked={check14Checked} defaultChecked={check14Checked} onClick={()=>{this.toggleCheck('check14checked');}}></input><label for="check14">Rinse all the containers & soak in cleaning liquid</label><span className="divider"/>
                <input type="checkbox" id="check15checked" checked={check15Checked} defaultChecked={check15Checked} onClick={()=>{this.toggleCheck('check15checked');}}></input><label for="check15">Rinse pizza screens in vinegar & cleaning liquid</label><span className="divider"/>
                <input type="checkbox" id="check16checked" checked={check16Checked} defaultChecked={check16Checked} onClick={()=>{this.toggleCheck('check16checked');}}></input><label for="check16">Done for the day!</label>
            </p>}
          </dd>
        </div>
      );
      
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
            onionQty: 0,
            jalapenosQty: 0,
            sweetCornQty: 0,
            mushroomQty: 0,
            basilQty: 0,
            handCoverQty: 0,
            takeawayBoxQty: 0,
            wastebinCoverQty: 0,
            block1: new Date().getHours()<11 || (new Date().getHours()==11 && (new Date().getMinutes() <= 31)) ,  
            block2: new Date().getHours()==11 && new Date().getMinutes() >= 31,
            block3: new Date().getHours()==12 && new Date().getMinutes() < 31,
            block4: (new Date().getHours()>=12 && new Date().getHours()<=16),
            block5: (new Date().getHours()>=16 && new Date().getMinutes() > 0)  && (new Date().getHours()<20),
            block6: (new Date().getHours()>=20),
            check1Checked: false,
            check2Checked: false,
            check3Checked: false,
            check4Checked: false,
            check5Checked: false,
            check6Checked: false,
            check7Checked: false,
            check8Checked: false,
            check9Checked: false,
            check10Checked: false,
            check11Checked: false,
            check12Checked: false,
            check13Checked: false,
            check14Checked: false,
            check15Checked: false,
            check16Checked: false
        };
        window.currSlotSelected = '';
        this.handleTabChange = this.handleTabChange.bind(this);
    }
    getInventory() {
        let franchiseId = -1;
        if (sessionStorage.getItem('user-profile') != null) {
            franchiseId = JSON.parse(sessionStorage.getItem('user-profile'))[0].id;
        }
        axios.get('/store/checklist/'+franchiseId)
          .then(function (response) {
            console.log('--response.data--', response.data);
            this.setState({check1Checked: response.data.check1checked == 'y'});
            this.setState({check2Checked: response.data.check2checked == 'y'});
            this.setState({check3Checked: response.data.check3checked == 'y'});
            this.setState({check4Checked: response.data.check4checked == 'y'});
            this.setState({check5Checked: response.data.check5checked == 'y'});
            this.setState({check6Checked: response.data.check6checked == 'y'});
            this.setState({check7Checked: response.data.check7checked == 'y'});
            this.setState({check8Checked: response.data.check8checked == 'y'});
            this.setState({check9Checked: response.data.check9checked == 'y'});
            this.setState({check10Checked: response.data.check10checked == 'y'});
            this.setState({check11Checked: response.data.check11checked == 'y'});
            this.setState({check12Checked: response.data.check12checked == 'y'});
            this.setState({check13Checked: response.data.check13checked == 'y'});
            this.setState({check14Checked: response.data.check14checked == 'y'});
            this.setState({check15Checked: response.data.check15checked == 'y'});
            this.setState({check16Checked: response.data.check16checked == 'y'});
          }.bind(this));
    }
    componentDidMount() {
        setInterval(()=> {window.location.reload();}, 1000*60*5);
        var winHeight = window.innerHeight;
        this.getInventory();
    }
    handleTabChange(event, newValue) {
        console.log('neValue: ', newValue);
        this.setState({value: newValue});
    }
    
    toggle(index) {
        this.setState({ [`block${index}`]: !this.state[`block${index}`] });
    }
      
    toggleExpand(expand) {
    this.setState({
        block1: expand,
        block2: expand,
        block3: expand,
        block4: expand,
        block5: expand,
        block6: expand,
    });
    }

    render() {
        const accordionList = [{ title: {__html: 'First Up <span class="due">(due by 11.30am)</span>'} }, { title: {__html: 'Morning Prep <span class="due">(due by 12.10pm)</span>'} }, { title: {__html: 'Counter Setup <span class="due">(due by 12.30pm)</span>' }}, { title: {__html: 'Ready to Serve <span class="due">(due by 12.30pm)</span>' }}, { title: {__html: 'Evening Prep <span class="due">(due by 4pm)</span>' }}, { title: {__html: 'Winding up! <span class="due">(due by 8.30pm)</span>' }}];
        const {franchises, status, orderTitle, dateTime, booking, customer, toppings, extras, location, mapUrl, comments, showLoader, results, starters, orderSummary, showCoupon, showSlot, showList, showWizard, numVistors, curStep, redirect} = this.state;
        const { id, title, expand, onClick, check1Checked, check2Checked, check3Checked, check4Checked, check5Checked, check6Checked, check7Checked, check8Checked, check9Checked, check10Checked, check11Checked, check12Checked, check13Checked, check14Checked, check15Checked, check16Checked } = this.state;

        return (<div style={{marginTop: '84px'}}>
                    <img id="logo" className="logo-img" src="../img/images/logo_scr.jpg" style={{width: '142px'}} onClick={()=>{window.location.href='/store';}} />
                    {status == 'success' && <span className="stage-heading status-success">Inventory updated successfully</span>}
                    
                    
                    <Paper>

                                              <TabPanel value={this.state.value} index={0}>
                                                   <span className="stage-heading" style={{top: '12px'}}><StoreIcon />&nbsp;&nbsp;Store Checklist</span>
                                                   <hr className="line-light" style={{visibility: 'hidden'}}/>

                                                   <dl className="accordion">
                                                        {accordionList.map((item, index) => (
                                                            <Accordion check1Checked={check1Checked} check2Checked={check2Checked} check3Checked={check3Checked} check4Checked={check4Checked} check5Checked={check5Checked} check6Checked={check6Checked} check7Checked={check7Checked} check8Checked={check8Checked} check9Checked={check9Checked} check10Checked={check10Checked} check11Checked={check11Checked} check12Checked={check12Checked} check13Checked={check13Checked} check14Checked={check14Checked} check15Checked={check15Checked} check16Checked={check16Checked} id={index} title={item.title} onClick={()=>{this.toggle(index + 1)}} expand={this.state[`block${index+1}`]} />
                                                        ))}
                                                    </dl>

                                                   <br/><br/>
                                                   
                                                   <br/><br/><br/><br/>

                                              </TabPanel>
                                              <TabPanel value={this.state.value} index={1}>



                                              </TabPanel>
                                            </Paper>
                </div>)
    }
}

export default withRouter(Dashboard);