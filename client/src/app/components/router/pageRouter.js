import React, { Component } from "react";
import MessageStore from '../store/MessageStore';
import _ from "lodash";
export class PageRoute extends Component {
    state = {currentPage:null};
    render(){
        return null;
    }
}
const getRoute = (t)=>{
    if(t.props.children == null || t.props.children.length == 0) {
        return t.props.component;
    }
    else {
        return t.props.children.reduce((pre,cur)=>{
            pre[cur.props.path] = getRoute(cur);
            return pre;
        },{});
    }
}
export class PageRouter extends Component {
    state = {current:{},routes:[]};
    componentDidMount = ()=>{
        var me = this;
        MessageStore.subscribe(()=>{
            let state = MessageStore.getState();
            if(state.type == "switchPage") {
                me.setState({current:state.data});
            }
        });
        this.setState({routes:getRoute(this)});

    }
    getPage(pageName){
        let pageSlice = pageName.split("/"),
            page = pageSlice.reduce((pre,cur)=>{
           if(pre[cur]) {
               return pre[cur];
           } else {
               throw "No Such Page";
           }
        },this.state.routes)
        if(typeof page != "function"){
            throw "No Such Page";
        }
        return page;
    }
    render(){
        if(this.state.routes.length == 0)
            return null;
        let thisPage = React.createElement(
            this.getPage(this.state.current.page || this.props.indexPage),
            _.merge({param:this.state.current.params || null},this.props)),
            mainComp = React.createElement(this.props.component,_.merge({pageContent:thisPage,currentPageName:
                    this.state.current.page || this.props.indexPage,param:this.state.current.params || null},this.props));
        return (
            <div>{mainComp}</div>
        )
    }
}