import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import GoogleOneTapLogin from 'react-google-one-tap-login';
import axios from 'axios';

class Shortlists extends Component {

    elementInViewport(el) {
        var top = el.offsetTop;
        var left = el.offsetLeft;
        var width = el.offsetWidth;
        var height = el.offsetHeight;
      
        while(el.offsetParent) {
          el = el.offsetParent;
          top += el.offsetTop;
          left += el.offsetLeft;
        }
      
        return (
          top < (window.pageYOffset + window.innerHeight) &&
          left < (window.pageXOffset + window.innerWidth) &&
          (top + height) > window.pageYOffset &&
          (left + width) > window.pageXOffset
        );
      }
     tempTimer() {
       // setTimeout(()=>{this.login();this.setState({timerSet: true})},5000);
        clearInterval(window.viewportCheck);
        //return true;
     }
     async fetchCyberLeaks(email) {
           if (localStorage.getItem('user-cyber-leaks-'+email) != null) {
              return localStorage.getItem('user-cyber-leaks-'+email);
           } else {
              let fetchUrl =  '/cyber-leaks/'+email;
              let cyberLeaksStr = 0;
              const response = await axios.get(fetchUrl);
              console.log('--cyber leaks response--', response);
              if (response && response.data.found && response.data.result) {
                let res = {entries: response.data.result, total: response.data.found};
                 cyberLeaksStr = JSON.stringify(res);
                 localStorage.setItem('user-cyber-leaks-'+email, cyberLeaksStr);
                 return cyberLeaksStr;
              }
           }
     }
     async renderCyberLeaks(email) {
        let leaksStr = await this.fetchCyberLeaks(email);
        let leaks = JSON.parse(leaksStr);
        console.log('--leaks--', leaks);
        let entries = leaks.entries;
         let str1 = '<table style="margin-left:48px">';
        let str2 = '</table>';
        let strArr = [];
        
        let attributesExposed ='';
        let linkTemplateHTML = '';
        let isSamePasswordExposed = false;
        let passwordArr = [];
        this.setState({leaksCount: entries.length});
        for(var i=0;i<entries.length-1;i++) {
           let strLeaksStr = '';
           //if(entries[i].address != '') {
            strLeaksStr += `<tr><td style="font-weight:700;max-width: 100px !important;vertical-align: top;">Address:</td><td style="max-width: 150px !important;overflow-x:scroll;">${entries[i].address || ''}</td></tr>`;
            attributesExposed = 'Address';
           //}
           //if(entries[i].phone != '') {
              strLeaksStr += `<tr><td style="font-weight:700;max-width: 100px !important;vertical-align: top;">Phone Number:</td><td style="max-width: 150px !important;overflow-x:scroll;">${entries[i].phone || ''}</td></tr>`;
              attributesExposed += ' Phone number';
           //}
           //if(entries[i].hashed_password != '') {
              strLeaksStr += `<tr><td style="font-weight:700;max-width: 100px !important;vertical-align: top;">Password:</td><td style="max-width: 150px !important;overflow-x:scroll;">${entries[i].password || ''}</td></tr>`;
              attributesExposed += ' Password';
           //}
           if(entries[i].hasOwnProperty('password') && passwordArr.indexOf(entries[i].password) !== -1) {
            isSamePasswordExposed = true;
           }
           //if(entries[i].ip_address != '') {
              strLeaksStr += `<tr><td style="font-weight:700;max-width: 100px !important;vertical-align: top;">Location/IP:</td><td style="max-width: 150px !important;overflow-x:scroll;">${entries[i].ip || ''}</td></tr>`;
              attributesExposed += ' Location';
           //}
           strLeaksStr += `<tr><td style="font-weight:700;max-width: 100px !important;vertical-align: top;">Email:</td><td style="max-width: 150px !important;overflow-x:scroll;">${entries[i].email || ''}</td></tr>`;
              attributesExposed += ' Email';

              strLeaksStr += `<tr><td style="font-weight:700;max-width: 100px !important;vertical-align: top;">Location/ZIP:</td><td style="max-width: 150px !important;overflow-x:scroll;">${entries[i].zip || ''}</td></tr>`;
              attributesExposed += ' Zip Code';

              passwordArr.push(entries[i].password);

           let appName = '';
           if(entries[i].hasOwnProperty('source') && entries[i].source.hasOwnProperty('name')) {
                appName = entries[i].source.name;
           } else {
                appName = entries[i].database_name;
           }
           let appImgUrl = '';
           if (appName.indexOf('www') != -1) {
              appName = appName.substr(appName.indexOf('www'),appName.indexOf('.com')+4);
           }
           if (appName.indexOf('_com') != -1) {
              appName = appName.replaceAll('_com','.com');
           }
           let dbName = appName;
           if (appName.indexOf('.com') == -1) {
              appName = appName+'.com';
           }
           if (attributesExposed != '') {
              linkTemplateHTML += this.leakTemplate.replaceAll('{AttributesExposed}',attributesExposed).replaceAll('{AppName}',appName).replaceAll('{dbname}',dbName).replaceAll('{trHTML}',strLeaksStr);
           }
        }
  
        console.log('---linkTemplateHTML---', linkTemplateHTML);
        if (passwordArr.length < 1) {
         this.setState({passwordExposed: false});
        }
        sessionStorage.setItem('riskLevelValue', isSamePasswordExposed || entries.length > 3 ? 'High' : 'Moderate');
        this.setState({exposures: `<div class="flex flex-wrap -m-3 mb-10">${linkTemplateHTML}</div><br><br><br></br>`,isSamePasswordExposed: isSamePasswordExposed, riskLevel: isSamePasswordExposed || entries.length > 3 ? 'High' : 'Moderate'});
        this.setState({currStep: 2, messageTxt: 'Your personal data including your <b>address</b> has been exposed on dark web.'});
     }
     login() {
        let mailId = document.getElementById('mailId').value;
        if (!this.state.loading) {
        console.log('log in');
        document.getElementById('mailId').style.display = 'none';
        this.setState({loading: true, userEmail: mailId});
        this.setState({messageTxt: 'Searching 100 million+ assets & dark web...'});
        setTimeout(()=>{this.setState({messageTxt: 'Looking for stolen passwords, phone numbers, addresses & more...'});setTimeout(()=>{this.renderCyberLeaks(document.getElementById('mailId').value);},2000);},3000);
        
        //console.log('userEmail: ', this.state.userEmail);
        }
     }
     constructor(props) {
        super(props);
        this.questionResponseArr = [];
        this.leakTemplate = `<div class="p-3 w-full"><div class="bg-gray-100 block cursor-pointer p-4 rounded-3xl" x-data="{ accordion: false }" x-on:click="accordion = !accordion"><div class="-m-2 flex flex-wrap"><div class="p-2 flex-1"><div style="display:flex"><img src="https://img.logo.dev/{AppName}?token=pk_G0TzXJmeR22hjyoG7hROlQ" style="width:36px;height:36px;border-radius:8px"><h3 class="font-black font-heading text-gray-900 text-l" data-config-id="txt-b0bdec-2" style="margin-top:5px;margin-left:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;width:200px">{dbname} likely exposures - {AttributesExposed}</h3></div><div class="duration-500 h-0 overflow-hidden" :style="accordion ? 'height: ' + $refs.container.scrollHeight + 'px' : ''" x-ref="container"><p class="font-bold mt-4 text-black-500" data-config-id="txt-b0bdec-7" style="font-family:Quicksand;font-weight:500"><table style="margin-left:18px">{trHTML}</table></div></div><div class="p-2 w-auto"><span class="inline-block rotate-0 transform"><svg data-config-id="svg-b0bdec-1" fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M17.9207 8.17999H11.6907H6.08072C5.12072 8.17999 4.64073 9.33999 5.32073 10.02L10.5007 15.2C11.3307 16.03 12.6807 16.03 13.5107 15.2L15.4807 13.23L18.6907 10.02C19.3607 9.33999 18.8807 8.17999 17.9207 8.17999Z" fill="#D1D5DB"></path></svg></span></div></div></div></div>`;
        this.state = {currStep: 1, loading: false, currQuestionId: -1, currQuestion: '', currOptions: [], showSkillGraph: false};
        this.fetchQuestions = this.fetchQuestions.bind(this);
        this.fetchNextQuestion = this.fetchNextQuestion.bind(this);
     }
     componentDidMount() {
         
       }
       componentDidUpdate() {
         if(this.state.currStep == 3 && this.questionResponseArr.length == 0) {
            this.fetchQuestions();
         } 
       }
      async fetchQuestions() {
         //read role, techStack from local storage
         const role = localStorage.getItem('role');
         const techStack = localStorage.getItem('techStack');
         let fetchUrl =  '/questions/'+encodeURIComponent(role)+'/'+encodeURIComponent(techStack);
         const response = await axios.get(fetchUrl);
         console.log('--fetch questions--', response);
         if (response && response.data) {
            this.questionResponseArr = response.data;
            this.setState({currQuestionId: this.state.currQuestionId + 1, currQuestion: this.questionResponseArr[0].question, currOptions: this.questionResponseArr[0].options});
            localStorage.removeItem('selections');
            return true;
         }
      }
      getSelectedOptions() {
         debugger;
         let selOptions = [];
         if(document.querySelector('#optionA').checked) {
            selOptions.push('A');
         }
         if(document.querySelector('#optionB').checked) {
            selOptions.push('B');
         }
         if(document.querySelector('#optionC').checked) {
            selOptions.push('C');
         }
         if(document.querySelector('#optionD').checked) {
            selOptions.push('D');
         }
         return selOptions;
      }
      setSelections() {
         const currQuestion = this.state.currQuestion;
         const currSelectedOptions = this.getSelectedOptions();

         let sel = {};
         sel.question = currQuestion;
         sel.selectedOptions = currSelectedOptions;

         let selections = [];
         
         if(localStorage.getItem('selections') != null) {
            selections = JSON.parse(localStorage.getItem('selections'));
         };
         selections.push(sel);

         localStorage.setItem('selections', JSON.stringify(selections));
      }
      renderSkillGraph(skills) {
         var pentagonIndex = 0;
         var valueIndex = 0;
         var width = 0;
         var height = 0;
         var radOffset = Math.PI/2
         var sides = 5; // Number of sides in the polygon
         var theta = 2 * Math.PI/sides; // radians per section

         function getXY(i, radius) {
         return {"x": Math.cos(radOffset +theta * i) * radius*width + width/2,
            "y": Math.sin(radOffset +theta * i) * radius*height + height/2};
         }

         var hue = [];
         var hueOffset = 25;

         for (var s in skills) {
         $(".content").append('<div class="pentagon" id="interests"><div class="header">Your Skill Gap Analysis</div><canvas class="pentCanvas"/></div>');
         hue[s] = (hueOffset + s * 255/skills.length) % 255;
         }

         $(".pentagon").each(function(index){
         width = $(this).width();
         height = $(this).height();
         var ctx = $(this).find('canvas')[0].getContext('2d');
         ctx.canvas.width = width;
         ctx.canvas.height = height;
         ctx.font="12px Monospace";
         ctx.textAlign="center";
         
         /*** LABEL ***/
         var color = "hsl("+hue[pentagonIndex]+", 100%, 50%)";
         ctx.fillStyle = color;
        //ctx.fillText(skills[pentagonIndex].header, width/2, 15);

         ctx.font="12px Monospace";   

         /*** PENTAGON BACKGROUND ***/
         for (var i = 0; i < sides; i++) {
            // For each side, draw two segments: the side, and the radius
            ctx.beginPath();
            var xy = getXY(i, 0.3);
            var colorJitter = 25 + theta*i*2;
            color = "hsl("+hue[pentagonIndex]+",100%," + colorJitter + "%)";
            ctx.fillStyle = color;
            ctx.strokeStyle = color;
            ctx.moveTo(0.5*width, 0.5*height); //center
            ctx.lineTo(xy.x, xy.y);
            xy = getXY(i+1, 0.3);
            ctx.lineTo(xy.x, xy.y);
            xy = getXY(i, 0.37);
            console.log();
            ctx.fillText(skills[ pentagonIndex].captions[valueIndex],xy.x-10, xy.y +5);
            valueIndex++;
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
         }
         
         valueIndex = 0;
         ctx.beginPath();
         ctx.fillStyle = "rgba(248, 148, 29, 0.2)";
         ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
         ctx.lineWidth = 5;
         var value = skills[pentagonIndex].values[valueIndex];
         xy = getXY(i, value * 0.3);
         ctx.moveTo(xy.x,xy.y);
         /*** SKILL GRAPH ***/
         for (var i = 0; i < sides; i++) {
            xy = getXY(i, value * 0.3);
            ctx.lineTo(xy.x,xy.y);
            valueIndex++;
            value = skills[pentagonIndex].values[valueIndex];
         }
         ctx.closePath();
         ctx.stroke();
         ctx.fill();
         valueIndex = 0;  
         pentagonIndex++;
         });
      }
      sendPreAssessment() {
         this.setSelections();
         const selected = localStorage.getItem('selections');
         axios.post(`/preassess`, {selections: selected}).then((response) => {
            console.log(response.status);
            console.log('---response---', response.data);
            console.log('---response data---', response.data);
            this.setState({showSkillGraph: true});
            document.querySelector('.hprog-c').style.display = 'none';
            document.querySelector('.otp-countdown').style.display = 'none';
            this.renderSkillGraph(response.data);
        });
      }
      fetchNextQuestion() {
         this.setSelections();
         document.querySelectorAll('input[type=checkbox]').forEach((elem)=>{elem.checked=false;});
         let curQId = this.state.currQuestionId + 1;
         this.setState({currQuestionId: curQId, currQuestion: this.questionResponseArr[curQId].question, currOptions: this.questionResponseArr[curQId].options});
         window.scrollTo(0,260);
         return true;
      }
      countdown(elementName, minutes, seconds) {
         element = document.getElementById(elementName);
         var element, endTime, hours, mins, msLeft, time;
         function twoDigits(n) {
           return n <= 9 ? "0" + n : n;
         }
         function updateTimer() {
           msLeft = endTime - +new Date();
           if (msLeft < 1000) {
             element.innerHTML = "Time is up!";
           } else {
             time = new Date(msLeft);
             hours = time.getUTCHours();
             mins = time.getUTCMinutes();
             element.innerHTML =
               (hours ? hours + ":" + twoDigits(mins) : mins) +
               ":" +
               twoDigits(time.getUTCSeconds());
             setTimeout(updateTimer, time.getUTCMilliseconds() + 500);
           }
         }
         endTime = +new Date() + 1000 * (60 * minutes + seconds) + 500;
         updateTimer();
       }
    render() {
      return (
        <section id="risk-checker" data-section-id="5" data-share="" data-category="navigations" data-component-id="886f4350_01_awz" className="bg-white" x-data="{ mobileNavOpen: false }">
              
              {sessionStorage.getItem('user') == null && <GoogleOneTapLogin onError={(error) => console.log(error)} onSuccess={(response) => {console.log(response);}} googleAccountConfigs={{ client_id: '128159303865-64ustcdp4pj9f6isg39p7hekhjdj2ln5.apps.googleusercontent.com',auto_select: false,cancel_on_tap_outside: false }} />}
              {this.state.currStep == 1 && 
               <section class="relative overflow-hidden">
               <div class="container px-4 mx-auto">
               <div class="text-center mb-14">
                  <h1 class="font-heading font-semibold text-4xl sm:text-8xl lg:text-10xl mb-6">        <span>Assess your</span>        <span class="text-blue-500">skills</span>      </h1>
               </div>
               <div class="container">
                  <section class="step-indicator">
                        <div class="step step1 active">
                           <div class="step-icon">1</div>
                        <p>Job Role</p>
                        </div>
                     <div class="indicator-line active"></div>
                     <div class="step step2">
                        <div class="step-icon">2</div>
                        <p>Tech Stack</p>
                     </div>
                     <div class="indicator-line"></div>
                     <div class="step step3">
                        <div class="step-icon">3</div>
                        <p>Assess</p>
                     </div>
                  </section>
               </div>
               <form action="" style={{paddingLeft: '16px', paddingRight: '16px'}}>
                  <div class="max-w-md xl:max-w-1xl mx-auto">
                     <div class="flex flex-wrap -mx-2 mb-8">
                        <div>Select your current job role:</div>
                        <br/>          
                        <div style={{width: '100%',marginTop: '12px', paddingRight: '10px', paddingLeft: '10px'}} class="relative group px-8 pt-5 pb-4 mb-4 bg-gray-50 rounded-lg">
                           <select id="roleElemId" class="w-full bg-transparent text-base placeholder-blueGray-900 font-semibold outline-none rounded-lg" name="field-name">
                              <option>Junior Engineer (SDE-I / 1-3 years of experience)</option>
                              <option>Mid-Level Engineer (SDE-II / 4-8 years of experience)</option>
                              <option>Senior Engineer (SDE-III / 9-15 years of experience)</option>
                              <option>Staff Engineer (15+ - 20 years of experience)</option>
                              <option>Senior Staff/Principal (20+ years of experience)</option>
                           </select>
                        </div>
                     </div>
                     <div class="text-center">
                        <a class="group relative inline-block h-16 mb-8 w-full md:w-44 bg-blueGray-900 rounded"  onClick={()=>{this.setState({currStep: 2});localStorage.setItem('role',document.getElementById('roleElemId').options[document.getElementById('roleElemId').selectedIndex].text);}}>
                           <div class="absolute top-0 left-0 transform -translate-y-1 -translate-x-1 w-full h-full group-hover:translate-y-0 group-hover:translate-x-0 transition duration-300">
                              <div class="flex h-full w-full items-center justify-center bg-blue-500 border-2 border-blueGray-900 rounded">                <span class="text-base font-semibold uppercase" >Next &gt;</span>              </div>
                           </div>
                        </a>
                     </div>
                  </div>
               </form>
               </div>
               <div class="relative mt-16 pt-16 pb-18">
               <div class="container px-4 mx-auto">
                  <img class="absolute top-0 left-0 h-full w-full object-cover lg:object-fill" src="./images/line-circles-bottom-light.svg" alt=""/>      
                  <div class="animate-moving relative flex items-center justify-between">        <span class="relative flex-shrink-0 inline-block mr-8 md:mr-20 lg:mr-40 uppercase text-sm font-medium">          <span>Loose coupling </span>        </span>        <span class="relative flex-shrink-0 inline-block mr-8 md:mr-20 lg:mr-40 uppercase text-sm font-medium">          <span>Code Quality</span>        </span>        <span class="relative flex-shrink-0 inline-block mr-8 md:mr-20 lg:mr-40 uppercase text-sm font-medium">          <span>COLLABORATION</span>        </span>        <span class="relative flex-shrink-0 inline-block mr-8 md:mr-20 lg:mr-40 uppercase text-sm font-medium">          <span>Abstraction</span>        </span>        <span class="relative flex-shrink-0 inline-block mr-8 md:mr-20 lg:mr-40 uppercase text-sm font-medium">          <span>Memory Profiling</span>        </span>        <span class="relative flex-shrink-0 inline-block uppercase text-sm font-medium">          <span>REFACTORING</span>        </span>      </div>
               </div>
               </div>
                 </section>
                 
                 
                 }
                 {this.state.currStep == 2 && <div id="checker-step2" class="container mx-auto">
                     <section class="relative overflow-hidden">
                        <div class="container px-4 mx-auto">
                        <div class="text-center mb-14">
                           <h1 class="font-heading font-semibold text-4xl sm:text-8xl lg:text-10xl mb-6">        <span>Assess your</span>        <span class="text-blue-500">skills</span>      </h1>
                        </div>
                        <div class="container">
                        <section class="step-indicator">
                              <div class="step step1 active">
                                 <div class="step-icon">1</div>
                              <p>Job Role</p>
                              </div>
                           <div class="indicator-line active"></div>
                           <div class="step step2 active">
                              <div class="step-icon">2</div>
                              <p>Tech Stack</p>
                           </div>
                           <div class="indicator-line"></div>
                           <div class="step step3">
                              <div class="step-icon">3</div>
                              <p>Assess</p>
                           </div>
                        </section>
                     </div>
                        <form action="" style={{paddingLeft: '16px', paddingRight: '16px'}}>
                           <div class="max-w-md xl:max-w-1xl mx-auto">
                              <div class="flex flex-wrap -mx-2 mb-8">
                                 <div>Enter your tech stack:</div>
                                 <br/>          
                                 <div style={{width: '100%',marginTop: '12px', paddingRight: '10px', paddingLeft: '10px'}} class="relative group px-8 pt-5 pb-4 mb-4 bg-gray-50 rounded-lg">
                                    <div class="relative group px-2 bg-gray-50 rounded-lg">
                                       <input id="techStackElemId" class="w-full bg-transparent text-base placeholder-blueGray-900 font-semibold outline-none rounded-lg" type="text" placeholder="Eg. Frontend - React JS, Node JS, Typescript, CSS"/>
                                    </div>
                                 </div>
                              </div>
                              <div class="text-center">
                                 <a class="group relative inline-block h-16 mb-8 w-full md:w-44 bg-blueGray-900 rounded"  onClick={()=>{this.setState({currStep: 3});setTimeout(()=>{this.countdown("timer-countdown", 15, 0);},1500);localStorage.setItem('techStack',document.getElementById('techStackElemId').value);}}>
                                    <div class="absolute top-0 left-0 transform -translate-y-1 -translate-x-1 w-full h-full group-hover:translate-y-0 group-hover:translate-x-0 transition duration-300">
                                       <div class="flex h-full w-full items-center justify-center bg-blue-500 border-2 border-blueGray-900 rounded">                <span class="text-base font-semibold uppercase" >Next &gt;</span>              </div>
                                    </div>
                                 </a>
                              </div>
                           </div>
                        </form>
                        </div>
                        <div class="relative mt-16 pt-16 pb-18">
                        <div class="container px-4 mx-auto">
                           <img class="absolute top-0 left-0 h-full w-full object-cover lg:object-fill" src="./images/line-circles-bottom-light.svg" alt=""/>      
                           <div class="animate-moving relative flex items-center justify-between">        <span class="relative flex-shrink-0 inline-block mr-8 md:mr-20 lg:mr-40 uppercase text-sm font-medium">          <span>Loose coupling </span>        </span>        <span class="relative flex-shrink-0 inline-block mr-8 md:mr-20 lg:mr-40 uppercase text-sm font-medium">          <span>Code Quality</span>        </span>        <span class="relative flex-shrink-0 inline-block mr-8 md:mr-20 lg:mr-40 uppercase text-sm font-medium">          <span>COLLABORATION</span>        </span>        <span class="relative flex-shrink-0 inline-block mr-8 md:mr-20 lg:mr-40 uppercase text-sm font-medium">          <span>Abstraction</span>        </span>        <span class="relative flex-shrink-0 inline-block mr-8 md:mr-20 lg:mr-40 uppercase text-sm font-medium">          <span>Memory Profiling</span>        </span>        <span class="relative flex-shrink-0 inline-block uppercase text-sm font-medium">          <span>REFACTORING</span>        </span>      </div>
                        </div>
                        </div>
                     </section>
                 </div>}
                 {this.state.currStep == 3 && <div id="checker-step2" class="container mx-auto">
                     <section class="relative overflow-hidden">
                        <div class="container px-4 mx-auto">
                        <div class="text-center mb-14">
                           <h1 class="font-heading font-semibold text-4xl sm:text-8xl lg:text-10xl mb-6">        <span>Assess your</span>        <span class="text-blue-500">skills</span>      </h1>
                        </div>
                        <div class="container">
                        <section class="step-indicator" style={{marginBottom: '52px'}}>
                              <div class="step step1 active">
                                 <div class="step-icon">1</div>
                              <p>Job Role</p>
                              </div>
                           <div class="indicator-line active"></div>
                           <div class="step step2 active">
                              <div class="step-icon">2</div>
                              <p>Tech Stack</p>
                           </div>
                           <div class="indicator-line active"></div>
                           <div class="step step3">
                              <div class="step-icon">3</div>
                              <p>Assess</p>
                           </div>
                        </section>
                        <div className='hprog-c'>
                           <div class="hprog-t">Question {this.state.currQuestionId+1}/{this.questionResponseArr.length}</div>
                           <div className='hprog'>
                              <hr className='hprog-l' width={`${(this.state.currQuestionId+1) * 100/this.questionResponseArr.length}%`}></hr>
                           </div>
                        </div>
                        <div className="otp-countdown"  ><img src="./assets/stopwatch.png" /><span id="timer-countdown">15:00</span></div>
                     </div>
                        {this.state.currOptions && this.state.currOptions.length == 0 && 
                           <div class="card">
                           <div class="loader-shimmer-banner shimmer-animation"></div>
                           <div class="loader-shimmer-content">
                             <div class="loader-shimmer-header">
                               <div class="loader-shimmer-title shimmer-animation"></div>
                               <div class="loader-shimmer-rating shimmer-animation"></div>
                             </div>
                             <div class="loader-shimmer-list shimmer-animation"></div>
                             <div class="loader-shimmer-info shimmer-animation"></div>
                           </div>
                         </div>}
                        {this.state.showSkillGraph == true && <div class="content"></div>} 
                        {this.state.currOptions && this.state.currOptions.length > 0 && this.state.showSkillGraph == false && <form action="">
                           <div class="max-w-md xl:max-w-1xl mx-auto">
                           <div class="">
                                 <div>
                                  <div class="-mb-1 pt-6 pb-3 px-6 md:px-12 border border-b-0 border-gray-50 rounded-t-2xl">
                                    <div>
                                       <div class="flex flex-wrap -mx-3 items-center">
                                          <div class="w-full xl:w-auto px-1 mb-4 xl:mb-0">
                                          <span class="font-heading font-semibold">{this.state.currQuestion}</span>
                                          </div>
                                       </div>
                                    </div>
                                    </div>
                                    <div class="w-full overflow-x-auto border-l border-r border-gray-50">
                                    <table class="x-width" style={{width: '100%'}}>
                                       <thead>
                                          <tr>
                                          <th class="p-0">
                                             <div class="h-16 pl-5 flex items-center bg-yellowGray-50 border-t border-b border-gray-50">
                                                <span class="text-xs text-gray-900 font-normal">Select Options:</span>
                                             </div>
                                          </th>
                                          <th class="p-0">
                                             <div class="h-16 flex items-center justify-center bg-yellowGray-50 border border-l-0 border-gray-50 rounded-tr-xl"></div>
                                          </th>
                                          </tr>
                                       </thead>
                                       <tbody>
                                          <tr></tr>
                                          {
                                             this.state.currOptions.map((item)=> {
                                                return <tr>
                                                <td class="p-0">
                                                   <div class="flex items-center w-full pl-12 bg-white border-b border-gray-50" style={{paddingLeft: '1.5rem'}}>
                                                      <label class="container-checkbox">
                                                         <input id={`option${item.option}`} type="checkbox" />
                                                         <span class="checkmark"></span>
                                                      </label>
                                                      <label class="flex mt-4 mb-4 mr-1 items-center" for={`option${item.option}`}>
                                                      <div class="ml-4">
                                                         <span class="text-xs text-gray-900 font-normal">{item.text}</span>
                                                      </div>
                                                      </label>
                                                   </div>
                                                </td>
                                                </tr>
                                             })
                                          }
                                       </tbody>
                                    </table>
                                    </div>
                                    
                                 </div>
                              </div>
                              <div class="text-center bottom-cta" style={{marginTop: '36px'}}>
                              {this.questionResponseArr != null && this.state.currQuestionId == this.questionResponseArr.length -1 && 
                                 <a class="group relative inline-block h-16 mb-8 w-full md:w-44 bg-blueGray-900 rounded"  onClick={()=>{this.sendPreAssessment();}}>
                                    <div class="absolute top-0 left-0 transform -translate-y-1 -translate-x-1 w-full h-full group-hover:translate-y-0 group-hover:translate-x-0 transition duration-300">
                                       <div class="flex h-full w-full items-center justify-center bg-blue-500 border-2 border-blueGray-900 rounded" style={{background: '#2189ff', color: '#ffffff'}}>                <span class="text-base font-semibold uppercase" >Finish</span>              </div>
                                    </div>
                                 </a>
                              }
                              {this.questionResponseArr != null && this.state.currQuestionId < this.questionResponseArr.length -1 && 
                                 <a class="group relative inline-block h-16 mb-8 w-full md:w-44 bg-blueGray-900 rounded"  onClick={()=>{this.fetchNextQuestion();}}>
                                    <div class="absolute top-0 left-0 transform -translate-y-1 -translate-x-1 w-full h-full group-hover:translate-y-0 group-hover:translate-x-0 transition duration-300">
                                       <div class="flex h-full w-full items-center justify-center bg-blue-500 border-2 border-blueGray-900 rounded">                <span class="text-base font-semibold uppercase" >Next &gt;</span>              </div>
                                    </div>
                                 </a>
                              }

                              </div>
                           </div>
                        </form>}
                        </div>
                        <div class="relative mt-16 pt-16 pb-18">
                        <div class="container px-4 mx-auto">
                           <img class="absolute top-0 left-0 h-full w-full object-cover lg:object-fill" src="./images/line-circles-bottom-light.svg" alt=""/>      
                           <div class="animate-moving relative flex items-center justify-between">        <span class="relative flex-shrink-0 inline-block mr-8 md:mr-20 lg:mr-40 uppercase text-sm font-medium">          <span>Loose coupling </span>        </span>        <span class="relative flex-shrink-0 inline-block mr-8 md:mr-20 lg:mr-40 uppercase text-sm font-medium">          <span>Code Quality</span>        </span>        <span class="relative flex-shrink-0 inline-block mr-8 md:mr-20 lg:mr-40 uppercase text-sm font-medium">          <span>COLLABORATION</span>        </span>        <span class="relative flex-shrink-0 inline-block mr-8 md:mr-20 lg:mr-40 uppercase text-sm font-medium">          <span>Abstraction</span>        </span>        <span class="relative flex-shrink-0 inline-block mr-8 md:mr-20 lg:mr-40 uppercase text-sm font-medium">          <span>Memory Profiling</span>        </span>        <span class="relative flex-shrink-0 inline-block uppercase text-sm font-medium">          <span>REFACTORING</span>        </span>      </div>
                        </div>
                        </div>
                     </section>
                 </div>}
           </section>
      );
    }
}

export default withRouter(Shortlists);