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

## Usage
See `./examples` for more

```javascript
//Analog of navigator.getGamepads();
let gps = Gamepad.getGamepads();

console.log(gps);
```

## Currently implements
1. `Gamepad.getGamepads`
2. `Gamepad` - bare bones instancing
3. `GamepadVendor` - enough to satisfy

## Status
Not ready for use