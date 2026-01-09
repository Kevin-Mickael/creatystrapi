export default {
    async subscribe(ctx: any) {
        const { email } = ctx.request.body;

        if (!email) {
            return ctx.badRequest('Email is required');
        }

        try {
            const apiKey = process.env.BREVO_API_KEY;

            const response = await fetch('https://api.brevo.com/v3/contacts', {
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

            const data: any = await response.json();

            if (response.ok || response.status === 204) {
                return {
                    success: true,
                    message: 'Thank you for subscribing!',
                };
            } else {
                console.error('Brevo Error:', data);
                return ctx.badRequest(data.message || 'An error occurred with the subscription.');
            }
        } catch (err: any) {
            console.error('Newsletter Controller Error:', err);
            return ctx.internalServerError(err.message || 'Failed to subscribe.');
        }
    },
};
