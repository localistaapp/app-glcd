import React, { Component } from 'react';
import axios from 'axios';
import { render } from 'react-dom';
import { Link, withRouter } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import EditIcon from '@material-ui/icons/Edit';
import CheckIcon from '@material-ui/icons/Check';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

import CalendarViewDay from '@material-ui/icons/CalendarToday';
import ListView from '@material-ui/icons/List';

import { questions, conditionalQuestions } from '../../data-source/mockDataQnA';
import { useHistory } from "react-router-dom";

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
  },
});

class Calendar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedMonth: moment(),
      selectedDay: moment().startOf("day"),
      selectedMonthEvents: [],
      showEvents: false
    };

    this.previous = this.previous.bind(this);
    this.next = this.next.bind(this);
    this.addEvent = this.addEvent.bind(this);
    this.showCalendar = this.showCalendar.bind(this);
    this.goToCurrentMonthView = this.goToCurrentMonthView.bind(this);

    this.initialiseEvents();
  }

  previous() {
    const currentMonthView = this.state.selectedMonth;

    this.setState({
      selectedMonth: currentMonthView.subtract(1, "month")
    });
  }

  next() {
    const currentMonthView = this.state.selectedMonth;
    this.setState({
      selectedMonth: currentMonthView.add(1, "month")
    });
  }

  select(day) {
    this.setState({
      selectedMonth: day.date,
      selectedDay: day.date.clone(),
      showEvents: true
    });
  }

  goToCurrentMonthView(){
    const currentMonthView = this.state.selectedMonth;
    this.setState({
      selectedMonth: moment()
    });
  }

  showCalendar() {
    this.setState({
      selectedMonth: this.state.selectedMonth,
      selectedDay: this.state.selectedDay,
      showEvents: false
    });
  }

  renderMonthLabel() {
    const currentMonthView = this.state.selectedMonth;
    return (

      <span className="box month-label">
        {currentMonthView.format("MMMM YYYY")}
      </span>
    );
  }

  renderDayLabel() {
    const currentSelectedDay = this.state.selectedDay;
    return (
    <div>
        <span className="box month-label" style={{marginRight:'60px',display:'inline-block'}} onClick={()=>{this.setState({
                                                                                                                  showEvents: false
                                                                                                                });}}>&lt; Back</span>
      <span className="box month-label" style={{display:'inline-block'}}>
        {currentSelectedDay.format("DD MMMM YYYY")}
      </span>
  </div>
    );
  }

  renderTodayLabel() {
    const currentSelectedDay = this.state.selectedDay;
    return (
      <span className="box today-label" onClick={this.goToCurrentMonthView}>
        Today
      </span>
    );
  }

  renderWeeks() {
    const currentMonthView = this.state.selectedMonth;
    const currentSelectedDay = this.state.selectedDay;
    const monthEvents = this.state.selectedMonthEvents;

    let weeks = [];
    let done = false;
    let previousCurrentNextView = currentMonthView
      .clone()
      .startOf("month")
      .subtract(1, "d")
      .day("Monday");
    let count = 0;
    let monthIndex = previousCurrentNextView.month();

    while (!done) {
      weeks.push(
        <Week
          previousCurrentNextView={previousCurrentNextView.clone()}
          currentMonthView={currentMonthView}
          monthEvents={monthEvents}
          selected={currentSelectedDay}
          select={day => this.select(day)}
        />
      );
      previousCurrentNextView.add(1, "w");
      done = count++ > 2 && monthIndex !== previousCurrentNextView.month();
      monthIndex = previousCurrentNextView.month();
    }
    return weeks;
  }

  handleAdd() {
    const monthEvents = this.state.selectedMonthEvents;
    const currentSelectedDate = this.state.selectedDay;

    let newEvents = [];

    var eventTitle = prompt("Please enter a name for your event: ");

    switch (eventTitle) {
      case "":
        alert("Event name cannot be empty.");
        break;
      case null:
        alert("Changed your mind? You can add one later!");
        break;
      default:
        var newEvent = {
          title: eventTitle,
          date: currentSelectedDate,
          dynamic: true
        };

        newEvents.push(newEvent);

        for (var i = 0; i < newEvents.length; i++) {
          monthEvents.push(newEvents[i]);
        }

        this.setState({
          selectedMonthEvents: monthEvents
        });
        break;
    }
  }

  addEvent() {
    const currentSelectedDate = this.state.selectedDay;
    let isAfterDay = moment().startOf("day").subtract(1, "d");

    if (currentSelectedDate.isAfter(isAfterDay)) {
      this.handleAdd();
    } else {
      if (confirm("Are you sure you want to add an event in the past?")) {
        this.handleAdd();
      } else {
      } // end confirm past
    } //end is in the past
  }

  redirectEvent(i) {
    const monthEvents = this.state.selectedMonthEvents.slice();
    const currentSelectedDate = this.state.selectedDay;
    console.log('OrderMeta: ', this.state.selectedMonthEvents[i].meta);
    sessionStorage.setItem('order-meta', JSON.stringify(this.state.selectedMonthEvents[i].meta));
    location.href = '/order-detail'
    /*if (confirm("Are you sure you ...want to remove this event?")) {
      let index = i;

      if (index != -1) {
        monthEvents.splice(index, 1);
      } else {
        alert("No events to remove on this day!");
      }

      this.setState({
        selectedMonthEvents: monthEvents
      });
    }*/
  }

  autoReadOtpSMS(cb) {
      // used AbortController with setTimeout so that WebOTP API (Autoread sms) will get disabled after 1min
      const ac = new AbortController();
      setTimeout(() => {
          ac.abort();
      }, 1 * 60 * 1000);
      async function readOTP() {
          //alert('readOTP4');
          if ('OTPCredential' in window) {
              //alert('feature detected');
              //feature detected
              try {
                  if (navigator.credentials) {
                      //alert('request sent for detection');
                      try {
                          navigator.credentials
                              .get({ signal: ac.signal, otp: { transport: ['sms'] } })
                              .then((otp) => {
                                  //alert('--OTP content exists--');
                                  //alert(otp);
                                  //alert('--OTP code--');
                                  if (otp && otp.code) {
                                      //alert('--OTP code exists--');
                                      //alert(otp.code);
                                      alert(otp.code[0]);
                                      alert(otp.code[1]);
                                      alert(otp.code[2]);
                                      alert(otp.code[3]);
                                      alert(otp.code[4]);
                                      alert(otp.code[5]);

                                  }
                              })
                              .catch(e => alert(e));
                      } catch (e) {
                            //alert(2);
                            alert(e);
                          return;
                      }
                  }
              } catch (err) {
                  //alert(3);
                  alert(err);
                  console.log(err);
              }
          }
      }
      readOTP();
    };

  initialiseEvents() {
    //alert('Checking OTP');
    //this.autoReadOtpSMS(()=>{alert('callback')});
    const monthEvents = this.state.selectedMonthEvents;

    let allEvents = [];

    axios.get(`/event-orders/${sessionStorage.getItem('user').replaceAll('"','')}`)
              .then(function (response) {
                console.log('Order data-----', response.data);
                //this.setState({results: response.data.results});
                for (var i=0;i<response.data.length;i++) {
                    var orderMeta = response.data[i];
                    var eventTitle = response.data[i].pizza_quantity + ' ' + response.data[i].size + ' pizzas';
                    var orderId = response.data[i].order_id;
                    var eventDate = moment(response.data[i].event_date + ' ' + response.data[i].event_time, 'YYYY-MM-DD hh:mm');
                    var event = {
                          meta: orderMeta,
                          title:eventTitle,
                          orderId: orderId,
                          date: eventDate,
                          dynamic: false
                        };
                    allEvents.push(event);
                }
                for (var j = 0; j < allEvents.length; j++) {
                  monthEvents.push(allEvents[j]);
                }

                this.setState({
                  selectedMonthEvents: monthEvents
                });

              }.bind(this));

    /* var event1 = {
      title:
        "Press the Add button and enter a name for your event. P.S you can delete me by pressing me!",
      date: moment(),
      dynamic: false
    };

    var event2 = {
      title: "Event 2 - Meeting",
      date: moment(),
      dynamic: false
    };

    var event3 = {
      title: "Event 3 - Cinema",
      date: moment().startOf("day").subtract(7, "d").add(18, "h"),
      dynamic: false
    };

    var event4 = {
      title: "Event 4 - Theater",
      date: moment().startOf("day").subtract(16, "d").add(20, "h"),
      dynamic: false
    };

    var event5 = {
      title: "Event 5 - Drinks",
      date: moment().startOf("day").subtract(2, "d").add(12, "h"),
      dynamic: false
    };

    var event6 = {
      title: "Event 6 - Diving",
      date: moment().startOf("day").subtract(2, "d").add(13, "h"),
      dynamic: false
    };

    var event7 = {
      title: "Event 7 - Tennis",
      date: moment().startOf("day").subtract(2, "d").add(14, "h"),
      dynamic: false
    };

    var event8 = {
      title: "Event 8 - Swimmming",
      date: moment().startOf("day").subtract(2, "d").add(17, "h"),
      dynamic: false
    };

    var event9 = {
      title: "Event 9 - Chilling",
      date: moment().startOf("day").subtract(2, "d").add(16, "h"),
      dynamic: false
    };

        var event10 = {
      title:
        "Hello World",
      date: moment('25/11/2022 18:00', 'DD/MM/YYYY hh:mm'),
      dynamic: false
    };

    allEvents.push(event1);
    allEvents.push(event2);
    allEvents.push(event3);
    allEvents.push(event4);
    allEvents.push(event5);
    allEvents.push(event6);
    allEvents.push(event7);
    allEvents.push(event8);
    allEvents.push(event9);
    allEvents.push(event10); */


  }

  render() {
    const currentMonthView = this.state.selectedMonth;
    const currentSelectedDay = this.state.selectedDay;
    const showEvents = this.state.showEvents;

    if (showEvents) {
      return (
        <section className="main-calendar">
          <header className="calendar-header">
            <div className="row title-header">
              {this.renderDayLabel()}
            </div>

          </header>
          <Events
            selectedMonth={this.state.selectedMonth}
            selectedDay={this.state.selectedDay}
            selectedMonthEvents={this.state.selectedMonthEvents}
            redirectEvent={i => this.redirectEvent(i)}
          />
        </section>
      );
    } else {
      return (
        <section className="main-calendar">
          <header className="calendar-header">
            <div className="row title-header">
              <i
                className="box arrow fa fa-angle-left"
                onClick={this.previous}
              />
              <div className="box header-text">
              {this.renderTodayLabel()}
              {this.renderMonthLabel()}
              </div>
              <i className="box arrow fa fa-angle-right" onClick={this.next} />
            </div>
            <DayNames />
          </header>
          <div className="days-container">
            {this.renderWeeks()}
          </div>
        </section>
      );
    }
  }
}

class Events extends React.Component {
  completeOrder(orderId) {
        var http = new XMLHttpRequest();
        var url = '/completeConfirmedOrder';
        var params = 'orderId='+orderId;
        http.open('POST', url, true);
        http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

        http.onreadystatechange = function() {//Call a function when the state changes.
            if(http.readyState == 4 && http.status == 200) {
                console.log('confirmed order creation post response:', http.responseText);
                var res = http.responseText;
                if(res != null){
                    res = JSON.parse(res);
                    console.log('--event order id--', res);
                    window.location.href='/orders?status=success';
                }
            }
        }.bind(this);
        http.send(params);
  }
  render() {
    const currentMonthView = this.props.selectedMonth;
    const currentSelectedDay = this.props.selectedDay;
    const monthEvents = this.props.selectedMonthEvents;
    const redirectEvent = this.props.redirectEvent;

    const monthEventsRendered = monthEvents.map((event, i) => {
    console.log('---event0---', event);
      return (
        <div
          key={event.title}
          className="event-container"
        >

            <div className="event-time event-attribute">
              {event.date.format("HH:mm")}
            </div>

            <span className="event-title event-attribute small-link" onClick={() => redirectEvent(i)}>{event.title}</span>
            <span className="desc-btn" style={{marginLeft:'14px'}}><EditIcon onClick={()=>{alert(1)}} />&nbsp;&nbsp;<CheckIcon onClick={()=>{this.completeOrder(event.orderId)}} /></span>
        </div>
      );
    });

    const dayEventsRendered = [];

    for (var i = 0; i < monthEventsRendered.length; i++) {
      if (monthEvents[i].date.isSame(currentSelectedDay, "day")) {
        dayEventsRendered.push(monthEventsRendered[i]);
      }
    }

    return (
      <div className="day-events">
        {dayEventsRendered}
      </div>
    );
  }
}

class DayNames extends React.Component {
  render() {
    return (
      <div className="row days-header">
        <span className="box day-name">Mon</span>
        <span className="box day-name">Tue</span>
        <span className="box day-name">Wed</span>
        <span className="box day-name">Thu</span>
        <span className="box day-name">Fri</span>
        <span className="box day-name">Sat</span>
        <span className="box day-name">Sun</span>
      </div>
    );
  }
}

class Week extends React.Component {
  render() {
    let days = [];
    let date = this.props.previousCurrentNextView;
    let currentMonthView = this.props.currentMonthView;
    let selected = this.props.selected;
    let select = this.props.select;
    let monthEvents = this.props.monthEvents;

    for (var i = 0; i < 7; i++) {
      var dayHasEvents = false;
      var isConfirmedOrder = false;
      var isSampleOrder = false;
      for (var j = 0; j < monthEvents.length; j++) {
        if (monthEvents[j].date.isSame(date, "day")) {
        console.log('monthEvents[j].meta', monthEvents[j].meta);
          dayHasEvents = true;
          if (monthEvents[j].meta.order_status == 'CONFIRMED') {
            isConfirmedOrder = true;
          }
          if (monthEvents[j].meta.order_type == 'SAMPLE') {
            isSampleOrder = true;
          }
        }
      }

      let day = {
        name: date.format("dd").substring(0, 1),
        number: date.date(),
        isCurrentMonth: date.month() === currentMonthView.month(),
        isToday: date.isSame(new Date(), "day"),
        date: date,
        hasEvents: dayHasEvents,
        isConfirmedOrder: isConfirmedOrder,
        isSampleOrder: isSampleOrder
      };

      days.push(<Day day={day} selected={selected} select={select} />);
      date = date.clone();
      date.add(1, "d");
    }
    return (
      <div className="row week">
        {days}
      </div>
    );
  }
}

class Day extends React.Component {
  render() {
    let day = this.props.day;
    let selected = this.props.selected;
    let select = this.props.select;
    let classNameColor = this.props.day.isConfirmedOrder ? 'day-number yellow' : 'day-number';
    console.log(this.props.day.isSampleOrder);
    classNameColor = this.props.day.isSampleOrder ? 'day-number blue' : classNameColor;
    return (
      <div
        className={
          "day" +
          (day.isToday ? " today" : "") +
          (day.isCurrentMonth ? "" : " different-month") +
          (day.date.isSame(selected) ? " selected" : "") +
          (day.hasEvents ? " has-events" : "")
        }
        onClick={() => select(day)}
      >
        <div className={classNameColor}>{day.number}</div>
      </div>
    );
  }
}


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
                    <div className="title starter-title">Freshly baked on arrival of your order</div>
                </div>}

                <div className={`incrementer sf-inc ${incrementerClass}`}>
                    <div className="card-mini-title" >Quantity:</div>
                    <div className="quantity">
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


class Stages extends Component {

    constructor() {
        super();
        Date.prototype.toDateInputValue = (function() {
                    var local = new Date(this);
                    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
                    return local.toJSON().slice(0,10);
                });
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
            eventDate: new Date().toDateInputValue(),
            deliveryDate: new Date().toDateInputValue(),
            orderSummary: localStorage.getItem('basket') != null ? JSON.parse(localStorage.getItem('basket')) : [],
            status: window.location.href.indexOf('?status=success') >= 0 ? 'success' :'default'
        };
        sessionStorage.setItem('eventDate',new Date().toDateInputValue());
        window.currSlotSelected = '';
        this.handleTabChange = this.handleTabChange.bind(this);
    }
    componentDidMount() {
        this.fetchJson();

    }
    fetchJson() {
        console.log('this.props.match: ', this.props.match);
        let task = 'interior';
        let loc = 'blr';
        let zone = 'east';

        axios.get(`/data/${task}/${loc}/${zone}`)
          .then(function (response) {
            console.log('response data-----', response.data);
            this.setState({results: response.data.results});
          }.bind(this));
        axios.get(`/data/${task}/${loc}/${zone}/starter`)
                  .then(function (response) {
                    this.setState({starters: response.data.results});
                  }.bind(this));
    }
    handleTabChange(event, newValue) {
        console.log('neValue: ', newValue);
        this.setState({value: newValue});
    }
    getTotal() {
        let orderSummary = this.state.orderSummary;
        let total = 0;
        let discounted = 1;

        if(isValidCoupon()) {
            discounted = 0.85;
        }
        orderSummary && Object.keys(orderSummary).map((index) => {
            if(typeof index !== 'undefined') {
                //total += orderSummary[index].price;
                total += Math.ceil(Math.round(orderSummary[index].price*discounted) / 10) * 10
            }
        });

        total = total + (0.04*total) + 75;
        if(!this.state.couponApplied) {
            localStorage.setItem('dPrice', Math.round(total));
        }
        return Math.round(total);
    }
    applyCoupon() {
        let curPrice = document.getElementById('price').innerHTML;
        let couponCode = document.getElementById('dCoupon').value;
        if(!this.state.couponApplied && couponCode != '' && couponCode.toUpperCase() == 'SLICE20') {
            curPrice = parseInt(curPrice,10);
            let revPrice = curPrice - curPrice * .2;;
            revPrice = Math.round(revPrice);
            document.getElementById('price').innerHTML = revPrice;
            localStorage.setItem('dPrice', revPrice);
            this.setState({couponApplied: true});
        }
    }
    selectSlot() {
        var e = document.getElementById("slots");
        var slot = e.options[e.selectedIndex].value;
        window.currSlotSelected = slot;
    }
    captureAddress() {
        let pincode = document.getElementById('dPincode').value;

        let address = document.getElementById('dAddress').value;
        let mobile = document.getElementById('dMobile').value;
        let name = document.getElementById('dName').value;
        localStorage.setItem('dPincode',pincode);
        localStorage.setItem('dAddress',address);
        localStorage.setItem('dMobile',mobile);
        localStorage.setItem('dName',name);
        let price = localStorage.getItem('dPrice');
        let slot = sessionStorage.getItem('deliverySlot') != null ? sessionStorage.getItem('deliverySlot') : '';
        let summary = localStorage.getItem('basket');
        let referralCode = localStorage.getItem('discountCode');
        let eOrderId = sessionStorage.getItem('eventOrderId');
        summary = summary != null ? summary : '';
        //create order
        var http = new XMLHttpRequest();
        var url = '/homelyOrder';
        var params = 'dPrice='+price+'&dMobile='+localStorage.getItem('dMobile')+'&dName='+localStorage.getItem('dName')+'&dSlot='+slot+'&dItems='+summary+'&dPincode='+pincode+'&referralCode='+referralCode+'&dAddress='+address+'&eOrderId='+eOrderId;
        http.open('POST', url, true);
        http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

        http.onreadystatechange = function() {//Call a function when the state changes.
            if(http.readyState == 4 && http.status == 200) {
                console.log('order creation post response:', http.responseText);
                var res = http.responseText;
                if(!pincode.includes('560') || !this.slotsAvailable) {
                    alert('Sorry, our slots are full. Pls check back again later!');
                    location.href = '/';
                }
                if(res != null){
                    res = JSON.parse(res);
                    /*if(res.whitelisted == false) {
                        alert("Sorry, we're not able to deliver to your location temporarily!");
                        this.setState({activeStep: 2});
                    } else {*/
                        document.getElementById('step3Circle').classList.add('active');this.setState({showSlot: true, activeStep: 3});
                        localStorage.setItem('orderId', res.orderId);
                    /*}*/
                }
            }
        }.bind(this);
        http.send(params);
        fbq('track', 'InitiateCheckout');
    }
    makePaymentRequest() {
        //uncomment
        //return;
        var http = new XMLHttpRequest();
        var url = '/paymentRequest';
        var orderId = 0;
        orderId = localStorage.getItem('orderId') != null ? localStorage.getItem('orderId') : orderId;

        var params = 'amount='+localStorage.getItem('dPrice')+'&phone='+localStorage.getItem('dMobile')+'&name='+localStorage.getItem('dName')+'&orderId='+orderId+'&slot='+sessionStorage.getItem('deliverySlot');
        http.open('POST', url, true);
        http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

        http.onreadystatechange = function() {//Call a function when the state changes.
            if(http.readyState == 4 && http.status == 200) {
                console.log('post response:', http.responseText);
                var res = http.responseText;
                res = JSON.parse(res);
                localStorage.setItem('paymentLink',res.payment_request.longurl);
                localStorage.setItem('paymentRequestId', res.payment_request.id);

                location.href = res.payment_request.longurl;
            }
        }
        http.send(params);
    }
    zeroPrefix(min) {
        return min < 10 ? '0'+min : min;
    }
    getDeliveryTime() {
        var newDateObj = new Date(new Date().getTime() + 90*60000);
        var lastDateObj = new Date(new Date().getTime() + 120*60000);
        var startHours = newDateObj.getHours() > 12 ? newDateObj.getHours() % 12 : newDateObj.getHours();
        var endHours = lastDateObj.getHours() > 12 ? lastDateObj.getHours() % 12 : lastDateObj.getHours();
        var ampmstart = newDateObj.getHours() >= 12 ? 'PM' : 'AM';
        var ampmend = lastDateObj.getHours() >= 12 ? 'PM' : 'AM';
        return startHours+":"+this.zeroPrefix(newDateObj.getMinutes() < 50 ? Math.ceil(newDateObj.getMinutes() / 10) * 10 : 50)+ampmstart+" and "+endHours+":"+this.zeroPrefix(lastDateObj.getMinutes() < 50 ? Math.ceil(lastDateObj.getMinutes() / 10) * 10 : 50)+ampmend;
    }
    setCOD() {
        var http = new XMLHttpRequest();
                var url = '/setCOD';
                var orderId = 0;
                orderId = localStorage.getItem('orderId') != null ? localStorage.getItem('orderId') : orderId;
                var params = 'orderId='+orderId;
                http.open('POST', url, true);
                http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

                http.onreadystatechange = function() {//Call a function when the state changes.
                    if(http.readyState == 4 && http.status == 200) {
                        console.log('post response:', http.responseText);
                        var res = http.responseText;
                        location.href = '/redirect/?payment_id=MOJO0629U05N96486745&payment_status=Credit&payment_request_id=388ed5d05e75428f9dc74327df7aa314';
                    }
                }
                http.send(params);
    }
    getQuoteString(numVistors) {
                return <div className="quote-txt" style={{marginTop: '22px'}}>Quote for {numVistors} large pizzas:</div>
            }
    saveEvent() {
        this.setState({curStep:2});
    }
    updateQuantity(eventQty) {
            //create order
            var http = new XMLHttpRequest();
            var url = '/updateEventOrder';
            var defaultPrice = 235;
            var eventQuote = Math.ceil(defaultPrice * parseInt(sessionStorage.getItem('qty'),10) * 0.85);
            var params = 'eventOrderId='+sessionStorage.getItem('eventOrderId')+'&eventQuantity='+eventQty+'&eventQuote='+eventQuote;
            http.open('POST', url, true);
            http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

            http.onreadystatechange = function() {//Call a function when the state changes.
                if(http.readyState == 4 && http.status == 200) {
                    console.log('event order update post response:', http.responseText);
                    var res = http.responseText;
                }
            }.bind(this);
            http.send(params);
            gtag('event', 'entered_num_guests', {'eDate': eventQty});
        }
    render() {
        const {status, showLoader, results, starters, orderSummary, showCoupon, showSlot, showList, showWizard, numVistors, curStep, redirect} = this.state;
        this.slotsAvailable = true;

        console.log('orderSummary: ', orderSummary);
        let loaderElems = [];
        console.log('::results::', results);
        for(var i=0; i<14; i++) {
            loaderElems.push(<div className="slice"></div>)
        }

        let slots = [];
        let currentHour = new Date().getHours();
        let currentMin = new Date().getMinutes();

        slots = ["Saturday 3PM - 4PM","Saturday 4PM - 5PM","Saturday 5PM - 6PM","Saturday 6PM - 7PM","Saturday 7PM - 8PM"];

        if(slots.length > 0) {
            window.currSlotSelected = slots[0];
        }

        let proposedPackage1 = {
                  "title": "Mediterranean Feast",
                  "type": "pizza",
                  "shortTitle": "Asense Interior",
                  "subTitle": "129, Siddapura",
                  "address": "129, Siddapura, Whitefield, Bengaluru, Karnataka, India, Varthur Main Road, Bengaluru",
                  "qna": [
                    {
                      "defaultPrice": 305,
                      "responses": [
                        {
                          "topic": "Large",
                          "pricing": {"Slim":  305, "Thick":  315}
                        },
                        {
                          "topic": "Medium",
                          "pricing": {"Slim":  295, "Thick":  305}
                        },
                        {
                          "topic": "Small",
                          "pricing": {"Slim":  275, "Thick":  295}
                        }
                      ],
                      "crust": [
                        {
                          "topic": "Slim",
                          "pricing": {"Large":  305, "Medium":  295, "Small":  275}
                        }
                      ]
                    }
                  ],
                  "usp": [
                    "Mild blend of Black Olives, Onion & Sweet corn"
                  ],
                  "images": {
                    "primary": "https://lh5.googleusercontent.com/p/AF1QipMfveOLCLmjGRfpfzooSICq5nskYbHGIdJVKtud=s870-k-no",
                    "secondary": []
                  }
                };



        return (<div>
                    <img id="logo" className="logo-img" src="../img/images/logo_scr.jpg" style={{width: '142px'}} onClick={()=>{window.location.href='/dashboard';}} />
                    {status == 'success' && <span className="stage-heading status-success">Order updated successfully</span>}
                    <span className="stage-heading" style={{top: '100px',background: '#f6f6f6'}}>Upcoming Event Orders</span>

                        <div className="calendar-rectangle"  style={{marginTop: '10px'}}>
                          <div id="calendar-content" className="calendar-content">
                            <Calendar />
                          </div>
                        </div>


                </div>)
    }
}

export default withRouter(Stages);