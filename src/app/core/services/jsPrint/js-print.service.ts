import { Injectable } from '@angular/core';
import moment from "moment";

@Injectable({
  providedIn: 'root'
})
export class JsPrintService {

  constructor() { }

    PrinterStatus = () => {
        /*if (JSPrintManager.websocket_status === WSStatus.Open) {
            return true;
        } else if (JSPrintManager.websocket_status === WSStatus.Closed) {
            return false;
        } else if (JSPrintManager.websocket_status === WSStatus.BlackListed) {
            return false;
        }*/
    };
    printCashReceipt(body: JsPrintBody) {
        /*if (this.PrinterStatus()) {
            const cpj = new ClientPrintJob();
            // User default printer
            cpj.clientPrinter = new DefaultPrinter();

            const esc = '\x1B'; //ESC byte in hex notation
            const newLine = '\x0A'; //LF byte in hex notation
            const cut = '\x1B\x6D';

            let cmds = esc + '@'; //Initializes the printer (ESC @)
            cmds += newLine;
            cmds += esc + '!' + '\x38'; //Emphasized + Double-height + Double-width mode selected (ESC ! (8 + 16 + 32)) 56 dec => 38 hex
            cmds += `${body.type} #${body.id.toString()}`; //text to print
            cmds += newLine;
            cmds += esc + '!' + '\x00'; //Character font A selected (ESC ! 0)
            cmds += `MOTIF    :   ${body.category_name + newLine}`;
            cmds += `NOTE     :   ${body.description + newLine}`;
            cmds += `BENEF.   :   ${body.contact_name + newLine}`;
            cmds += `ARRETE   :   Ar ${body.amount + newLine}`;
            cmds += `CAISSE   :   ${body.account_name + newLine}`;
            cmds += `CAISSIER :   ${body.user_name + newLine}`;
            cmds += `DATE     :   ${moment().format('YYYY-MM-DD H:mm:ss') + newLine}`;
            cmds += 'SIGNATURE';
            cmds += newLine + newLine + newLine + newLine + newLine;
            cmds += newLine + newLine + newLine;
            cmds += cut;

            if (body.type !== 'CREDIT') cmds += cmds;

            cpj.printerCommands = cmds;

            // Send print job to printer!
            cpj.sendToClient();
        }*/
    }
}
interface JsPrintBody {
    id: number,
    account_name: string,
    amount: number,
    category_name: string,
    contact_name: string,
    description: string,
    paid_at: string,
    type: 'DEBIT' | 'CREDIT' | 'TRANSFER',
    user_name: string
}
