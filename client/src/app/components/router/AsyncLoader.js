import React, { Component } from "react";
export class AsyncLoader extends Component {
    constructor(props){
        super(props)
        this.state = {asyncComponent:null};
    }
    componentWillReceiveProps =(props) =>{
        this.state = {asyncComponent:null};
    }
    componentDidMount = ()=> {
        var thisCmp = this
        if(this.props.asyncComponent && this.state.asyncComponent == null){
            this.props.asyncComponent.then((cmp)=>{
                thisCmp.setState({asyncComponent:cmp})
            })
        }
    }
    render(){
        if(this.state.asyncComponent == null){
             var thisCmp = this
             this.props.asyncComponent.then((cmp)=>{
                  thisCmp.setState({asyncComponent:cmp})
             })
             return (<div></div>)
        } else {
            let renderCmp = React.createElement(this.state.asyncComponent,this.props)
            return (<div>{renderCmp}</div>)
        }
    }
}

AsyncLoader.defaultProps = {
    asyncComponent:null
}