const express = require('express');
const stripe = require('stripe')('sk_test_51YourSecretKeyHereFromStripeDashboard'); // Öz key-ni qoy
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require('path')


const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(__dirname));
app.use('/images', express.static(path.join(__dirname, 'images')));


// Payment Intent yarat (modal üçün client secret göndər)
app.post('/create-payment-intent', async (req, res) => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: req.body.price,
            currency: 'usd',
            automatic_payment_methods: { enabled: true },
            metadata: { product: req.body.product, email: req.body.email }, // Email-i saxla
        });
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ödəniş uğurlu olduqda email göndər (webhook daha yaxşı, amma sadəlik üçün bu endpoint)
app.post('/send-product', async (req, res) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'yourgmail@gmail.com',
            pass: 'yourapppassword'
        }
    });

    const mailOptions = {
        from: 'support@1999x.store',
        to: req.body.email,
        subject: 'Your NIKO PYTHON Panel',
        text: 'Təşəkkürlər! Məhsulunuz buradadır.',
        attachments: [{ filename: 'product.zip', path: path.join(__dirname, 'product.zip') }]
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            res.status(500).json({ error: error.message });
        } else {
            res.json({ success: true });
        }
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
