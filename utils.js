const config = require('./config.json')

function longFormChannelName(name) {
    const abbrev = name.slice(0, name.indexOf('-'));
    const date = name.slice(name.indexOf('-') + 1)
    const territory = config.territories[abbrev.toUpperCase()]
    return territory + ' ' + date
  }
  
  function splitContent(content) {
    const start = `user: `;
    const end = `missions: `;
    const username = content.split(start)[1].split(end)[0]
    const missions = content.split(end)[1]
    return [username, missions]
  }
  
  function countMissions(messages) {
    count = 0
    messages.forEach(m => {
      missionValue = isNaN(splitContent(m.content)[1]) ? 0 : splitContent(m.content)[1]
      count = +missionValue + +count
    })
    return count
  }
  
  function wait(time) {
    return new Promise(resolve => {
      setTimeout(resolve, time);
    });
  }

  function totalString(total) {
    let stringTotal = ''
    for (key in total) {
        stringTotal += key + ' : ' + total[key] + '\n'
    }
    return stringTotal
}


exports.longFormChannelName = longFormChannelName
exports.splitContent = splitContent
exports.countMissions = countMissions
exports.wait = wait
exports.totalString = totalString