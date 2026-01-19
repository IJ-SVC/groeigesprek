import nodemailer from 'nodemailer'

interface EmailConfig {
  host: string
  port: number
  user: string
  password: string
  from: string
}

let transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (transporter) {
    return transporter
  }

  const config: EmailConfig = {
    host: process.env.SMTP_HOST || 'smtp.office365.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.FROM_EMAIL || 'noreply@ijsselheem.nl',
  }

  transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: {
      user: config.user,
      pass: config.password,
    },
  })

  return transporter
}

export async function sendConfirmationEmail(
  to: string,
  session: {
    conversation_type?: { name: string }
    date: string
    start_time: string
    end_time?: string
    location: string
    is_online: boolean
    teams_link?: string
    facilitator: string
  },
  cancellationToken?: string
) {
  try {
    const enabled = process.env.EMAIL_CONFIRMATION_ENABLED === 'true'
    if (!enabled) {
      return
    }

    const transporter = getTransporter()
    const cancellationLink = cancellationToken
      ? `${process.env.NEXT_PUBLIC_APP_URL}/annuleren/${cancellationToken}`
      : null

    await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'noreply@ijsselheem.nl',
      to,
      subject: `Bevestiging aanmelding: ${session.conversation_type?.name || 'Groeigesprek'} - ${new Date(session.date).toLocaleDateString('nl-NL')}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Montserrat, Arial, sans-serif; color: #25377f; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #a1d9f7; padding: 20px; text-align: center; }
            .content { background-color: #ffffff; padding: 20px; }
            .button { display: inline-block; padding: 10px 20px; background-color: #a1d9f7; color: #25377f; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Bevestiging aanmelding</h1>
            </div>
            <div class="content">
              <p>Beste deelnemer,</p>
              <p>Je inschrijving voor het volgende groeigesprek is bevestigd:</p>
              <ul>
                <li><strong>Type:</strong> ${session.conversation_type?.name || 'Gesprek'}</li>
                <li><strong>Datum:</strong> ${new Date(session.date).toLocaleDateString('nl-NL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</li>
                <li><strong>Tijd:</strong> ${session.start_time.substring(0, 5)}${session.end_time ? ` - ${session.end_time.substring(0, 5)}` : ''}</li>
                <li><strong>Locatie:</strong> ${session.is_online ? 'Online (Teams)' : session.location}</li>
                ${session.is_online && session.teams_link ? `<li><strong>Teams-link:</strong> <a href="${session.teams_link}">${session.teams_link}</a></li>` : ''}
                <li><strong>Begeleider:</strong> ${session.facilitator}</li>
              </ul>
              ${cancellationLink ? `<p><a href="${cancellationLink}" class="button">Annuleer inschrijving</a></p>` : ''}
              <p>Met vriendelijke groet,<br>IJsselheem</p>
            </div>
          </div>
        </body>
        </html>
      `,
    })
  } catch (error) {
    console.error('Error sending confirmation email:', error)
    // Don't throw - email is optional
  }
}

export async function sendCancellationEmail(
  to: string,
  session: {
    conversation_type?: { name: string }
    date: string
    start_time: string
    location: string
    is_online?: boolean
    teams_link?: string
  }
) {
  try {
    const enabled = process.env.EMAIL_CANCELLATION_ENABLED === 'true'
    if (!enabled) {
      return
    }

    const transporter = getTransporter()

    await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'noreply@ijsselheem.nl',
      to,
      subject: `Annulering: ${session.conversation_type?.name || 'Groeigesprek'} - ${new Date(session.date).toLocaleDateString('nl-NL')}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Montserrat, Arial, sans-serif; color: #25377f; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #cbe9fb; padding: 20px; text-align: center; }
            .content { background-color: #ffffff; padding: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Inschrijving geannuleerd</h1>
            </div>
            <div class="content">
              <p>Beste deelnemer,</p>
              <p>Je inschrijving voor het volgende groeigesprek is geannuleerd:</p>
              <ul>
                <li><strong>Type:</strong> ${session.conversation_type?.name || 'Gesprek'}</li>
                <li><strong>Datum:</strong> ${new Date(session.date).toLocaleDateString('nl-NL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</li>
                <li><strong>Tijd:</strong> ${session.start_time.substring(0, 5)}</li>
                <li><strong>Locatie:</strong> ${session.is_online ? 'Online (Teams)' : session.location}</li>
                ${session.is_online && session.teams_link ? `<li><strong>Teams-link:</strong> <a href="${session.teams_link}">${session.teams_link}</a></li>` : ''}
              </ul>
              <p>Met vriendelijke groet,<br>IJsselheem</p>
            </div>
          </div>
        </body>
        </html>
      `,
    })
  } catch (error) {
    console.error('Error sending cancellation email:', error)
    // Don't throw - email is optional
  }
}

export async function sendIndividualRequestEmail(
  to: string,
  request: {
    colleague_name: string
    requester_name?: string
    requester_email?: string
    message: string
  }
) {
  try {
    const enabled = process.env.EMAIL_CONFIRMATION_ENABLED === 'true'
    if (!enabled) {
      return
    }

    const transporter = getTransporter()
    const requesterInfo = request.requester_name
      ? `${request.requester_name}${request.requester_email ? ` (${request.requester_email})` : ''}`
      : request.requester_email || 'Een collega'

    await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'noreply@ijsselheem.nl',
      to,
      subject: `Aanvraag voor ontwikkelgesprek van ${requesterInfo}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Montserrat, Arial, sans-serif; color: #25377f; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #a1d9f7; padding: 20px; text-align: center; }
            .content { background-color: #ffffff; padding: 20px; }
            .message-box { background-color: #f0f0f0; padding: 15px; border-left: 4px solid #a1d9f7; margin: 20px 0; }
            .reply-info { background-color: #e8f5e9; padding: 15px; border-left: 4px solid #4caf50; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Aanvraag voor ontwikkelgesprek</h1>
            </div>
            <div class="content">
              <p>Beste ${request.colleague_name},</p>
              <p>Je hebt een aanvraag ontvangen voor een ontwikkelgesprek van ${requesterInfo}.</p>
              <div class="message-box">
                <p><strong>Bericht:</strong></p>
                <p>${request.message.replace(/\n/g, '<br>')}</p>
              </div>
              ${request.requester_email ? `
                <div class="reply-info">
                  <p><strong>Je kunt reageren door te antwoorden op deze email.</strong></p>
                  <p>Het email adres van ${request.requester_name || 'de aanvrager'} is: <a href="mailto:${request.requester_email}">${request.requester_email}</a></p>
                </div>
              ` : ''}
              <p>Met vriendelijke groet,<br>IJsselheem</p>
            </div>
          </div>
        </body>
        </html>
      `,
    })
  } catch (error) {
    console.error('Error sending individual request email:', error)
    // Don't throw - email is optional
  }
}


