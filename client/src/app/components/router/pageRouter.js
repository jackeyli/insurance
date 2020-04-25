import React, { Component } from "react";
import MessageStore from '../store/MessageStore';
import {AsyncLoader} from "./AsyncLoader";
import _ from "lodash";
export class PageRoute extends Component {
    state = {render: false};
    render(){
        return null;
    }
}
const getRoute = (t)=> {
    if(t.props.children == null || t.props.children.length == 0) {
        return t.props;
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
    constructor(props,context){
        super(props,context)
        if(!window.routerInitialized){
            var _wr = function(type) {
               var orig = window.history[type];
               return function() {
                   var rv = orig.apply(this, arguments);
                   var e = new Event(type);
                   e.arguments = arguments;
                   window.dispatchEvent(e);
                   return rv;
               };
            };
            window.history.pushState = _wr('pushState');
            window.history.replaceState = _wr('replaceState');
        }
    }

    responsePageChange =(event) =>{
        let [st,tag,url] = event.arguments
        if(url == "/")
            url = null
        this.setState({current:{params:st,page:url}})
    }
    registEventListener = ()=>{
        this.pushReplace = this.responsePageChange
        this.popState = (function(e){
                e.arguments = [null,null,document.location.pathname]
                this.responsePageChange(e)
                }).bind(this)
         window.addEventListener('pushState',this.pushReplace)
         window.addEventListener('replaceState',this.pushReplace)
         window.addEventListener('popstate',this.popState)
    }
    componentDidMount = ()=>{
        this.registEventListener()
        this.setState({routes:getRoute(this)});
    }
    componentWillUnmount = ()=>{
        window.removeEventListener('pushState',this.pushReplace)
        window.removeEventListener('replaceState',this.pushReplace)
        window.removeEventListener('popstate',this.popState)
    }
    getPage(pageName){
        try {
            let pageSlice = pageName.split("/"),
                page = this.state.routes[pageName]

            if (!page.component || typeof page.component != "function") {
                throw "No Such Page";
            }
            return page;
        }catch (e) {
            if(e == 'No Such Page')
                return null;
        }
    }
    shouldComponentUpdate = (nextProps, nextState)=>{
         return nextState.routes[((nextState.current && nextState.current.page) || nextProps.indexPage)];
    }
    render(){
        if(this.state.routes.length == 0)
            return null;
        let thisPageComp = this.getPage(this.state.current.page || this.props.indexPage);
        let thisPage = React.createElement(
            thisPageComp.component,
            _.merge({param:this.state.current.params || null,asyncComponent:thisPageComp.loadercomponent},this.props));
        let mainComp = React.createElement(this.props.component,_.merge({pageContent:thisPage,currentPageName:
                    this.state.current.page || this.props.indexPage,param:this.state.current.params || null},this.props));
        return (
            <div>{mainComp}</div>
        )
    }
}