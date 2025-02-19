export class Device {
    async autoReadSmsOtp(callback) {
        //feature not supported
        if (!window.AbortController || !navigator.credentials) {
            alert('feature not supported1');
            return;
        }

        return await this.readOtp(callback);
    };

    async readOtp(callback) {
        //feature detection to check if auto detection of OTP SMS functionality is supported by the browser

        // eslint-disable-next-line compat/compat -- Handled via feature detection at the start of this function
        const abortController = new AbortController();
        if (!('OTPCredential' in window) || !('credentials' in navigator)) {
            alert('feature not supported2');
            return;
        }
        // eslint-disable-next-line compat/compat -- Handled via feature detection at the start of this function
        navigator.credentials
            .get({ signal: abortController.signal, otp: { transport: ['sms'] } })
            .then((content) => {
                if (content.code) {
                    callback(content.code);
                }
            })
            .catch(e => {
                alert('error caught: ' +e.message);
            });
    };
}