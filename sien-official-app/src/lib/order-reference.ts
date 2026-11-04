export const REFERENCE_FIDELITY_OPTIONS = [
  { value: "1", label: "完全お任せ", description: "参考音源は見ますが、全体の方向性はお任せください。" },
  { value: "2", label: "参考にしつつ調整", description: "参考音源の雰囲気を取り入れながら仕上げます。" },
  { value: "3", label: "リファレンス重視", description: "できる限り参考音源に近い方向で制作します。" },
] as const;
