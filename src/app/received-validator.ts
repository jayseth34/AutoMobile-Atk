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
