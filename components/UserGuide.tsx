import React from 'react';
import Header from './Header';
import Footer from './Footer';

const UserGuide: React.FC = () => {
  return (
    <div className="bg-gray-100 font-sans">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">ご利用ガイド</h1>
          
          {/* サイト概要 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#d11a68] mb-4 pb-2 border-b border-gray-200">美活部について</h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              「美活部」は、あなたのキレイを応援する総合美容メディアです。最新のコスメトレンド、スキンケア、メイクアップ、ヘアケアから、プロが教える美容テクニックまで、美しくなるための情報をお届けします。
            </p>
            <p className="text-gray-700 leading-relaxed">
              美容に関心のある一般ユーザー、コスメ・スキンケア製品の情報を求める方、美容の最新トレンドを知りたい方を対象に、信頼性の高い情報を提供しています。
            </p>
          </section>

          {/* 記事の見つけ方 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#d11a68] mb-4 pb-2 border-b border-gray-200">記事の見つけ方</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">1. カテゴリーから探す</h3>
              <p className="text-gray-700 mb-3">
                お悩み別に記事を分類しています。ヘッダーメニューからお選びください。
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>シミ・くすみ</strong>: 透明感のある明るい肌を目指すケア方法</li>
                <li><strong>毛穴</strong>: 毛穴レスな美肌を実現するケア方法</li>
                <li><strong>赤み・赤ら顔</strong>: 敏感肌や赤みが気になる方向けのケア</li>
                <li><strong>たるみ・しわ</strong>: エイジングサインに効果的なケア方法</li>
                <li><strong>ニキビ・ニキビ跡</strong>: クリアな肌を目指すソリューション</li>
                <li><strong>肌育</strong>: 基礎からしっかりと肌を育てる方法</li>
                <li><strong>最新の美容機器</strong>: 革新的な美容テクノロジー情報</li>
                <li><strong>ホームケア</strong>: おうちで実践できる本格的な美容ケア</li>
                <li><strong>サロン経営</strong>: 美容サロンの経営戦略とノウハウ</li>
                <li><strong>海外トレンド</strong>: 世界の最新美容トレンド</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">2. トップページから探す</h3>
              <p className="text-gray-700 mb-3">
                トップページでは、以下のセクションから最新情報をチェックできます：
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Hot Medical Beauty</strong>: 話題の美容医療と海外トレンド情報</li>
                <li><strong>Beauty Topics</strong>: 美容に関するすべての記事</li>
                <li><strong>Featured Events</strong>: 注目の美容イベント情報</li>
                <li><strong>Professional's Column</strong>: プロの美容テクニック</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">3. 検索機能を活用する</h3>
              <p className="text-gray-700">
                各記事一覧ページには検索機能があります。キーワードを入力して、お探しの情報を素早く見つけることができます。
              </p>
            </div>
          </section>

          {/* 記事の読み方 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#d11a68] mb-4 pb-2 border-b border-gray-200">記事の読み方</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">記事の構成</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>タイトル</strong>: 記事の内容を分かりやすく表現</li>
                <li><strong>カテゴリー</strong>: 記事の分類を表示</li>
                <li><strong>公開日</strong>: 情報の新しさを確認</li>
                <li><strong>アイキャッチ画像</strong>: 記事内容のイメージ</li>
                <li><strong>本文</strong>: 詳細な情報とアドバイス</li>
                <li><strong>関連記事</strong>: 同じカテゴリーや最新の記事</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">記事の特徴</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Markdown記法に対応した読みやすいレイアウト</li>
                <li>見出し、リスト、画像、リンク、太字などの装飾</li>
                <li>囲い線による重要ポイントの強調</li>
                <li>表形式での比較情報</li>
                <li>専門用語の解説と分かりやすい説明</li>
              </ul>
            </div>
          </section>

          {/* 機能について */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#d11a68] mb-4 pb-2 border-b border-gray-200">その他の機能</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">肌タイプ診断</h3>
              <p className="text-gray-700">
                ヘッダーメニューの「肌タイプ診断」から、あなたの肌質を診断できます。診断結果に基づいたおすすめのケア方法もご提案します。
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">ユーザー登録・ログイン</h3>
              <p className="text-gray-700 mb-3">
                ユーザー登録をすると、以下の機能をご利用いただけます：
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>お気に入り記事の保存</li>
                <li>マイページでの履歴管理</li>
                <li>パーソナライズされたおすすめ情報</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">掲載について</h3>
              <p className="text-gray-700">
                美容関連の商品やサービスの掲載をご希望の場合は、ヘッダーの「美活部に掲載」からお問い合わせください。
              </p>
            </div>
          </section>

          {/* 推奨環境 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#d11a68] mb-4 pb-2 border-b border-gray-200">推奨環境</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">対応ブラウザ</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Google Chrome（最新版）</li>
                <li>Mozilla Firefox（最新版）</li>
                <li>Safari（最新版）</li>
                <li>Microsoft Edge（最新版）</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">対応デバイス</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>デスクトップ・ノートPC</li>
                <li>タブレット</li>
                <li>スマートフォン</li>
              </ul>
              <p className="text-gray-700 mt-3">
                レスポンシブデザインにより、どのデバイスでも最適な表示で記事をお読みいただけます。
              </p>
            </div>
          </section>

          {/* 注意事項 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#d11a68] mb-4 pb-2 border-b border-gray-200">ご利用時の注意事項</h2>
            
            <ul className="list-disc pl-6 text-gray-700 space-y-3">
              <li>
                <strong>個人差について</strong><br />
                美容に関する情報は個人差があります。肌質や体質に合わない場合は使用を中止し、必要に応じて専門医にご相談ください。
              </li>
              <li>
                <strong>情報の更新について</strong><br />
                商品情報や価格は記事公開時点のものです。最新情報は各メーカーや販売店の公式サイトでご確認ください。
              </li>
              <li>
                <strong>リンク先について</strong><br />
                外部サイトへのリンクについては、リンク先サイトの利用規約に従ってご利用ください。
              </li>
              <li>
                <strong>著作権について</strong><br />
                当サイトの記事内容、画像等の無断転載・複製を禁止します。
              </li>
            </ul>
          </section>

          {/* お問い合わせ */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#d11a68] mb-4 pb-2 border-b border-gray-200">お問い合わせ</h2>
            <p className="text-gray-700 mb-4">
              ご不明な点やご質問がございましたら、以下の方法でお気軽にお問い合わせください：
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>よくある質問ページをご確認ください</li>
              <li>フッターの「お問い合わせ」からご連絡ください</li>
              <li>SNS（Twitter）からのDMも受け付けています</li>
            </ul>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default UserGuide;
