const Huejay = require('huejay');
const Color = require('c0lor')

const LIGHT_NAME = "Jakes Desk Lamp";

// COLORS, DUKE!
const RGB = Color.space.rgb.sRGB;
const COLORS = {
  RED: RGB.XYZ(Color.rgb(99, 33, 33)).xyY(),
  GREEN: RGB.XYZ(Color.rgb(33, 99, 33)).xyY(),
  YELLOW: RGB.XYZ(Color.rgb(99, 66, 33)).xyY()
};

module.exports = class LightHouse {
  constructor(lightName) {
    this.clientPromise = LightHouse.getBridgeIP().then(LightHouse.clientFor);
    this.lightsPromise = this.clientPromise.then(client => client.lights.getAll());
    this.lightPromise = this.lightsPromise.then(lights => {
      let light = lights.find(l => l.name == lightName);
      if (light) return light;
      throw `Name ${lightname} not found in ${lights.map(i => i.name)}`
    });
  }

  setColor(color) {
    this.color = color;
    let xy = COLORS[color];
    this.lightPromise.then(light => {
      light.on = true;
      light.xy = [xy.x, xy.y]
    })
  }

  turnOff() {
    this.lightPromise.then(light => light.on = false);
  }

  save() {
    return Promise.all([this.clientPromise, this.lightPromise])
      .then((arr) => arr[0].lights.save(arr[1]));
  }

  static getBridgeIP(force) { 
    // discovery broke, hardcoding for now
    return Promise.resolve('192.168.11.126');
    if (!this.discoverPromise || force) { 
      this.discoverPromise = Huejay.discover();
    }
    return this.discoverPromise.then(b => b[0] && b[0].ip);
  }

  static clientFor(ip) {
    return new Huejay.Client({
      host: ip,
      username: process.env.HUE_USER
    });
  }
}

// let lightHouse = new LightHouse("Jakes Desk Lamp");
// lightHouse.setColor('RED');
// lightHouse.save();
