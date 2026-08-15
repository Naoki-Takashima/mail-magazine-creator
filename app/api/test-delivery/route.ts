import {
  NOT_CONFIGURED_MESSAGE,
  parseTestDeliveryRequest,
  SEND_FAILED_MESSAGE,
  type TestDeliveryResult,
} from '@/lib/testDelivery';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

function json(result: TestDeliveryResult, status: number): Response {
  return Response.json(result, { status });
}

/**
 * 入力内容をそのまま1通だけ送るテスト配信。
 *
 * このアプリで唯一のサーバー処理。API キーをブラウザに出さないためだけに存在するので、
 * 判定は lib/testDelivery.ts の純関数に寄せ、ここは受け渡しに徹する。
 *
 * 環境変数はモジュールの読み込み時ではなくリクエストのたびに読む。
 * ビルド時に評価すると、キーを持たない CI で本番ビルドが通らなくなるため。
 */
export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, message: 'リクエストの形式が不正です' }, 400);
  }

  const parsed = parseTestDeliveryRequest(body);
  if (typeof parsed === 'string') {
    return json({ ok: false, message: parsed }, 400);
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;
  if (!apiKey || !from) {
    console.error('[test-delivery] RESEND_API_KEY または MAIL_FROM が未設定');
    return json({ ok: false, message: NOT_CONFIGURED_MESSAGE }, 500);
  }

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [parsed.to],
        subject: parsed.subject,
        html: parsed.html,
      }),
    });

    if (!response.ok) {
      // 生のエラーには送信元ドメインや内部IDが混ざるので、サーバーのログにだけ残す
      console.error('[test-delivery] Resend が失敗', response.status, await response.text());
      return json({ ok: false, message: SEND_FAILED_MESSAGE }, 502);
    }

    return json({ ok: true }, 200);
  } catch (error) {
    console.error('[test-delivery] Resend への送信に失敗', error);
    return json({ ok: false, message: SEND_FAILED_MESSAGE }, 502);
  }
}
