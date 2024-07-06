export enum TransactionTypeEnum { Sale, Purchase, CreditNote, PaymentIn }

export enum TimeFilterEnum {
    All, CurMonth, LastMonth, CurQuarter, CurYear, Custom
};

export interface ColumnInfo {
    columnName: string,
    isColoured: boolean,
    identifier: string,
    positiveIcon?: string,
    negativeIcon?: string,
}

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

export interface Customer {
    id: number,
    name: string
    phonenumber: number
    balance: number
    billingaddress: string
}

export interface TransactionItem {
    id: number,
    item: string,
    quantity: number,
    unit: string,
    price: number,
    discountPercent: number,
    discountAmount: number,
    taxPercent: number,
    taxAmount: number,
    totalAmount: number
}

export interface Party {
    partyname: string,
    phonenumber: number,
    billingaddress: string,
    shipppingaddress: string,
    creditlimit: number,
    topayparty: number,
    toreceivefromparty: number,
}

export interface TransactionDetails {
    typeofpay: string
    invoicedate: string
    stateofsupply: string
    paymenttype: string
    total: number
    received: number
    balance: number
    customername: string
    phonenumber: number
    billingaddress: string
    shippingaddress: string
    status: string
    invoicenumbercount: number
    topayparty: number
    toreceivefromparty: number
    itemdetailslist: ItemDetail[]
}

export interface ItemDetail {
    item: string
    qty: number
    unit: string
    priceperunit: number
    transactionid: number
    taxrate: string
    taxrateamount: number
    discountpercent: number
    discountamount: number
    remainingquantity: number
}

export interface Item {
    itemname: string,
    remainingquantity: number,
    saleprice: number,
    purchaseprice: number,
    wholesaleprice: number,
    minimumwholesalequantity: number,
    discountonsaleprice: number,
    percentageoramounttype: any,
    baseunit: string,

    [index: string]: string | number;
}

export interface Typeofpaytransaction {
    invoicenumber: number
    invoicedate: string
    customername: string
    typeofpay: string
    paymenttype: string
    total: number
    balance: number
    paymentstatus: string
}

export interface LinkedTransaction {
    invoicedate: string;
    typeofpay: string;
    invoicenumber: number;
    total: number;
    balance: number;
    topayparty: number; // Assuming this is the field from party table
    toreceivefromparty: number;
    linkedAmount: number;
    disabled: boolean;
    originalLinkedAmount: number;
    originalBalance: number;
    unused: number;
    registeredphonenumber: number;
    customername: string;
}

export interface PaymentInOut {
    invoicenumber: any;
    received: number;
    paymenttype: string;
    customername: string;
    typeofpay: string;
    registeredphonenumber: number;
}

// ---------------- Request - Response Models ------------------

export interface LoginReponse {
    status: string
    statusMessage: string
    accessToken: string
    expiryDate: string
}

export interface LoginRequest {
    phonenumber: number
    password: string
}


export interface PartyListRs {
    getPartyList: Party[],
}

export interface GetPartyTransactionDetailsRq {
    registeredphonenumber: number
    invoicenumber: number
    typeofpay: string
    issaleconvert: boolean
    issaleorderconvert: boolean
}

export interface ItemListRs {
    getItemList: Item[]
}

export interface GetTypeOfPayTransactionsRq {
    status: string
    invoicenumbercount: number
    typeofpaytransactionlist: Typeofpaytransaction[]
}

export interface SaveUpdateTransactionRq {
    typeofpay: string
    invoicenumber: number
    invoicedate: string
    stateofsupply: any
    paymenttype: any
    total: number
    received: number
    balance: number
    customername: any
    phonenumber: number
    registeredphonenumber: number
    topayparty: number
    toreceivefromparty: number
    partybalance: number
    billingaddress: string
    shippingaddress: string
    paymentstatus: any
    isconvert: boolean
    isupdate: boolean
    itemdetailslist: Itemdetailslist[]
}

interface Itemdetailslist {
    item: any
    qty: number
    unit: any
    priceperunit: number
    remainingquantity: number
    queryoperationtype: any
    taxrate: any
    taxrateamount: number
    transactionid: number
    discountpercent: number
    discountamount: number
}
