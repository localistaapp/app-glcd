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

import ListIcon from '@material-ui/icons/List';
import MapIcon from '@material-ui/icons/Room';
import RequestQuoteIcon from '@material-ui/icons/NotesSharp';
import OrdersIcon from '@material-ui/icons/ViewListSharp';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';
import BackIcon from '@material-ui/icons/ArrowBack';
import StarHalfIcon from '@material-ui/icons/StarHalf';
import Button from '@material-ui/core/Button';

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

class SearchInput extends Component {
  render() {
    return (
      <div><input id="searchKey" type="text" className="txt-field right search-key" onKeyUp={(e)=>{this.props.onSearch(e.target.value)}} /><SearchIcon className="search-icon" /><ClearIcon className="clear-icon" onClick={(e)=>{this.props.onClear();document.getElementById('searchKey').value='';}} /></div>
    );
  }
}

class Nearby extends Component {
  render() {
    return (
      <div>
        {
          this.props.places.map((place)=> {
            return (
              <div className="nearby-card-container" onClick={()=>{window.location.href = `https://www.google.com/maps/place/?q=place_id:${place.place_id}`;}}>
                  <span className="heading">{place.name}</span>
                  
                  <div className="image-container">
                    <img src={`https://maps.googleapis.com/maps/api/place/photo?photoreference=${place.photos && place.photos.length > 0 && place.photos[0].photo_reference}&sensor=false&maxheight=250&maxwidth=250&key=AIzaSyBvSR-z-DPXEfccE9bwj-FdH1fbsQl60Qg`} />
                  </div>
                  <div className="nearby-address">
                  {place.formatted_address}
                  </div>
                  <div className="nearby-ratings">
                    <StarHalfIcon /><span>{place.rating}</span><span style={{marginLeft: '32px'}}>({place.user_ratings_total})</span>
                  </div>
              </div>
            )
          })
        }
      </div>
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
            nearby: []
        };
        this.handleListItemClick = this.handleListItemClick.bind(this);
        window.currSlotSelected = '';
        this.handleTabChange = this.handleTabChange.bind(this);
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
    drawMap(loc, defaultLat, defaultLong) {
      $.getScript("https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&libraries=visualization,geometry&key=AIzaSyBvSR-z-DPXEfccE9bwj-FdH1fbsQl60Qg")
              .done(function(script, textStatus) {
                var myLatlng = new google.maps.LatLng(defaultLat, defaultLong);
                window.globalmap = new google.maps.Map(document.getElementById("map-canvas"), {
                  zoom: 13,
                  center: myLatlng,
                  mapTypeId: google.maps.MapTypeId.ROADMAP,
                  styles: this.styles
                });
                $.each(loc, function(i, e) {
                  e.location = new google.maps.LatLng(e.latitude, e.longitude);
                });
                var heatmap = new google.maps.visualization.HeatmapLayer({
                  data: loc,
                  map: window.globalmap,
                  radius: 100, 
                  opacity: 1
                });
                heatmap.setMap(window.globalmap);
                console.log(loc);
              });
    }
    fetchLocalities() {
      axios.get(`/locations/bangalore`)
          .then(function (response) {
            let origArr = response.data;

            let totalLowerBound = 0;
            let meanLowerBound = 0;
            let totalLegalLowerBoundCount = 0;
            origArr.forEach((item) => {
              if (item.users_lower_bound > 1000) {
                totalLowerBound = item.users_lower_bound + totalLowerBound;
                totalLegalLowerBoundCount++;
              }
            });
            meanLowerBound = totalLowerBound / totalLegalLowerBoundCount;
            console.log('totalLegalLowerBoundCount: ', totalLegalLowerBoundCount);
            console.log('totalLowerBound: ', totalLowerBound);
            console.log('meanLowerBound: ', meanLowerBound);
            let formattedArr = new Array();
            origArr.forEach((item) => {
              let obj = item;
              if (item.users_lower_bound < meanLowerBound) {
                let percentageFromMean = (item.users_lower_bound / meanLowerBound) * 100;
                if (percentageFromMean < 50) {
                    obj['color'] = 'red';
                    obj['weight'] = Math.ceil(item.users_lower_bound * 1);
                } else {
                  obj['color'] = 'yellow';
                  obj['weight'] = Math.ceil(item.users_lower_bound * 5);
                }
              } else {
                obj['color'] = 'green';
                obj['weight'] = Math.ceil(item.users_lower_bound * 13);
              }
              
              
              obj['latitude'] = item.lat;
              obj['longitude'] = item.long;
              formattedArr.push(obj);
            });
            this.setState({localities: formattedArr});
            this.localitiesOrig = formattedArr;
            this.drawMap(formattedArr, 12.9226373, 77.6174442);
          }.bind(this));
    }
    componentDidMount() {
        var winHeight = window.innerHeight;
        //query API to fetch data
        this.fetchLocalities();

    }
    handleTabChange(event, newValue) {
        console.log('newValue: ', newValue);
        this.setState({value: newValue});
        
        if (newValue == 1) {
            
        }
    }
    search(query) {
      if (query != '') {
        this.setState({localities: this.state.localities.filter(item=>item.locality.toUpperCase().indexOf(query.toUpperCase()) >= 0)});
      } else {
        this.clear();
      }
    }
    clear() {
      this.setState({localities: this.localitiesOrig});
    }
    getNearbyRestaurants(queryLocation) {
      this.setState({selectedLocality: queryLocation});
      queryLocation = escape(queryLocation);
      let queryUrl = '/nearby/'+queryLocation;
      let that = this;
      axios.get(queryUrl)
          .then(function (response) {
            let nearbyRes = response;
            console.log('-nearbyRes-', nearbyRes.data);
            that.setState({nearby: nearbyRes.data});
            nearbyRes.data.forEach((item)=> {
              let lat = item.geometry.location.lat;
              let lng = item.geometry.location.lng;
              let myLatLng = new google.maps.LatLng(lat, lng);
              new google.maps.Marker({
                position: myLatLng,
                map: window.globalmap,
                title: item.name,
              });
            })
          });
    }
    handleListItemClick(item) {
      console.log('..item: ', item.locality);
      this.drawMap(this.localitiesOrig, item.latitude, item.longitude);
      this.getNearbyRestaurants(item.locality);
      this.setState({value: 1});
    }
    render() {
        const {localities, status, orderTitle, dateTime, booking, customer, toppings, extras, location, mapUrl, comments, showLoader, results, starters, orderSummary, showCoupon, showSlot, showList, showWizard, numVistors, curStep, redirect} = this.state;

        return (<div style={{marginTop: '84px'}}>
                    <img id="logo" className="logo-img" src="../img/images/logo_scr.jpg" style={{width: '142px'}} onClick={()=>{window.location.href='/dashboard';}} />
                    {status == 'success' && <span className="stage-heading status-success">Order created successfully</span>}
                    <span className="stage-heading" style={{marginTop: '-12px',background: '#f6f6f6'}}><OrdersIcon />&nbsp;&nbsp;Store Location Planner</span>
                                                   
                    <Paper>
                    <Tabs
                            value={this.state.value}
                            onChange={this.handleTabChange}
                            indicatorColor="primary"
                            textColor="primary"
                            centered
                            style={{marginTop: '164px'}}
                          >
                            <Tab icon={<ListIcon />} label="&nbsp;&nbsp;&nbsp;List View&nbsp;&nbsp;&nbsp;" />
                            <Tab icon={<MapIcon />} label="&nbsp;&nbsp;&nbsp;Map View&nbsp;&nbsp;&nbsp;" />
                          </Tabs>

                                              <TabPanel value={this.state.value} index={0}>
                                                  <div className="tab-container">
                                                    <div className="search-container" style={{display: this.state.selectedLocality == '' ? 'block' : 'none'}}>
                                                      <SearchInput onSearch={(v)=>{this.search(v)}} onClear={()=>{this.clear()}} />
                                                      <div className="list-container">
                                                        {
                                                          localities.map(item=> {
                                                            return <div className={`list-item item-${item.color}`} onClick={()=>{this.handleListItemClick(item)}}>{item.locality} ({item.users_lower_bound})</div>
                                                          })
                                                        }
                                                      </div>   
                                                    </div>  
                                                    <div className="detail-container" style={{display: this.state.selectedLocality == '' ? 'none' : 'block'}}>
                                                    <Button variant="contained" color="#fe1715" size="small" startIcon={<BackIcon />} onClick={()=>{this.setState({selectedLocality: ''})}}>Back</Button>
                                                        <Nearby places={this.state.nearby} />
                                                    </div>   
                                                  </div>
                                                  
                                              </TabPanel>
                                              <TabPanel value={this.state.value} index={1}>
                                                  <div className="tab-container">
                                                    <div id="map-canvas"></div>
                                                  </div>
                                              </TabPanel>
                                            </Paper>
                </div>)
    }
}

export default withRouter(Dashboard);