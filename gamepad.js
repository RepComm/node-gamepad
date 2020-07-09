
let usb = require("usb");

/**@returns {Array<import("usb").Device>}
 */
function getNativeUsbs() {
  return usb.getDeviceList();
}

/**Attempts to conform to this
 * https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API
 */
class Gamepad {
  static AllGamepads = undefined;
  /**Instantiates a gamepad instance referencing an hid device
   * Please don't call this if you don't know what you're doing
   * @param {HID} dev
   * @param {GamepadVendor} vendor
   */
  constructor(dev, vendor) {
    this.vendor = vendor;

    this.hid = dev;

    /**@param {Buffer} data*/
    this.onData = (data) => {
      console.log(data.toString());
    }

    this.registerListeners();
  }
  get connected() {
    //TODO - more implementation here
    return (
      this.hid
    );
  }
  /**Internal - called on instantiation
   * Registers HID event listeners needed to do updates
   */
  registerListeners() {
    //TODO - more implementation here
  }
  /**Internal
   * Removes HID event listeners
   */
  unregisterListeners() {
    throw "Not implemented yet";
  }
  /**Tries to add a usb device as gamepad
   * @param {import("usb").Device} dev
   */
  static tryAddDevice(dev) {
    let vendorId = dev.deviceDescriptor.idVendor;
    let productId = dev.deviceDescriptor.idProduct;

    // console.log(`vendorId : ${vendorId}, productId : ${productId} / vendorId : ${vendorId.toString(16)}, productId : ${productId.toString(16)}`);

    let ven = GamepadVendor.matches(productId, productId);

    if (ven) {
      try {
        // console.log("Found gamepad!", ven);
        // dev.open(true);
        let gp = new Gamepad(dev, ven);
        Gamepad.getGamepadsNoQuery().push(gp);
      } catch (ex) {
        //Skip this one
        console.warn("Could not use device", dev);
        // throw "Could use device " + dev;
      }
    }
  }
  /**Internal - non-spec
   * Get all the loaded gamepads without usb query stuff
   * @returns {Array<Gamepad>}
   */
  static getGamepadsNoQuery () {
    if (!Gamepad.AllGamepads) {
      Gamepad.AllGamepads = new Array();
    }
    return Gamepad.AllGamepads;
  }
  /**Get all the available gamepads
   * Analog to navigator.getGamepads
   * @returns {Array<Gamepad>}
   */
  static getGamepads() {
    let devs = getNativeUsbs();

    for (let dev of devs) {
      Gamepad.tryAddDevice(dev);
    }
    let result = new Array();
    Gamepad.getGamepadsNoQuery ().forEach((gp)=>{
      result.push(gp);
    });
    return result;
  }
}

class GamepadVendor {
  /**Where key is vendorId
   * @type {Array<GamepadVendor>|undefined} internal*/
  static All = undefined;

  /**
   * @param {number} vendorId 
   * @param {number} productId 
   */
  constructor(vendorId, productId, vendorName="") {
    this.vendorId = vendorId;
    this.productId = productId;
    this.vendorName = vendorName;
  }
  /**Tries to add a vendor (without duplicating)
   * @param {number} vendorId
   * @param {number} productId
   * @param {GamepadVendor|false}
   */
  static tryAdd (vendorId, productId, vendorName="") {
    GamepadVendor.getAll().forEach((gp)=>{
      if (gp.vendorId === vendorId && gp.productId === productId) return false;
    });
    let result = new GamepadVendor(vendorId, productId, vendorName);
    // console.log("Added vendor", vendorName)
    GamepadVendor.All.push(result);

    return result;
  }
  /**Get all currently loaded vendors
   * @returns {Array<GamepadVendor>}
   */
  static getAll() {
    if (!GamepadVendor.All) {
      GamepadVendor.All = new Array();
    }
    return GamepadVendor.All;
  }

  /**Loads a set of vendors from a json definition
   * @param {Array<{name: string, vendorId: number, productId: number}>} defs
   */
  static loadFromJson(defs) {
    for (let def of defs) {
      GamepadVendor.tryAdd(def.vendorId, def.productId, def.name)
    }
  }

  /**load but reads a file using node fs
   * @param {string} fname
   */
  static loadFromFile(fname) {
    this.loadFromJson(require(fname));
  }

  /**Loads default vendors
   */
  static loadDefaultVendors() {
    this.loadFromFile("./lib/default-vendors.json");
  }

  /**Test if a vid and pid is loaded against available types
   * @param {number} vendorId 
   * @param {number} productId
   * @returns {GamepadVendor} instance if it does
   */
  static matches(vendorId, productId) {
    for (let ven of GamepadVendor.getAll()) {
      if (ven.productId === vendorId && ven.productId === productId) return ven;
    }
    return false;
  }
}

usb.on("attach", (dev)=>{
  Gamepad.tryAddDevice(dev);
});

usb.on("detach", (dev)=>{
  //Gamepad.tryRemoveDevice(dev);
});

GamepadVendor.loadDefaultVendors();

module.exports = {
  Gamepad, GamepadVendor
};
