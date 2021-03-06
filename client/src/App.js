import React, {Component} from 'react';
import {PageRoute, PageRouter} from "./app/components/router/pageRouter";
import AppClass from "./AppClass";
import Home_wrapper from "./app/pages/Home_wrapper";
import Introduction from "./app/pages/Introduction";
class App extends Component {
  render() {
    return (
      <div>
        <PageRouter component={Home_wrapper} indexPage="/Introduction">
          <PageRoute path="/Introduction" component= {Introduction}/>
          <PageRoute path="/Home" component= {AppClass}/>
        </PageRouter>
      </div>
    )
  }
};

export default App;
