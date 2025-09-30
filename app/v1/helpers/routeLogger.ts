import consoleColors from "../enum/consoleColors";

export default function (
  method: "get" | "post" | "put" | "delete",
  endpoint: string
) {
  console.log(
    `${consoleColors.yellowColor}  ${consoleColors.brightColor}  ${consoleColors.hiddenColor}  ${consoleColors.greenColor}`,
    " ROUTE ",
    method,
    "==>",
    endpoint
  );
}
