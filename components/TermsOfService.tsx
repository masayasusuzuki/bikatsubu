import React from 'react';
import Header from './Header';
import Footer from './Footer';

const TermsOfService: React.FC = () => {
  return (
    <div className="bg-gray-100 font-sans">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">利用規約</h1>
          
          <div className="text-sm text-gray-600 mb-8 text-center">
            制定日：2024年1月1日<br />
            最終更新日：2024年9月26日
          </div>

          {/* 前文 */}
          <section className="mb-10">
            <p className="text-gray-700 leading-relaxed">
              この利用規約（以下「本規約」）は、美活部（以下「当サイト」または「当社」）が提供するサービス（以下「本サービス」）の利用条件を定めるものです。本サービスをご利用される方（以下「ユーザー」）は、本規約に同意したものとみなします。
            </p>
          </section>

          {/* サービス内容 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-brand-primary mb-4 pb-2 border-b border-gray-200">第1条（サービス内容）</h2>
            
            <p className="text-gray-700 leading-relaxed mb-4">
              本サービスは、美容に関する情報を発信する専門メディアサイトです。以下のサービスを提供します：
            </p>
            
            <ol className="list-decimal pl-6 text-gray-700 space-y-2">
              <li>美容に関する記事・コンテンツの配信</li>
              <li>コスメ情報、美容テクニック、イベント情報の提供</li>
              <li>肌診断サービス</li>
              <li>その他、美容活動をサポートする関連サービス</li>
            </ol>
          </section>

          {/* ユーザーの責務 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-brand-primary mb-4 pb-2 border-b border-gray-200">第2条（ユーザーの責務）</h2>
            
            <p className="text-gray-700 leading-relaxed mb-4">
              ユーザーは、本サービスの利用にあたり、以下の事項を遵守するものとします：
            </p>
            
            <ol className="list-decimal pl-6 text-gray-700 space-y-3">
              <li>法令及び本規約を遵守すること</li>
              <li>本サービスを個人的な目的でのみ利用し、商業目的で利用しないこと</li>
              <li>他のユーザーや第三者の権利を侵害しないこと</li>
              <li>本サービスの運営を妨害しないこと</li>
            </ol>
          </section>

          {/* 禁止行為 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-brand-primary mb-4 pb-2 border-b border-gray-200">第3条（禁止行為）</h2>
            
            <p className="text-gray-700 leading-relaxed mb-4">
              ユーザーは、本サービスの利用にあたり、以下の行為を行ってはなりません：
            </p>
            
            <ol className="list-decimal pl-6 text-gray-700 space-y-2">
              <li>法令に違反する行為</li>
              <li>犯罪行為に関連する行為</li>
              <li>当社や他のユーザー、第三者の権利を侵害する行為</li>
              <li>当社や他のユーザー、第三者の財産、プライバシーを侵害する行為</li>
              <li>当社や他のユーザー、第三者に不利益や損害を与える行為</li>
              <li>公序良俗に反する行為</li>
              <li>差別や誹謗中傷にあたる行為</li>
              <li>暴力的、性的、反社会的な内容を含む行為</li>
              <li>虚偽の情報を流布させる行為</li>
              <li>営利目的での情報収集や宣伝・広告行為</li>
              <li>本サービスのシステムに負荷をかける行為</li>
              <li>本サービスの運営を妨害する行為</li>
              <li>不正アクセス行為</li>
              <li>その他、当社が不適切と判断する行為</li>
            </ol>
          </section>

          {/* コンテンツの取り扱い */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-brand-primary mb-4 pb-2 border-b border-gray-200">第4条（コンテンツの取り扱い）</h2>
            
            <ol className="list-decimal pl-6 text-gray-700 space-y-3">
              <li>
                <strong>著作権</strong><br />
                本サービスで提供される記事、画像、動画等のコンテンツの著作権は、当社または正当な権利者に帰属します。
              </li>
              <li>
                <strong>利用範囲</strong><br />
                ユーザーは、本サービスのコンテンツを個人的な利用の範囲内で使用することができます。
              </li>
              <li>
                <strong>禁止事項</strong><br />
                以下の行為は禁止します：
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>無断での複製、転載、配布</li>
                  <li>商業目的での利用</li>
                  <li>改変、加工</li>
                  <li>逆引きエンジニアリング</li>
                </ul>
              </li>
            </ol>
          </section>

          {/* サービスの変更・停止 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-brand-primary mb-4 pb-2 border-b border-gray-200">第5条（サービスの変更・停止）</h2>
            
            <ol className="list-decimal pl-6 text-gray-700 space-y-3">
              <li>
                <strong>サービス内容の変更</strong><br />
                当社は、ユーザーに事前に通知することなく、本サービスの内容を変更、追加、削除することがあります。
              </li>
              <li>
                <strong>サービスの一時停止</strong><br />
                当社は、以下の場合、本サービスを一時的に停止することがあります：
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>システムメンテナンスを実施する場合</li>
                  <li>システム障害が発生した場合</li>
                  <li>地震、火災、停電等の不可抗力により運営が困難となった場合</li>
                  <li>その他、運営上必要と判断した場合</li>
                </ul>
              </li>
              <li>
                <strong>サービスの終了</strong><br />
                当社は、事前にユーザーに通知することで、本サービスを終了することができます。
              </li>
            </ol>
          </section>

          {/* 利用制限 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-brand-primary mb-4 pb-2 border-b border-gray-200">第6条（利用制限）</h2>

            <p className="text-gray-700 leading-relaxed">
              当社は、ユーザーが本規約に違反した場合、事前の通知なく、当該ユーザーの本サービス利用を制限または停止することができます。
            </p>
          </section>

          {/* 免責事項 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-brand-primary mb-4 pb-2 border-b border-gray-200">第7条（免責事項）</h2>
            
            <ol className="list-decimal pl-6 text-gray-700 space-y-3">
              <li>
                <strong>サービス内容について</strong><br />
                当社は、本サービスの正確性、完全性、有用性について保証しません。また、本サービスの利用により生じた損害について、当社は一切の責任を負いません。
              </li>
              <li>
                <strong>美容情報について</strong><br />
                本サービスで提供される美容情報は一般的な情報提供を目的としており、個別の医学的アドバイスではありません。利用者の肌質や体質に合わない場合は使用を中止し、必要に応じて専門医にご相談ください。
              </li>
              <li>
                <strong>外部サイトについて</strong><br />
                本サービスから外部サイトへのリンクが含まれる場合がありますが、当社は外部サイトの内容について責任を負いません。
              </li>
              <li>
                <strong>システム障害等について</strong><br />
                システム障害、通信障害、その他の技術的問題により本サービスが利用できない場合があっても、当社は責任を負いません。
              </li>
            </ol>
          </section>

          {/* 損害賠償 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-brand-primary mb-4 pb-2 border-b border-gray-200">第8条（損害賠償）</h2>
            
            <p className="text-gray-700 leading-relaxed mb-4">
              ユーザーが本規約に違反し、当社に損害を与えた場合、ユーザーは当社に対して損害を賠償する責任を負います。
            </p>
            
            <p className="text-gray-700 leading-relaxed">
              当社がユーザーに対して負う損害賠償責任は、理由の如何を問わず、ユーザーに現実に生じた直接かつ通常の損害に限られ、その総額は金10万円を上限とします。
            </p>
          </section>

          {/* 個人情報の取り扱い */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-brand-primary mb-4 pb-2 border-b border-gray-200">第9条（個人情報の取り扱い）</h2>
            
            <p className="text-gray-700 leading-relaxed">
              当社は、ユーザーの個人情報を、別途定めるプライバシーポリシーに従って適切に取り扱います。
            </p>
          </section>

          {/* 規約の変更 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-brand-primary mb-4 pb-2 border-b border-gray-200">第10条（規約の変更）</h2>
            
            <ol className="list-decimal pl-6 text-gray-700 space-y-3">
              <li>
                当社は、ユーザーの一般の利益に適合する場合、または本サービスの運営上必要な場合は、本規約を変更することがあります。
              </li>
              <li>
                規約の変更は、変更後の規約を本サイトに掲載した時点で効力を生じます。
              </li>
              <li>
                変更後もユーザーが本サービスを継続利用する場合、変更後の規約に同意したものとみなします。
              </li>
            </ol>
          </section>

          {/* 準拠法・管轄裁判所 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-brand-primary mb-4 pb-2 border-b border-gray-200">第11条（準拠法・管轄裁判所）</h2>
            
            <ol className="list-decimal pl-6 text-gray-700 space-y-3">
              <li>
                本規約の解釈及び適用は、日本法に準拠します。
              </li>
              <li>
                本サービスに関連して生じた紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
              </li>
            </ol>
          </section>

          {/* 協議解決 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-brand-primary mb-4 pb-2 border-b border-gray-200">第12条（協議解決）</h2>
            
            <p className="text-gray-700 leading-relaxed">
              本規約に定めのない事項または本規約の解釈に関して疑義が生じた場合は、ユーザーと当社が誠実に協議の上解決を図るものとします。
            </p>
          </section>

          {/* お問い合わせ */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-brand-primary mb-4 pb-2 border-b border-gray-200">第13条（お問い合わせ）</h2>
            
            <p className="text-gray-700 leading-relaxed mb-4">
              本規約に関するお問い合わせは、以下までご連絡ください：
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">
                <strong>美活部 運営事務局</strong><br />
                メール: support@bikatsu-bu.com<br />
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

export default TermsOfService;
