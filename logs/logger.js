import { format, createLogger, transports } from "winston";
const { combine, timestamp, label, printf, prettyPrint } = format;

export let saveLog = (teste)=>{
  return  createLogger({
    level: "debug",
    format: combine(
      timestamp({
          format: "DD-MM-YYYY HH:mm:ss",
        }),
      format.json(),
      prettyPrint()
    ),
    
    transports: [
      //new transports:
      new transports.File({
        filename:teste,
      }),
    ],
  });
  
}