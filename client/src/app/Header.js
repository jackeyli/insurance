import React from "react";
import {Icon,Header} from 'semantic-ui-react';
export const HeaderCompoment = (props)=>{
    return (
        <Header as="h2" style={{backgroundColor:'#154360',color:'white',padding:20}}>
            <Icon name="ethereum"></Icon>
               Flight Insurance (Powered By Ethereum)
            <div style={{fontSize:15}}>
                This application is 100% decentralized and self-governed.
            </div>
        </Header>
    )
}