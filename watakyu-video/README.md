# 一枚のシーツから世界へ ― ワタキューセイモアの海外での挑戦

高校生向け 職場見学 学習用解説のモーショングラフィック動画（Remotion 製）。

| 納品物 | 修正版（ナレーション v2） | 初版（v1・比較用に保存） |
|---|---|---|
| 本編のみ | `deliverables/watakyu_main_v2.mp4`（97.0秒）＋ `.srt` | `deliverables/watakyu_main.mp4`（91.7秒）＋ `.srt` |
| 追加パート付き | `deliverables/watakyu_full_v2.mp4`（124.3秒）＋ `.srt` | `deliverables/watakyu_full.mp4`（116.8秒）＋ `.srt` |
| シーン別ナレーション | `public/audio/v2/scene01.wav`〜`appendix02.wav` | `public/audio/scene01.wav`〜`appendix02.wav` |
| 確定台本と実際のタイミング | `script.md` | `script_v1.md` |
| 修正前後の比較サンプル | `samples/`（説明は `samples/README.md`） | |

（ナレーションはどちらも 48kHz・モノラル・各 -24 LUFS）
| 出典・事実の対応、素材の利用条件 | `sources.md` |

動画仕様：1920×1080／30fps／H.264（High, yuv420p）＋AAC 48kHz ステレオ／字幕焼き込み／-16 LUFS（True Peak 約 -1 dBFS）。

## 構成

```
src/data/script.json   台本（字幕文 text と TTS 用の読み tts を分けて管理）・声の設定・余白
src/data/timing_v2.json 修正版ナレーションの実測時間（字幕チャンク・きっかけ単位）※ tools/tts.py が出力
src/data/timing.json   初版ナレーションの実測時間 ※ tools/tts_v1.py が出力
src/data/pronunciation.json 固有名詞のユーザー辞書（読みとアクセント）
src/timeline.ts        script.json + timing.json → 各場面の開始フレーム・長さ
src/scenes/*.tsx       各場面（S01〜S08, A01〜A03）。場面内の動きはナレーションのキューに同期
src/components/        字幕帯、見出し、SVG アイコン、地図（d3-geo + world-atlas）
public/audio, music, se  ナレーション、BGM、効果音
tools/                 TTS、BGM 合成、SRT・script.md 生成、仕上げ（音量正規化）、同期検証
```

## 準備

```bash
npm install
# Chrome が自動で取得できない環境では、手元の Chrome/Chromium を指定する
export REMOTION_BROWSER=/path/to/chrome-headless-shell
```

## プレビュー

```bash
npm run studio      # Main / Full（修正版）、MainV1 / FullV1（初版）を確認
```

## 動画の書き出し

```bash
npm run build       # SRT・script.md を生成し、修正版の2版をレンダリング → deliverables/*_v2.mp4
npm run verify      # 書き出した音声と字幕タイミングのずれを確認（numpy が必要）
npm run render:main:v1 / render:full:v1   # 初版を作り直す場合
```

`render:*` は Remotion で `out/raw_*.mp4` を書き出したあと、`tools/finalize.sh` で音量を -16 LUFS に正規化し、映像を yuv420p の H.264 に変換して `deliverables/` に保存します。

## 台本の修正

1. `src/data/script.json` の該当シーンを編集する。
   - `chunks[].text`：画面に出る字幕（1チャンク＝字幕1枚）。読み上げ用のカナは字幕に出ない。
   - `speech[]`：1文＝1回の合成単位。`parts[].chunk` はその部分を表示する字幕チャンク番号、`parts[].kana` は読みとアクセント、`pause` は文の後の無音（秒）、`question: true` は問いかけの文。
2. 読みとアクセントの書き方（AquesTalk 風記法）
   - `'` アクセント核（直後で下がる。句末に置くと平板）、`/` 句の区切り（間なし）、`、` 区切り＋短い間、`_` 無声化
   - 長音は「ー」ではなく母音で書く（例：ワタキュウ、ビョオイン）
   - `|` は発音しない目印。シーンのアニメーションのきっかけ（`seg(i, j)`）の区切りになる
   - `kana` を省くと `parts[].text` をユーザー辞書つきで自動解析する
3. 固有名詞は `src/data/pronunciation.json` に登録する（`accent_type` はアクセント核のモーラ位置、0＝平板、`check_kana` は期待する読み）。`npm run tts:check` で辞書の照合結果と全文の読みを確認できる。
4. 音声を作り直し（下記）、`npm run build`。音声の長さが変わると、場面の長さ・字幕・アニメーションのきっかけは自動で追従する。

画面上の図解の文言（ラベルや注記）は `src/scenes/*.tsx` にあります。

## 音声の生成・差し替え

VOICEVOX Core 0.16.0 をローカルで使います（API キー・アカウント不要）。

```bash
# 1) VOICEVOX Core 一式を取得（例：/opt/vv に配置）
mkdir -p /opt/vv && cd /opt/vv
curl -LO https://github.com/VOICEVOX/voicevox_core/releases/download/0.16.0/voicevox_core-0.16.0-cp310-abi3-manylinux_2_34_x86_64.whl
curl -LO https://github.com/VOICEVOX/onnxruntime-builder/releases/download/voicevox_onnxruntime-1.17.3/voicevox_onnxruntime-linux-x64-1.17.3.tgz && tar xzf voicevox_onnxruntime-linux-x64-1.17.3.tgz
curl -LO https://github.com/r9y9/open_jtalk/releases/download/v1.11.1/open_jtalk_dic_utf_8-1.11.tar.gz && tar xzf open_jtalk_dic_utf_8-1.11.tar.gz
mkdir -p vvms && curl -L -o vvms/4.vvm https://github.com/VOICEVOX/voicevox_vvm/releases/download/0.16.0/4.vvm
python3 -m venv venv && ./venv/bin/pip install ./voicevox_core-0.16.0-*.whl numpy

# 2) 生成（全シーン、または指定シーンのみ）
cd <このディレクトリ>
VOICEVOX_DIR=/opt/vv /opt/vv/venv/bin/python tools/tts.py            # 修正版 v2 → public/audio/v2/, timing_v2.json
VOICEVOX_DIR=/opt/vv /opt/vv/venv/bin/python tools/tts.py scene05
VOICEVOX_DIR=/opt/vv /opt/vv/venv/bin/python tools/tts.py --check    # 辞書の照合と全文の読み・アクセント一覧
VOICEVOX_DIR=/opt/vv /opt/vv/venv/bin/python tools/make_samples.py   # 修正前後の比較サンプル（parselmouth・matplotlib が必要）
```

`tools/readings_v2.txt` に、各文の最終的な読みとアクセントが出力されます。

**抑揚の補正設定**（`script.json` の `voiceV2`）：話速 0.93、抑揚 0.95、山の圧縮（`peakKnee`/`peakRatio`）、文・句の下降（`sentenceDecl`/`phraseDecl`）、文末の下げ（`endFall`/`endStretch`）、問いかけの上昇（`questionRise`/`questionStretch`）、助詞の跳ね上がり抑制（`particleClamp`）。各項目の意味は `tools/tts.py` の冒頭に書いてあります。

**別の音声（収録音声や他の TTS）に差し替える場合**：`public/audio/v2/<scene>.wav` を置き換え、`src/data/timing_v2.json` の該当シーンの `duration` と、各チャンクの `start`/`end` と `segments`（音声ファイル先頭からの秒）を実測値に更新してから `npm run build` してください。字幕・場面の長さ・アニメーションのきっかけはこの値から決まります。

生成した音声は「VOICEVOX:玄野武宏」のクレジット表記が必要です（終了画面に表示済み）。初版の生成手順は `tools/tts_v1.py`（読み上げ文は `chunks[].tts`）に残してあります。

## BGM・効果音

```bash
npm run music   # tools/music.py で合成（自作・外部音源なし）→ public/music/bgm.m4a, public/se/*.wav
```

BGM の音量とナレーション中のダッキングは `src/Video.tsx` の `bgmVol` で調整します。
