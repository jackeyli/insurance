import React, {Component}from 'react';
class Home_wrapper extends Component {
    render(){
        return (
           <div>
            {this.props.pageContent}
           </div>
    );
    }
};

export default Home_wrapper;

