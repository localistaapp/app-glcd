import React, { Component } from 'react';
import { render } from 'react-dom';


import CreateCafe from './createCafe.jsx';
import { BrowserRouter as Router, Route, Link, withRouter } from 'react-router-dom';

var CreateCafeWithRouter = withRouter(CreateCafe);

render(<Router>
    <div>
        <Route path="/cafe" exact render={() => (
                    <div className="results">
                            <Route exact path="/" component={CreateCafeWithRouter} />
                        <Route  path="/cafe" component={CreateCafeWithRouter} />
                    </div>)} />
        <Route path="/cafe/:id" exact render={() => (
        <div className="results">
                <Route exact path="/" component={CreateCafeWithRouter} />
            <Route  path="/cafe/:id" component={CreateCafeWithRouter} />
        </div>)} />
    </div>
</Router>, document.getElementById('containerWiz'));