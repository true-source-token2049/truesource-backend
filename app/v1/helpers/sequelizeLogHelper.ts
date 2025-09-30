import consoleColors from "../enum/consoleColors";

let log = false;

export default (msg: string) => {
  if (log) {
    console.log(consoleColors.cyanColor, msg);
  }
};

export const setLogger = (value: boolean = true) => {
  log = true;
};
