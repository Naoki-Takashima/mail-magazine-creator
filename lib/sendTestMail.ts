import {
  NETWORK_FAILED_MESSAGE,
  SEND_FAILED_MESSAGE,
  type TestDeliveryRequest,
  type TestDeliveryResult,
} from '@/lib/testDelivery';

export const TEST_DELIVERY_ENDPOINT = '/api/test-delivery';

/**
 * テスト配信をサーバーに依頼する。downloadHtml と同じ粒度の薄い関数で、React に依存しない。
 *
 * 判定はすべてサーバー側で済ませてあるので、ここは通信の成否だけを見る。
 * 例外は投げず、必ず TestDeliveryResult に畳んで返す（呼び出し側の分岐を1本にするため）。
 */
export async function sendTestMail(request: TestDeliveryRequest): Promise<TestDeliveryResult> {
  try {
    const response = await fetch(TEST_DELIVERY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    const result: unknown = await response.json();

    // サーバーは成否によらず TestDeliveryResult を返すが、
    // 502 などで別の中身が返る経路もあるため形を確かめてから使う
    if (typeof result === 'object' && result !== null && 'ok' in result) {
      return result as TestDeliveryResult;
    }

    return { ok: false, message: SEND_FAILED_MESSAGE };
  } catch {
    // オフライン・サーバー停止など、レスポンスが返ってこなかった場合
    return { ok: false, message: NETWORK_FAILED_MESSAGE };
  }
}
