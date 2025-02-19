import React, { Component } from 'react';
import axios from 'axios';
import { render } from 'react-dom';
import { Link, withRouter } from 'react-router-dom';

import { withStyles, makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Switch from '@material-ui/core/Switch';

import RestaurantIcon from '@material-ui/icons/Business';
import OrdersIcon from '@material-ui/icons/ViewListSharp';
import InventoryIcon from '@material-ui/icons/ShoppingBasket';
import ChatBubbleIcon from '@material-ui/icons/ChatBubble';
import RequestQuoteIcon from '@material-ui/icons/NotesSharp';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';
import BackIcon from '@material-ui/icons/ArrowBack';
import StarHalfIcon from '@material-ui/icons/StarHalf';
import Button from '@material-ui/core/Button';

import { questions, conditionalQuestions } from '../../data-source/mockDataQnA';
import { useHistory } from "react-router-dom";

const GreenSwitch = withStyles({
  switchBase: {
    color: '#fff',
    '&$checked': {
      color: '#19a836',
    },
    '&$checked + $track': {
      backgroundColor: '#19a836',
    },
  },
  checked: {},
  track: {},
})(Switch);

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

class SearchInput extends Component {
  render() {
    return (
      <div><input id="searchKey" type="text" className="txt-field right search-key" onKeyUp={(e)=>{this.props.onSearch(e.target.value)}} /><SearchIcon className="search-icon" /><ClearIcon className="clear-icon" onClick={(e)=>{this.props.onClear();document.getElementById('searchKey').value='';}} /></div>
    );
  }
}


class Dashboard extends Component {

    constructor() {
        super();
        this.state = {
            value: 0,
            localities: [],
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
            status: window.location.href.indexOf('?status=success') >= 0 ? 'success' :'default',
            selectedLocality: '',
            nearby: [],
            storeName: '',
            storeNotExists: false,
            accepting: false,
            webOrderCount: 0,
            role: 'USER'
        };
        this.handleToggle = this.handleToggle.bind(this);
        window.currSlotSelected = '';
        this.styles = [{
          "featureType": "road",
          "elementType": "geometry",
          "stylers": [{
            "lightness": 10
          }, {
            "visibility": "on"
          }]
        }, {
          "featureType": "road",
          "elementType": "labels",
          "stylers": [{
            "visibility": "on"
          }]
        }, {
          "featureType": "poi",
          "elementType": "labels",
          "stylers": [{
            "visibility": "on"
          }]
        }];
    }
    getStoreName(suffix) {
      if (sessionStorage.getItem('user-profile') != null) {
          var franchiseId = JSON.parse(sessionStorage.getItem('user-profile'))[0].id;
          var userRole = JSON.parse(sessionStorage.getItem('user-profile'))[0].role;
          this.setState({role: userRole});
          axios.get('/store'+suffix+'/name/'+franchiseId)
                .then(function (response) {
                  if(response.data.indexOf('error') == -1) {
                    console.log('--store res--', response.data);
                    let res = response.data;
                    sessionStorage.setItem('curr-order-count', res[0].count);
                    this.setState({storeId: res[0].id,storeName: '('+res[0].locality+')', accepting: res[0].accepting_online_orders == 'N' ? false : true, webOrderCount: res[0].count});
                    let item = document.createElement('div');
                    item.className = 'top-bar';
                    item.onclick = function(){location.href='/web-orders';};
                    const notifAudio = document.createElement('audio');
                    notifAudio.src='./sc/n.mp3';
                    notifAudio.autostart = 'false';
                    
                    const orderCount = res[0].count;

                    if(window.currOrderCount != null && orderCount - sessionStorage.getItem('curr-order-count') > 0) {
                        document.querySelector('.notif').style.display = 'inline';
                       
                        document.body.appendChild(notifAudio);

                        sessionStorage.setItem('new-order-count', orderCount - window.currOrderCount);
                        let countVal = orderCount - window.currOrderCount;
                        let orderSuffix = 'order';
                        if (orderCount - window.currOrderCount > 1) {
                            orderSuffix = 'orders';
                        }
                        item.innerHTML = '<div class="top-bar" onclick="location.href=\'/web-orders\';"><div class="notif-container"><div class="notif-title">You have '+countVal+' new web '+orderSuffix+'!</div></div></div>';
                        document.body.appendChild(item);
                        notifAudio.play();
                    }
                    window.currOrderCount = orderCount;
                  } else {
                    this.setState({storeNotExists: true});
                  }
                }.bind(this));
          }
    }
    componentDidMount() {
        this.getStoreName('-default');
        this.getStoreName('');
    }
    handleToggle(event) {
      this.setState({accepting: event.target.checked });
      this.updateOnlineStatus(event.target.checked);
    };
    updateOnlineStatus(newStatus) {
        var accepting = newStatus ? 'Y' : 'N';
        //create store
        var http = new XMLHttpRequest();
        var url = 'updateStoreWebOrder/'+accepting;
        var params = '&storeId='+this.state.storeId;
        http.open('POST', url, true);
        http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

        http.onreadystatechange = function() {//Call a function when the state changes.
            if(http.readyState == 4 && http.status == 200) {
                console.log('confirmed order creation post response:', http.responseText);
                var res = http.responseText;
                if(res.indexOf('error') >= 0){
                    alert('Sorry! Unable to update status.');
                } else if(res != null){
                    res = JSON.parse(res);
                    if(res.storeId != null) {
                      alert('Order status updated successfuly!');
                    } else {
                        alert('Sorry! Unable to update status');
                    }
                }
            }
        }.bind(this);
        http.send(params);
    }
    render() {

        return (<div style={{marginTop: '84px'}}>
        <img id="logo" className="logo-img" src="../img/images/logo_scr.jpg" style={{width: '142px'}} />
        <span id="logout" className="logout" onClick={this.logout}>Logout</span>
        <Paper id="dash-content">
          <TabPanel value={this.state.value} index={0}>
            <br/>
          <span className="stage-desc" onClick={()=>{window.location.href='/dashboard';}}><span style={{marginTop:'-6px',position:'absolute',color:'#afafaf'}}>Dashboard > <span style={{color: '#666'}}>Store</span><span>&nbsp; {this.state.storeName}</span></span></span>
                <hr className="line-light" style={{visibility: 'hidden',marginTop: '8px'}}/>

                {this.state.role == 'SUPERUSER' && <div>
                <span className="stage-desc">
                  <span class="stage-desc" style={{marginLeft: '0px'}} onClick={()=>{window.location.href='/store-location-planner';}}>Plan</span>{this.state.storeNotExists && <span class="stage-desc" style={{marginLeft: '18px'}} onClick={()=>{if (confirm("Please make sure you're accessing this page from your store's physical location. If not, your store won't be configured correctly. Do you want to proceed?")) {window.location.href = '/dashboard-create-store';}}}>Create Store</span>}
                </span>
                <hr className="line-light" style={{marginTop: '18px'}}/>
                </div>}

                <span className="stage-desc" onClick={()=>{window.location.href='/dashboard-create-store-order';}}>Create Order</span>
                <hr className="line-light" style={{marginTop: '18px'}}/>

                <div>
                <span className="stage-desc" onClick={()=>{window.location.href='/web-orders';}}> 
                Web Orders <span className="notif"><span id="webOrderCount">{this.state.webOrderCount}</span></span> 
                </span>
                </div>

                {this.state.role == 'SUPERUSER' && <div className='accepting'>
                <GreenSwitch
                  checked={this.state.accepting}
                  onChange={this.handleToggle}
                  color="primary"
                  name="checkedB"
                  inputProps={{ 'aria-label': 'primary checkbox' }}
                />
                <span>{this.state.accepting ? 'Accepting': 'Off'}</span>
                </div>}

                <hr className="line-light" style={{marginTop: '18px'}}/>
                <span className="stage-desc" onClick={()=>{window.location.href='/dashboard-store-inventory';}}>
                    Inventory</span>
                <hr className="line-light" style={{marginTop: '18px'}}/>
                <span className="stage-desc" onClick={()=>{window.location.href='/dashboard-store-checklist';}}>
                    Checklist</span>
                <hr className="line-light" style={{marginTop: '18px'}}/>
                
                {this.state.role == 'SUPERUSER' && <div>
                <span className="stage-desc" onClick={()=>{window.location.href='/dashboard-create-sample-order';}}>
                    Stats</span>

                <hr className="line-light" style={{marginTop: '18px'}}/>
                    </div>}
                    

                <span className="stage-desc" onClick={()=>{window.location.href='/dashboard-store-onboarding';}}>Onboarding</span>
                <hr className="line-light" style={{marginTop: '18px'}}/>

                <br/><br/><br/>

          </TabPanel>
          <TabPanel value={this.state.value} index={1}>



          </TabPanel>
        </Paper>
    </div>)
    }
}

export default withRouter(Dashboard);