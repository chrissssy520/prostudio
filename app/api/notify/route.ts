import { Resend } from "resend"
import { NextResponse } from "next/server"

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(req: Request) {
  try {
    const { emails, subject, message } = await req.json()
    if (!emails || emails.length === 0) {
      return NextResponse.json({ error: "No emails provided" }, { status: 400 })
    }

    await resend.emails.send({
      from: "ProStudio <onboarding@resend.dev>",
      to: emails.length === 1 ? emails[0] : emails,
      subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0f1117; color: #e8eaf0; border-radius: 12px;">
          <h1 style="font-size: 20px; font-weight: 700; color: #ffffff; margin: 0;"><span style="color: #ef4444;">Pro</span>Studio</h1>
          <p style="font-size: 11px; color: #7a8099; margin: 2px 0 0;">Team Project Planner</p>
          <div style="background: #181c27; border: 1px solid #2a2f42; border-radius: 8px; padding: 20px; margin-top: 16px;">
            <p style="font-size: 15px; color: #e8eaf0; margin: 0; line-height: 1.6;">${message}</p>
          </div>
          <p style="font-size: 11px; color: #7a8099; margin-top: 16px; text-align: center;">ProStudio · Built by Christian Otnis</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}