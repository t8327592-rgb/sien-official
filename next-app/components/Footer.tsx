import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Col 1: Service */}
        <div className="footer-col">
          <h4>サービス内容</h4>
          <ul>
            <li>
              <Link href="/mix">ミックス・マスタリング</Link>
            </li>
            <li>
              <Link href="/original">オリジナル楽曲制作</Link>
            </li>
          </ul>
        </div>

        {/* Col 2: Support */}
        <div className="footer-col">
          <h4>ご依頼・サポート</h4>
          <ul>
            <li>
              <Link href="/order">ご依頼フォーム</Link>
            </li>
            <li>
              <Link href="/business">法人・企業様お問い合わせ</Link>
            </li>
            <li>
              <Link href="/faq">よくある質問（FAQ）</Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Policy */}
        <div className="footer-col">
          <h4>規約・ポリシー</h4>
          <ul>
            <li>
              <Link href="/terms">ご依頼に関する留意事項</Link>
            </li>
            <li>
              <Link href="/privacy">プライバシーポリシー</Link>
            </li>
            <li>
              <Link href="/tokusho">特定商取引法に基づく表記</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p className="footer-copy">
          Copyright (c) 2026 Sien-Official. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
