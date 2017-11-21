const GitHub = require('github');
const LightHouse = require('./light_house');

const LIGHT_NAME = 'Jakes Desk Lamp';
const GITHUB_POLL_INTERVAL = 30000;
if (!process.env.LREPO) throw 'set LREPO to repo name'; 
const GITHUB_TARGET = {
  owner: process.env.LOWNER || 'callrail',
  repo: process.env.LREPO,
  ref: process.env.LREF || 'master'
};
const COLOR_MAPPING = {
  success: 'GREEN',
  failure: 'RED',
  pending: 'YELLOW'
};

let light = new LightHouse(LIGHT_NAME);
let github = new GitHub();
let repos = github.getReposApi();

github.authenticate({
  type: 'token',
  token: process.env.LIGHTHOUSE_GITHUB_TOKEN
});

updateLight();
setInterval(updateLight, GITHUB_POLL_INTERVAL)

process.on('SIGINT', () => {
  console.log(" - wait, turning off lamp...");
  light.turnOff()
  light.save().then(() => process.exit()).catch((e) => {
    console.log("ERROR TURNING OFF LAMP:", e); process.exit()
  });
});

function updateLight() {
  statusColor().then(color => {
    light.setColor(color)
    light.save();
  });
}

function statusColor() {
  return repos.getCombinedStatusForRef(GITHUB_TARGET)
    .then(resp => COLOR_MAPPING[resp.data.state])
}
