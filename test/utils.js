const wait= (time)=>{return new Promise((resolve,reject)=>{
    setTimeout(()=>{
        resolve();
    },time * 1000);
})}
const _waitForEvent = async function(contract,event,fromBlock,gap,totalWaitSeconds,tolerance) {
    if(totalWaitSeconds > tolerance) {
        throw "No Response";
    }
    let evts = await contract.getPastEvents(event,{fromBlock: fromBlock,toBlock: 'latest'});
    if(evts.length > 0){
        return evts[0];
    } else {
        await wait(gap);
        return _waitForEvent(contract,event,fromBlock,gap,totalWaitSeconds + gap,tolerance);
    }
}
const waitForEvent = async (contract,event,fromBlock,gap,tolerance) => {
    return await _waitForEvent(contract,event,fromBlock,gap,0,tolerance);
}
module.exports = {
    waitForEvent
}
/*const PREFIX = "VM Exception while processing transaction: "

module.exports = {
  waitForEvent,
  PREFIX
}*/

/*
function getMaxPrice1(list,cap){
  var lastTurnResult = [],
      thisTurnResult = [];
  for(var i = 0; i < list.length; i ++){
     var item = list[i];
     if(i == 0){
        thisTurnResult.push({index:0,value:0});
        if(item.bytes <= cap) {
          thisTurnResult.push({index:item.bytes,value:item.value});
        }
     } else {
        var ptr = 0;
         thisTurnResult.push(lastTurnResult[0]);
        for(var j = 0; j <  .length; j ++){
          let _idx = lastTurnResult[j].index + item.bytes,
              _v = lastTurnResult[j].value + item.value;
          if(_idx <= cap){
             for(var x = ptr; x < lastTurnResult.length; x ++){
                if(x == lastTurnResult.length - 1 || (
                    lastTurnResult[x + 1].index > _idx &&
                    lastTurnResult[x].index <= _idx))
                {
                  ptr = x;
                  break;
                } else if(thisTurnResult[thisTurnResult.length - 1].value < lastTurnResult[x].value){
                    thisTurnResult.push(lastTurnResult[x]);
                }
             }
             if(lastTurnResult[ptr].value < _v) {
               if(lastTurnResult[ptr].index != _idx
                   && lastTurnResult[ptr].value > thisTurnResult[thisTurnResult.length - 1].value){
                   thisTurnResult.push(lastTurnResult[ptr]);
               }
               if(_v > thisTurnResult[thisTurnResult.length - 1].value)
                   thisTurnResult.push({index:_idx,value:_v});
             } else if(lastTurnResult[ptr].value > thisTurnResult[thisTurnResult.length - 1].value) {
                 thisTurnResult.push(lastTurnResult[ptr]);
             }
          } else {
             for(var x = ptr; x < lastTurnResult.length; x ++){
                if(lastTurnResult[x].value > thisTurnResult[thisTurnResult.length - 1].value) {
                  thisTurnResult.push(lastTurnResult[x]);
                }
             }
             break;
          }
        }
     }
     lastTurnResult = thisTurnResult;
     thisTurnResult = [];
  }
  return lastTurnResult[lastTurnResult.length - 1].value;
}*/