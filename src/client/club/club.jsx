import React, { Component } from 'react';
import { render } from 'react-dom';


import CreateClub from './createClub.jsx';
import { BrowserRouter as Router, Route, Link, withRouter } from 'react-router-dom';

var CreateClubWithRouter = withRouter(CreateClub);

render(<Router>
    <div>
        <Route path="/club" exact render={() => (
                    <div className="results">
                            <Route exact path="/" component={CreateClubWithRouter} />
                        <Route  path="/club" component={CreateClubWithRouter} />
                    </div>)} />
        <Route path="/cafe/:id" exact render={() => (
        <div className="results">
                <Route exact path="/" component={CreateClubWithRouter} />
            <Route  path="/cafe/:id" component={CreateClubWithRouter} />
        </div>)} />
    </div>
</Router>, document.getElementById('containerWiz'));