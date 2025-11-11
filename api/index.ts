import { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // クエリパラメータからパスを取得
    const requestPath = (req.query.path as string) || '/';

    // 正規URLを構築
    const canonicalUrl = `https://www.bikatsubu-media.jp${requestPath}`;

    // index.htmlを読み込み（Vercelでは __dirname を使う）
    const htmlPath = path.join(__dirname, '..', 'index.html');

    // もしファイルが見つからなければ、別のパスを試す
    let html: string;
    if (fs.existsSync(htmlPath)) {
      html = fs.readFileSync(htmlPath, 'utf-8');
    } else {
      // Vercelのビルド後のパスを試す
      const altPath = path.join(process.cwd(), 'index.html');
      if (fs.existsSync(altPath)) {
        html = fs.readFileSync(altPath, 'utf-8');
      } else {
        throw new Error(`HTML file not found. Tried: ${htmlPath}, ${altPath}`);
      }
    }

    // canonicalタグを挿入（</head>の前に）
    const canonicalTag = `    <link rel="canonical" href="${canonicalUrl}" />`;
    html = html.replace('</head>', `${canonicalTag}\n</head>`);

    // HTMLを返す
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).send(html);
  } catch (error) {
    console.error('Error in canonical injection:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error instanceof Error ? error.message : 'Unknown error' });
  }
}
