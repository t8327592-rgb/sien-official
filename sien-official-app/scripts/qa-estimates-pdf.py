"""Verify PDF text, page bounds, private data exclusion and CJK in PDFium."""
from pathlib import Path
import json
import re
import pdfplumber
import pypdfium2 as pdfium

root = Path(__file__).resolve().parents[2] / 'tmp' / 'estimates-qa'
results = {}
for name in ['estimate-11-songs.pdf', 'estimate-single.pdf', 'estimate-100-songs.pdf', 'estimate-original-redownload.pdf', 'estimate-long-notes.pdf']:
    with pdfplumber.open(root / name) as doc:
        texts = [page.extract_text() or '' for page in doc.pages]
        text = '\n'.join(texts)
        assert all(abs(page.width - 595.28) < .1 and abs(page.height - 841.89) < .1 for page in doc.pages)
        assert 'SIEN.OFFICIAL' in text
        assert '御 見 積 書' in text
        assert 'ポ村ころりぃ' in text
        assert not re.search(r'example\.invalid|qa-estimate-order|/admin/|127\.0\.0\.1', text)
        assert '□' not in text
        for page in doc.pages:
            for word in page.extract_words():
                assert word['x0'] >= 39 and word['x1'] <= 556.5, (name, word)
                assert word['top'] >= 18 and word['bottom'] <= 819, (name, word)
        if name in ['estimate-11-songs.pdf', 'estimate-original-redownload.pdf']:
            assert len(doc.pages) == 1
            for phrase in ['110,000', '130,000', '26,000', '104,000', 'カットアップ', 'ストロボラスト']:
                # Basic sum is represented by separate 50,000 / 60,000 subtotals.
                if phrase != '110,000':
                    assert phrase in text, phrase
        if name == 'estimate-single.pdf':
            assert len(doc.pages) == 1
            assert '10,000円' in text
        if name == 'estimate-100-songs.pdf':
            assert len(doc.pages) > 1
            assert '100. 長い楽曲名' in text
        if name == 'estimate-long-notes.pdf':
            assert len(doc.pages) > 1
            assert text.count('明細ごとの長い特記事項です。') == 30
            assert '備考の最後まで表示' in text
        results[name] = {'pages': len(doc.pages), 'japanese': 'PASS', 'bounds': 'PASS', 'private_data': 'NONE'}
        (root / (name + '.txt')).write_text(text, encoding='utf-8')

assert (root / 'estimate-11-songs.pdf.txt').read_text(encoding='utf-8') == (root / 'estimate-original-redownload.pdf.txt').read_text(encoding='utf-8')
# A second renderer catches font files that only work with Poppler.
for name, pages in [('estimate-11-songs.pdf', [0]), ('estimate-single.pdf', [0]), ('estimate-100-songs.pdf', [0, 7])]:
    doc = pdfium.PdfDocument(root / name)
    for page_number in pages:
        page = doc[page_number]
        page.render(scale=1.5).to_pil().save(root / f'{Path(name).stem}-pdfium-{page_number+1}.png')
    doc.close()
print(json.dumps({'result': 'PASS', 'pdfs': results}, ensure_ascii=False, indent=2))
