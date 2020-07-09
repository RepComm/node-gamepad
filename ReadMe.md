# node-gamepad
A partial implementation of the
[Gamepad API](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API) 
for node js

## Purpose
Electron support for Gamepad API is still lacking <br/>
and I need it for [OpenBF](https://github.com/node-openbf-project/node-openbf-client)

This project uses [node-usb](https://github.com/tessel/node-usb)

And I used these references while deving:<br/>
1. [lloeki/xbox_one_controller](https://github.com/lloeki/xbox_one_controller/blob/master/xbox_one_controller/xbox_one_controller_packet.h)
2. [gamepad tester](https://html5gamepad.com/)
3. [usb busy error](https://github.com/tessel/node-usb/issues/174)

## Usage
See `./examples` for more

```javascript
//Analog of navigator.getGamepads();
let gps = Gamepad.getGamepads();

console.log(gps);
```

## Currently implements
1. `Gamepad.getGamepads` - finished
2. `Gamepad` - instancing and most button parsing (not usable just yet)
3. `GamepadButton` - satisfactory
4. `GamepadVendor` - satisfactory

## Status
Nearly ready for alpha testing