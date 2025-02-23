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
     showRiskLevel() {
      window.scrollTo({  top: 0, behavior: 'smooth' });
      this.setState({loading: false, messageTxt: 'Follow all the recommendations below to ensure your cyber safety.', displayRiskLevel: true});
      let linkTemplateHTML1 = '';
      let sectionKey = 'passwordNotExposed';
      if(this.state.isSamePasswordExposed) {
         sectionKey = 'isSamePasswordExposed';
      } else if(this.state.passwordExposed) {
         sectionKey = 'passwordExposed';
      }
      let section1Para1 = this.sectionImmediateRisks[this.state.riskLevel][sectionKey]['para1'];
      let section1Para2 = this.sectionImmediateRisks[this.state.riskLevel][sectionKey]['para2'];
      let linkTemplateMain = '<div class="p-3 w-full"><div class="bg-gray-100 block cursor-pointer p-4 rounded-3xl" x-data="{ accordion: false }" x-on:click="accordion = !accordion"><div class="-m-2 flex flex-wrap"><div class="p-2 flex-1"><div style="display:flex"><img src="../psassets/num1s.png" style="width:36px;height:36px;border-radius:8px"><h3 class="font-black font-heading text-gray-900 text-l" data-config-id="txt-b0bdec-2" style="margin-top:5px;margin-left:12px;overflow:hidden;white-space:nowrap;width:223px">Know your risks</h3></div><div class="duration-500 h-0 overflow-hidden" :style="accordion ? \'height: \' + $refs.container.scrollHeight + \'px\' : \'\'" x-ref="container"><p class="font-bold mt-4 text-black-500" data-config-id="txt-b0bdec-7" style="font-family:Quicksand;font-weight:500"><table style="margin-left:18px">{trHTML}</table></div></div><div class="p-1 w-auto"><span class="inline-block rotate-0 transform"><svg data-config-id="svg-b0bdec-1" fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M17.9207 8.17999H11.6907H6.08072C5.12072 8.17999 4.64073 9.33999 5.32073 10.02L10.5007 15.2C11.3307 16.03 12.6807 16.03 13.5107 15.2L15.4807 13.23L18.6907 10.02C19.3607 9.33999 18.8807 8.17999 17.9207 8.17999Z" fill="#D1D5DB"></path></svg></span></div></div></div></div>';
      let strLeaksStr = `<tr><td style="font-weight:700;max-width: 100px !important;vertical-align: top;"><img style="width:120px;border-radius: 8px;" src="../psassets/clickbait.png"></td><td style="max-width: 200px !important;overflow-x:scroll;padding-left: 14px;vertical-align: top;">${section1Para1}<br/><br/>${section1Para2}</td></tr>`;
      linkTemplateHTML1 += linkTemplateMain.replaceAll('{trHTML}',strLeaksStr);

      let linkTemplateHTML2 = '';
      let linkTemplateMain2 = '<div class="p-3 w-full" onclick="document.querySelector(\'#num2\').src = \'../psassets/num2s.png\';"><div class="bg-gray-100 block cursor-pointer p-4 rounded-3xl" x-data="{ accordion: false }" x-on:click="accordion = !accordion"><div class="-m-2 flex flex-wrap"><div class="p-2 flex-1"><div style="display:flex"><img id="num2" src="../psassets/num2.png" style="width:36px;height:36px;border-radius:8px"><h3 class="font-black font-heading text-gray-900 text-l" data-config-id="txt-b0bdec-2" style="margin-top:5px;margin-left:12px;overflow:hidden;white-space:nowrap;width:223px">Immediate fixes</h3></div><div class="duration-500 h-0 overflow-hidden" :style="accordion ? \'height: \' + $refs.container.scrollHeight + \'px\' : \'\'" x-ref="container"><p class="font-bold mt-4 text-black-500" data-config-id="txt-b0bdec-7" style="font-family:Quicksand;font-weight:500"><table style="margin-left:18px">{trHTML}</table></div></div><div class="p-1 w-auto"><span class="inline-block rotate-0 transform"><svg data-config-id="svg-b0bdec-1" fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M17.9207 8.17999H11.6907H6.08072C5.12072 8.17999 4.64073 9.33999 5.32073 10.02L10.5007 15.2C11.3307 16.03 12.6807 16.03 13.5107 15.2L15.4807 13.23L18.6907 10.02C19.3607 9.33999 18.8807 8.17999 17.9207 8.17999Z" fill="#D1D5DB"></path></svg></span></div></div></div></div>';
      let strLeaksStr2 = `<tr><td style="font-weight:700;max-width: 100px !important;vertical-align: top;"><img style="width: 147px;border-radius: 8px;" src="../psassets/apps.png"></td><td style="max-width: 200px !important;overflow-x:scroll;padding-left: 14px;vertical-align: top;"><div style="margin-bottom: 8px"><b>Use Link Scanner</b></div><div>With Proveshare, you can scan unknown or suspicious links before clicking on them to prevent online scammers from targeting you. </div></td></tr>`;
      strLeaksStr2 += `<tr><td style="font-weight:700;max-width: 100px !important;vertical-align: top;"><img style="width: 87px;border-radius: 8px;margin-top:20px" src="../psassets/spy.png"></td><td style="max-width: 200px !important;overflow-x:scroll;padding-left: 14px;vertical-align: top;"><div style="margin-bottom: 8px;margin-top: 20px;"><b>Stolen Password Alerts</b></div><div>With password alerts, Proveshare detects when your password is stolen and helps you immediately take next steps to protect yourself.</div></td></tr>`
      linkTemplateHTML2 += linkTemplateMain2.replaceAll('{trHTML}',strLeaksStr2);

      let linkTemplateHTML3 = '';
      let linkTemplateMain3 = '<div class="p-3 w-full"  onclick="document.querySelector(\'#num3\').src = \'../psassets/num3s.png\';document.querySelector(\'#activateBtn\').style.display = \'block\';"><div class="bg-gray-100 block cursor-pointer p-4 rounded-3xl" x-data="{ accordion: false }" x-on:click="accordion = !accordion"><div class="-m-2 flex flex-wrap"><div class="p-2 flex-1"><div style="display:flex"><img id="num3" src="../psassets/num3.png" style="width:36px;height:36px;border-radius:8px"><h3 class="font-black font-heading text-gray-900 text-l" data-config-id="txt-b0bdec-2" style="margin-top:5px;margin-left:12px;overflow:hidden;white-space:nowrap;width:223px">Activate Free plan</h3></div><div class="duration-500 h-0 overflow-hidden" :style="accordion ? \'height: \' + $refs.container.scrollHeight + \'px\' : \'\'" x-ref="container"><p class="font-bold mt-4 text-black-500" data-config-id="txt-b0bdec-7" style="font-family:Quicksand;font-weight:500"><table style="margin-left:18px">{trHTML}</table></div></div><div class="p-1 w-auto"><span class="inline-block rotate-0 transform"><svg data-config-id="svg-b0bdec-1" fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M17.9207 8.17999H11.6907H6.08072C5.12072 8.17999 4.64073 9.33999 5.32073 10.02L10.5007 15.2C11.3307 16.03 12.6807 16.03 13.5107 15.2L15.4807 13.23L18.6907 10.02C19.3607 9.33999 18.8807 8.17999 17.9207 8.17999Z" fill="#D1D5DB"></path></svg></span></div></div></div></div>';
      let strLeaksStr3 = `<tr><td style="max-width: 100% !important;overflow-x:scroll;padding-left: 14px;vertical-align: top;">Ensure stress-free cyber safety with your free plan.</td></tr>`;
      linkTemplateHTML3 += linkTemplateMain3.replaceAll('{trHTML}',strLeaksStr3);
      this.setState({ensureSafetyHTML: `<div class="flex flex-wrap -m-3 mb-10">${linkTemplateHTML1}${linkTemplateHTML2}${linkTemplateHTML3}</div><br><br><br></br>`});
     }
     constructor(props) {
        super(props);
        this.leakTemplate = `<div class="p-3 w-full"><div class="bg-gray-100 block cursor-pointer p-4 rounded-3xl" x-data="{ accordion: false }" x-on:click="accordion = !accordion"><div class="-m-2 flex flex-wrap"><div class="p-2 flex-1"><div style="display:flex"><img src="https://img.logo.dev/{AppName}?token=pk_G0TzXJmeR22hjyoG7hROlQ" style="width:36px;height:36px;border-radius:8px"><h3 class="font-black font-heading text-gray-900 text-l" data-config-id="txt-b0bdec-2" style="margin-top:5px;margin-left:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;width:200px">{dbname} likely exposures - {AttributesExposed}</h3></div><div class="duration-500 h-0 overflow-hidden" :style="accordion ? 'height: ' + $refs.container.scrollHeight + 'px' : ''" x-ref="container"><p class="font-bold mt-4 text-black-500" data-config-id="txt-b0bdec-7" style="font-family:Quicksand;font-weight:500"><table style="margin-left:18px">{trHTML}</table></div></div><div class="p-2 w-auto"><span class="inline-block rotate-0 transform"><svg data-config-id="svg-b0bdec-1" fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M17.9207 8.17999H11.6907H6.08072C5.12072 8.17999 4.64073 9.33999 5.32073 10.02L10.5007 15.2C11.3307 16.03 12.6807 16.03 13.5107 15.2L15.4807 13.23L18.6907 10.02C19.3607 9.33999 18.8807 8.17999 17.9207 8.17999Z" fill="#D1D5DB"></path></svg></span></div></div></div></div>`;
        this.state = {currStep: 1, loading: false, leaksCount: '', isSamePasswordExposed: false, passwordExposed: true, displayRiskLevel: false, riskLevel: '', messageTxt: 'Enter your active email ID to continue', userEmail: '', exposures: `<div class="flex flex-wrap -m-3 mb-10">${this.leakTemplate}</div><br><br><br>`};
     }
     componentDidMount() {
        window.viewportCheck = setInterval(()=> {
           if(this.elementInViewport(document.getElementById('risk-checker'))) {
              this.tempTimer();
           }
        },2000);
        this.sectionImmediateRisks = {"High":{"isSamePasswordExposed":{"para1":"You are at real high risk as you have the same passwords used across sites and they are exposed in the dark web.","para2":"You should watch out for suspicious links and social online scammers."},"passwordExposed":{"para1":"You are at high risk as you have your  passwords exposed in the dark web that makes you vulnerable for man-in-the-middle attacks.","para2":"You should watch out for suspicious websites and online scammers."},"passwordNotExposed":{"para1":"You are at high risk as you have your  personal data exposed in the dark web that makes you vulnerable for cyber attacks.","para2":"You should watch out for suspicious websites and online scammers."}},"Moderate":{"isSamePasswordExposed":{"para1":"You are at high risk as you have the same passwords used across sites and they are exposed in the dark web.","para2":"You should watch out for suspicious links and social online scammers."},"passwordExposed":{"para1":"You are at moderate risk as you have your  password exposed in the dark web that makes you vulnerable for man-in-the-middle attacks.","para2":"You should watch out for suspicious websites and online scammers."},"passwordNotExposed":{"para1":"You are at moderate risk as you have your  personal data exposed in the dark web that makes you vulnerable for cyber attacks.","para2":"You should watch out for suspicious websites and online scammers."}}};
      }
    render() {
      return (
        <section id="risk-checker" data-section-id="5" data-share="" data-category="navigations" data-component-id="886f4350_01_awz" className="py-6 bg-white" x-data="{ mobileNavOpen: false }">
              
              {sessionStorage.getItem('user') == null && <GoogleOneTapLogin onError={(error) => console.log(error)} onSuccess={(response) => {console.log(response);}} googleAccountConfigs={{ client_id: '128159303865-64ustcdp4pj9f6isg39p7hekhjdj2ln5.apps.googleusercontent.com',auto_select: false,cancel_on_tap_outside: false }} />}
              {this.state.currStep == 1 && 
               <section class="relative pt-4 overflow-hidden">
               <div class="container px-4 mx-auto">
               <div class="text-center mb-14">
                  <h1 class="font-heading font-semibold text-6xl sm:text-8xl lg:text-10xl mb-6">        <span>Assess your</span>        <span class="text-blue-500">skills</span>      </h1>
               </div>
               <form action="" style={{paddingLeft: '16px', paddingRight: '16px'}}>
                  <div class="max-w-md xl:max-w-1xl mx-auto">
                     <div class="flex flex-wrap -mx-2 mb-8">
                        <div>Select your current job role:</div>
                        <br/>          
                        <div style={{width: '100%',marginTop: '12px', paddingRight: '10px', paddingLeft: '10px'}} class="relative group px-8 pt-5 pb-4 mb-4 bg-gray-50 rounded-lg">
                           <select class="w-full bg-transparent text-base placeholder-blueGray-900 font-semibold outline-none rounded-lg" name="field-name">
                              <option>Junior Engineer (SDE-I / 1-3 years of experience)</option>
                              <option>Mid-Level Engineer (SDE-II / 4-8 years of experience)</option>
                              <option>Senior Engineer (SDE-III / 9-15 years of experience)</option>
                              <option>Staff Engineer (15+ - 20 years of experience)</option>
                              <option>Senior Staff/Principal (20+ years of experience)</option>
                           </select>
                        </div>
                     </div>
                     <div class="text-center">
                        <a class="group relative inline-block h-16 mb-8 w-full md:w-44 bg-blueGray-900 rounded" href="#">
                           <div class="absolute top-0 left-0 transform -translate-y-1 -translate-x-1 w-full h-full group-hover:translate-y-0 group-hover:translate-x-0 transition duration-300">
                              <div class="flex h-full w-full items-center justify-center bg-blue-500 border-2 border-blueGray-900 rounded">                <span class="text-base font-semibold uppercase" onClick={()=>{this.setState({currStep: 2});}}>Next &gt;</span>              </div>
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
                 {this.state.currStep == 2 && <div id="checker-step2" class="container mx-auto px-4 py-6" style={{background: '#f3f4f6'}}>
                       Step 2
                 </div>}
           </section>
      );
    }
}

export default withRouter(Shortlists);