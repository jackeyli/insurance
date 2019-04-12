import React, {Component}from 'react';
import {Button} from 'semantic-ui-react';
import MessageStore from '../components/store/MessageStore';
import HeaderNav from '../components/HeaderNav';
import * as Header from '../../flight.jpg';

const HeaderStyle = {
  backgroundImage: `url(${Header})`,
  backgroundRepeat: 'no-repeat',
  backgroundAttachment: 'fixed',
  backgroundPosition: 'center',
  backgroundSize: 'cover',
  backgroundOrigin: 'border-box'
};

const HeaderTextStyle1 = {
  color: '#ffb3b3',

};

const HeaderTextStyle2 = {
  color: '#ffcccc',

};

class Introduction extends Component {
  switchPage(pageName,params){
    MessageStore.dispatch({
      type:'switchPage',
      data:{page:pageName,params:params}
    });
  }
  render(){
    return (
      <header className="large-header light push" style={HeaderStyle}>
        <HeaderNav />

        <div className="header-container">
          <div className="content">
            <h1 style={HeaderTextStyle2}>Insure your time, </h1>
            <h1 style={HeaderTextStyle1}>Insure your fortune.</h1>
            <Button onClick={()=>{this.switchPage('Home')}} className="btn">
              BUY NOW!
            </Button>
          </div>
        </div>
      </header>
    );
  }
};

export default Introduction;

