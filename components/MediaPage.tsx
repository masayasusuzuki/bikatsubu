import React from 'react';

const MediaPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#d11a68] to-[#e91e63] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">美活部に掲載</h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            美容業界専門メディアで貴社のサービス・製品を効果的にPR
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-3xl mx-auto">
            <p className="text-lg leading-relaxed">
              美容クリニック・美容機器メーカーの皆様へ<br />
              美活部で貴社のサービス・製品を効果的にPRしませんか？
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        {/* Introduction */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">美活部について</h2>
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p>
                美活部は、美容業界に特化したメディアプラットフォームとして、クリニック、メーカー、関連企業と美容に関心の高いユーザーをつなぐ役割を担っています。
              </p>
              <p>
                全国の美容愛好者や業界関係者が、美活部を通じて「最新美容情報の収集」「クリニック選び」「美容機器の比較検討」など、美容に関する幅広い情報を求めています。
              </p>
              <p>
                美活部への掲載により、ターゲット層への効率的なアプローチと、ブランド認知度の向上を実現できます。美容業界をリードするメディアで、貴社の魅力を最大限に発信してみませんか？
              </p>
            </div>
          </div>
        </div>

        {/* Problems Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              <span className="text-[#d11a68]">こんなお悩みはありませんか？</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <span className="text-red-500 text-2xl mr-3">🎯</span>
                  <h3 className="text-lg font-semibold text-red-800">ターゲティング</h3>
                </div>
                <p className="text-red-700">
                  美容に関心の高い層に効果的にリーチしたい
                </p>
              </div>
              <div className="bg-orange-50 border-l-4 border-orange-400 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <span className="text-orange-500 text-2xl mr-3">📈</span>
                  <h3 className="text-lg font-semibold text-orange-800">広告効果</h3>
                </div>
                <p className="text-orange-700">
                  Web広告の成果が思うように上がらない
                </p>
              </div>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <span className="text-yellow-500 text-2xl mr-3">👥</span>
                  <h3 className="text-lg font-semibold text-yellow-800">営業体制</h3>
                </div>
                <p className="text-yellow-700">
                  新規顧客獲得のための営業体制が不足している
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Solution Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-gradient-to-r from-[#d11a68] to-[#e91e63] rounded-lg shadow-lg p-8 text-white">
            <h2 className="text-3xl font-bold mb-8 text-center">
              美活部なら、これらの課題を解決できます
            </h2>
            <div className="space-y-6 text-lg leading-relaxed">
              <p>
                美活部は「美容業界専門メディア」として、本当に美容に興味のあるユーザーが集まるプラットフォームです。
              </p>
              <p>
                美容への関心が高く、実際にサービス利用を検討している質の高いユーザーに対して、貴社の製品・サービス情報や専門知識を発信することで、一般的なWebサイトよりも高いコンバージョン率を実現し、効率的な顧客獲得につなげることができます。
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              まずはお気軽にお問い合わせください
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              貴社に最適な掲載プランをご提案いたします
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:contact@bikatsu-bu.com"
                className="bg-[#d11a68] hover:bg-[#b8175a] text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors"
              >
                📧 メールでお問い合わせ
              </a>
              <a
                href="tel:03-1234-5678"
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors"
              >
                📞 お電話でお問い合わせ
              </a>
            </div>
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>営業時間:</strong> 平日 9:00-18:00<br />
                <strong>お電話:</strong> 03-1234-5678<br />
                <strong>メール:</strong> contact@bikatsu-bu.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaPage;
