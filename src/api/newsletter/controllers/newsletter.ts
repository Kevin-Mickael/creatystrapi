export default {
    async subscribe(ctx: any) {
        const { email } = ctx.request.body;

        if (!email) {
            return ctx.badRequest('Email is required');
        }

        try {
            const apiKey = process.env.BREVO_API_KEY;

            // 1. Add/Update Contact in Brevo List
            const contactResponse = await fetch('https://api.brevo.com/v3/contacts', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'content-type': 'application/json',
                    'api-key': apiKey as string,
                },
                body: JSON.stringify({
                    email,
                    listIds: [2], // Default list ID
                    updateEnabled: true,
                }),
            });

            // 2. Send Confirmation Emails via SMTP
            const emailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'content-type': 'application/json',
                    'api-key': apiKey as string,
                },
                body: JSON.stringify({
                    sender: { name: "Creaty", email: "support@creatymu.org" },
                    to: [{ email: email }],
                    subject: "Welcome to Creaty Newsletter!",
                    htmlContent: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #000;">Thank you for subscribing!</h2>
              <p>Hello,</p>
              <p>We're excited to have you on board. You'll now receive our latest news, insights, and special offers directly in your inbox.</p>
              <p>Best regards,<br>The Creaty Team</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="font-size: 12px; color: #888;">You're receiving this because you signed up on our website creatymu.org.</p>
            </div>
          `,
                }),
            });

            // 3. Notify Admin
            await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'content-type': 'application/json',
                    'api-key': apiKey as string,
                },
                body: JSON.stringify({
                    sender: { name: "Creaty System", email: "support@creatymu.org" },
                    to: [{ email: "support@creatymu.org" }],
                    subject: `New Newsletter Subscription: ${email}`,
                    htmlContent: `<p>A new user has just subscribed to the newsletter: <strong>${email}</strong></p>`,
                }),
            });

            if (contactResponse.ok || contactResponse.status === 204) {
                return {
                    success: true,
                    message: 'Thank you for subscribing!',
                };
            } else {
                const errorData: any = await contactResponse.json();
                console.error('Brevo Error:', errorData);
                return ctx.badRequest(errorData.message || 'An error occurred with the subscription.');
            }
        } catch (err: any) {
            console.error('Newsletter Controller Error:', err);
            return ctx.internalServerError(err.message || 'Failed to subscribe.');
        }
    },
};
