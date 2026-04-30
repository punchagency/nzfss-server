interface FormDetails {
    applicantName: string;
    formType: string;
    email: string;
    phone: string;
}
export declare class EmailService {
    private transporter;
    private config;
    private initializationPromise;
    constructor();
    private validateAndGetConfig;
    private initializeTransporter;
    private ensureTransporter;
    sendFormNotification(clubEmail: string, formDetails: FormDetails): Promise<void>;
    sendGenericNotification(to: string, subject: string, message: string): Promise<void>;
}
export {};
