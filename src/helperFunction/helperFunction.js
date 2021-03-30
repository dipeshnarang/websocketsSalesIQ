const merge = intervals => {
    if (intervals.length < 2) return intervals;
    
    intervals.sort((a, b) => a[0] - b[0]);
    
    const result = [];
    let previous = intervals[0];
    
    for (let i = 1; i < intervals.length; i += 1) {
      if (previous[1] >= intervals[i][0]) {
        previous = [previous[0], Math.max(previous[1], intervals[i][1])];
      } else {
        result.push(previous);
        previous = intervals[i];
      }
    }
    
    result.push(previous);   
    return result;
}

const calculateActiveTime=function(intervals){
  totalTime=0
  intervals.forEach((interval)=>{
    let dif=interval[1]-interval[0]
    totalTime+=dif
  })
  return totalTime
}

const convertToReadableTime=function(millis){
    let delim = " ";
          let hours = Math.floor(millis / (1000 * 60 * 60) % 60);
          let minutes = Math.floor(millis / (1000 * 60) % 60);
          let seconds = Math.floor(millis / 1000 % 60);
          hours = hours < 10 ? '0' + hours : hours;
          minutes = minutes < 10 ? '0' + minutes : minutes;
          seconds = seconds < 10 ? '0' + seconds : seconds;
          return hours + 'h'+ delim + minutes + 'm' + delim + seconds + 's';
}

module.exports={
    merge,
    calculateActiveTime,
    convertToReadableTime
}