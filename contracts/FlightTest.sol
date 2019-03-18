pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;
import "./oraclize/usingOraclize.sol";
import "./stringutils/strings.sol";
import "./library/DateTime.sol";
import "./Shareholder.sol";
contract FlightTest is usingOraclize {
   using strings for *;
   address payable owner;
   Shareholder holderContract;
   uint public priceLimit_Low =  50000000000000000;   // 0.05 ETH
   uint public priceLimit_High = 10000000000000000000; // 10 ETH
   enum OraclizeState {CheckValid,EstTimeCheck,ActTimeCheck}
   struct OraclizeCallback {
        OraclizeState oState;
        string flightNo;
        string expectedDepatureDate;
        address user;
        uint paidAmt;
        bytes32 content;
   }
   struct FlightStatus {
        uint expectedArriveDate;
        uint actArriveDate;
        bool checked;
        uint delaySeconds;
        bool isActResultNull;
   }
   struct UserAccount {
        uint256 balance;
        bytes32[] order_ids;
   }
   struct Order {
       uint payoutAmount;
       address user;
       string flightNo;
       bool isDone;
       string expectedDepatureDate;
       uint compensateValue;
   }
   struct Profit{
       uint profit;
       uint timestamp;
       uint year;
       address triggerAddr;
   }
   mapping(bytes32 => Order) orders;
   mapping(bytes32 => OraclizeCallback) callbacks;
   mapping(string => mapping(string => FlightStatus)) status;
   mapping(address => UserAccount) accounts;
   Profit[] dividendYearList;
   address [] shareholders;
   uint public unClaimedAmount;
   uint public balanceOffset;
   constructor() public payable{
         owner = msg.sender;
         OAR = OraclizeAddrResolverI(0x6f485C8BF6fc43eA212E93BBF8ce046C7f1cb475);
   }
   event LogCheckValid(address sender,string flightNo,string result);
   event LogString(string,string);
   event LogBytes32(string,bytes32);
   event LogCompensation(bool isSuccess,bytes32 order_id,string message,address user,uint amount);
   event LogOrderCreated(bytes32 order_id,string flightNo,string expectedDepatureDate,address user,uint paidAmt);
   event LogFlightStatusUpdate(bool isSuccess,string flightNo,string expectedDepatureDate,uint expectedArriveDate,uint actArriveDate);
   function setHolderContract(address payable contractAddr) public {
       require(address(holderContract) == address(0));
       require(msg.sender == owner);
       holderContract = (Shareholder)(contractAddr);
   }
   function () external payable{
   }
   function donate() public payable returns(bool){
       return holderContract.buyShareHolder(msg.sender,msg.value);
   }
   function transferShareHolder(address to,uint token) public returns(bool){
       return holderContract.transferShareHolder(msg.sender,to,token);
   }
   function recordOrder(string memory flightNo,uint expDate,string memory expectedDate,address orderOwner) internal {
        bytes memory info_bytes;
                assembly {
                                    info_bytes := mload(0x40)
                                    let ptr := add(info_bytes,32)
                                    let ptrFlight := add(flightNo,32)
                                    mstore(ptr,orderOwner)
                                    ptr := add(ptr,32)
                                    let flightNoLen := mload(flightNo)
                                    if gt(flightNoLen,32) {revert(0,0)}
                                    let mask := not(sub(exp(256,sub(32,flightNoLen)),1))
                                    mstore(ptr,and(mask,mload(ptrFlight)))
                                    ptr := add(ptr,32)
                                    mstore(ptr,expDate)
                                    ptr := add(ptr,32)
                                    mstore(info_bytes,96)
                                    mstore(0x40,ptr)
                }
                bytes32 t_id = keccak256(info_bytes);
                address addr = orders[t_id].user;
                require(addr == address(0),"You have already insure this flight");
                orders[t_id] = Order(msg.value,orderOwner,flightNo,false,expectedDate,0);
                accounts[orderOwner].order_ids.push(t_id);
                unClaimedAmount += msg.value;
                emit LogOrderCreated(t_id,flightNo,expectedDate,msg.sender,msg.value);
   }
   function checkValidFlight(string memory flightNo) public payable {
        require(msg.value >= 4000000000000000,"Please transfer the 0.004 ether the check");
        string memory queryStr = "https://flights.ctrip.com/process/ajax/HistoryPunctuality?FlightNo=".toSlice()
        .concat(flightNo.toSlice());
        bytes32 queryId = oraclize_query("URL",queryStr,200000);
        callbacks[queryId] = OraclizeCallback(OraclizeState.CheckValid,flightNo,"",msg.sender,0,0);
   }
   function insure(string memory flightNo,uint expDate) public payable {
        require(msg.value >= priceLimit_Low && msg.value <= priceLimit_High);
        string memory expectedDate = DateTime.uintToDateString(expDate);
        require(DateTime.comparingToTimeStamp(now + 86400,expectedDate) < 0,"Please insure 48 hours before depature");
        recordOrder(flightNo,expDate,expectedDate,msg.sender);
   }
   function getShareholderContractAddr() public view returns(address) {
        return address(holderContract);
   }
   function getContractBalance() public view returns(uint) {
        return address(this).balance;
   }
   function getContractProfit() public view returns(uint) {
        if(address(this).balance > unClaimedAmount * 9 / 10 + balanceOffset) {
            return (address(this).balance - unClaimedAmount * 9 / 10 - balanceOffset) * 4 / 5;
        } else {
            return 0;
        }
   }
   function getMyAccountInfo() public view returns(uint balance,bytes32[] memory order_ids) {
       balance = accounts[msg.sender].balance;
       order_ids = accounts[msg.sender].order_ids;
   }
   function getOrderInfo(bytes32 id) public view returns(uint payoutAmount,
                                                         address user,
                                                         string memory flightNo,
                                                         bool isDone,
                                                         string memory expectedDepatureDate,
                                                         uint compensateValue) {
       payoutAmount = orders[id].payoutAmount;
       user = orders[id].user;
       isDone = orders[id].isDone;
       expectedDepatureDate = orders[id].expectedDepatureDate;
       flightNo = orders[id].flightNo;
       compensateValue = orders[id].compensateValue;
   }
   function getFlightStatus(string memory flightNo,string memory flightDate) public view
   returns(uint expectedArriveDate,
           uint actArriveDate,
           bool checked,
           uint delaySeconds)
   {
       FlightStatus memory _status = status[flightNo][flightDate];
       expectedArriveDate = _status.expectedArriveDate;
       actArriveDate = _status.actArriveDate;
       checked = _status.checked;
       delaySeconds = _status.delaySeconds;
   }
   function withDrawBalance(uint amount) public returns(bool){
       require(msg.sender != address(0));
       require(amount <= address(this).balance && amount <= accounts[msg.sender].balance);
       accounts[msg.sender].balance -= amount;
       if(balanceOffset >= amount) {
            balanceOffset -= amount;
       }
       else {
            balanceOffset = 0;
       }
       msg.sender.transfer(amount);
   }
   function dividend() public returns(bool){
        (uint16 _year,uint8 _month,,,,,) = DateTime.parseTimestamp(now);
        require((dividendYearList.length == 0 || dividendYearList[dividendYearList.length - 1].year < _year)
        && _month == 12);
        uint token = holderContract.getShareToken(msg.sender);
        require(token > 0);
        if(unClaimedAmount * 9 / 10 + balanceOffset < address(this).balance) {
            uint profitThisTurn = (address(this).balance - unClaimedAmount * 9/10 - balanceOffset) * 4 / 5;
            dividendYearList.push(Profit({profit:profitThisTurn,timestamp:now,year:_year,triggerAddr:msg.sender}));
            holderContract.dividend(profitThisTurn,_year);
            address(holderContract).transfer(profitThisTurn);
        }
        return true;
   }
   function getDividendLen() public view returns(uint) {
          return dividendYearList.length;
   }
   function getDividendHistory(uint i) public view returns(uint profit,uint timestamp,uint year,address triggerAddr) {
          profit = dividendYearList[i].profit;
          timestamp = dividendYearList[i].timestamp;
          year = dividendYearList[i].year;
          triggerAddr = dividendYearList[i].triggerAddr;
   }
   function claimCompensation(bytes32 order_id) public returns(bool) {
       Order memory order  = orders[order_id];
       require(!order.isDone,"You have already claimed");
       require(status[order.flightNo][order.expectedDepatureDate].checked,"Please request status update first");
       uint compensateValue = 0;
       if(unClaimedAmount >= order.payoutAmount) {
          unClaimedAmount -= order.payoutAmount;
       } else {
          unClaimedAmount = 0;
       }
       if(status[order.flightNo][order.expectedDepatureDate].delaySeconds >= 3600) {
            compensateValue = order.payoutAmount * 10;
            emit LogCompensation(true,order_id,"",order.user,compensateValue);
       } else if(status[order.flightNo][order.expectedDepatureDate].delaySeconds >= 1800) {
            compensateValue = order.payoutAmount * 5;
            emit LogCompensation(true,order_id,"",order.user,compensateValue);
       } else {
            compensateValue = order.payoutAmount / 10;
            emit LogCompensation(false,order_id,"",order.user,compensateValue);
       }
       accounts[order.user].balance += compensateValue;
       balanceOffset += compensateValue;
       orders[order_id].compensateValue = compensateValue;
       orders[order_id].isDone = true;
   }
   function requestUpdate(bytes32 order_id) public payable returns(bool){
        require(msg.value >= 8000000000000000,"Request fee is 0.008 ether");
        Order memory order = orders[order_id];
        if(status[order.flightNo][order.expectedDepatureDate].checked) {
            return true;
        }
        string memory queryStr = "json(https://flights.ctrip.com/process/ajax/HistoryPunctuality?FlightNo=".toSlice()
        .concat(order.flightNo.toSlice()).toSlice().concat(").\"".toSlice()).toSlice().concat(order.expectedDepatureDate.toSlice());
        bytes32 queryId_Est = oraclize_query("URL",
        queryStr.toSlice().concat("\".FlightArrtimeReady".toSlice()),200000);
        bytes32 queryId_Act = oraclize_query("URL",
        queryStr.toSlice().concat("\".FlightArrtime".toSlice()),200000);
        callbacks[queryId_Est] = OraclizeCallback(OraclizeState.EstTimeCheck,"","",address(0),0,order_id);
        callbacks[queryId_Act] = OraclizeCallback(OraclizeState.ActTimeCheck,"","",address(0),0,order_id);
        return true;
   }
   function __callback(bytes32 myid, string memory result) public {
          if (msg.sender != oraclize_cbAddress()) revert();
          //emit LogString("debug",result);
          OraclizeCallback memory callback = callbacks[myid];
          if(bytes(result).length == 0) {
              emit LogFlightStatusUpdate(false,
              orders[callback.content].flightNo,
              orders[callback.content].expectedDepatureDate,0,0);
              return;
          }
          if(callback.oState == OraclizeState.CheckValid) {
              emit LogCheckValid(callback.user,callback.flightNo,result);
              delete callbacks[myid];
          }
          else if(callback.oState == OraclizeState.EstTimeCheck) {
               Order memory order_est = orders[callback.content];
               (uint16 year_est,uint8 month_est,uint8 day_est,uint8 hour_est,uint8 minute_est) =
               DateTime.stringToDateTime(result);
               uint ts = DateTime.toTimestamp(year_est,month_est,day_est,hour_est,minute_est);
               FlightStatus storage theStatus = status[order_est.flightNo][order_est.expectedDepatureDate];
               theStatus.expectedArriveDate = ts;
               if(theStatus.actArriveDate > 0 || theStatus.isActResultNull) {
                   if(theStatus.actArriveDate > ts) {
                       theStatus.delaySeconds = theStatus.actArriveDate - ts;
                   }
                   if(theStatus.isActResultNull) {
                       theStatus.actArriveDate = ts;
                   }
                   theStatus.checked = true;
                   emit LogFlightStatusUpdate(true,order_est.flightNo,
                   order_est.expectedDepatureDate,theStatus.expectedArriveDate,theStatus.actArriveDate);
               }
               delete callbacks[myid];
          } else if(callback.oState == OraclizeState.ActTimeCheck) {
               Order memory order_act = orders[callback.content];
               FlightStatus storage theStatus = status[order_act.flightNo][order_act.expectedDepatureDate];
               if(result.toSlice().equals("null".toSlice())) {
                    theStatus.isActResultNull = true;
               }
               uint ts = 0;
               if(!theStatus.isActResultNull) {
                    (uint16 year_act,uint8 month_act,uint8 day_act,uint8 hour_act,uint8 minute_act) = DateTime.stringToDateTime(result);
                    uint ts = DateTime.toTimestamp(year_act, month_act, day_act, hour_act, minute_act);
                    theStatus.actArriveDate = ts;
               }
               if(theStatus.expectedArriveDate > 0) {
                   if(theStatus.expectedArriveDate < ts && !theStatus.isActResultNull) {
                       theStatus.delaySeconds = ts - theStatus.expectedArriveDate;
                   }
                   if(theStatus.isActResultNull) {
                       theStatus.actArriveDate = theStatus.expectedArriveDate;
                   }
                   theStatus.checked = true;
                   emit LogFlightStatusUpdate(true,order_act.flightNo,
                                      order_act.expectedDepatureDate,theStatus.expectedArriveDate,theStatus.actArriveDate);
               }
               delete callbacks[myid];
          }
   }
}