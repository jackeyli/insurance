import React, { Component } from "react";


const AsyncLoader = (Wrapped) => {return class extends Component {
    constructor(props){
            super(props)
            this.state = {component:null}
        }
        componentDidMount = async() => {
            var wrappedClass = await Wrapped()
            this.setState({component:wrappedClass})
        }
        render = () =>{
            let WrappedClass = this.state.component
            if (WrappedClass == null) {
                return (<div></div>)
            } else {
                return <WrappedClass {...this.props}/>
            }
        }
}
}

export default AsyncLoader
