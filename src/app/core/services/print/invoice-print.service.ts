import { Injectable } from '@angular/core';
import Invoice from "../../model/invoice";
import {InvoiceService} from "../invoice/invoice.service";
import Room from "../../model/room";
import Currency from "../../model/currency";
import {UtilityService} from "../utility/utility.service";
import {formatCurrency} from '@angular/common';
import moment from "moment";
import {SessionService} from "../session/session.service";
import {SettingsCompanyService} from "../settingsCompany/settings-company.service";
const DEFAULT_CURRENCY = 'MGA';
import {NumberToLetter} from 'convertir-nombre-lettre';
/*import * as pdfMake from 'pdfmake/build/pdfmake.js';*/
import Revenue from "../../model/revenue";
import _filter  from 'lodash/filter';
import _forEach from "lodash/forEach";
import _groupBy from 'lodash/groupBy';
import _cloneDeep from 'lodash/cloneDeep'
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Injectable({
  providedIn: 'root'
})
export class InvoicePrintService {

  constructor(
      private invoiceService: InvoiceService,
      private utilityService: UtilityService,
      private sessionService: SessionService
  ) { }

    buildTableBodyV2(invoice: Invoice, rooms?: Room[], currency?: Currency): Array<any> {
        const table_body = [];

        //  Table header
        table_body.push([
            {text: 'ARTICLE', style: 'table-header', border: [false, true, false, false]},
            {text: 'QUANTITE', style: 'table-header', border: [false, true, false, false], alignment: 'center'},
            {text: 'P.U. HT', style: 'table-header', border: [false, true, false, false], alignment: 'right'},
            {text: 'TOTAL HT', style: 'table-header', border: [false, true, false, false], alignment: 'right'}
        ]);

        const filteredRooms = invoice?.InvoiceItems.filter(item => {
            return item.item_id !== null && item.item_type === 'ROOM';
        });

        _forEach(filteredRooms, item => {
            const meta = item.description ? '\n' + item.description : '';

            table_body.push([
                {text: item.name + meta, style: 'table-cell', fontSize: 9},
                {text: item.quantity, style: 'table-cell', alignment: 'center', fontSize: 9},
                {text: this.utilityService.numberFormat(item.price), style: 'table-cell', alignment: 'right', fontSize: 9},
                {text: this.utilityService.numberFormat(item.quantity * item.price), style: 'table-cell', alignment: 'right', fontSize: 9}
            ]);
        });

        const filteredItemsId = _filter(invoice?.InvoiceItems, item => item.item_id !== null && item.item_type !== 'ROOM');
        const groupedItems = _groupBy(filteredItemsId, 'item_id');

        _forEach(groupedItems, items => {
            let row: any;

            _forEach(items, (item, index) => {
                if (index === 0) {
                    row = item;
                }
                else {
                    row['quantity'] += item.quantity;
                    row['total'] += item.total;
                }
            });

            const meta = row.description ? '\n' + row.description : '';

            table_body.push([
                {text: row.name + meta, style: 'table-cell', fontSize: 9},
                {text: row.quantity, style: 'table-cell', alignment: 'center', fontSize: 9},
                {text: this.utilityService.numberFormat(row.price), style: 'table-cell', alignment: 'right', fontSize: 9},
                {text: this.utilityService.numberFormat(row.quantity * row.price), style: 'table-cell', alignment: 'right', fontSize: 9}
            ]);
        });

        const filteredItems = _filter(invoice?.InvoiceItems, {item_id: null});

        _forEach(filteredItems, item => {
            const meta = item.description ? '\n' + item.description : '';

            table_body.push([
                {text: item.name + meta, style: 'table-cell', fontSize: 9},
                {text: item.quantity, style: 'table-cell', alignment: 'center', fontSize: 9},
                {text: this.utilityService.numberFormat(item.price), style: 'table-cell', alignment: 'right', fontSize: 9},
                {text: this.utilityService.numberFormat(item.quantity * item.price), style: 'table-cell', alignment: 'right', fontSize: 9}
            ]);
        });

        return table_body;
    }

    invoiceV2(inv: Invoice, doNotPrint?): any {
        const invoice = _cloneDeep(inv);
        const invoice_number = invoice?.invoice_number;
        const invoice_type = invoice?.status === 'DRAFT' ? 'Facture proforma' : 'Facture'; // draft = PROFORMA
        const table_body = this.buildTableBodyV2(invoice);
        const user = this.sessionService.getUser();
        const str_print = 'Imprimé ce ' + moment().format('DD MMM YYYY HH:mm') + ' par ' + user?.name;
        const company = this.company();
        const total_due = this.invoiceService.getPaymentDue(invoice?.InvoiceItems);
        const total_payment = this.invoiceService.getTotalPayment(invoice);
        const total_discount = this.invoiceService.getTotalDiscount(invoice?.InvoiceItems);
        const total_tax = this.invoiceService.getTotalTax(invoice?.InvoiceItems);
        const total_ttc = total_due + total_tax - total_discount;
        const balance = total_ttc - total_payment;

        const mx = 75;

        let revenues: Revenue[] = invoice?.Revenues;

        const revenueLabelContent = revenues?.map(revenue => {
            return {
                /*text: this.translateService.instant('payment.' + revenue.payment_method) + '\n' + moment(revenue.paid_at).format('DD/MM/YYYY') + '\n\n'*/
            }
        });

        const revenueAmountContent = revenues?.map(revenue => {
            return {
                text: this.utilityService.numberFormat(revenue.amount) + '\n\n\n'
            }
        });

        const dd = {
            footer: (currentPage, pageCount) => {
                return [
                    /* {
                      canvas: [
                        {
                          type: 'line',
                          x1: 40, y1: 0,
                          x2: 555, y2: 0,
                          lineWidth: 1
                        }
                      ]
                    }, */
                    {
                        fontSize: 9,
                        columns: [
                            {
                                width: '*',
                                border: [false, true, false, false],
                                margin: [40, 0, 0, 0],
                                alignment: 'left',
                                text: [
                                    str_print
                                ]
                            },
                            {
                                width: 120,
                                margin: [0, 0, 40, 0],
                                alignment: 'right',
                                text: currentPage.toString() + '/' + pageCount.toString()
                            }
                        ]
                    }
                ];
            },
            pageSize: 'A4',
            pageMargins: [40, 30, 40, 18],
            watermark: {
                text: company?.name,
                opacity: 0.04
            },
            content: [
                {
                    columns: [
                        {
                            width: '*',
                            columns: [
                                {
                                    width: 43,
                                    qr: (invoice?.id).toString(),
                                    fit: 43
                                },
                                {
                                    width: '*',
                                    text: invoice_type,
                                    bold: true,
                                    margin: [10, 8, 0, 0],
                                    fontSize: 20
                                }
                            ]
                        },
                        {
                            width: 220,
                            columns: [
                                {
                                    width: '*',
                                    text: [
                                        {text: 'ID: \n'},
                                        {text: 'N°: \n'},
                                        {text: 'Date: \n'},
                                        {text: 'Echéance: '}
                                    ]
                                },
                                {
                                    width: '*',
                                    text: [
                                        {text: invoice?.id + '\n', bold: true},
                                        {text: invoice_number + '\n', bold: true},
                                        {text: moment(invoice?.invoiced_at).format('DD/MM/YYYY') + '\n', bold: true},
                                        {text: moment(invoice?.due_at).format('DD/MM/YYYY') + '\n', bold: true}
                                    ]
                                }
                            ],
                            fontSize: 9
                        }
                    ]
                },
                {text: '', style: 'separator-xxs'},
                {
                    canvas: [
                        {
                            type: 'line',
                            x1: 295, y1: 0,
                            x2: 515, y2: 0,
                            lineWidth: 0.45
                        }
                    ]
                },
                {text: '', style: 'separator-xxs'},
                {
                    columns: [
                        {
                            width: '*',
                            text: [
                                {
                                    text: (company?.name).toUpperCase() + '\n',
                                    fontSize: 13
                                },
                                (company?.address_1 || '-') + '\n' + (company?.address_2 || '-') + '\n',
                                'Tel: ' + (company?.phone || '-') + '\n',
                                'Email: ' + (company?.email || '-') + '\n',
                                'NIF: ' + (company?.nif || '-') + '\n',
                                'STAT: ' + (company?.stat || '-')
                            ]
                        },
                        {
                            width: 220,
                            text: [
                                {text: (invoice?.Contact.name || '') + '\n'},
                                {text: invoice?.Contact.address ? invoice?.Contact.address + '\n' : ''},
                                invoice?.Contact.email ? invoice?.Contact.email + '\n' : '',
                                {text: invoice?.Contact.phone ? invoice?.Contact.phone + '\n' : ''},
                                invoice?.Contact.is_business ? 'NIF: ' + (invoice?.Contact.meta.nif || '-') + '\n' : '',
                                invoice?.Contact.is_business ? 'STAT: ' + (invoice?.Contact.meta.stat || '-') + '\n' : ''
                            ]
                        }
                    ]
                },
                {text: '', style: 'separator-sm'},
                {
                    style: 'table',
                    table: {
                        widths: ['*', 70, 100, 100],
                        headerRows: 1,
                        body: table_body
                    },
                    layout: {
                        hLineWidth: function (i, node) {
                            if (i === 1) {
                                return 1;
                            }
                            return 0;
                        },
                        vLineWidth: function (i, node) {
                            return 0;
                        },
                        hLineColor: function (i, node) {
                            if (i === 0 || i === 1 || i === node.table.body.length
                                || i === node.table.body.length - 1) {
                                return 'black';
                            }

                            return '#b3b5b7'; // gray light
                        },
                        vLineColor: function (i, node) {
                            return '#b3b5b7';
                        },
                        hLineStyle: function (i, node) {
                            if (i === 1) {
                                return null;
                            }
                            return {dash: {length: 1}};
                        },
                        vLineStyle: function (i, node) {
                            return null;
                        }
                    }
                },
                {text: '', style: 'separator-md'},
                {
                    canvas: [
                        {
                            type: 'line',
                            x1: mx, y1: 0,
                            x2: 515 - mx, y2: 0,
                            lineWidth: 1
                        }
                    ]
                },
                {text: '', style: 'separator-xxs'},
                {
                    margin: [mx, 0, mx, 0],
                    columns: [
                        {
                            width: '*',
                            text: [
                                {
                                    text: 'Total HT\n'
                                },
                                {
                                    text: 'Taxe\n'
                                },
                                {
                                    text: 'Remise\n'
                                },
                                {
                                    text: 'Total TTC\n',
                                    bold: true
                                },
                                {
                                    text: 'Montant Payé\n\n'
                                }
                            ]
                        },
                        {
                            width: '*',
                            alignment: 'right',
                            text: [
                                {
                                    text: (this.utilityService.numberFormat(total_due) || '-') + '\n'
                                },
                                {
                                    text: (total_tax ? this.utilityService.numberFormat(total_tax) : '-') + '\n'
                                },
                                {
                                    text: (total_discount ? this.utilityService.numberFormat(total_discount) : '-') + '\n'
                                },
                                {
                                    text: (this.utilityService.numberFormat(total_ttc) || '-') + '\n',
                                    bold: true
                                },
                                {
                                    text: this.utilityService.numberFormat(total_payment) + '\n\n'
                                }
                            ]
                        }
                    ]
                },
                {text: '', style: 'separator-xs'},
                {
                    margin: [mx, 0, mx, 3],
                    text: 'Paiement(s): ',
                    bold: true
                },
                {
                    canvas: [
                        {
                            type: 'line',
                            x1: mx, y1: 0,
                            x2: 515 - mx, y2: 0,
                            lineWidth: 1,
                            dash: {
                                length: 1,
                                space: 2
                            }
                        }
                    ]
                },
                {text: '', style: 'separator-xxs'},
                revenueLabelContent.length ? {
                    margin: [mx, 0, mx, 0],
                    columns: [
                        {
                            width: '*',
                            text: [
                                ...revenueLabelContent,
                                {
                                    text: '\n\nReste à payer',
                                    bold: true
                                }
                            ]
                        },
                        {
                            width: '*',
                            alignment: 'right',
                            text: [
                                ...revenueAmountContent,
                                {
                                    text: '\n\n' + (this.utilityService.numberFormat(balance) || '-'),
                                    bold: true
                                }
                            ]
                        }
                    ]
                } : {
                    margin: [mx, 0, mx, 0],
                    text: 'Aucun paiement enregistré'
                },
                {text: '', style: 'separator-xs'},
                {
                    canvas: [
                        {
                            type: 'line',
                            x1: mx, y1: 0,
                            x2: 515 - mx, y2: 0,
                            lineWidth: 1
                        }
                    ]
                },
                {text: '', style: 'separator-md'},
                {text: '', style: 'separator-md'},
                {
                    text: invoice?.notes
                }
            ],
            defaultStyle: {
                fontSize: 10
            },
            styles: {
                'separator-xxs': {
                    margin: [0, 4, 0, 2]
                },
                'separator-xs': {
                    margin: [0, 10]
                },
                'separator-sm': {
                    margin: [0, 20]
                },
                'separator-md': {
                    margin: [0, 25]
                },
                table: {
                    margin: 0
                },
                'table-header': {
                    bold: true,
                    margin: 7
                },
                'table-cell': {
                    margin: 7
                }
            },
            /*images: {
                logo: ImageService.logo,
                signature: ImageService.signature
            }*/
        };

        if (!doNotPrint) pdfMake.createPdf(dd).print();

        return dd;
    }
    company: any = () => {
        return JSON.parse(sessionStorage.getItem(SettingsCompanyService.KEY));
    };

    receipt(invoice: Invoice) {
        const arrival_station = invoice?.InvoiceItems[0].name.toUpperCase();
        const seats = invoice?.InvoiceItems.length;
        const str_client = invoice?.Contact.name;
        const str_copyright = 'Powered by CAPSULE IO Finance Technology';
        const str_station = this.company().name;
        const title = [
            {
                text: str_station,
                bold: true,
                fontSize: 12
            },
            {
                text: '\n' + str_copyright
            },
            {
                text: '\n N° ' + invoice?.id,
                fontSize: 12,
                bold: true
            }
        ];
        const str_departure_date = moment(invoice?.due_at).format('DD/MM/YYYY');
        const str_invoice = 'N° ' + invoice?.id;
        const str_phone = this.utilityService.phoneFormat(invoice?.Contact.phone);
        const str_timestamp = moment().format('DD/MM/YYYY \à HH:mm');
        const str_user = 'Imprimé par ' + this.sessionService.getUser().name;
        const str_footer = str_user + '\n' + str_timestamp + ' - ' + str_invoice;
        const payment_due = this.formatCurrency(invoice?.amount, 'Ar');

        const docDefinition = {
            watermark: {
                text: str_station,
                opacity: 0.05
            },
            pageSize: {
                width: 226,
                height: 'auto'
            },
            pageMargins: [5, 15],
            content: [
                {
                    text: title,
                    alignment: 'center',
                    margin: [0, 0, 0, 5]
                },
                {
                    table: {
                        widths: [45, '*'],
                        body: [
                            [
                                {
                                    rowSpan: 2,
                                    qr: invoice?.id.toString(),
                                    fit: 43,
                                    alignment: 'center',
                                    margin: [0, 5, 0, 0],
                                    border: [false, false, false, false]
                                },
                                {
                                    text: [
                                        {
                                            text: 'Destination : \n'
                                        },
                                        {
                                            text: arrival_station,
                                            fontSize: 12,
                                            bold: true
                                        }
                                    ],
                                    border: [false, true, false, true]
                                }
                            ],
                            [
                                '',
                                {
                                    text: [
                                        {
                                            text: 'Date : \n'
                                        },
                                        {
                                            text: str_departure_date,
                                            fontSize: 12,
                                            bold: true
                                        }
                                    ],
                                    border: [false, false, false, true]
                                }
                            ]
                        ]
                    }
                },
                {
                    table: {
                        widths: ['*', '*'],
                        body: [
                            [
                                {
                                    colSpan: 2,
                                    text: [
                                        {
                                            text: 'Nom : \n'
                                        },
                                        {
                                            text: str_client,
                                            style: 'value'
                                        }
                                    ],
                                    border: [false, false, false, true]
                                },
                                ''
                            ],
                            [
                                {
                                    text: [
                                        {
                                            text: 'Tél : \n'
                                        },
                                        {
                                            text: str_phone,
                                            style: 'value'
                                        }
                                    ],
                                    border: [false, false, false, true]
                                },
                                {
                                    text: [
                                        {
                                            text: 'Places : \n'
                                        },
                                        {
                                            text: seats,
                                            style: 'value'
                                        }
                                    ],
                                    border: [false, false, false, true]
                                }
                            ],
                            [
                                {
                                    text: [
                                        {
                                            text: 'Montant : \n'
                                        },
                                        {
                                            text: payment_due,
                                            style: 'value'
                                        }
                                    ],
                                    border: [false, false, false, true]
                                },
                                {
                                    text: [
                                        {
                                            text: 'N° Ticket : \n'
                                        },
                                        {
                                            text: invoice?.id,
                                            style: 'value'
                                        }
                                    ],
                                    border: [false, false, false, true]
                                }
                            ]
                        ]
                    }
                },
                {
                    text: str_footer,
                    alignment: 'center',
                    margin: [0, 10, 0, 0]
                }
            ],
            /*images: {
                logo: ImageService.logo
            },*/
            defaultStyle: {
                fontSize: 8
            },
            styles: {
                label: {
                    margin: [0, 0, 0, 2]
                },
                value: {
                    fontSize: 10,
                    bold: true
                }
            }
        };

        pdfMake.createPdf(docDefinition).print();
    }
    public static formatCurrency(number, symbol?: string, currency_code?: string) {
        return formatCurrency(number, 'fr-FR', symbol || '', currency_code || 'MGA');
    }
    private formatCurrency(number, symbol?: string, currency_code?: string) {
        return formatCurrency(number, 'fr-FR', symbol || '', currency_code || DEFAULT_CURRENCY);
    }
    buildTableBody(invoice: Invoice, rooms?: Room[], currency?: Currency): Array<any> {
        let table_body = [];
        const total_due = this.invoiceService.getPaymentDue(invoice?.InvoiceItems, rooms);
        const total_payment = this.invoiceService.getTotalPayment(invoice);
        const total_discount = this.invoiceService.getTotalDiscount(invoice?.InvoiceItems);
        const total_tax = this.invoiceService.getTotalTax(invoice?.InvoiceItems);
        const balance = total_due + total_tax - total_discount - total_payment;

        //  Table header
        table_body.push([
            {text: 'PRODUIT', style: 'table-header', border: [false, true, false, false]},
            {text: 'QUANTITE', style: 'table-header', border: [false, true, false, false], alignment: 'center'},
            {text: 'PRIX', style: 'table-header', border: [false, true, false, false], alignment: 'right'},
            {text: 'TOTAL', style: 'table-header', border: [false, true, false, false], alignment: 'right'}
        ]);

        const filteredRooms = invoice?.InvoiceItems.filter(item => {
            return item.item_id !== null && item.item_type === 'ROOM';
        });

        _forEach(filteredRooms, item => {
            const meta = item.description ? '\n' + item.description : '';

            table_body.push([
                {text: item.name + meta, style: 'table-cell'},
                {text: item.quantity, style: 'table-cell', alignment: 'center'},
                {text: this.utilityService.numberFormat(item.price), style: 'table-cell', alignment: 'right'},
                {text: this.utilityService.numberFormat(item.quantity * item.price), style: 'table-cell', alignment: 'right'}
            ]);
        });

        const filteredItemsId = _filter(invoice?.InvoiceItems, item => item.item_id !== null && item.item_type !== 'ROOM');
        const groupedItems = _groupBy(filteredItemsId, 'item_id');

        _forEach(groupedItems, items => {
            let row: any;

            _forEach(items, (item, index) => {
                if (index === 0) {
                    row = item;
                }
                else {
                    row['quantity'] += item.quantity;
                    row['total'] += item.total;
                }
            });

            const meta = row.description ? '\n' + row.description : '';

            table_body.push([
                {text: row.name + meta, style: 'table-cell'},
                {text: row.quantity, style: 'table-cell', alignment: 'center'},
                {text: this.utilityService.numberFormat(row.price), style: 'table-cell', alignment: 'right'},
                {text: this.utilityService.numberFormat(row.quantity * row.price), style: 'table-cell', alignment: 'right'}
            ]);
        });

        const filteredItems = _filter(invoice?.InvoiceItems, {item_id: null});

        _forEach(filteredItems, item => {
            const meta = item.description ? '\n' + item.description : '';

            table_body.push([
                {text: item.name + meta, style: 'table-cell'},
                {text: item.quantity, style: 'table-cell', alignment: 'center'},
                {text: this.utilityService.numberFormat(item.price), style: 'table-cell', alignment: 'right'},
                {text: this.utilityService.numberFormat(item.quantity * item.price), style: 'table-cell', alignment: 'right'}
            ]);
        });


        //  Table summary
        const discountBody = new Array();
        let discountCount = 0;

        _forEach(invoice?.InvoiceItems, item => {
            _forEach(item.Taxes, tax => {
                if (tax.type === 'DISCOUNT') {
                    discountBody.push([
                        '',
                        '',
                        {
                            text: `${tax.name} :`,
                            style: 'table-cell',
                            border: [false, false, false, true],
                            bold: true
                        },
                        {
                            text: this.utilityService.numberFormat((item.price * item.quantity) * tax.rate / 100),
                            style: 'table-cell',
                            border: [false, false, false, true],
                            alignment: 'right',
                            bold: true
                        }
                    ]);

                    discountCount++;
                }
            });
        });

        table_body.push([
            {
                text: '',
                colSpan: 2,
                alignment: 'center',
                style: 'table-cell',
                border: [false, false, false, false]
            },
            '',
            {
                text: 'Sous Total :',
                style: 'table-cell',
                border: [false, false, false, true],
                bold: true
            },
            {
                text: this.utilityService.numberFormat(total_due),
                style: 'table-cell',
                border: [false, false, false, true],
                alignment: 'right'
            }
        ]);

        table_body.push([
            {
                colSpan: 2,
                rowSpan: 3 + discountCount,
                text: '',
                style: 'table-cell',
                border: [false, false, false, false]
            },
            '',
            {
                text: 'Taxe :',
                style: 'table-cell',
                border: [false, false, false, true],
                bold: true
            },
            {
                text: total_tax ? this.utilityService.numberFormat(total_tax) : '-',
                style: 'table-cell',
                border: [false, false, false, true],
                alignment: 'right'
            }
        ]);

        table_body = table_body.concat(discountBody);

        table_body.push([
            '',
            '',
            {
                text: 'Payé :',
                style: 'table-cell',
                border: [false, false, false, true],
                bold: true
            },
            {
                text: this.formatCurrency(total_payment, ''),
                style: 'table-cell',
                border: [false, false, false, true],
                alignment: 'right'
            }
        ]);
        table_body.push([
            '',
            '',
            {
                text: 'Reste à payer :',
                style: 'table-cell',
                border: [false, false, false, true],
                bold: true
            },
            {
                text: this.formatCurrency(balance, 'Ar'),
                style: 'table-cell',
                border: [false, false, false, true],
                alignment: 'right', bold: true
            }
        ]);

        return table_body;
    }
    invoice(inv: Invoice, doNotPrint?): any {
        const invoice = _cloneDeep(inv);
        const total_due = this.invoiceService.getPaymentDue(invoice?.InvoiceItems);
        const total_payment = this.invoiceService.getTotalPayment(invoice);
        const total_discount = this.invoiceService.getTotalDiscount(invoice?.InvoiceItems);
        const total_tax = this.invoiceService.getTotalTax(invoice?.InvoiceItems);
        const balance = total_due + total_tax - total_discount - total_payment;

        const invoice_number = invoice?.id;
        const invoice_type = invoice?.Revenues.length > 0 ? 'FACTURE' : 'PROFORMA';
        const table_body = this.buildTableBody(invoice);
        const user = this.sessionService.getUser();
        const str_print = 'Imprimé ce ' + moment().format('DD MMM YYYY HH:mm') + ' par ' + user.name;

        const dd = {
            footer: {
                fontSize: 9,
                table: {
                    widths: '*',
                    body: [
                        [
                            {
                                border: [false, true, false, false],
                                alignment: 'center',
                                text: [
                                    this.company().nif ? ('NIF: ' + this.company().nif + ' - ') : '',
                                    this.company().stat ? ('N° STAT: ' + this.company().stat + ' - ') : '',
                                    this.company().rcs ? ('RCS: ' + this.company().rcs + ' - ') : '',
                                    str_print
                                ]
                            }
                        ]
                    ]
                }
            },
            pageSize: 'A4',
            pageMargins: [40, 30, 40, 18],
            watermark: {
                text: this.company().name,
                opacity: 0.04
            },
            content: [
                {
                    columns: [
                        {
                            width: '*',
                            text: ''
                        },
                        {
                            width: 100,
                            image: 'logo',
                            alignment: 'right',
                            margin: [0, 0, 20, 0]
                        }
                    ]
                },
                {text: '', style: 'separator-xs'},
                {
                    columns: [
                        {
                            width: '*',
                            text: invoice_type,
                            bold: true,
                            fontSize: 20
                        },
                        {
                            width: 190,
                            text: [
                                {
                                    text: (this.company().name).toUpperCase() + '\n',
                                    alignment: 'center',
                                    bold: true,
                                    fontSize: 13
                                },
                                this.company().phone + '\n',
                                this.company().email + '\n',
                                this.company().address_1 + '\n' + this.company().address_2,
                                /* 'NIF : ' + this.company().nif + '\n',
                                'STAT : ' + this.company().stat */
                            ],
                            alignment: 'center'
                        }
                    ]
                },
                {text: '', style: 'separator-xs'},
                {
                    canvas: [
                        {
                            type: 'line',
                            x1: 0, y1: 0,
                            x2: 515, y2: 0,
                            lineWidth: 1.5
                        }
                    ]
                },
                {text: '', style: 'separator-xs'},
                {
                    columns: [
                        {
                            width: '*',
                            text: [
                                {text: (invoice?.Contact.name || '') + '\n'},
                                {text: (invoice?.Contact.phone || '') + '\n'},
                                invoice?.Contact.email ? invoice?.Contact.email + '\n' : '',
                                {text: (invoice?.Contact.address || '') + '\n'},
                                invoice?.Contact.is_business ? 'NIF: ' + (invoice?.Contact.meta.nif || '-') + '\n' : '',
                                invoice?.Contact.is_business ? 'STAT: ' + (invoice?.Contact.meta.stat || '-') + '\n' : ''
                            ]
                        },
                        {
                            width: 220,
                            columns: [
                                {
                                    width: '*',
                                    text: [
                                        {text: 'N°\n', alignment: 'left', bold: true},
                                        {text: 'Date de facturation\n', alignment: 'left'},
                                        {text: 'Date d\'échéance\n', alignment: 'left'},
                                        {text: 'Montant total', alignment: 'left'}
                                    ]
                                },
                                {
                                    width: '*',
                                    text: [
                                        {text: ' : ' + invoice_number + '\n', bold: true},
                                        {text: ' : ' + moment(invoice?.invoiced_at).format('DD MMMM YYYY') + '\n'},
                                        {text: ' : ' + moment(invoice?.due_at).format('DD MMMM YYYY') + '\n'},
                                        {text: ' : ' + this.formatCurrency(balance, 'Ar', 'MGA')}
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {text: '', style: 'separator-xs'},
                /* {
                  canvas: [
                    {
                      type: 'line',
                      x1: 0, y1: 0,
                      x2: 515, y2: 0,
                      lineWidth: 1.5
                    }
                  ]
                },
                { text: '', style: 'separator-xs' }, */
                {
                    style: 'table',
                    table: {
                        widths: ['*', 70, 100, 100],
                        headerRows: 1,
                        body: table_body
                    },
                    layout: {
                        hLineWidth: function (i, node) {
                            if (i === 0) {
                                return 0;
                            }
                            return 1;
                        },
                        vLineWidth: function (i, node) {
                            if (i === 0 || i === node.table.widths.length) {
                                return 0;
                            }

                            return 1;
                        },
                        hLineColor: function (i, node) {
                            if (i === 0 || i === 1 || i === node.table.body.length
                                || i === node.table.body.length - 1) {
                                return 'black';
                            }

                            return '#b3b5b7'; // gray light
                        },
                        vLineColor: function (i, node) {
                            return '#b3b5b7';
                        },
                        hLineStyle: function (i, node) {
                            if (i === 0 || i === 1 || i === node.table.body.length
                                || i === (node.table.body.length - 1)) {
                                return null;
                            }
                            return {dash: {length: 2}};
                        },
                        vLineStyle: function (i, node) {
                            if (i === 0 || i === node.table.widths.length) {
                                return null;
                            }
                            return {dash: {length: 2}};
                        }
                    }
                },
                {text: '', style: 'separator-sm'},
                {
                    text: [
                        {text: 'Arrêté la présente ' + invoice_type.toLowerCase() + ' à la somme de : '},
                        {text: '"' + NumberToLetter(balance) + ' ariary"', bold: true}
                    ]
                },
                {text: '', style: 'separator-sm'},
                {
                    text: 'Le responsable',
                    margin: [0, 0, 55, 0],
                    alignment: 'right'
                },
                this.company().signature ? {
                    width: 115,
                    image: 'signature',
                    alignment: 'right',
                    margin: [0, 0, 15, 0]
                } : ''
                /* { text: '', style: 'separator-sm' },
                {
                  columns: [
                    {
                      width: '50%',
                      text: [
                        { text: 'NOTE\n\n', alignment: 'left', bold: true },
                        { text: 'Terme de paiement : \n', alignment: 'left' },
                        { text: 'Délai de paiement : \n', alignment: 'left' }
                      ],
                      alignment: 'center',
                      margin: [0, 0, 20, 0]
                    },
                    {
                      width: '50%',
                      text: [
                        { text: '', style: 'separator-xs' },
                        { text: (user.Position ? user.Position.title : 'Le responsable') + ',\n\n\n\n\n\n', margin: [0, 0, 20, 0], alignment: 'center' },
                        { text: user.name, alignment: 'center' }
                      ]
                    }
                  ]
                } */
            ],
            defaultStyle: {
                fontSize: 11
            },
            styles: {
                'separator-xs': {
                    margin: [0, 10]
                },
                'separator-sm': {
                    margin: [0, 20]
                },
                table: {
                    margin: 0
                },
                'table-header': {
                    bold: true,
                    margin: 7
                },
                'table-cell': {
                    margin: 7
                }
            },
            /*images: {
                logo: ImageService.logo,
                signature: ImageService.signature
            }*/
        };

        if (!doNotPrint) pdfMake.createPdf(dd).print();

        return dd;
    }
}
