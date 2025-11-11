import { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // クエリパラメータからパスを取得
  const requestPath = (req.query.path as string) || '/';

  // 正規URLを構築
  const canonicalUrl = `https://www.bikatsubu-media.jp${requestPath === '/' ? '/' : requestPath}`;

  // index.htmlを読み込み
  const htmlPath = path.join(process.cwd(), 'dist', 'index.html');
  let html = fs.readFileSync(htmlPath, 'utf-8');

  // canonicalタグを挿入（</head>の前に）
  const canonicalTag = `    <link rel="canonical" href="${canonicalUrl}" />`;
  html = html.replace('</head>', `${canonicalTag}\n</head>`);

  // HTMLを返す
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
}
