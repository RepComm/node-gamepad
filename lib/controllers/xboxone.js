
//https://github.com/lloeki/xbox_one_controller/blob/master/xbox_one_controller/xbox_one_controller_packet.h

const MSG_TYPE_BTN = 0x20;
const MSG_TYPE_X = 0x07;

let getBit = (val, pos)=> {
  return (val >> pos) & 1;
}

/**@param {Gamepad} gamepad 
 * @param {Buffer} data 
 */
module.exports = function parseData (gamepad, data) {
  let head = {
    type:data[0],
    counter:data[2],
    len:data[3]
  }

  if (head.type === MSG_TYPE_BTN) {
    //https://w3c.github.io/gamepad/#remapping
    let btns = {
      0:getBit(data[4], 4), //A
      1:getBit(data[4], 5), //B
      2:getBit(data[4], 6), //X
      3:getBit(data[4], 7), //Y

      4:getBit(data[5], 4), //lp
      5:getBit(data[5], 5), //rp

      6:getBit(data[4], 3), //window
      7:getBit(data[4], 2), //list

      8:0 //home
    };
    let axes = {
      6:0,
      7:0
    };

    if (getBit(data[5], 1)) {
      axes[7] = 1;
    } else if (getBit(data[5], 0)) {
      axes[7] = -1;
    } else {
      axes[7] = 0;
    }

    if (getBit(data[5], 2)) {
      axes[6] = -1;
    } else if (getBit(data[5], 3)) {
      axes[6] = 1;
    } else {
      axes[6] = 0;
    }

    console.log(...Object.values(btns));
    // console.log(...Object.values(axes));
    // console.log(data[5]);
  } else {
    //Handle X
  }
}
