import React, { Component } from 'react';
import { render } from 'react-dom';

import Shortlists from './shortlists.jsx';
import Home from './home.jsx';
import { BrowserRouter as Router, Route, Link, withRouter } from 'react-router-dom';


var ShortlistsWithRouter = withRouter(Shortlists);
var HomeWithRouter = withRouter(Home);

render(<Router>
    <div>
        <Route path="/" render={() => (
            <div className="results">
                    <Route exact path="/" component={ShortlistsWithRouter} />
                <Route path="/checker/" component={ShortlistsWithRouter} />
                <Route path="/home/" component={HomeWithRouter} />
            </div>)} />
    </div>
</Router>, document.getElementById('containerWiz'));