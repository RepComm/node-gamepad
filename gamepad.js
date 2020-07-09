
let usb = require("usb");

/**@returns {Array<import("usb").Device>}
 */
function getNativeUsbs() {
  return usb.getDeviceList();
}

const xboxoneParse = require("./lib/controllers/xboxone.js");

/**Attempts to confirm to this
 * https://developer.mozilla.org/en-US/docs/Web/API/GamepadButton
 */
class GamepadButton {
  constructor () {
    this._pressed = false;
    this._touched = false;
    this._value = 0;
  }
  get pressed () {
    return this._pressed;
  }
  get touched () {
    return this._touched;
  }
  get value () {
    return this._value;
  }
}

/**Attempts to conform to this
 * https://developer.mozilla.org/en-US/docs/Web/API/Gamepad
 */
class Gamepad {
  /**Internal - non spec
   * Use Gamepad.getGamepads()
   * @type {Array<Gamepad>}
   */
  static AllGamepads = undefined;
  /**Instantiates a gamepad instance referencing an hid device
   * Please don't call this if you don't know what you're doing
   * @param {import("usb").Device} dev
   * @param {GamepadVendor} vendor
   */
  constructor(dev, vendor) {
    /**@type {Array<GamepadButton>}*/
    this._buttons = new Array(10);
    for (let i=0; i<this._buttons.length; i++) {
      this._buttons[i] = new GamepadButton();
    }

    /**@type {Array<number>}*/
    this._axes = new Array(7);

    /**non spec
     * GamepadVendor
     */
    this.vendor = vendor;

    /**Internal - non spec
     * node-usb device
     */
    this.device = dev;

    /**Internal - non spec
     * @type {import("usb").OutEndpoint}*/
    this.out = undefined;
    /**Internal - non spec
     * @type {import("usb").InEndpoint}*/
    this.in = undefined;

    /**Internal - non spec
     * @param {Buffer} data*/
    this.onData = (data) => {
      //TODO - parse controller specific data here
      xboxoneParse(this, data);
      // console.log(data[4].toString(2));
    }

    /**Internal - non spec
     * @param {string} ex 
     */
    this.onError = (ex)=>{
      this.markDirty();
    }

    try {
      this.device.open(true);

      for (let inter of this.device.interfaces) {
        if (inter.isKernelDriverActive()) {
          inter.detachKernelDriver();
        }
        inter.claim();
        for (let endpoint of inter.endpoints) {
          if (!this.out && endpoint instanceof usb.OutEndpoint) {
            this.out = endpoint;
          } else if (!this.in && endpoint instanceof usb.InEndpoint) {
            this.in = endpoint;
          }
        }
      }

      if (this.in) {
        this.in.on("data", this.onData);
        this.in.on("error", this.onError);
        try {
          this.in.startPoll();
        } catch (ex) {
          console.warn(ex);
        }
      }
    } catch (ex) {
      throw "Could not open device > " + ex;
    }
  }
  get buttons () {
    return this._buttons;
  }
  get axes () {
    return this._axes;
  }
  get connected() {
    //TODO - more implementation here
    return (
      this.device && !this.getDirty()
    );
  }
  /**Internal - non spec
   * Copies button data from btnConfig
   * Used by usb data parsers
   * @param {*} btnConfig 
   */
  setButtons (btnConfig) {

  }
  /**Internal - non spec
   * Gets if this gamepad is marked as dirty
   * @returns {boolean}
   */
  getDirty () {
    return this._dirty;
  }
  /**Internal - non spec
   * Marks gamepad instance as dirty (broken)
   * Will cause connected to return false
   */
  markDirty () {
    this._dirty = true;
    console.warn("Disconnected gamepad, we need more testing here");
  }
  /**Internal - non spec
   * Tries to add a usb device as gamepad
   * @param {import("usb").Device} dev
   */
  static tryAddDevice(dev) {
    let vendorId = dev.deviceDescriptor.idVendor;
    let productId = dev.deviceDescriptor.idProduct;

    // console.log(`vendorId : ${vendorId}, productId : ${productId} / vendorId : ${vendorId.toString(16)}, productId : ${productId.toString(16)}`);

    let ven = GamepadVendor.matches(vendorId, productId);

    if (ven) {
      try {
        let gp = new Gamepad(dev, ven);
        Gamepad.getGamepads().push(gp);
      } catch (ex) {
        //Skip this one
        console.warn("Could not use device >", ex);
      }
    }
  }
  /**Get all the available gamepads
   * Analog to navigator.getGamepads
   * @returns {Array<Gamepad>}
   */
  static getGamepads() {
    if (!Gamepad.AllGamepads) {
      Gamepad.AllGamepads = new Array();
    }
    return Gamepad.AllGamepads;
  }
  /**Internal - non-spec
   * Get all the loaded gamepads without usb query stuff
   * @returns {Array<Gamepad>}
   */
  static getGamepadsWithNativeQuery() {
    let devs = getNativeUsbs();

    for (let dev of devs) {
      Gamepad.tryAddDevice(dev);
    }
    let result = new Array();
    Gamepad.getGamepads().forEach((gp) => {
      result.push(gp);
    });
    return result;
  }
}

/**
 * Not part of the Gamepad API official specs
 * Used to help identify gamepads for node-gamepad
 */
class GamepadVendor {
  /**Where key is vendorId
   * @type {Array<GamepadVendor>|undefined} internal*/
  static All = undefined;

  /**
   * @param {number} vendorId 
   * @param {number} productId 
   */
  constructor(vendorId, productId, vendorName = "") {
    this.vendorId = vendorId;
    this.productId = productId;
    this.vendorName = vendorName;
  }
  /**Tries to add a vendor (without duplicating)
   * @param {number} vendorId
   * @param {number} productId
   * @param {GamepadVendor|false}
   */
  static tryAdd(vendorId, productId, vendorName = "") {
    GamepadVendor.getAll().forEach((gp) => {
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
      if (ven.vendorId === vendorId && ven.productId === productId) return ven;
    }
    return false;
  }
}

usb.on("attach", (dev) => {
  Gamepad.tryAddDevice(dev);
});

usb.on("detach", (dev) => {
  //Gamepad.tryRemoveDevice(dev);
});

GamepadVendor.loadDefaultVendors();

Gamepad.getGamepadsWithNativeQuery();

module.exports = {
  Gamepad, GamepadVendor, GamepadButton
};
