export enum TransactionTypeEnum { Sale, Purchase, CreditNote, PaymentIn }

export enum TimeFilterEnum {
    All, CurMonth, LastMonth, CurQuarter, CurYear, Custom
};

export interface Transaction {
    invoicenumber: number
    invoicedate: string
    customername: string
    typeofpay: string
    paymenttype: string
    total: number
    balance: number
    paymentstatus: string
}