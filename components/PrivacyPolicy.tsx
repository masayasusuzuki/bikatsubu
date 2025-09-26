import React from 'react';
import Header from './Header';
import Footer from './Footer';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="bg-gray-100 font-sans">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">プライバシーポリシー</h1>
          
          <div className="text-sm text-gray-600 mb-8 text-center">
            制定日：2024年1月1日<br />
            最終更新日：2024年9月26日
          </div>

          {/* 前文 */}
          <section className="mb-10">
            <p className="text-gray-700 leading-relaxed mb-4">
              美活部（以下「当サイト」）は、ユーザーの個人情報保護を重要な責務と考え、個人情報保護法及び関連する法令・ガイドライン等を遵守し、ユーザーの個人情報を適切に取り扱います。
            </p>
            <p className="text-gray-700 leading-relaxed">
              本プライバシーポリシーは、当サイトがどのような個人情報を収集し、どのように利用・保護するかについて説明するものです。
            </p>
          </section>

          {/* 個人情報の定義 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#d11a68] mb-4 pb-2 border-b border-gray-200">1. 個人情報の定義</h2>
            <p className="text-gray-700 leading-relaxed">
              本プライバシーポリシーにおいて「個人情報」とは、個人情報保護法第2条第1項に定義される、生存する個人に関する情報であって、当該情報に含まれる氏名、メールアドレス、その他の記述により特定の個人を識別することができるもの（他の情報と容易に照合することができ、それにより特定の個人を識別することができることとなるものを含む）を指します。
            </p>
          </section>

          {/* 収集する情報 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#d11a68] mb-4 pb-2 border-b border-gray-200">2. 収集する個人情報</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 会員登録時に収集する情報</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>メールアドレス</li>
                <li>パスワード（暗号化して保存）</li>
                <li>ニックネーム（任意）</li>
                <li>生年月日（任意）</li>
                <li>性別（任意）</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 サイト利用時に自動的に収集される情報</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>IPアドレス</li>
                <li>ブラウザの種類やバージョン</li>
                <li>オペレーティングシステム</li>
                <li>アクセス日時</li>
                <li>閲覧ページ</li>
                <li>リファラ情報（アクセス元のサイト情報）</li>
                <li>デバイス情報</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.3 お問い合わせ時に収集する情報</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>お名前</li>
                <li>メールアドレス</li>
                <li>お問い合わせ内容</li>
              </ul>
            </div>
          </section>

          {/* 利用目的 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#d11a68] mb-4 pb-2 border-b border-gray-200">3. 個人情報の利用目的</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 サービス提供のための利用</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>会員サービスの提供</li>
                <li>お気に入り記事の保存・管理</li>
                <li>パーソナライズされたコンテンツの提供</li>
                <li>肌診断サービスの提供</li>
                <li>ログイン認証</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2 サービス改善・分析のための利用</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>サイトの利用状況の分析</li>
                <li>コンテンツの改善</li>
                <li>新機能の開発</li>
                <li>ユーザビリティの向上</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.3 コミュニケーションのための利用</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>お問い合わせへの回答</li>
                <li>重要なお知らせの送信</li>
                <li>メールマガジンの配信（同意いただいた場合のみ）</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.4 マーケティング活動のための利用</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>美容関連商品・サービスの情報提供</li>
                <li>キャンペーン・イベント情報の配信</li>
                <li>アンケート調査の実施</li>
              </ul>
            </div>
          </section>

          {/* Cookie等の利用 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#d11a68] mb-4 pb-2 border-b border-gray-200">4. Cookie及びアクセス解析ツールについて</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Cookieの利用</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                当サイトでは、ユーザーの利便性向上のためにCookieを使用しています。Cookieは以下の目的で利用されます：
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>ログイン状態の維持</li>
                <li>ユーザー設定の保存</li>
                <li>サイト利用状況の分析</li>
                <li>広告の最適化</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 Google Analyticsの利用</h3>
              <p className="text-gray-700 leading-relaxed">
                当サイトでは、Googleが提供するアクセス解析ツール「Google Analytics」を使用しています。Google Analyticsはデータの収集のためにCookieを使用し、このデータは匿名で収集されており、個人を特定するものではありません。
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.3 Cookieの無効化</h3>
              <p className="text-gray-700 leading-relaxed">
                Cookieの受け入れを希望されない場合は、ブラウザの設定によりCookieを無効にすることが可能です。ただし、Cookieを無効にした場合、サイトの一部機能がご利用いただけない場合があります。
              </p>
            </div>
          </section>

          {/* 第三者提供 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#d11a68] mb-4 pb-2 border-b border-gray-200">5. 個人情報の第三者提供</h2>
            
            <p className="text-gray-700 leading-relaxed mb-4">
              当サイトは、以下の場合を除き、ユーザーの同意なく個人情報を第三者に提供することはありません：
            </p>
            
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>法令に基づく場合</li>
              <li>人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難である場合</li>
              <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難である場合</li>
              <li>国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがある場合</li>
            </ul>
          </section>

          {/* 外部サービス */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#d11a68] mb-4 pb-2 border-b border-gray-200">6. 外部サービスの利用</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.1 利用している外部サービス</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Supabase</strong>: データベース・認証サービス</li>
                <li><strong>Cloudinary</strong>: 画像ストレージ・配信サービス</li>
                <li><strong>Google Analytics</strong>: アクセス解析ツール</li>
              </ul>
            </div>

            <p className="text-gray-700 leading-relaxed">
              これらの外部サービスは、それぞれ独自のプライバシーポリシーに従って個人情報を取り扱います。詳細は各サービスのプライバシーポリシーをご確認ください。
            </p>
          </section>

          {/* セキュリティ */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#d11a68] mb-4 pb-2 border-b border-gray-200">7. 個人情報の安全管理</h2>
            
            <p className="text-gray-700 leading-relaxed mb-4">
              当サイトは、個人情報の漏えい、滅失または毀損の防止その他の個人情報の安全管理のため、必要かつ適切な措置を講じます：
            </p>
            
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>SSL（Secure Socket Layer）による暗号化通信の使用</li>
              <li>パスワードの暗号化</li>
              <li>アクセス権限の適切な管理</li>
              <li>定期的なセキュリティの見直し</li>
              <li>システムの脆弱性対策</li>
            </ul>
          </section>

          {/* 保存期間 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#d11a68] mb-4 pb-2 border-b border-gray-200">8. 個人情報の保存期間</h2>
            
            <p className="text-gray-700 leading-relaxed mb-4">
              収集した個人情報は、利用目的達成のために必要な期間に限り保存します：
            </p>
            
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>会員情報</strong>: 退会から3年間</li>
              <li><strong>お問い合わせ情報</strong>: 対応完了から3年間</li>
              <li><strong>アクセスログ</strong>: 収集から1年間</li>
              <li><strong>その他の情報</strong>: 利用目的達成後、遅滞なく削除</li>
            </ul>
          </section>

          {/* ユーザーの権利 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#d11a68] mb-4 pb-2 border-b border-gray-200">9. ユーザーの権利</h2>
            
            <p className="text-gray-700 leading-relaxed mb-4">
              ユーザーは、自身の個人情報について以下の権利を有します：
            </p>
            
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>開示請求権</strong>: 個人情報の利用目的や第三者提供の状況などの開示を求める権利</li>
              <li><strong>訂正・追加・削除請求権</strong>: 個人情報の内容に誤りがある場合の訂正・追加・削除を求める権利</li>
              <li><strong>利用停止・消去請求権</strong>: 個人情報の利用停止や消去を求める権利</li>
              <li><strong>第三者提供停止請求権</strong>: 第三者への提供の停止を求める権利</li>
            </ul>
            
            <p className="text-gray-700 leading-relaxed mt-4">
              これらの権利を行使される場合は、お問い合わせフォームからご連絡ください。本人確認を行った上で、法令に従い対応いたします。
            </p>
          </section>

          {/* 未成年者 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#d11a68] mb-4 pb-2 border-b border-gray-200">10. 未成年者の個人情報</h2>
            
            <p className="text-gray-700 leading-relaxed">
              当サイトは、15歳未満の方からは個人情報を収集しません。15歳以上18歳未満の方が会員登録を行う場合は、保護者の同意を得た上でご利用ください。
            </p>
          </section>

          {/* プライバシーポリシーの変更 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#d11a68] mb-4 pb-2 border-b border-gray-200">11. プライバシーポリシーの変更</h2>
            
            <p className="text-gray-700 leading-relaxed mb-4">
              当サイトは、法令の変更やサービスの改善等に伴い、本プライバシーポリシーを変更することがあります。
            </p>
            
            <p className="text-gray-700 leading-relaxed">
              重要な変更については、サイト上での掲載やメール通知により、ユーザーに周知いたします。変更後のプライバシーポリシーは、当サイトに掲載された時点で効力を生じるものとします。
            </p>
          </section>

          {/* お問い合わせ */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#d11a68] mb-4 pb-2 border-b border-gray-200">12. お問い合わせ</h2>
            
            <p className="text-gray-700 leading-relaxed mb-4">
              個人情報の取り扱いに関するお問い合わせ、開示請求等については、以下までご連絡ください：
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">
                <strong>美活部 個人情報お問い合わせ窓口</strong><br />
                メール: privacy@bikatsu-bu.com<br />
                お問い合わせフォーム: サイト内のお問い合わせページから
              </p>
            </div>
          </section>

          <div className="text-center text-gray-500 text-sm mt-12 pt-8 border-t border-gray-200">
            以上
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
