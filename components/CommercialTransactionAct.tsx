import React from 'react';
import Header from './Header';
import Footer from './Footer';

const CommercialTransactionAct: React.FC = () => {
  return (
    <div className="bg-gray-100 font-sans">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">特定商取引法に基づく表示</h1>
          
          <div className="text-sm text-gray-600 mb-8 text-center">
            最終更新日：2024年9月26日
          </div>

          {/* 前文 */}
          <section className="mb-10">
            <p className="text-gray-700 leading-relaxed">
              「美活部」における広告掲載サービス及び関連商品・サービスの販売について、特定商取引に関する法律（特定商取引法）第11条に基づき、以下の事項を表示いたします。
            </p>
          </section>

          {/* 販売業者情報 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#d11a68] mb-4 pb-2 border-b border-gray-200">販売業者</h2>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <table className="w-full">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 pr-4 font-semibold text-gray-800 align-top">販売業者名</td>
                    <td className="py-3 text-gray-700">株式会社LOGICA</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 pr-4 font-semibold text-gray-800 align-top">代表者</td>
                    <td className="py-3 text-gray-700">代表取締役 [代表者名]</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 pr-4 font-semibold text-gray-800 align-top">所在地</td>
                    <td className="py-3 text-gray-700">
                      〒[郵便番号]<br />
                      [住所]
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 pr-4 font-semibold text-gray-800 align-top">電話番号</td>
                    <td className="py-3 text-gray-700">[電話番号]</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 pr-4 font-semibold text-gray-800 align-top">メールアドレス</td>
                    <td className="py-3 text-gray-700">info@bikatsu-bu.com</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-semibold text-gray-800 align-top">ウェブサイト</td>
                    <td className="py-3 text-gray-700">https://bikatsu-bu.com</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 販売価格 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#d11a68] mb-4 pb-2 border-b border-gray-200">販売価格</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">広告掲載サービス</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>記事広告掲載</strong>: 100,000円〜（税込）</li>
                <li><strong>バナー広告掲載</strong>: 50,000円〜（税込）</li>
                <li><strong>商品紹介記事作成</strong>: 80,000円〜（税込）</li>
                <li><strong>PR記事作成・掲載</strong>: 120,000円〜（税込）</li>
              </ul>
              <p className="text-gray-600 text-sm mt-3">
                ※ 価格は掲載期間、記事内容、掲載位置等により変動いたします<br />
                ※ 詳細な料金については、お問い合わせ時にお見積もりいたします
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">その他サービス</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>美容コンサルティング</strong>: 30,000円〜（税込）</li>
                <li><strong>コンテンツ制作代行</strong>: 50,000円〜（税込）</li>
              </ul>
            </div>
          </section>

          {/* 代金の支払方法 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#d11a68] mb-4 pb-2 border-b border-gray-200">代金の支払方法</h2>
            
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>銀行振込</strong>（前払い）</li>
              <li><strong>クレジットカード決済</strong>（VISA、MasterCard、JCB、American Express、Diners Club）</li>
              <li><strong>請求書払い</strong>（法人のみ、与信審査あり）</li>
            </ul>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
              <p className="text-gray-700 text-sm">
                <strong>注意事項：</strong><br />
                ・銀行振込の場合、振込手数料はお客様負担となります<br />
                ・請求書払いをご希望の場合は、事前に与信審査を行います<br />
                ・お支払い確認後、サービス提供を開始いたします
              </p>
            </div>
          </section>

          {/* サービス提供時期 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#d11a68] mb-4 pb-2 border-b border-gray-200">サービス提供時期</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">広告掲載サービス</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li><strong>記事広告</strong>: お申し込み・お支払い確認後、7〜14営業日以内に掲載開始</li>
                  <li><strong>バナー広告</strong>: お申し込み・お支払い確認後、3〜5営業日以内に掲載開始</li>
                  <li><strong>PR記事</strong>: 取材・制作期間を含め、20〜30営業日以内に掲載</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">その他サービス</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li><strong>コンサルティング</strong>: お申し込み後、7営業日以内に開始日程を調整</li>
                  <li><strong>コンテンツ制作</strong>: 内容により10〜30営業日で納品</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 申込の有効期限 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#d11a68] mb-4 pb-2 border-b border-gray-200">申込の有効期限</h2>
            
            <p className="text-gray-700 leading-relaxed mb-4">
              お見積書の有効期限は発行日から30日間です。期限を過ぎた場合は、改めてお見積もりをいたします。
            </p>
            
            <p className="text-gray-700 leading-relaxed">
              正式なお申し込みは、契約書へのご署名・ご捺印、またはメールでの受注確認をもって成立します。
            </p>
          </section>

          {/* キャンセル・変更 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#d11a68] mb-4 pb-2 border-b border-gray-200">キャンセル・変更について</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">キャンセル規定</h3>
              
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <p className="text-gray-700 font-semibold mb-2">原則として、以下の場合はキャンセルをお受けできません：</p>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>制作作業開始後のキャンセル</li>
                  <li>掲載開始後のキャンセル</li>
                  <li>お客様都合による掲載前日のキャンセル</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-800">掲載開始前（制作作業開始前）</h4>
                  <p className="text-gray-700 text-sm">キャンセル料：無料</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800">制作作業開始後（掲載前）</h4>
                  <p className="text-gray-700 text-sm">キャンセル料：契約金額の50%</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800">掲載開始後</h4>
                  <p className="text-gray-700 text-sm">キャンセル不可（契約金額の100%お支払いいただきます）</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">内容変更について</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>軽微な修正（文字・画像の差し替え等）: 無料（制作中に限る）</li>
                <li>大幅な内容変更: 別途お見積もり</li>
                <li>掲載開始後の変更: 原則不可（技術的に可能な場合は別途料金）</li>
              </ul>
            </div>
          </section>

          {/* 返金について */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#d11a68] mb-4 pb-2 border-b border-gray-200">返金について</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">当社都合による返金</h3>
                <p className="text-gray-700 leading-relaxed">
                  当社の事情によりサービス提供が困難になった場合、お支払いいただいた代金は全額返金いたします。返金は銀行振込にて、返金決定から10営業日以内に実施いたします。
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">お客様都合による返金</h3>
                <p className="text-gray-700 leading-relaxed">
                  お客様都合によるキャンセルの場合、上記キャンセル規定に従い、返金可能な場合は返金手数料（1,000円）を差し引いた金額を返金いたします。
                </p>
              </div>
            </div>
          </section>

          {/* 不良品・誤納品 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#d11a68] mb-4 pb-2 border-b border-gray-200">不良品・誤納品について</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">対応内容</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>記載内容に明らかな誤りがある場合: 無償で修正</li>
                  <li>ご依頼内容と著しく異なる場合: 無償で再制作または全額返金</li>
                  <li>技術的な問題により掲載に支障がある場合: 無償で修正対応</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">対応期限</h3>
                <p className="text-gray-700 leading-relaxed">
                  不良品・誤納品については、納品・掲載開始から7日以内にご連絡ください。期限を過ぎた場合の対応はいたしかねます。
                </p>
              </div>
            </div>
          </section>

          {/* 個人情報保護 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#d11a68] mb-4 pb-2 border-b border-gray-200">個人情報の取り扱い</h2>
            
            <p className="text-gray-700 leading-relaxed">
              お客様からお預かりした個人情報は、当社の「プライバシーポリシー」に従って適切に管理し、サービス提供以外の目的では使用いたしません。詳細は当サイトの「プライバシーポリシー」をご確認ください。
            </p>
          </section>

          {/* その他の事項 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#d11a68] mb-4 pb-2 border-b border-gray-200">その他の事項</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">営業時間</h3>
                <p className="text-gray-700">平日 9:00〜18:00（土日祝日を除く）</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">お問い合わせ方法</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>メール: info@bikatsu-bu.com</li>
                  <li>お問い合わせフォーム: 当サイト内のお問い合わせページから</li>
                  <li>電話: [電話番号]（営業時間内のみ）</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">準拠法・管轄裁判所</h3>
                <p className="text-gray-700 leading-relaxed">
                  本取引は日本法に準拠し、紛争が生じた場合は東京地方裁判所を第一審の専属的合意管轄裁判所とします。
                </p>
              </div>
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

export default CommercialTransactionAct;
