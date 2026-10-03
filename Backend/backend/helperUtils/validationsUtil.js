import validator from "validator";

export function validatePhoneNumber(completePhone) {
    if (typeof completePhone !== "string" || !completePhone.trim()) {
        return { valid: false, completePhone: "", reason: "missing_or_invalid_input" };
    }

    completePhone = completePhone.trim();
    const e164Regex = /^\+[1-9]\d{1,14}$/;

    if (!e164Regex.test(completePhone)) {
        return { valid: false, completePhone, reason: "invalid_format" };
    }

    return { valid: true, completePhone };
}
