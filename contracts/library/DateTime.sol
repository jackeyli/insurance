library DateTime {
        /*
         *  Date and Time utilities for ethereum contracts
         *
         */
        struct _DateTime {
                uint16 year;
                uint8 month;
                uint8 day;
                uint8 hour;
                uint8 minute;
                uint8 second;
                uint8 weekday;
        }

        uint constant DAY_IN_SECONDS = 86400;
        uint constant YEAR_IN_SECONDS = 31536000;
        uint constant LEAP_YEAR_IN_SECONDS = 31622400;

        uint constant HOUR_IN_SECONDS = 3600;
        uint constant MINUTE_IN_SECONDS = 60;

        uint16 constant ORIGIN_YEAR = 1970;
        function uintToDateString(uint date) internal pure returns(string memory addr) {
           uint year = (date & 0xffff0000) >> 16;
           uint month = (date & 0x0000ff00) >> 8;
           uint day = date & 0x000000ff;
           require(year <= 9999 && month <= 12 && month > 0 && day > 0 && day <= 31);
           assembly{
               addr := mload(0x40)
               let ptr := add(addr,35)
               let sIdx := ptr
               for {
                   let v := 0
               } gt(year,0) {
               } {
                   v := mod(year,10)
                   v := mod(year,10)
                   year := div(year,10)
                   mstore8(sIdx,add(v,0x30))
                   sIdx := sub(sIdx,1)
               }
               ptr := add(ptr,1)
               mstore8(ptr,45)
               ptr := add(ptr,1)
               if gt(month,9) {ptr := add(ptr,1)}
               sIdx := ptr
               for {
                   let v:= 0
               } gt(month,0) {
               }{
                   v := mod(month,10)
                   month := div(month,10)
                   mstore8(sIdx,add(v,0x30))
                   sIdx := sub(sIdx,1)
               }
               ptr := add(ptr,1)
               mstore8(ptr,45)
               ptr :=add(ptr,1)
               if gt(day,9) {ptr := add(ptr,1)}
               sIdx := ptr
               for {
                   let v:= 0
               } gt(day,0) {}{
                   v:= mod(day,10)
                   day := div(day,10)
                   mstore8(sIdx,add(v,0x30))
                   sIdx := sub(sIdx,1)
               }
               mstore(addr,sub(sub(ptr,addr),31))
               ptr := add(ptr,1)
               mstore(0x40,ptr)
           }
      }
        function comparingToTimeStamp(uint _time,string memory dateStr) public pure returns(int){
            (uint16 year,uint8 month,uint8 day,uint8 hour,uint8 minute) = stringToDateTime(dateStr);
            uint _time2 = toTimestamp(year,month,day,hour,minute);
            if(_time > _time2)
                return 1;
            if(_time < _time2)
                return -1;
            return 0;
        }
        function dateStringCompare(string memory dateStr1,string memory dateStr2) public pure returns (int){
            (uint16 year,uint8 month,uint8 day,uint8 hour,uint8 minute) = stringToDateTime(dateStr1);
            (uint16 year2,uint8 month2,uint8 day2,uint8 hour2,uint8 minute2) = stringToDateTime(dateStr2);
            uint _time = toTimestamp(year,month,day,hour,minute);
            uint _time2 = toTimestamp(year2,month2,day2,hour2,minute2);
            if(_time > _time2)
                return 1;
            if(_time < _time2)
                return -1;
            return 0;
        }
        function memcpy(uint src, uint dest, uint len) private pure {
                // Copy word-length chunks while possible
                for(; len >= 32; len -= 32) {
                    assembly {
                        mstore(dest, mload(src))
                    }
                    dest += 32;
                    src += 32;
                }

                // Copy remaining bytes
                uint mask = 256 ** (32 - len) - 1;
                assembly {
                    let srcpart := and(mload(src), not(mask))
                    let destpart := and(mload(dest), mask)
                    mstore(dest, or(destpart, srcpart))
                }
        }
        function stringToDateTime(string memory dateStr) internal pure returns (uint16 year,
        uint8 month,uint8 day,uint8 hour,uint8 minute){
                    assembly{
                        let _year := 0
                        let _month := 0
                        let _date := 0
                        let _hour := 0
                        let _minute := 0
                        let _ptr := 0
                        let _bytes := mload(add(dateStr,32))
                        let _len := mload(dateStr)
                        for {
                        } lt(_ptr, 4) {
                            _ptr := add(_ptr, 1)
                        } {
                            _year := mul(_year,10)
                            _year := add(_year,sub(byte(_ptr,_bytes),0x30))
                        }
                        if gt(_year,9999) {revert(0,0)}
                        for {
                            _ptr := add(_ptr,1)
                        } eq(eq(byte(_ptr,_bytes),45),0) {
                            _ptr := add(_ptr, 1)
                        } {
                            _month := mul(_month,10)
                            _month := add(_month,sub(byte(_ptr,_bytes),0x30))
                        }
                        if gt(_month,12) {revert(0,0)}
                        for{
                            _ptr := add(_ptr,1)
                        } and(and(lt(byte(_ptr,_bytes),0x3a),gt(byte(_ptr,_bytes),0x2f)),lt(_ptr,_len)) {
                            _ptr := add(_ptr,1)
                        }
                        {
                            _date := mul(_date,10)
                            _date := add(_date,sub(byte(_ptr,_bytes),0x30))
                        }
                        if gt(_date,31) {revert(0,0)}
                        if lt(_ptr,_len) {
                            for {
                                _ptr := add(_ptr,1)
                            } and(and(gt(byte(_ptr,_bytes),0x2f),lt(byte(_ptr,_bytes),0x3a)),lt(_ptr,_len)) {
                                _ptr := add(_ptr,1)
                            }{
                                _hour := mul(_hour,10)
                                _hour := add(_hour,sub(byte(_ptr,_bytes),0x30))
                            }
                        }
                        if gt(_hour,24) {revert(0,0)}
                        if lt(_ptr,_len) {
                           for {
                                _ptr := add(_ptr,1)
                           } and(and(gt(byte(_ptr,_bytes),0x2f),lt(byte(_ptr,_bytes),0x3a)),lt(_ptr,_len)) {
                                _ptr := add(_ptr,1)
                           } {
                                _minute := mul(_minute,10)
                                _minute := add(_minute,sub(byte(_ptr,_bytes),0x30))
                           }
                        }
                        if gt(_minute,59) {revert(0,0)}
                        year := _year
                        month := _month
                        day := _date
                        hour := _hour
                        minute := _minute
                    }
        }
        function isLeapYear(uint16 year) public pure returns (bool) {
                if (year % 4 != 0) {
                        return false;
                }
                if (year % 100 != 0) {
                        return true;
                }
                if (year % 400 != 0) {
                        return false;
                }
                return true;
        }
        function leapYearsBefore(uint year) public pure returns (uint) {
            uint result = 0;
                assembly{
                    year := sub(year,1)
                    result := add(sub(div(year,4),div(year,100)),div(year,400))
                }
            return result;
        }
        function getDaysInMonth(uint8 month, uint16 year) public pure returns (uint8) {
                uint8 result = 0;
                if(month == 2){
                    if(isLeapYear(year))
                        return 29;
                    else
                        return 28;
                } else {
                    assembly{
                        let cond_1 := 0
                        cond_1 := or(cond_1,eq(month,4))
                        cond_1 := or(cond_1,eq(month,6))
                        cond_1 := or(cond_1,eq(month,9))
                        cond_1 := or(cond_1,eq(month,11))
                        if eq(cond_1,1) {
                            result := 30
                        }
                        if eq(cond_1,0) {
                            result := 31
                        }
                    }
                    return result;
                }
        }
        function parseTimestamp(uint timestamp) public pure returns (uint16 year,uint8 month,
        uint8 day,uint8 hour,uint8 minute,
        uint second,uint weekday) {
                uint secondsAccountedFor = 0;
                uint buf;
                uint8 i;

                // Year
                year = getYear(timestamp);
                buf = leapYearsBefore(year) - leapYearsBefore(ORIGIN_YEAR);

                secondsAccountedFor += LEAP_YEAR_IN_SECONDS * buf;
                secondsAccountedFor += YEAR_IN_SECONDS * (year - ORIGIN_YEAR - buf);

                // Month
                uint secondsInMonth;
                for (i = 1; i <= 12; i++) {
                        secondsInMonth = DAY_IN_SECONDS * getDaysInMonth(i, year);
                        if (secondsInMonth + secondsAccountedFor > timestamp) {
                                month = i;
                                break;
                        }
                        secondsAccountedFor += secondsInMonth;
                }

                // Day
                for (i = 1; i <= getDaysInMonth(month, year); i++) {
                        if (DAY_IN_SECONDS + secondsAccountedFor > timestamp) {
                                day = i;
                                break;
                        }
                        secondsAccountedFor += DAY_IN_SECONDS;
                }

                // Hour
                hour = getHour(timestamp);

                // Minute
                minute = getMinute(timestamp);

                // Second
                second = getSecond(timestamp);

                // Day of week.
                weekday = getWeekday(timestamp);
        }

        function getYear(uint timestamp) public pure returns (uint16) {
                uint secondsAccountedFor = 0;
                uint16 year;
                uint numLeapYears;

                // Year
                year = uint16(ORIGIN_YEAR + timestamp / YEAR_IN_SECONDS);
                numLeapYears = leapYearsBefore(year) - leapYearsBefore(ORIGIN_YEAR);

                secondsAccountedFor += LEAP_YEAR_IN_SECONDS * numLeapYears;
                secondsAccountedFor += YEAR_IN_SECONDS * (year - ORIGIN_YEAR - numLeapYears);

                while (secondsAccountedFor > timestamp) {
                        if (isLeapYear(uint16(year - 1))) {
                                secondsAccountedFor -= LEAP_YEAR_IN_SECONDS;
                        }
                        else {
                                secondsAccountedFor -= YEAR_IN_SECONDS;
                        }
                        year -= 1;
                }
                return year;
        }

        function getMonth(uint timestamp) public pure returns (uint8 month) {
            (,uint8 _month,,,,,) = parseTimestamp(timestamp);
            month = _month;
        }

        function getDay(uint timestamp) public pure returns (uint8 day) {
            (,,uint8 _day,,,,) = parseTimestamp(timestamp);
            day = _day;
        }

        function getHour(uint timestamp) public pure returns (uint8 hour) {
                return uint8((timestamp / 60 / 60) % 24);
        }

        function getMinute(uint timestamp) public pure returns (uint8) {
                return uint8((timestamp / 60) % 60);
        }

        function getSecond(uint timestamp) public pure returns (uint8) {
                return uint8(timestamp % 60);
        }

        function getWeekday(uint timestamp) public pure returns (uint8) {
                return uint8((timestamp / DAY_IN_SECONDS + 4) % 7);
        }

        function toTimestamp(uint16 year, uint8 month, uint8 day) public pure returns (uint timestamp) {
                return toTimestamp(year, month, day, 0, 0, 0);
        }

        function toTimestamp(uint16 year, uint8 month, uint8 day, uint8 hour) public pure returns (uint timestamp) {
                return toTimestamp(year, month, day, hour, 0, 0);
        }

        function toTimestamp(uint16 year, uint8 month, uint8 day, uint8 hour, uint8 minute) public pure returns (uint timestamp) {
                return toTimestamp(year, month, day, hour, minute, 0);
        }

        function toTimestamp(uint16 year, uint8 month, uint8 day, uint8 hour, uint8 minute, uint8 second) public pure returns (uint timestamp) {
                uint16 i;

                // Year
                for (i = ORIGIN_YEAR; i < year; i++) {
                        if (isLeapYear(i)) {
                                timestamp += LEAP_YEAR_IN_SECONDS;
                        }
                        else {
                                timestamp += YEAR_IN_SECONDS;
                        }
                }

                // Month
                uint8[12] memory monthDayCounts;
                monthDayCounts[0] = 31;
                if (isLeapYear(year)) {
                        monthDayCounts[1] = 29;
                }
                else {
                        monthDayCounts[1] = 28;
                }
                monthDayCounts[2] = 31;
                monthDayCounts[3] = 30;
                monthDayCounts[4] = 31;
                monthDayCounts[5] = 30;
                monthDayCounts[6] = 31;
                monthDayCounts[7] = 31;
                monthDayCounts[8] = 30;
                monthDayCounts[9] = 31;
                monthDayCounts[10] = 30;
                monthDayCounts[11] = 31;

                for (i = 1; i < month; i++) {
                        timestamp += DAY_IN_SECONDS * monthDayCounts[i - 1];
                }

                // Day
                timestamp += DAY_IN_SECONDS * (day - 1);

                // Hour
                timestamp += HOUR_IN_SECONDS * (hour);

                // Minute
                timestamp += MINUTE_IN_SECONDS * (minute);

                // Second
                timestamp += second;

                return timestamp;
        }
}