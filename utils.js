const config = require('./config.json')

function longFormChannelName(name) {
    const abbrev = name.slice(0, name.indexOf('-'));
    const date = name.slice(name.indexOf('-') + 1)
    const territory = config.territories[abbrev.toUpperCase()]
    return territory + ' ' + date
  }
  
  function splitContent(content) {
    const start = `user: `;
    const end = ` missions: `;
    const username = content.split(start)[1].split(end)[0]
    const missions = content.split(end)[1]
    return [username, missions]
  }
  
  function countMissions(messages) {
    if (!messages || messages.size === 0) return count = 0

    count = 0

    if(messages.size > 0) {
      messages.forEach(m => {
        missionValue = isNaN(splitContent(m.content)[1]) ? 0 : splitContent(m.content)[1]
        count = +missionValue + +count
      })
    } else {
      missionValue = isNaN(splitContent(messages.content)[1]) ? 0 : splitContent(messages.content)[1]
      count = +missionValue + +count
    }

    return count
  }
  
  function wait(time) {
    return new Promise(resolve => {
      setTimeout(resolve, time);
    });
  }

  function addOrReplace(arr){ 
    const res = Array.from(arr.reduce(
      (m, {name, count}) => m.set(name, (m.get(name) || 0) + count), new Map
    ), ([name, count]) => ({name, count}));
    return res
   }

  function totalString(total) {
    let stringTotal = ''
    total.forEach(item => {
      stringTotal += item.name + ' : ' + item.count + '\n'
    })
    return stringTotal
}


exports.longFormChannelName = longFormChannelName
exports.splitContent = splitContent
exports.countMissions = countMissions
exports.wait = wait
exports.addOrReplace = addOrReplace
exports.totalString = totalString