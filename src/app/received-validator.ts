import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms"

export const ReceivedValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const totalControl = control.get("total");
    const receivedControl = control.get("received");

    if (totalControl && receivedControl && totalControl.value < receivedControl.value) {
        return {
            received: "Received Amount cannot be greater than Total Amount",
        }
    }
    return null;
}

export const PaymentRefNoValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const typeControl = control.get("type");
    const refNoControl = control.get("refno");

    if(!typeControl || !refNoControl || typeControl.value.length == 0){
        return {
            type: "Payment Type Cannot be empty",
        }
    } else if (typeControl.value !== 'CASH' && refNoControl.value.length == 0){
        return {
            refno: "Reference No cannot be empyt when payment type is not CASH",
        }
    }
    return null;
}
