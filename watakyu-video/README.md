# 一枚のシーツから世界へ ― ワタキューセイモアの海外での挑戦

高校生向け 職場見学 学習用解説のモーショングラフィック動画（Remotion 製）。

| 納品物 | 場所 |
|---|---|
| 本編のみ（約92秒） | `deliverables/watakyu_main.mp4` ＋ `deliverables/watakyu_main.srt` |
| 追加パート付き（約117秒） | `deliverables/watakyu_full.mp4` ＋ `deliverables/watakyu_full.srt` |
| シーン別ナレーション | `public/audio/scene01.wav`〜`scene08.wav`, `appendix01.wav`, `appendix02.wav`（48kHz・モノラル、各 -24 LUFS） |
| 確定台本と実際のタイミング | `script.md` |
| 出典・事実の対応、素材の利用条件 | `sources.md` |

動画仕様：1920×1080／30fps／H.264（High, yuv420p）＋AAC 48kHz ステレオ／字幕焼き込み／-16 LUFS（True Peak 約 -1 dBFS）。

## 構成

```
src/data/script.json   台本（字幕文 text と TTS 用の読み tts を分けて管理）・声の設定・余白
src/data/timing.json   TTS で生成した音声の実測時間（チャンク・区切り単位）※ tools/tts.py が出力
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
npm run studio      # ブラウザで Main（本編）/ Full（追加パート付き）を確認
```

## 動画の書き出し

```bash
npm run build       # SRT・script.md を生成し、2版をレンダリング → deliverables/ に出力
npm run verify      # 書き出した音声と字幕タイミングのずれを確認（numpy が必要）
```

`render:*` は Remotion で `out/raw_*.mp4` を書き出したあと、`tools/finalize.sh` で音量を -16 LUFS に正規化し、映像を yuv420p の H.264 に変換して `deliverables/` に保存します。

## 台本の修正

1. `src/data/script.json` の該当シーンを編集する。
   - `text`：画面に出る字幕（1チャンク＝字幕1枚）。
   - `tts`：読み上げる文と、その後の間（秒）の組。読み間違える語は表記を変える（例：日本→「ニホン」、行って→「おこなって」）。
2. 音声を作り直す（下記）。音声の長さが変わると、場面の長さ・字幕・アニメーションのキューは自動で追従します。
3. `npm run build`。

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
VOICEVOX_DIR=/opt/vv /opt/vv/venv/bin/python tools/tts.py
VOICEVOX_DIR=/opt/vv /opt/vv/venv/bin/python tools/tts.py scene05
```

`tools/readings.txt` に、各文を TTS がどう読んだか（カタカナ）が出力されます。固有名詞・数字の読みはここで確認できます。

**別の音声（収録音声や他の TTS）に差し替える場合**：`public/audio/<scene>.wav` を置き換え、`src/data/timing.json` の該当シーンの `duration` と各チャンクの `start`/`end`（音声ファイル先頭からの秒）を実測値に更新してから `npm run build` してください。字幕・場面の長さはこの値から決まります。

声の設定（全シーン共通）：玄野武宏（ノーマル, styleId 11）、話速 0.93、抑揚 1.05、間 1.15。生成した音声は「VOICEVOX:玄野武宏」のクレジット表記が必要です（終了画面に表示済み）。

## BGM・効果音

```bash
npm run music   # tools/music.py で合成（自作・外部音源なし）→ public/music/bgm.m4a, public/se/*.wav
```

BGM の音量とナレーション中のダッキングは `src/Video.tsx` の `bgmVol` で調整します。
