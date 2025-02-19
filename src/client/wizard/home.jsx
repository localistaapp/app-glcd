import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import GoogleOneTapLogin from 'react-google-one-tap-login';
import axios from 'axios';

// Create a class to handle progress bar animations
class ProgressBar {
   constructor(element) {
     this.element = element;
     this.label = element.querySelector('.ui-label');
     this.valueEl = this.label.querySelector('.value');
   }
 
   animateProgress(targetProgress, callback) {
     const startWidth = parseFloat(this.element.style.width) || 0;
     const startTime = performance.now();
     const duration = 2000;
 
     const animate = (currentTime) => {
       const elapsed = currentTime - startTime;
       const progress = Math.min(elapsed / duration, 1);
       
       // Easing function (swing - similar to easeInOutQuad)
       const swing = (p) => 0.5 - Math.cos(p * Math.PI) / 2;
       const easedProgress = swing(progress);
       
       // Calculate current width
       const currentWidth = startWidth + (targetProgress - startWidth) * easedProgress;
       this.element.style.width = currentWidth + '%';
       
       // Handle label visibility and text
       if (this.label) {
         if (Math.ceil(currentWidth) < 20 && !this.label.classList.contains('hidden')) {
           this.label.style.display = 'none';
           this.label.classList.add('hidden');
         } else if (this.label.classList.contains('hidden')) {
           this.label.style.display = '';
           this.label.classList.remove('hidden');
           fadeIn(this.label);
         }
 
         if (Math.ceil(currentWidth) === 100) {
           this.label.textContent = 'Done';
           setTimeout(() => fadeOut(this.label), 1000);
         } else if (this.valueEl) {
           this.valueEl.textContent = Math.ceil(currentWidth) + '%';
         }
       }
 
       if (progress < 1) {
         requestAnimationFrame(animate);
       } else if (callback) {
         callback.call(this.element);
       }
     };
 
     requestAnimationFrame(animate);
   }
 }
 
 // Helper function for fade in animation
 function fadeIn(element, duration = 400) {
   element.style.opacity = 0;
   element.style.display = '';
 
   let start = null;
   const animate = (timestamp) => {
     if (!start) start = timestamp;
     const progress = timestamp - start;
     
     element.style.opacity = Math.min(progress / duration, 1);
     
     if (progress < duration) {
       requestAnimationFrame(animate);
     }
   };
   
   requestAnimationFrame(animate);
 }
 
 // Helper function for fade out animation
 function fadeOut(element, duration = 400) {
   let start = null;
   const animate = (timestamp) => {
     if (!start) start = timestamp;
     const progress = timestamp - start;
     
     element.style.opacity = 1 - Math.min(progress / duration, 1);
     
     if (progress < duration) {
       requestAnimationFrame(animate);
     } else {
       element.style.display = 'none';
     }
   };
   
   requestAnimationFrame(animate);
 }

const IOSSwitch = withStyles((theme) => ({
   root: {
     width: 42,
     height: 26,
     padding: 0,
     margin: theme.spacing(1),
   },
   switchBase: {
     padding: 1,
     '&$checked': {
       transform: 'translateX(16px)',
       color: theme.palette.common.white,
       '& + $track': {
         backgroundColor: '#52d869',
         opacity: 1,
         border: 'none',
       },
     },
     '&$focusVisible $thumb': {
       color: '#52d869',
       border: '6px solid #fff',
     },
   },
   thumb: {
     width: 24,
     height: 24,
   },
   track: {
     borderRadius: 26 / 2,
     border: `1px solid ${theme.palette.grey[400]}`,
     backgroundColor: theme.palette.grey[50],
     opacity: 1,
     transition: theme.transitions.create(['background-color', 'border']),
   },
   checked: {checked: true},
   focusVisible: {},
 }))(({ classes }) => {
   return (
     <Switch
       focusVisibleClassName={classes.focusVisible}
       disableRipple
       classes={{
         root: classes.root,
         switchBase: classes.switchBase,
         thumb: classes.thumb,
         track: classes.track,
         checked: classes.checked,
       }}
     />
   );
 });

class Home extends Component {

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
        this.state = {scanURL: '', currStep: 2, loading: false, leaksCount: '', isSamePasswordExposed: false, passwordExposed: true, displayRiskLevel: true, riskLevel: '', messageTxt: '', userEmail: '', exposures: `<div class="flex flex-wrap -m-3 mb-10">${this.leakTemplate}</div><br><br><br>`, riskLevel: sessionStorage.getItem('riskLevelValue')};
     }
     componentDidMount() {
      if (location.href.indexOf('?') != -1) {
         document.getElementById('riskLevelSection').style.display = 'none';
         document.getElementById('protectionSection').style.display = 'none';
         document.getElementById('progressiveLoaderSection').style.display = 'block';

         const token = '788bdc201ce3c7ac0e2d60a9782f38ab';

         const payload = JSON.stringify({});
         
         fetch("https://api.diffbot.com/v3/analyze?url=https://www.proveshare.com&token=" + token, {
         method: 'GET',
         headers: {
         "Content-Type": "application/json"
         }
         })
         .then((response) => response.json())
         .then((result) => {console.log('--res---', result);})
         .catch((error) => console.error(error));
               


         const progressBar = document.querySelector('#progress_bar .ui-progress');
         const label = progressBar.querySelector('.ui-label');
         
         // Initial setup
         if (label) {
            label.style.display = 'none';
         }
         progressBar.style.width = '7%';
         
         // Create instance and start animation sequence
         const progress = new ProgressBar(progressBar);
         
         progress.animateProgress(43, function() {
            progress.animateProgress(79, function() {
               setTimeout(() => {
               progress.animateProgress(100, function() {
                  const mainContent = document.querySelector('#main_content');
                  if (mainContent) {
                     // Simple slide down animation
                     mainContent.style.display = 'none';
                     mainContent.style.overflow = 'hidden';
                     mainContent.style.height = '0';
                     mainContent.style.display = 'block';
                     
                     const height = mainContent.scrollHeight;
                     mainContent.style.transition = 'height 400ms ease-in-out';
                     mainContent.style.height = height + 'px';
                     
                     setTimeout(() => {
                     mainContent.style.height = 'auto';
                     }, 400);
                  }
               });
               }, 2000);
            });
         });
      }
       
        window.viewportCheck = setInterval(()=> {
           if(this.elementInViewport(document.getElementById('risk-checker'))) {
              this.tempTimer();
           }
        },2000);
        this.sectionImmediateRisks = {"High":{"isSamePasswordExposed":{"para1":"You are at real high risk as you have the same passwords used across sites and they are exposed in the dark web.","para2":"You should watch out for suspicious links and social online scammers."},"passwordExposed":{"para1":"You are at high risk as you have your  passwords exposed in the dark web that makes you vulnerable for man-in-the-middle attacks.","para2":"You should watch out for suspicious websites and online scammers."},"passwordNotExposed":{"para1":"You are at high risk as you have your  personal data exposed in the dark web that makes you vulnerable for cyber attacks.","para2":"You should watch out for suspicious websites and online scammers."}},"Moderate":{"isSamePasswordExposed":{"para1":"You are at high risk as you have the same passwords used across sites and they are exposed in the dark web.","para2":"You should watch out for suspicious links and social online scammers."},"passwordExposed":{"para1":"You are at moderate risk as you have your  password exposed in the dark web that makes you vulnerable for man-in-the-middle attacks.","para2":"You should watch out for suspicious websites and online scammers."},"passwordNotExposed":{"para1":"You are at moderate risk as you have your  personal data exposed in the dark web that makes you vulnerable for cyber attacks.","para2":"You should watch out for suspicious websites and online scammers."}}};
        document.querySelectorAll('.MuiIconButton-root')[0].click();
        document.querySelectorAll('.MuiIconButton-root')[1].click();
        document.addEventListener('DOMContentLoaded', function() {

            const form = document.createElement('form');
            //form.method = 'POST';
            //form.enctype = 'multipart/form-data';
            
            //const data = new FormData(form); // Normally this would be passed via the event.

            // Fetch shared title/text
            const parsedUrl = new URL(window.location);
            //const sharedTitle = data.get('title');
            //const sharedText = data.get('text');
            //const sharedUrl = data.get('url');

            const sharedTitle = parsedUrl.searchParams.get('title');
            const sharedText = parsedUrl.searchParams.get('text');
            const sharedUrl = parsedUrl.searchParams.get('url');

            console.log('Shared title:', sharedTitle);
            console.log('Shared text:', sharedText);
            console.log('Shared URL:', sharedUrl);

            if(sharedUrl != null &&  sharedUrl != '') {
               this.setState({scanURL: sharedUrl});
               document.querySelector('#scanner').style.display = 'block';
            }
         }.bind(this));
      
      }
    render() {
      return (
        <section id="risk-checker" data-section-id="5" data-share="" data-category="navigations" data-component-id="886f4350_01_awz" className="py-6 bg-white" x-data="{ mobileNavOpen: false }">
              <div className="container mx-auto px-4">
                 <div className="flex items-center justify-between px-6 py-3.5 bg-gray-100 border border-gray-100 rounded-full bg-blank" style={{paddingBottom: '2rem'}}>
                    <div className="w-auto">
                       <div className="flex flex-wrap items-center">
                          <div className="w-auto">
                             <a href="/#">
                             <img src="../psassets/logo.png" alt="" data-config-id="img-fe4768-1" className="logo"/>
                             </a>

                          </div>
                          <div><img className='custom-icon-shield' src={`../psassets/shield1.png`} alt="" /></div>
                       </div>
                    </div>
                    <div className="w-auto">
                       <div className="flex flex-wrap items-center">
                          <div className="w-auto hidden lg:block">
                             <ul className="flex items-center justify-center">
                                <li className="mr-9"><a className="inline-block text-sm font-bold text-gray-900 hover:text-gray-700" href="/#recentIncidents" data-config-id="txt-fe4768-1">Recent Incidents</a></li>
                                <li className="mr-9"><a className="inline-block text-sm font-bold text-gray-900 hover:text-gray-700" href="/#cyberRisks" data-config-id="txt-fe4768-2">Cyber Risks</a></li>
                                <li className="mr-9"><a className="inline-block text-sm font-bold text-gray-900 hover:text-gray-700" href="/#faqs" data-config-id="txt-fe4768-3">FAQs</a></li>
                                <li><a className="inline-block text-sm font-bold text-gray-900 hover:text-gray-700" href="/#" data-config-id="txt-fe4768-4">Risk Checker</a></li>
                             </ul>
                          </div>
                       </div>
                    </div>
                    <div className="w-auto">
                       <div className="flex flex-wrap items-center">
                          <div className="w-auto hidden lg:block">
                             <div className="flex flex-wrap -m-2">
                                <div className="w-full md:w-auto p-2"><a className="block w-full px-4 py-2.5 text-sm text-center text-gray-900 font-bold bg-gray-100 hover:bg-gray-200 focus:ring-4 focus:ring-gray-200 rounded-full" href="/#" data-config-id="txt-fe4768-5">Log In</a></div>
                                <div className="w-full md:w-auto p-2"><a className="block w-full px-4 py-2.5 text-sm text-center text-white font-bold bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:ring-blue-200 rounded-full bg-bl" href="/#" data-config-id="txt-fe4768-6">Check your risk</a></div>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
                 
              </div>
              {sessionStorage.getItem('user') == null && <GoogleOneTapLogin onError={(error) => console.log(error)} onSuccess={(response) => {console.log(response);}} googleAccountConfigs={{ client_id: '128159303865-64ustcdp4pj9f6isg39p7hekhjdj2ln5.apps.googleusercontent.com',auto_select: false,cancel_on_tap_outside: false }} />}
              {this.state.currStep == 1 && <div id="checker-main" class="container mx-auto px-4 py-6" style={{background: '#f3f4f6'}}>
                 <div class="px-8 pt-16 bg-white border border-gray-100 rounded-t-3xl pad-0" >
                    <div class="max-w-7xl mx-auto">
                       <div class="flex flex-wrap items-center justify-between -m-4 pb-12 pb-6">
                          <div class="w-full md:w-1/2 p-4 p-0 p-0">
                             <h2 class="font-heading md:text-5xl text-gray-900 font-black tracking-tight text-3xl" data-config-id="text11">Cyber risk check</h2>
                          </div>
                          
                       </div>
                    </div>
                 </div>
                 <div class="relative px-8">
                    <div class="max-w-7xl mx-auto">
                       <div class="absolute left-0 w-full h-1/2 bg-white border-l border-r border-b border-gray-100 rounded-b-3xl top-0"></div>
                       <div class="relative z-10 flex flex-nowrap -m-4 transition-transform duration-500 ease-in-out" >
                          <div x-ref="slide1" class="flex-shrink-0 max-w-sm w-full p-0">
                             <div class="flex flex-col justify-between p-8 h-full bg-gray-100 border border-gray-100 rounded-3xl shadow-md p-4 fheight m-4" contenteditable="false">
                                <div class="flex-initial mb-0 mb-0" style={{display: 'flex', flexDirection: 'column'}}>
                                {!this.state.loading ? <span id="iconSpan"><svg xmlns="http://www.w3.org/2000/svg" style={{display: 'table-cell', marginTop: '4px'}} height="24" viewBox="0 0 24 24" width="24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
                                </span> : <div className="spinner"></div>}
                                <p id="messageSpan" style={{paddingLeft: '16px',display: 'table-cell',verticalAlign: 'top',marginTop: '-26px',marginLeft: '32px'}} class="text-lg text-gray-700">{this.state.messageTxt}</p>
                                <div style={{marginTop: '12px',width: '100%',borderRadius: '12px',fontSize: '1.5rem'}} ><input style={{borderRadius: '8px',fontSize: '1.2rem',width: '100%',padding: '17px'}} type="email" id="mailId"/></div>
                                </div>
                                <div class="flex flex-wrap -m-2">
                             <div class="w-full md:w-auto p-2 float-bottom" id="risk-checker-cta"><a class="block w-full px-8 py-3.5 text-lg text-center text-white font-bold bg-gray-900 hover:bg-gray-800 focus:ring-4 focus:ring-gray-600 rounded-full" onClick={()=>{this.login()}} data-config-id="text3">Next (1/3)</a></div>
                          </div>
                             </div>
                          </div>
                          </div>
                       </div>
                    </div>
                 </div>}
                 {this.state.currStep == 2 && <div id="checker-step2" class="container mx-auto px-4 py-6" style={{background: '#f3f4f6'}}>
                 <div id="scanner" class="scan wrapper">
                     <div class="fingerprint"></div>
                     <div class="overlay"></div>
                        <iframe src={this.state.scanURL} frameborder="0" allowfullscreen></iframe>
                  </div>
                 <div id="riskLevelSection" class="px-8 pt-16 bg-white border border-gray-100 rounded-t-3xl pad-0" style={{background: 'none', marginTop: '30px'}}>
                    {!this.state.displayRiskLevel && <div class="max-w-7xl mx-auto">
                       <div class="flex flex-wrap items-center justify-between -m-4 pb-12 pb-6">
                          <div class="w-full md:w-1/2 p-0 p-0" style={{paddingBottom: '0.6rem',paddingLeft: '1rem',display: 'flex'}}>
                             <img src="../psassets/warning.png" style={{width: '48px'}}/>
                             <h2 class="font-heading md:text-5xl text-gray-900 font-black tracking-tight text-3xl" data-config-id="text11" style={{color: '#000',fontSize: '1.5rem',marginTop: '8px'}}>{this.state.leaksCount} <span style={{color: 'red'}}>cyber leaks</span> found!</h2>
                          </div>
                          
                       </div>
                    </div>}
                    {this.state.displayRiskLevel && <div class="max-w-7xl mx-auto">
                       <div class="flex flex-wrap items-center justify-between -m-4 pb-12 pb-6">
                          <div class="w-full md:w-1/2 p-0 p-0" style={{paddingBottom: '0.6rem',paddingLeft: '1rem',display: 'flex'}}>
                           <h2 class="font-heading md:text-4xl text-gray-900 font-black tracking-tight text-1xl" style={{fontSize: '1.2rem'}} >Your Risk Level: <b>Moderate</b></h2>
                          </div>
                          
                       </div>
                    </div>}
                 </div>
                 <div class="relative px-8" id="progressiveLoaderSection">
                              <div id="progress_bar" class="ui-progress-bar ui-container">
                        <div class="ui-progress" style={{width: '79%'}}>
                           <span class="ui-label" style={{display: 'none'}}>Processing <b class="value">79%</b></span>
                           </div>
                     </div>

                     <div class="content" id="main_content" style={{display: 'none'}}>
                        <p>Finalizing...</p>
                     </div>
                 </div>
                 <div class="relative px-8" id="protectionSection">
                    <div class="max-w-7xl mx-auto">
                       <div class="absolute left-0 w-full h-1/2 bg-white border-l border-r border-b border-gray-100 rounded-b-3xl top-0" style={{zIndex: '-1'}}></div>
                       <div class="relative z-10 flex flex-nowrap -m-4 transition-transform duration-500 ease-in-out" >
                          <div x-ref="slide1" class="flex-shrink-0 max-w-sm w-full p-0">
                             <div class="flex flex-col justify-between p-2 h-full bg-gray-100 border border-gray-100 rounded-3xl shadow-md p-4 fheight m-4" style={{height: '133px',background:'#fff'}} contenteditable="false">
                                <div class="flex-initial mb-0 mb-0" style={{display: 'inline-table'}}>
                                <table style={{width: '100%'}}>
                                    <tr><td style={{width: '80%',paddingLeft: '8px'}}>Password Theft Protection</td><td style={{paddingLeft: '4px'}}>
                                    <FormControlLabel
        control={<IOSSwitch defaultChecked name="checkedB" />}
        label=""
      />
                                       </td></tr>
                                    <tr><td style={{width: '80%',paddingLeft: '8px'}}>Link Scan Protection</td><td style={{paddingLeft: '4px'}}>
                                    <FormControlLabel
        control={<IOSSwitch defaultChecked name="checkedC" />}
        label=""
      />
                                       </td></tr>
                                </table>
                                <br/><br/>
                                <div class="share-warning" style={{display: 'table'}}>
                                <img style={{width: '60px',display: 'table-cell'}} src="../psassets/caution.png" />
                                <h2 class="font-heading md:text-4xl text-gray-900 font-black tracking-tight text-1xl" style={{display: 'table-cell', fontSize: '1.15rem', color:'#a97300', verticalAlign: 'top'}} >Scan suspicious links to avoid online scams & threats.</h2>
                                 
                                </div>
                                <div><img src="../psassets/share.gif" style={{width: '100%', marginTop: '96px', borderRadius: '8px'}} /></div>

                                </div>
                                <div class="flex flex-wrap -m-2">
                             {this.state.displayRiskLevel == false && <div class="w-full md:w-auto p-2 float-bottom" id="risk-checker-cta"><a class="block w-full px-8 py-3.5 text-lg text-center text-white font-bold bg-gray-900 hover:bg-gray-800 focus:ring-4 focus:ring-gray-600 rounded-full" onClick={()=>{this.showRiskLevel()}} data-config-id="text3">Next (2/3)</a></div>}
                             <div class="w-full md:w-auto p-2 float-bottom" id="activateBtn" style={{display: 'none'}}><a class="block w-full px-8 py-3.5 text-lg text-center text-white font-bold bg-gray-900 hover:bg-gray-800 focus:ring-4 focus:ring-gray-600 rounded-full" href="#popup2" onClick={()=>{document.querySelector('#addToHome').play();window.scrollTo({  top: 0, behavior: 'smooth' });}} data-config-id="text3">Activate Free Plan</a></div>
                          </div>
                             </div>
                          </div>
                          </div>
                       </div>

                       <div class="max-w-3xl mx-auto" style={{background: 'white',padding: '0px',position: 'absolute',zIndex: 1,top: '200px',left:'0px', width: '100%'}} dangerouslySetInnerHTML={{__html: this.state.displayRiskLevel ? this.state.ensureSafetyHTML : this.state.exposures}}>
  
                       </div>
                       <div id="popup2" className="popup-container popup-style-2">
                        <div className="popup-content">
                           <a href="#" className="close">&times;</a>
                           <h3 style={{color: '#1d4dd6', fontWeight: 'bold', fontSize: '1.1rem'}}>Install Proveshare</h3>
                           <p>Choose "Add to Homescreen" on your browser to activate your free plan.</p>
                           <br/>
                              <img src="../psassets/psadd.gif" />
                        </div>
                        </div>
                       
                    </div>
                 </div>}
           </section>
      );
    }
}

export default withRouter(Home);