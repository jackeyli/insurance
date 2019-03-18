pragma solidity ^0.5.0;
contract Shareholder {
   address payable owner;
   uint public totalShareholderToken;
   uint public startTimestamp;
   event LogWithdrawProfit(address addr,uint profitGet);
   struct DividendOp {
        uint profit;
        uint year;
        uint closeDividendTs;
        uint startTs;
        uint totalToken;
   }
   struct ShareholderSnapShot{
       uint myToken;
       uint timestamp;
   }
   mapping(address=>mapping(uint=>bool)) shareholderClaimHistory;
   mapping (address=>uint) balances;
   DividendOp[] public dividendOps;
   mapping (address=>ShareholderSnapShot[]) shareholderChangingHist;
   constructor(address payable _owner) public{
       owner = _owner;
       startTimestamp = now;
   }
   function () external payable{
   }
   function nextPriceTs() public view returns(uint) {
       return now + (15552000 - (now - startTimestamp) % 15552000);
   }
   function getCurrentTokenPrice() public view returns(uint) {
      uint rate = 2 ** ((now - startTimestamp) / 15552000);
      if(rate > 1024) {
           rate = 1024;
      }
      return 10240000 / rate;
   }
   function buyShareHolder(address theShareOwner,uint token) external returns(bool){
       require(msg.sender == owner);
       uint rate = 2 ** ((now - startTimestamp) / 15552000);
       if(rate > 1024) {
            rate = 1024;
       }
       uint holder = token * 1024/rate/100000000000000;
       totalShareholderToken += holder;
       ShareholderSnapShot[] storage snap = shareholderChangingHist[theShareOwner];
       if(snap.length == 0){
           snap.push(ShareholderSnapShot({myToken:holder,timestamp:now}));
       } else {
          ShareholderSnapShot storage last = snap[snap.length - 1];
          snap.push(ShareholderSnapShot({myToken:last.myToken + holder,timestamp:now}));
       }
       return true;
   }
   function transferShareHolder(address from,address to,uint holder) external returns(bool) {
        require(msg.sender == from);
        require(to != address(0) && to != from);
        ShareholderSnapShot[] storage snapFrom = shareholderChangingHist[from];
        ShareholderSnapShot[] storage snapTo = shareholderChangingHist[to];
        require(snapFrom.length > 0);
        ShareholderSnapShot memory lastOfFrom = snapFrom[snapFrom.length - 1];
        require(holder > 0 && lastOfFrom.myToken >= holder);
        snapFrom.push(ShareholderSnapShot({myToken:lastOfFrom.myToken + holder,timestamp:now}));
        if(snapTo.length == 0) {
            snapTo.push(ShareholderSnapShot({myToken:holder,timestamp:now}));
        } else {
            ShareholderSnapShot memory lastOfTo = snapTo[snapTo.length - 1];
            snapTo.push(ShareholderSnapShot({myToken:lastOfTo.myToken + holder,timestamp:now}));
        }
        return true;
   }
   function dividend(uint profit,uint year) external returns(bool){
        require(msg.sender == owner);
        require(dividendOps.length == 0 || dividendOps[dividendOps.length - 1].year < year);
        dividendOps.push(DividendOp({year:year,closeDividendTs:now + 2678400,profit:profit,startTs:now,
        totalToken:totalShareholderToken}));
        return true;
   }
   function getShareToken(address addr) external view returns(uint){
        ShareholderSnapShot[] memory snap = shareholderChangingHist[addr];
        if(snap.length == 0) {
            return 0;
        } else {
            return snap[snap.length - 1].myToken;
        }
   }
   function getMyAmtOfShareOfProfit(uint year) public view returns(uint) {
           uint totalToken = 0;
           uint timestamp = 0;
           uint profit = 0;
           for(uint i = 0; i < dividendOps.length; i ++){
               if(dividendOps[i].year == year) {
                   totalToken = dividendOps[i].totalToken;
                   timestamp = dividendOps[i].startTs;
                   profit = dividendOps[i].profit;
                   break;
               }
           }
           if(timestamp == 0 || totalToken == 0)
               return 0;
           ShareholderSnapShot[] memory snap = shareholderChangingHist[msg.sender];
           if(snap.length == 0) {
               return 0;
           }
           uint myToken = 0;
           if(snap.length == 1 && snap[0].timestamp < timestamp) {
               myToken = snap[0].myToken;
           } else {
               for(uint i = snap.length - 1; i > 0; i --){
                   if(i == snap.length - 1 && snap[i].timestamp < timestamp) {
                        myToken = snap[i].myToken;
                        break;
                   }
                   if(snap[i].timestamp > timestamp && snap[i - 1].timestamp < timestamp) {
                        myToken = snap[i - 1].myToken;
                        break;
                   }
               }
           }
           return profit * myToken / totalToken;
      }
   function isYearClaimedProfit(uint year) public view returns(bool) {
       return shareholderClaimHistory[msg.sender][year];
   }
   function getMyShareOfProfit(uint year) public returns(uint) {
       require(shareholderClaimHistory[msg.sender][year] == false);
       uint myShareOfProfit = getMyAmtOfShareOfProfit(year);
       shareholderClaimHistory[msg.sender][year] = true;
       balances[msg.sender] += myShareOfProfit;
   }
   function getMyBalance() public view returns(uint){
       return balances[msg.sender];
   }
   function withDraw(uint amount) public returns(bool) {
       require(balances[msg.sender] >= amount && address(this).balance >= amount);
       balances[msg.sender] -= amount;
       msg.sender.transfer(amount);
       return true;
   }
   function getLastDividendStatus() public view returns(uint profit,
                                                       uint year,
                                                       uint closeDividendTs){
           DividendOp memory dividendOp;
           if(dividendOps.length == 0) {
                return(0,0,0);
           }
           profit = dividendOps[dividendOps.length - 1].profit;
           year = dividendOps[dividendOps.length - 1].year;
           closeDividendTs = dividendOps[dividendOps.length - 1].closeDividendTs;
   }
}