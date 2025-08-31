function buildMessage({ email, name }) {
  return {
    personalizations: [
      {
        to: [{ email, name }],
      },
    ],
    from: {
      email: "codo_175@yahoo.co.jp",
      name: "Seiya Abukawa",
    },
    subject: "お問い合わせありがとうございます",
    content: [
      {
        type: "text/plain",
        value: [
          `${name}様`,
          "",
          "お問い合わせいただき、誠にありがとうございます。",
          "このメールは、システムによる自動返信であり、お問い合わせを受け付けたことをお知らせするものです。",
          "お問い合わせ内容につきましては、担当者が確認の上、改めてご連絡させていただきます。",
          "",
          "通常、1営業日以内には回答を差し上げておりますが、内容によっては少々お時間をいただく場合がございます。",
        ].join("\n"),
      },
    ],
  };
}

// APIキーを引数に追加
async function sendContact(contact, apiKey) {
  try {
    const resp = await fetch("https://ua0x84w8fc.microcms.io/api/v1/contact", {
      method: "POST",
      headers: {
        "X-MICROCMS-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contact),
    });

    if (!resp.ok) {
      throw new Error(`お問い合わせの送信に失敗しました: ${resp.statusText}`);
    }

    return await resp.json();
  } catch (err) {
    throw err;
  }
}

// APIキーを引数に追加
async function sendMail({ email, name }, apiKey) {
  const message = buildMessage({ email, name });

  try {
    const resp = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(message),
    });

    if (!resp.ok) {
      const data = await resp.json();
      throw new Error(`メールの送信に失敗しました: ${data.errors[0].message}`);
    }

    return { ok: true };
  } catch (err) {
    throw err;
  }
}

export async function onRequestPost(context) {
  const contact = await context.request.json();
  const { origin } = new URL(context.request.url);

  try {
    await Promise.all([
      sendContact(contact, context.env.MICROCMS_API_KEY),
      sendMail(
        { email: contact.email, name: contact.name },
        context.env.SENDGRID_API_KEY,
      ),
    ]);

    return Response.redirect(`${origin}/complete`);
  } catch (err) {
    console.error("error: ", err);
    return Response.json({ message: err.message }, { status: 500 });
  }
}
