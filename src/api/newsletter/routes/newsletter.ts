export default {
    routes: [
        {
            method: 'POST',
            path: '/newsletter/subscribe',
            handler: 'newsletter.subscribe',
            config: {
                auth: false, // Make it public
            },
        },
    ],
};
