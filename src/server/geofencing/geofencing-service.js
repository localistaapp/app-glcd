
class GeofencingService {
    static degToDms (deg) {
        var d = Math.floor (deg);
        var minfloat = (deg-d)*60;
        var m = Math.floor(minfloat);
        var secfloat = (minfloat-m)*60;
        var s = Math.round(secfloat);
        // After rounding, the seconds might become 60. These two
        // if-tests are not necessary if no rounding is done.
        if (s==60) {
          m++;
          s=0;
        }
        if (m==60) {
          d++;
          m=0;
        }
        return ("" + d + ":" + m + ":" + s);
     }
    static isLocationInVicinity(currLat, currLong, storeLat, storeLong) {
        var latDiff = Math.abs(currLat - storeLat);
        var longDiff = Math.abs(currLong - storeLong);
        var latDiffSeconds = this.degToDms(latDiff).split(':')[2];
        var longDiffSeconds = this.degToDms(longDiff).split(':')[2];
        console.log('--latDiffSeconds--', latDiffSeconds);
        console.log('--longDiffSeconds--', longDiffSeconds);
        /*if (latDiffSeconds <= 0.5 && longDiffSeconds <= 0.5) {
            return true;
        }
        return false;*/
        return true;
    }
}
module.exports = GeofencingService;