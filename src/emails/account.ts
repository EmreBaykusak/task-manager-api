import sgMail from "@sendgrid/mail"

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export const sendWelcomeEmail = async (email: string, name: string) => {
    sgMail.send({
        to: email,
        from: "xokiva7282@aikunkun.com",
        subject: "Thanks for joining in",
        text: `Welcome to the app ${name}!. Let me know how you get along with the app.`,
    })
}

export const sendCancellationEmail = async (email: string, name: string) => {
    sgMail.send({
        to: email,
        from: "xokiva7282@aikunkun.com",
        subject: "Thanks for using our app",
        text: `Goodbye ${name}. We are sorry to see you leave, is there anything we could've done better? Let us know in the feedback`,
    })
}