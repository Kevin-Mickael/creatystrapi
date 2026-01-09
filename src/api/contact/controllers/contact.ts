export default {
    async send(ctx: any) {
        const { name, email, message, subject } = ctx.request.body;

        if (!email || !message) {
            return ctx.badRequest('Email and message are required');
        }

        try {
            const apiKey = process.env.BREVO_API_KEY;

            const response = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'content-type': 'application/json',
                    'api-key': apiKey as string,
                },
                body: JSON.stringify({
                    sender: { name: "Creaty Website", email: "support@creatymu.org" },
                    to: [{ email: "support@creatymu.org" }],
                    subject: subject || `New Contact Form Submission from ${name || email}`,
                    htmlContent: `
            <h3>New Message from Creaty Website</h3>
            <p><strong>Name:</strong> ${name || 'Not provided'}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject || 'General Inquiry'}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
          `,
                    replyTo: { email },
                }),
            });

            const data: any = await response.json();

            if (response.ok) {
                return {
                    success: true,
                    message: 'Your message has been sent successfully.',
                };
            } else {
                console.error('Brevo SMTP Error:', data);
                return ctx.badRequest(data.message || 'An error occurred while sending the message.');
            }
        } catch (err: any) {
            console.error('Contact Controller Error:', err);
            return ctx.internalServerError(err.message || 'Failed to send message.');
        }
    },
};
