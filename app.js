const screens = [
  {
    id: "landing",
    title: "今晚睡眠",
    heading: "不是监测面板，而是主动干预的睡眠闭环",
    badge: "准备开始",
    action: "开始体验",
    description:
      "Somnus AI 将床品接口采集到的状态数据转化为可执行的睡眠干预，帮助用户更快入睡，并在更合适的时间醒来。",
  },
  {
    id: "checkin",
    title: "睡前检测",
    heading: "身体数据告诉我们发生了什么，对话告诉我们为什么",
    badge: "阶段 1",
    action: "生成助眠方案",
    description:
      "系统融合枕头与床垫的生理数据和 AI 睡前对话，识别用户此刻真正的入睡阻力。",
  },
  {
    id: "plan",
    title: "助眠方案",
    heading: "把生理信号与对话分析转化为个性化助眠策略",
    badge: "阶段 2",
    action: "开始睡眠流程",
    description:
      "AI 睡眠助手基于实时状态输出个性化助眠方案，不是固定播放内容，而是根据入睡问题动态选择干预方式。",
  },
  {
    id: "sleeping",
    title: "睡眠进行",
    heading: "从紧张到平稳的夜间状态流",
    badge: "阶段 3",
    action: "进入智能唤醒",
    description:
      "系统展示用户如何从高心率、高体动的入睡困难状态，逐步切换到更稳定的睡眠状态。",
  },
  {
    id: "wake",
    title: "智能唤醒",
    heading: "在浅睡窗口内选择更合适的唤醒时机",
    badge: "阶段 4",
    action: "查看晨间反馈",
    description:
      "用户设定最晚起床时间后，系统会在一个可接受窗口内寻找更轻、更自然的叫醒时刻。",
  },
  {
    id: "summary",
    title: "晨间反馈",
    heading: "把整晚睡眠问题解释清楚",
    badge: "完成",
    action: "重新开始演示",
    description:
      "晨间总结的数据将用于优化未来的助眠方案。",
  },
];

const metrics = [
  { key: "heartRate", label: "心率", unit: "bpm" },
  { key: "hrv", label: "HRV", unit: "ms" },
  { key: "breathRate", label: "呼吸", unit: "/min" },
  { key: "movementLevel", label: "体动", unit: "/10" },
  { key: "noiseLevel", label: "噪音", unit: "dB" },
  { key: "lightLevel", label: "光线", unit: "lux" },
];

const sensorTimeline = [
  { heartRate: 92, hrv: 22, breathRate: 20, movementLevel: 8, noiseLevel: 47, lightLevel: 28 },
  { heartRate: 88, hrv: 26, breathRate: 19, movementLevel: 7, noiseLevel: 41, lightLevel: 22 },
  { heartRate: 83, hrv: 31, breathRate: 17, movementLevel: 6, noiseLevel: 35, lightLevel: 16 },
  { heartRate: 77, hrv: 38, breathRate: 16, movementLevel: 4, noiseLevel: 29, lightLevel: 11 },
  { heartRate: 72, hrv: 45, breathRate: 14, movementLevel: 3, noiseLevel: 23, lightLevel: 8 },
  { heartRate: 68, hrv: 50, breathRate: 13, movementLevel: 2, noiseLevel: 20, lightLevel: 6 },
  { heartRate: 64, hrv: 58, breathRate: 12, movementLevel: 2, noiseLevel: 18, lightLevel: 4 },
  { heartRate: 63, hrv: 61, breathRate: 12, movementLevel: 2, noiseLevel: 17, lightLevel: 4 },
  { heartRate: 66, hrv: 56, breathRate: 13, movementLevel: 3, noiseLevel: 17, lightLevel: 6 },
  { heartRate: 69, hrv: 51, breathRate: 14, movementLevel: 4, noiseLevel: 19, lightLevel: 8 },
];

const sensorRules = {
  heartRate: { min: 52, max: 105, maxStep: 2, noise: 1.2, decimals: 0 },
  hrv: { min: 16, max: 82, maxStep: 3, noise: 2.2, decimals: 0 },
  breathRate: { min: 9, max: 22, maxStep: 0.5, noise: 0.35, decimals: 1 },
  movementLevel: { min: 0, max: 10, maxStep: 0.8, noise: 0.65, decimals: 1 },
  noiseLevel: { min: 15, max: 58, maxStep: 2, noise: 1.8, decimals: 0 },
  lightLevel: { min: 1, max: 36, maxStep: 2, noise: 1.1, decimals: 0 },
};

const sensorState = {
  frame: { ...sensorTimeline[0] },
  samples: [],
  clockMinutes: 22 * 60 + 46,
  timerId: null,
};

function createSeededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function generateHistoricalSleepData(seed = 20260724) {
  const random = createSeededRandom(seed);
  const startDate = Date.UTC(2026, 5, 25);

  return Array.from({ length: 30 }, (_, index) => {
    const usesAiPlan = index >= 15;
    const learningProgress = usesAiPlan ? (index - 15) / 14 : 0;
    const workRumination = clamp(0.46 + random() * 0.45 - learningProgress * 0.13, 0.2, 0.95);
    const loneliness = clamp(0.34 + random() * 0.42 - learningProgress * 0.08, 0.18, 0.88);
    const noiseLevel = Math.round(clamp(24 + random() * 17 - (usesAiPlan ? 5 : 0), 17, 46));
    const sleepLatency = Math.round(
      clamp(19 + workRumination * 23 + loneliness * 11 + (noiseLevel - 20) * 0.35 - (usesAiPlan ? 17 + learningProgress * 4 : 0) + (random() - 0.5) * 7, 10, 58)
    );
    const awakenings = Math.round(clamp(1 + loneliness * 2.1 + (noiseLevel - 20) * 0.06 - (usesAiPlan ? 1.1 : 0) + (random() - 0.5), 0, 5));
    const hrv = Math.round(clamp(31 + (1 - workRumination) * 19 + (usesAiPlan ? 8 + learningProgress * 4 : 0) + (random() - 0.5) * 6, 26, 68));
    const avgHeartRate = Math.round(clamp(73 - hrv * 0.16 + workRumination * 9 - (usesAiPlan ? 3 : 0) + (random() - 0.5) * 3, 57, 79));
    const sleepDuration = Math.round(clamp(455 - sleepLatency * 0.72 - awakenings * 12 + (usesAiPlan ? 28 : 0) + (random() - 0.5) * 25, 350, 500));
    const recoveryScore = Math.round(clamp(45 + hrv * 0.48 + sleepDuration * 0.055 - sleepLatency * 0.32 - awakenings * 2.5 + (usesAiPlan ? 5 : 0), 52, 92));
    const morningRating = roundTo(clamp(1.5 + recoveryScore / 30 + (random() - 0.5) * 0.55, 2.5, 5), 1);
    const date = new Date(startDate + index * 24 * 60 * 60 * 1000);

    return {
      date: `${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`,
      nightIndex: index + 1,
      sleepDuration,
      sleepLatency,
      awakenings,
      avgHeartRate,
      hrv,
      recoveryScore,
      bedtimeEmotion: workRumination > 0.68 ? "工作反刍" : loneliness > 0.58 ? "夜间孤独" : "相对平稳",
      workRumination: roundTo(workRumination, 2),
      loneliness: roundTo(loneliness, 2),
      noiseLevel,
      intervention: usesAiPlan ? "身体扫描 + 柔和夜雨" : "未使用 AI 方案",
      morningRating,
      usesAiPlan,
    };
  });
}

function averageBy(records, key) {
  return records.reduce((total, record) => total + record[key], 0) / records.length;
}

function correlation(records, keyA, keyB) {
  const meanA = averageBy(records, keyA);
  const meanB = averageBy(records, keyB);
  let numerator = 0;
  let varianceA = 0;
  let varianceB = 0;
  records.forEach((record) => {
    const differenceA = record[keyA] - meanA;
    const differenceB = record[keyB] - meanB;
    numerator += differenceA * differenceB;
    varianceA += differenceA ** 2;
    varianceB += differenceB ** 2;
  });
  return numerator / Math.sqrt(Math.max(0.0001, varianceA * varianceB));
}

function buildLearningProfile(records) {
  const before = records.filter((record) => !record.usesAiPlan);
  const after = records.filter((record) => record.usesAiPlan);
  const recent = records.slice(-7);
  const comparison = {
    sleepLatency: { before: averageBy(before, "sleepLatency"), after: averageBy(after, "sleepLatency") },
    awakenings: { before: averageBy(before, "awakenings"), after: averageBy(after, "awakenings") },
    recoveryScore: { before: averageBy(before, "recoveryScore"), after: averageBy(after, "recoveryScore") },
  };
  const recoveryTrend = averageBy(recent, "recoveryScore") - averageBy(after.slice(0, 7), "recoveryScore");

  return {
    nightsLearned: records.length,
    confidence: 0.91,
    baseline: {
      sleepLatency: averageBy(before, "sleepLatency"),
      hrv: averageBy(before, "hrv"),
      recoveryScore: averageBy(before, "recoveryScore"),
    },
    comparison,
    influences: [
      { label: "工作反刍", value: Math.round(Math.abs(correlation(records, "workRumination", "sleepLatency")) * 100), direction: "阻碍入睡", tone: "negative" },
      { label: "夜间孤独", value: Math.round(Math.abs(correlation(records, "loneliness", "awakenings")) * 100), direction: "增加夜醒", tone: "negative" },
      { label: "环境噪声", value: Math.round(Math.abs(correlation(records, "noiseLevel", "sleepLatency")) * 100), direction: "延长入睡", tone: "negative" },
      { label: "身体扫描", value: Math.round(clamp((comparison.sleepLatency.before - comparison.sleepLatency.after) * 3.2, 20, 88)), direction: "缩短入睡", tone: "positive" },
      { label: "柔和夜雨", value: Math.round(clamp((comparison.awakenings.before - comparison.awakenings.after) * 32, 18, 82)), direction: "减少夜醒", tone: "positive" },
    ],
    prediction: {
      recoveryScore: Math.round(clamp(averageBy(recent, "recoveryScore") + Math.max(2, recoveryTrend * 0.35), 72, 94)),
      confidence: 0.88,
      adjustments: ["身体扫描冥想延长至 10 分钟", "睡前 20 分钟将光照降至 8 lux", "继续使用柔和夜雨并降低 8% 音量"],
    },
  };
}

const historicalSleepData = generateHistoricalSleepData();
const learningProfile = buildLearningProfile(historicalSleepData);

const state = {
  screenIndex: 0,
  timelineIndex: 0,
  wakeTargetMinutes: 7 * 60 + 30,
  learningMetric: "recoveryScore",
  reportedMood: "有点孤独，脑子停不下来",
  sleepAnalysis: {
    lonelinessLevel: "中",
    stressSource: "工作思绪未卸载",
    cognitiveArousal: "高",
    primaryNeed: "倾听陪伴",
    summary: "用户在独处环境中仍持续处理工作信息，孤独感与认知反刍共同提高了入睡阻力。",
    confidence: 0.72,
  },
  planPreferences: {
    duration: 8,
    breathingMode: "body-scan",
    soundscape: "rain",
    autoDim: true,
    pillowPulse: true,
  },
  chatMessages: [
    {
      role: "assistant",
      content: "我在。枕头检测到你的心率和翻身次数都比平时高一点。今晚发生了什么，让你一直放不下来？",
    },
  ],
};

const companionConfig = {
  mode:
    globalThis.location?.protocol === "file:" || globalThis.location?.hostname?.endsWith("github.io")
      ? "mock"
      : "api",
  model: "deepseek-v4-flash",
  endpoint: "/api/chat",
};

const breathingModes = [
  { id: "body-scan", type: "meditation", label: "身体扫描冥想", detail: "从额头到脚逐步松开紧张", inhale: 5, exhale: 7 },
  { id: "safe-place", type: "meditation", label: "安全场景冥想", detail: "用安静场景收束注意力", inhale: 5, exhale: 7 },
  { id: "4-6", type: "breathing", label: "4-6 呼吸", detail: "吸气 4 秒 · 呼气 6 秒", inhale: 4, exhale: 6 },
  { id: "natural", type: "breathing", label: "自然延长呼吸", detail: "跟随当前呼吸逐步放慢", inhale: 5, exhale: 7 },
];

const meditationScripts = {
  "body-scan": [
    { until: 0.2, label: "安静下来", detail: "轻轻闭上眼睛，感受身体与床垫接触的位置。" },
    { until: 0.45, label: "放松面部", detail: "松开眉心、眼周和下颌，不需要刻意做任何表情。" },
    { until: 0.72, label: "释放肩颈", detail: "让肩膀向床面下沉，把今天没有完成的事暂时放在一边。" },
    { until: 1, label: "身体下沉", detail: "感受胸口、腹部和双腿逐渐变重，允许自己进入休息。" },
  ],
  "safe-place": [
    { until: 0.2, label: "进入场景", detail: "想象一个让你感到安静和安全的地方。" },
    { until: 0.45, label: "感受光线", detail: "观察那里柔和的光线、温度和空气，不需要补充细节。" },
    { until: 0.72, label: "听见声音", detail: "让远处稳定的声音留在背景里，注意力慢慢变轻。" },
    { until: 1, label: "留在此刻", detail: "你不需要解决任何事情，只需要在这个安全场景里休息。" },
  ],
};

const soundscapes = [
  { id: "rain", label: "柔和夜雨", detail: "掩盖间歇环境噪声" },
  { id: "ocean", label: "远岸潮汐", detail: "低频、规律、无突发音" },
  { id: "pink", label: "粉红噪声", detail: "稳定连续的低刺激背景" },
];

const planPreview = {
  active: false,
  timerId: null,
  startedAt: 0,
  lastPhase: "",
};

const PLAN_PREVIEW_DURATION = 20_000;

const SLEEP_DEMO_DURATION = 32_000;
const SIMULATED_SLEEP_MINUTES = 8 * 60;
const sleepTimer = {
  active: false,
  timerId: null,
  startedAt: 0,
};

const sleepStages = [
  { at: 0, label: "正在入睡", detail: "呼吸逐渐放慢，体动开始减少" },
  { at: 0.12, label: "浅睡期", detail: "感知外界刺激的敏感度下降" },
  { at: 0.34, label: "深睡期", detail: "身体修复与能量恢复进入高峰" },
  { at: 0.68, label: "REM 睡眠", detail: "大脑进行记忆与情绪整理" },
  { at: 0.9, label: "接近唤醒", detail: "系统开始寻找自然浅睡窗口" },
];

const LEARNING_ANIMATION_DURATION = 5_000;
const learningAnimation = {
  active: false,
  completed: false,
  timerId: null,
  startedAt: 0,
};

const learningSteps = [
  { label: "读取历史数据", detail: "30 晚多模态睡眠记录" },
  { label: "建立个人基线", detail: "识别你的正常波动范围" },
  { label: "评估干预效果", detail: "比较方案使用前后变化" },
  { label: "生成明晚方案", detail: "预测更合适的干预组合" },
];

const learningMetrics = {
  recoveryScore: { label: "恢复指数", unit: "分", min: 50, max: 95, color: "#8ce0cb" },
  sleepLatency: { label: "入睡耗时", unit: "min", min: 5, max: 60, color: "#f5b971" },
  hrv: { label: "HRV", unit: "ms", min: 20, max: 72, color: "#8ea9ff" },
};

const WAKE_DEMO_DURATION = 18_000;
const wakeDemo = {
  active: false,
  timerId: null,
  audioContext: null,
  stageIndex: -1,
};

const wakeStages = [
  { at: 0, label: "浅睡确认", detail: "床品接口检测到体动增加，确认进入自然唤醒窗口。" },
  { at: 0.18, label: "晨光启动", detail: "环境光从极低亮度缓慢升高，减少醒来时的刺激。" },
  { at: 0.45, label: "声音淡入", detail: "自然提示音以极低音量进入，并根据反应逐步增强。" },
  { at: 0.72, label: "轻触唤醒", detail: "枕头提供轻柔触觉反馈，声音与晨光同步增强。" },
  { at: 0.94, label: "清醒确认", detail: "检测到持续体动与心率上升，系统判断用户已经醒来。" },
];

const els = {
  progressSteps: document.getElementById("progress-steps"),
  screenTitle: document.getElementById("screen-title"),
  screenHeading: document.getElementById("screen-heading"),
  stageBadge: document.getElementById("stage-badge"),
  screenDescription: document.getElementById("screen-description"),
  screenBody: document.getElementById("screen-body"),
  primaryAction: document.getElementById("primary-action"),
  resetButton: document.getElementById("reset-button"),
  metricsGrid: document.getElementById("metrics-grid"),
  timelineBars: document.getElementById("timeline-bars"),
  timelineLabel: document.getElementById("timeline-label"),
  insightText: document.getElementById("insight-text"),
};

function getCurrentFrame() {
  return sensorState.frame;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function roundTo(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function createNextSensorFrame(targetFrame = sensorTimeline[state.timelineIndex]) {
  return Object.fromEntries(
    Object.entries(sensorRules).map(([key, rule]) => {
      const current = sensorState.frame[key];
      const targetPull = (targetFrame[key] - current) * 0.24;
      const variation = (Math.random() - 0.5) * rule.noise;
      const delta = clamp(targetPull + variation, -rule.maxStep, rule.maxStep);
      const nextValue = clamp(current + delta, rule.min, rule.max);
      return [key, roundTo(nextValue, rule.decimals)];
    })
  );
}

function initializeSensorHistory() {
  sensorState.frame = { ...sensorTimeline[0] };
  sensorState.clockMinutes = 22 * 60 + 46;
  sensorState.samples = [];

  for (let index = 11; index >= 0; index -= 1) {
    const sample = Object.fromEntries(
      Object.entries(sensorRules).map(([key, rule]) => {
        const variation = (Math.random() - 0.5) * rule.noise * 1.7;
        return [key, roundTo(clamp(sensorState.frame[key] + variation, rule.min, rule.max), rule.decimals)];
      })
    );
    sensorState.samples.push({ ...sample, clockMinutes: sensorState.clockMinutes - index });
  }
  sensorState.frame = { ...sensorState.samples[sensorState.samples.length - 1] };
}

function tickSensorSimulation() {
  sensorState.clockMinutes += 1;
  sensorState.frame = createNextSensorFrame();
  sensorState.samples.push({ ...sensorState.frame, clockMinutes: sensorState.clockMinutes });
  sensorState.samples = sensorState.samples.slice(-20);
  renderMetrics();
  renderTimeline();
  renderInsight();
}

function startSensorSimulation() {
  if (sensorState.timerId) clearInterval(sensorState.timerId);
  sensorState.timerId = setInterval(tickSensorSimulation, 1200);
}

function assessSleepState(frame) {
  if (frame.heartRate > 85 && frame.movementLevel >= 7) {
    return {
      stateLabel: "高唤醒 / 入睡困难",
      arousalLevel: "高",
      sleepResistanceReason: "夜间孤独感、思维未卸载、环境刺激偏强",
      emotionalNeed: "需要被倾听和陪伴，再逐步降低认知唤醒",
      sleepStability: "低",
      confidence: 0.93,
    };
  }

  if (frame.heartRate > 74 || frame.movementLevel >= 4) {
    return {
      stateLabel: "正在放松",
      arousalLevel: "中",
      sleepResistanceReason: "仍存在轻度紧张，但已开始下降",
      emotionalNeed: "减少对话强度，转入安静陪伴",
      sleepStability: "中",
      confidence: 0.87,
    };
  }

  if (frame.heartRate <= 66 && frame.movementLevel <= 2) {
    return {
      stateLabel: "浅睡窗口",
      arousalLevel: "低",
      sleepResistanceReason: "睡眠稳定，可自然唤醒",
      emotionalNeed: "停止主动对话，保护连续睡眠",
      sleepStability: "高",
      confidence: 0.9,
    };
  }

  return {
    stateLabel: "睡眠趋稳",
    arousalLevel: "低",
    sleepResistanceReason: "生理指标平稳，已适合持续睡眠",
    emotionalNeed: "保持低刺激环境",
    sleepStability: "高",
    confidence: 0.89,
  };
}

function getInterventionPlan(assessment, sleepAnalysis = state.sleepAnalysis) {
  if (assessment.stateLabel.includes("高唤醒")) {
    const needsCompanion = sleepAnalysis.primaryNeed === "倾听陪伴" || sleepAnalysis.lonelinessLevel === "高";
    return {
      title: needsCompanion ? "情绪承接 + 深呼吸卸载方案" : "认知卸载 + 深呼吸方案",
      duration: "8 分钟",
      guidanceText: needsCompanion
        ? "对话分析显示孤独感正在放大工作反刍。先用短时低刺激陪伴承接情绪，再用 4-6 呼吸节奏降低生理唤醒。"
        : "对话分析显示主要阻力来自持续思考。先完成认知卸载，再用 4-6 呼吸节奏降低生理唤醒。",
      audioMode: "低频环境音 + 呼吸提示",
      environmentTips: ["关闭高亮屏幕", "将卧室光线降到 10 lux 以下", "枕边播放低频环境音"],
      tags: [sleepAnalysis.primaryNeed, "呼吸引导", "认知卸载", "环境降刺激"],
    };
  }

  return {
    title: "稳定延续方案",
    duration: "5 分钟",
    guidanceText: "当前身体已逐渐平稳，继续维持低刺激环境，避免重新激活注意力。",
    audioMode: "持续白噪音 + 极弱语音",
    environmentTips: ["保持当前音量", "维持低光环境", "避免再次查看手机"],
    tags: ["维持平稳", "轻干预", "持续白噪音"],
  };
}

function buildCompanionPrompt(frame, assessment) {
  return `你是 Somnus 睡前评估与陪伴助手。你的目标是通过低刺激对话理解用户此刻睡不着的主观原因，为下一步助眠方案提供依据。

当前上下文：
- 用户自述：${state.reportedMood}
- 状态判断：${assessment.stateLabel}，唤醒程度${assessment.arousalLevel}
- 生理数据：心率 ${frame.heartRate} bpm，HRV ${frame.hrv} ms，呼吸 ${frame.breathRate}/min，体动 ${frame.movementLevel}/10
- 环境数据：噪音 ${frame.noiseLevel} dB，光线 ${frame.lightLevel} lux
- 当前需要：${assessment.emotionalNeed}

回复原则：
1. 先倾听和复述感受，不评判，不急着给建议。
2. 每次只回复 1-3 个短句，语气温和、低刺激，避免让用户越聊越兴奋。
3. 不声称自己是人类，不鼓励用户依赖或只与 AI 建立关系。
4. 对话 2-3 轮后，询问是否愿意转入呼吸、声音或安静陪伴。
5. 不做医疗诊断；如用户表达自伤或紧急危险，优先建议联系当地紧急服务和可信任的人。`;
}

function analyzeConversationLocally() {
  const conversation = state.chatMessages
    .filter((item) => item.role === "user")
    .map((item) => item.content)
    .join(" ");
  const hasLoneliness = /孤独|一个人|没人|想家|陪我/.test(conversation);
  const hasWorkStress = /加班|工作|老板|项目|会议|任务/.test(conversation);
  const hasRumination = /停不下来|一直想|反复|担心|焦虑|脑子/.test(conversation);
  const wantsRelaxation = /呼吸|放松|睡觉|困|累/.test(conversation);
  const userMessageCount = state.chatMessages.filter((item) => item.role === "user").length;

  return {
    lonelinessLevel: hasLoneliness ? "高" : userMessageCount > 0 ? "中" : "待确认",
    stressSource: hasWorkStress ? "工作与未完成任务" : hasRumination ? "持续担忧与反刍" : "仍在识别",
    cognitiveArousal: hasRumination || hasWorkStress ? "高" : userMessageCount > 0 ? "中" : "待确认",
    primaryNeed: wantsRelaxation ? "呼吸放松" : hasLoneliness ? "倾听陪伴" : "认知卸载",
    summary: hasLoneliness && hasWorkStress
      ? "独处环境放大了工作后的反刍，用户需要先被倾听，再逐步收束注意力。"
      : hasWorkStress
        ? "主要入睡阻力来自工作思绪未卸载，需要先结束认知循环。"
        : "当前对话信息有限，建议继续用一个简短问题确认主要入睡阻力。",
    confidence: Math.min(0.9, 0.58 + userMessageCount * 0.12),
  };
}

function getMockCompanionReply(message) {
  const normalized = message.trim();

  if (/加班|工作|老板|项目|会议/.test(normalized)) {
    return "听起来你已经离开了工作，但工作还没有离开你的脑子。今晚不用把所有事想完，我们可以先把最挂心的那一件放在这里。";
  }

  if (/孤独|一个人|没人|想家|陪我/.test(normalized)) {
    return "一个人躺下时，白天被压住的孤独感确实会变得更清楚。我会陪你把这一刻慢慢放轻；你愿意说说今晚最希望有人理解你的哪一点吗？";
  }

  if (/呼吸|放松|睡觉|困|累/.test(normalized)) {
    return "好，我们不再处理新的事情了。跟着枕边的节奏吸气 4 秒、呼气 6 秒，我会把声音慢慢降下来。";
  }

  if (state.chatMessages.filter((item) => item.role === "user").length >= 2) {
    return "我听见了，今晚这些感受不需要立刻被解决。要不要把对话停在这里，我陪你做三轮缓慢呼吸？";
  }

  return "这件事在安静下来以后，好像变得更重了。你可以只说最压着你的那一小部分，我会听着。";
}

async function requestCompanionReply(message, frame, assessment) {
  if (companionConfig.mode === "mock") {
    return { reply: getMockCompanionReply(message), analysis: analyzeConversationLocally() };
  }

  // 真实接入时由后端代理模型请求，API Key 不应出现在浏览器代码中。
  const response = await fetch(companionConfig.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: companionConfig.model,
      systemPrompt: buildCompanionPrompt(frame, assessment),
      messages: state.chatMessages,
    }),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "夜间陪伴服务暂时不可用");
  }

  if (!data.reply) {
    throw new Error("夜间陪伴服务没有返回有效内容");
  }
  return { reply: data.reply, analysis: data.analysis || analyzeConversationLocally() };
}

function renderSleepAnalysis() {
  const analysis = state.sleepAnalysis;
  const confidence = Math.round(clamp(Number(analysis.confidence) || 0, 0, 1) * 100);
  return `
    <div class="sleep-analysis-card">
      <div class="analysis-heading">
        <div>
          <p class="card-label">AI 对话分析</p>
          <h4>主观状态画像</h4>
        </div>
        <span>${confidence}% 置信度</span>
      </div>
      <div class="analysis-grid">
        <div><small>孤独程度</small><strong>${escapeHtml(analysis.lonelinessLevel)}</strong></div>
        <div><small>压力来源</small><strong>${escapeHtml(analysis.stressSource)}</strong></div>
        <div><small>认知唤醒</small><strong>${escapeHtml(analysis.cognitiveArousal)}</strong></div>
        <div><small>主要需求</small><strong>${escapeHtml(analysis.primaryNeed)}</strong></div>
      </div>
      <p class="analysis-summary">${escapeHtml(analysis.summary)}</p>
    </div>
  `;
}

function renderCompanionCard(frame, assessment) {
  return `
    <div class="companion-card">
      <div class="companion-header">
        <div>
          <p class="card-label">AI 主观状态采集</p>
          <h4>身体有数据，感受也应该被听见</h4>
        </div>
        <span class="companion-status"><i></i> ${companionConfig.mode === "mock" ? "Demo AI · 本地分析" : "DeepSeek · 分析中"}</span>
      </div>
      <div class="context-strip">
        <span>心率 ${frame.heartRate} bpm</span>
        <span>体动 ${frame.movementLevel}/10</span>
        <span>生理唤醒：${assessment.arousalLevel}</span>
        <span>对话轮次：${state.chatMessages.filter((item) => item.role === "user").length}</span>
      </div>
      <div id="chat-messages" class="chat-messages" aria-live="polite">${renderChatMessages()}</div>
      <div class="quick-replies">
        <button type="button" data-chat-prompt="今天加班到很晚，停下来以后脑子还是一直在想工作。">工作停不下来</button>
        <button type="button" data-chat-prompt="我一个人住，晚上安静下来以后会觉得很孤独。">今晚有点孤独</button>
        <button type="button" data-chat-prompt="身体很累，但我还是放松不下来。">累但睡不着</button>
      </div>
      <form id="chat-form" class="chat-form">
        <input id="chat-input" type="text" maxlength="180" autocomplete="off" placeholder="告诉 AI 今晚为什么睡不着……" aria-label="输入睡前感受">
        <button type="submit">发送</button>
      </form>
      <p class="chat-footnote">对话用于助眠需求分析，不替代医疗或心理危机支持。</p>
    </div>
  `;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderChatMessages() {
  return state.chatMessages
    .map(
      (message) => `
        <div class="chat-message ${message.role === "user" ? "is-user" : "is-assistant"}">
          <span class="chat-role">${message.role === "user" ? "你" : "Somnus"}</span>
          <p>${escapeHtml(message.content)}</p>
        </div>
      `
    )
    .join("");
}

function buildSessionSummary(assessment, wakePlan) {
  return {
    problemDiagnosis: "昨晚的主要阻力来自独处时放大的孤独感与工作后的高唤醒，表现为心率偏高、体动频繁、呼吸节律不稳定。",
    interventionsUsed: "系统先用夜间陪伴对话承接情绪，再切换到呼吸引导、低频环境音和环境降刺激，帮助你逐步进入平稳睡眠。",
    wakeTimingReason: `系统在 ${wakePlan.triggerTime} 触发唤醒，因为当时体动与心率变化表明你处于更易醒来的浅睡窗口。`,
    nextSuggestion: "明晚建议在上床前 20 分钟停止工作信息输入，并提前开启放松模式。",
    score: "恢复指数 84 / 100",
    confidence: `${Math.round(assessment.confidence * 100)}%`,
  };
}

function buildLearningTrendChart(metricKey) {
  const metric = learningMetrics[metricKey] || learningMetrics.recoveryScore;
  const width = 720;
  const height = 230;
  const paddingX = 34;
  const paddingY = 24;
  const chartHeight = height - paddingY * 2;
  const chartWidth = width - paddingX * 2;
  const points = historicalSleepData.map((record, index) => {
    const x = paddingX + (index / (historicalSleepData.length - 1)) * chartWidth;
    const normalized = clamp((record[metricKey] - metric.min) / (metric.max - metric.min), 0, 1);
    const y = paddingY + (1 - normalized) * chartHeight;
    return { x, y, value: record[metricKey], record };
  });
  const pointString = points.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
  const interventionX = paddingX + (14.5 / (historicalSleepData.length - 1)) * chartWidth;
  const latestPoint = points[points.length - 1];
  const selectedValues = historicalSleepData.slice(-7).map((record) => record[metricKey]);
  const recentAverage = averageBy(historicalSleepData.slice(-7), metricKey);

  return `
    <div class="learning-chart-summary">
      <div><small>最近 7 晚均值</small><strong>${roundTo(recentAverage, metricKey === "recoveryScore" ? 0 : 1)} ${metric.unit}</strong></div>
      <div><small>最近波动范围</small><strong>${Math.min(...selectedValues)}–${Math.max(...selectedValues)} ${metric.unit}</strong></div>
      <div><small>个人基线</small><strong>${roundTo(learningProfile.baseline[metricKey] ?? averageBy(historicalSleepData.slice(0, 15), metricKey), 1)} ${metric.unit}</strong></div>
    </div>
    <div class="learning-chart-wrap">
      <svg class="learning-trend-chart" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img" aria-label="30 晚${metric.label}趋势">
        <defs>
          <linearGradient id="learning-area-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${metric.color}" stop-opacity="0.3"></stop>
            <stop offset="100%" stop-color="${metric.color}" stop-opacity="0"></stop>
          </linearGradient>
        </defs>
        <g class="learning-chart-grid">
          <line x1="${paddingX}" y1="${paddingY}" x2="${width - paddingX}" y2="${paddingY}"></line>
          <line x1="${paddingX}" y1="${height / 2}" x2="${width - paddingX}" y2="${height / 2}"></line>
          <line x1="${paddingX}" y1="${height - paddingY}" x2="${width - paddingX}" y2="${height - paddingY}"></line>
        </g>
        <polygon class="learning-area" points="${paddingX},${height - paddingY} ${pointString} ${width - paddingX},${height - paddingY}"></polygon>
        <polyline class="learning-line" pathLength="1" style="--learning-line-color:${metric.color}" points="${pointString}"></polyline>
        <line class="intervention-marker" x1="${interventionX}" y1="${paddingY}" x2="${interventionX}" y2="${height - paddingY}"></line>
        <circle class="learning-latest-point" style="--learning-line-color:${metric.color}" cx="${latestPoint.x}" cy="${latestPoint.y}" r="5"></circle>
      </svg>
      <span class="intervention-label" style="left:${(interventionX / width) * 100}%">AI 方案开始</span>
      <div class="learning-chart-axis"><span>${historicalSleepData[0].date}</span><span>${historicalSleepData[14].date}</span><span>${historicalSleepData[29].date}</span></div>
    </div>
  `;
}

function formatComparisonValue(key, value) {
  if (key === "sleepLatency") return `${Math.round(value)} min`;
  if (key === "awakenings") return `${roundTo(value, 1)} 次`;
  return `${Math.round(value)} 分`;
}

function buildComparisonCards() {
  const labels = {
    sleepLatency: { label: "平均入睡耗时", lowerIsBetter: true },
    awakenings: { label: "平均夜醒次数", lowerIsBetter: true },
    recoveryScore: { label: "平均恢复指数", lowerIsBetter: false },
  };

  return Object.entries(learningProfile.comparison)
    .map(([key, values]) => {
      const delta = values.after - values.before;
      const improvement = labels[key].lowerIsBetter ? -delta : delta;
      const changeText = `${improvement >= 0 ? "+" : ""}${roundTo(improvement, key === "awakenings" ? 1 : 0)}${key === "recoveryScore" ? " 分" : key === "sleepLatency" ? " min 改善" : " 次改善"}`;
      return `
        <div class="comparison-card">
          <p>${labels[key].label}</p>
          <div class="comparison-values">
            <span><small>使用前</small>${formatComparisonValue(key, values.before)}</span>
            <i>→</i>
            <strong><small>使用后</small>${formatComparisonValue(key, values.after)}</strong>
          </div>
          <em>${changeText}</em>
        </div>
      `;
    })
    .join("");
}

function renderLearningDashboard(summary) {
  const prediction = learningProfile.prediction;
  return `
    <div class="summary-overview grid-two">
      <div class="sub-card recovery-result-card">
        <p class="card-label">昨晚恢复结果</p>
        <h4>${summary.score}</h4>
        <p class="scenario-copy">单晚判断置信度：${summary.confidence}</p>
      </div>
      <div class="sub-card">
        <p class="card-label">昨晚发生了什么</p>
        <ul class="summary-list">
          <li>${summary.problemDiagnosis}</li>
          <li>${summary.interventionsUsed}</li>
          <li>${summary.wakeTimingReason}</li>
        </ul>
      </div>
    </div>

    <section id="learning-pipeline" class="learning-pipeline" style="--learning-progress:0;">
      <div class="learning-section-heading">
        <div>
          <p class="card-label">AI 个性化学习</p>
          <h4>系统正在把每一晚变成更懂你的下一晚</h4>
        </div>
        <div class="learning-model-status"><span id="learning-nights-count">0</span> 晚已学习 · <strong id="learning-confidence">0%</strong></div>
      </div>
      <div class="learning-flow-line"><span id="learning-flow-progress"></span></div>
      <div class="learning-steps">
        ${learningSteps.map((step, index) => `
          <div class="learning-step" data-learning-step="${index}">
            <i>${index + 1}</i><div><strong>${step.label}</strong><small>${step.detail}</small></div>
          </div>`).join("")}
      </div>
      <button id="replay-learning" class="replay-learning-button" type="button">重播学习过程</button>
    </section>

    <section class="learning-dashboard-card">
      <div class="learning-section-heading">
        <div><p class="card-label">30 晚趋势</p><h4>你的睡眠正在形成个人基线</h4></div>
        <div class="learning-metric-tabs">
          ${Object.entries(learningMetrics).map(([key, metric]) => `
            <button type="button" data-learning-metric="${key}" class="${state.learningMetric === key ? "is-selected" : ""}">${metric.label}</button>`).join("")}
        </div>
      </div>
      <div id="learning-trend-content">${buildLearningTrendChart(state.learningMetric)}</div>
    </section>

    <section class="learning-dashboard-card">
      <div class="learning-section-heading">
        <div><p class="card-label">AI 学到的个人规律</p><h4>哪些因素正在影响你的睡眠</h4></div>
        <span class="explainability-badge">可解释影响权重</span>
      </div>
      <div class="influence-list">
        ${learningProfile.influences.map((factor) => `
          <div class="influence-row ${factor.tone}">
            <div><strong>${factor.label}</strong><small>${factor.direction}</small></div>
            <div class="influence-bar"><span style="width:${factor.value}%"></span></div>
            <b>${factor.value}%</b>
          </div>`).join("")}
      </div>
    </section>

    <section class="learning-dashboard-card">
      <div class="learning-section-heading">
        <div><p class="card-label">干预效果验证</p><h4>方案使用前后发生了什么变化</h4></div>
        <span class="intervention-period">前 15 晚 vs 后 15 晚</span>
      </div>
      <div class="comparison-grid">${buildComparisonCards()}</div>
    </section>

    <section class="tomorrow-prediction-card">
      <div class="prediction-score">
        <p class="card-label">明晚恢复预测</p>
        <strong>${prediction.recoveryScore}</strong><span>/ 100</span>
        <small>预测置信度 ${Math.round(prediction.confidence * 100)}%</small>
      </div>
      <div class="prediction-plan">
        <p class="card-label">模型建议调整</p>
        <h4>明晚方案将自动微调</h4>
        <ul>${prediction.adjustments.map((adjustment) => `<li>${adjustment}</li>`).join("")}</ul>
      </div>
      <div class="prediction-arrow">→</div>
    </section>

    <p class="learning-disclaimer">基于 30 晚模拟睡眠数据的个性化学习 Demo，仅用于产品体验展示，不构成医疗诊断。</p>
  `;
}

function applyLearningAnimationProgress(progress) {
  const pipeline = document.getElementById("learning-pipeline");
  if (!pipeline) return;
  const clampedProgress = clamp(progress, 0, 1);
  const activeStep = Math.min(learningSteps.length - 1, Math.floor(clampedProgress * learningSteps.length));
  pipeline.style.setProperty("--learning-progress", clampedProgress.toFixed(3));
  document.getElementById("learning-flow-progress").style.width = `${clampedProgress * 100}%`;
  document.getElementById("learning-nights-count").textContent = Math.round(clampedProgress * learningProfile.nightsLearned);
  document.getElementById("learning-confidence").textContent = `${Math.round(clampedProgress * learningProfile.confidence * 100)}%`;
  document.querySelectorAll("[data-learning-step]").forEach((step, index) => {
    step.classList.toggle("is-active", index === activeStep && clampedProgress < 1);
    step.classList.toggle("is-complete", index < activeStep || clampedProgress >= 1);
  });
}

function stopLearningAnimation(markComplete = false) {
  if (learningAnimation.timerId) clearInterval(learningAnimation.timerId);
  learningAnimation.timerId = null;
  learningAnimation.active = false;
  if (markComplete) learningAnimation.completed = true;
}

function startLearningAnimation(forceReplay = false) {
  if (learningAnimation.completed && !forceReplay) {
    applyLearningAnimationProgress(1);
    return;
  }
  stopLearningAnimation(false);
  learningAnimation.completed = false;
  learningAnimation.active = true;
  learningAnimation.startedAt = Date.now();
  applyLearningAnimationProgress(0.001);
  learningAnimation.timerId = setInterval(() => {
    const progress = (Date.now() - learningAnimation.startedAt) / LEARNING_ANIMATION_DURATION;
    applyLearningAnimationProgress(progress);
    if (progress >= 1) stopLearningAnimation(true);
  }, 80);
}

function getWakePlan(targetMinutes) {
  const windowStart = targetMinutes - 30;
  const triggerTime = targetMinutes - 12;
  return {
    latestWake: formatMinutes(targetMinutes),
    windowStart: formatMinutes(windowStart),
    triggerTime: formatMinutes(triggerTime),
    reason: "浅睡窗口命中，当前体动与心率处于更适合自然唤醒的区间。",
  };
}

function formatMinutes(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function getWakeStage(progress) {
  for (let index = wakeStages.length - 1; index >= 0; index -= 1) {
    if (progress >= wakeStages[index].at) return { ...wakeStages[index], index };
  }
  return { ...wakeStages[0], index: 0 };
}

function playWakeChime(intensity) {
  const AudioContext = globalThis.AudioContext || globalThis.webkitAudioContext;
  if (!AudioContext) return;

  if (!wakeDemo.audioContext) wakeDemo.audioContext = new AudioContext();
  const context = wakeDemo.audioContext;
  if (context.state === "suspended") context.resume();

  const now = context.currentTime;
  const volume = 0.025 + intensity * 0.055;
  [523.25, 659.25].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, now + index * 0.12);
    gain.gain.setValueAtTime(0.0001, now + index * 0.12);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.28 + index * 0.12);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.65 + index * 0.12);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now + index * 0.12);
    oscillator.stop(now + 1.8 + index * 0.12);
  });
}

function updateWakeDemo(progress) {
  const demo = document.getElementById("wake-demo");
  if (!demo) return;

  const clampedProgress = Math.max(0, Math.min(1, progress));
  const stage = getWakeStage(clampedProgress);
  const wakePlan = getWakePlan(state.wakeTargetMinutes);
  const triggerMinutes = state.wakeTargetMinutes - 12;
  const simulatedMinutes = triggerMinutes + Math.round(clampedProgress * 12);

  demo.style.setProperty("--wake-progress", clampedProgress.toFixed(3));
  demo.style.setProperty("--sun-y", `${58 - clampedProgress * 92}px`);
  demo.style.setProperty("--horizon-glow", (clampedProgress * 0.32).toFixed(3));
  demo.classList.toggle("is-active", clampedProgress > 0 && clampedProgress < 1);
  demo.classList.toggle("is-complete", clampedProgress >= 1);

  document.getElementById("wake-demo-time").textContent = formatMinutes(simulatedMinutes);
  document.getElementById("wake-stage-label").textContent = stage.label;
  document.getElementById("wake-stage-detail").textContent = stage.detail;
  document.getElementById("wake-progress-value").textContent = `${Math.round(clampedProgress * 100)}%`;
  document.getElementById("wake-progress-bar").style.width = `${clampedProgress * 100}%`;

  document.querySelectorAll(".wake-phase").forEach((phase, index) => {
    phase.classList.toggle("is-current", index === stage.index);
    phase.classList.toggle("is-complete", index < stage.index || clampedProgress >= 1);
  });

  if (stage.index > wakeDemo.stageIndex) {
    wakeDemo.stageIndex = stage.index;
    if (stage.index === 2 || stage.index === 3) playWakeChime(clampedProgress);
  }

  if (clampedProgress >= 1) {
    document.getElementById("wake-demo-button").textContent = "再演示一次";
    document.getElementById("wake-demo-caption").textContent = `${wakePlan.triggerTime} 开始渐进唤醒，${wakePlan.latestWake} 前确认清醒`;
  }
}

function stopWakeDemo(resetVisual = true) {
  if (wakeDemo.timerId) clearInterval(wakeDemo.timerId);
  wakeDemo.timerId = null;
  wakeDemo.active = false;
  wakeDemo.stageIndex = -1;

  if (wakeDemo.audioContext) wakeDemo.audioContext.close();
  wakeDemo.audioContext = null;

  const button = document.getElementById("wake-demo-button");
  const range = document.getElementById("wake-range");
  if (button) button.textContent = "体验 18 秒渐进唤醒";
  if (range) range.disabled = false;
  if (resetVisual) updateWakeDemo(0);
}

function startWakeDemo() {
  if (wakeDemo.active) {
    stopWakeDemo();
    return;
  }

  stopWakeDemo();
  wakeDemo.active = true;
  wakeDemo.stageIndex = -1;
  const startedAt = Date.now();
  const button = document.getElementById("wake-demo-button");
  const range = document.getElementById("wake-range");
  if (button) button.textContent = "停止唤醒演示";
  if (range) range.disabled = true;
  updateWakeDemo(0.001);

  wakeDemo.timerId = setInterval(() => {
    const progress = (Date.now() - startedAt) / WAKE_DEMO_DURATION;
    updateWakeDemo(progress);
    if (progress >= 1) {
      clearInterval(wakeDemo.timerId);
      wakeDemo.timerId = null;
      wakeDemo.active = false;
      if (range) range.disabled = false;
    }
  }, 100);
}

function metricDescription(key, value) {
  switch (key) {
    case "heartRate":
      return value > 85 ? "偏高，提示仍处于高唤醒" : value > 72 ? "正在下降，进入放松阶段" : "平稳，接近适合睡眠的区间";
    case "hrv":
      return value < 30 ? "偏低，说明恢复状态不足" : value < 45 ? "正在回升，恢复能力改善" : "较高，说明身心更稳定";
    case "breathRate":
      return value > 18 ? "呼吸偏快，紧张感明显" : value > 14 ? "正在恢复稳定" : "呼吸稳定，适合维持睡眠";
    case "movementLevel":
      return value >= 7 ? "频繁翻身，入睡阻力明显" : value >= 4 ? "仍有体动，但已下降" : "体动低，睡眠稳定度更高";
    case "noiseLevel":
      return value >= 40 ? "环境刺激偏强" : value >= 25 ? "环境可接受，但仍可继续优化" : "环境安静，适合睡眠";
    case "lightLevel":
      return value >= 20 ? "光线偏亮，建议继续降低" : value >= 10 ? "已进入低光区间" : "低光环境稳定";
    default:
      return "";
  }
}

function buildSparkline(key, width = 112, height = 32) {
  const rule = sensorRules[key];
  const samples = sensorState.samples.slice(-12);
  const points = samples
    .map((sample, index) => {
      const x = samples.length === 1 ? width : (index / (samples.length - 1)) * width;
      const y = height - ((sample[key] - rule.min) / (rule.max - rule.min)) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return `<svg class="metric-sparkline" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true"><polyline points="${points}"></polyline></svg>`;
}

function getMetricTrend(key) {
  const samples = sensorState.samples;
  if (samples.length < 2) return { text: "采集中", className: "is-neutral" };

  const current = samples[samples.length - 1][key];
  const previous = samples[samples.length - 2][key];
  const difference = roundTo(current - previous, sensorRules[key].decimals);
  const threshold = sensorRules[key].decimals === 0 ? 1 : 0.2;
  if (Math.abs(difference) < threshold) return { text: "趋于稳定", className: "is-neutral" };

  const improving = key === "hrv" ? difference > 0 : difference < 0;
  const sign = difference > 0 ? "+" : "";
  return {
    text: `较前 1 分钟 ${sign}${difference}`,
    className: improving ? "is-improving" : "is-alerting",
  };
}

function buildTimelinePoints(key, width, height, padding) {
  const samples = sensorState.samples;
  const rule = sensorRules[key];
  return samples.map((sample, index) => {
    const x = padding + (index / Math.max(1, samples.length - 1)) * (width - padding * 2);
    const y = padding + (1 - (sample[key] - rule.min) / (rule.max - rule.min)) * (height - padding * 2);
    return { x, y };
  });
}

function pointsToString(points) {
  return points.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
}

function getSelectedBreathingMode() {
  return breathingModes.find((mode) => mode.id === state.planPreferences.breathingMode) || breathingModes[0];
}

function getSelectedSoundscape() {
  return soundscapes.find((sound) => sound.id === state.planPreferences.soundscape) || soundscapes[0];
}

function renderPlanComposer() {
  const preferences = state.planPreferences;
  const breathing = getSelectedBreathingMode();
  const soundscape = getSelectedSoundscape();

  return `
    <div class="plan-composer">
      <div class="composer-heading">
        <div><p class="card-label">今晚方案编排</p><h4>根据你的感受做最后调整</h4></div>
        <span id="plan-total-time">共 ${preferences.duration + 2} 分钟</span>
      </div>
      <div class="plan-control-grid">
        <div class="plan-control">
          <div class="control-label-row">
            <div><strong>助眠引导时长</strong><small>建议 6–12 分钟</small></div>
            <span id="plan-duration-value">${preferences.duration} 分钟</span>
          </div>
          <input id="plan-duration-range" type="range" min="5" max="15" step="1" value="${preferences.duration}">
        </div>
        <div class="plan-control">
          <strong>引导方式</strong>
          <div class="choice-buttons">
            ${breathingModes.map((mode) => `
              <button class="${mode.id === breathing.id ? "is-selected" : ""}" type="button" data-breathing-mode="${mode.id}">
                <span>${mode.label}</span><small>${mode.detail}</small>
              </button>`).join("")}
          </div>
        </div>
        <div class="plan-control">
          <strong>环境声音</strong>
          <div class="choice-buttons sound-choice-buttons">
            ${soundscapes.map((sound) => `
              <button class="${sound.id === soundscape.id ? "is-selected" : ""}" type="button" data-soundscape="${sound.id}">
                <span>${sound.label}</span><small>${sound.detail}</small>
              </button>`).join("")}
          </div>
        </div>
        <div class="plan-control device-control">
          <strong>床品联动</strong>
          <button class="plan-toggle ${preferences.autoDim ? "is-on" : ""}" type="button" data-plan-toggle="autoDim" aria-pressed="${preferences.autoDim}">
            <span><b>灯光渐暗</b><small>10 分钟内降至 5 lux</small></span><i></i>
          </button>
          <button class="plan-toggle ${preferences.pillowPulse ? "is-on" : ""}" type="button" data-plan-toggle="pillowPulse" aria-pressed="${preferences.pillowPulse}">
            <span><b>枕头呼吸轻触</b><small>用触觉同步呼吸节奏</small></span><i></i>
          </button>
        </div>
      </div>
      <div class="routine-preview">
        <div class="routine-heading"><strong>执行时间轴</strong><span>${soundscape.label}将全程保持低音量</span></div>
        <div class="routine-track">
          <div class="routine-segment emotion" style="flex: 2"><span>情绪收束</span><small>2 min</small></div>
          <div id="breathing-segment" class="routine-segment breathing" style="flex: ${preferences.duration}"><span>${breathing.label}</span><small id="breathing-duration">${preferences.duration} min</small></div>
          <div class="routine-segment sleep" style="flex: 3"><span>自然入睡</span><small>持续监测</small></div>
        </div>
      </div>
      ${renderBreathingPreview(breathing)}
    </div>
  `;
}

function renderBreathingPreview(breathing) {
  const isMeditation = breathing.type === "meditation";
  return `
    <div id="breathing-preview" class="breathing-preview">
      <div class="breath-visual">
        <div id="breath-orb" class="breath-orb"><span id="breath-phase">准备</span><small id="breath-countdown">${isMeditation ? "20s" : `${breathing.inhale}s`}</small></div>
        <div class="breath-ring one"></div><div class="breath-ring two"></div>
      </div>
      <div class="breath-preview-copy">
        <p class="card-label">${isMeditation ? "交互冥想预演" : "交互呼吸预演"}</p>
        <h4>感受一下 ${breathing.label}</h4>
        <p id="breath-preview-description">${isMeditation ? "跟随文字把注意力从思绪带回身体，20 秒后自动结束。" : "跟随圆形的扩张和收缩呼吸，20 秒后自动结束。"}</p>
        <div class="preview-progress"><span id="preview-progress-bar"></span></div>
        <button id="start-plan-preview" type="button">开始 20 秒${isMeditation ? "冥想" : "呼吸"}</button>
      </div>
    </div>
  `;
}

function updatePlanPreview() {
  const preview = document.getElementById("breathing-preview");
  if (!preview || !planPreview.active) return;

  const breathing = getSelectedBreathingMode();
  const elapsed = Date.now() - planPreview.startedAt;
  const totalProgress = Math.min(1, elapsed / PLAN_PREVIEW_DURATION);
  preview.classList.add("is-active");
  document.getElementById("preview-progress-bar").style.width = `${totalProgress * 100}%`;

  if (breathing.type === "meditation") {
    const script = meditationScripts[breathing.id];
    const step = script.find((item) => totalProgress <= item.until) || script[script.length - 1];
    const scale = 0.82 + Math.sin((elapsed / 1000) * Math.PI * 0.25) * 0.08;
    preview.classList.add("is-meditating");
    preview.classList.remove("is-inhale", "is-exhale");
    document.getElementById("breath-orb").style.transform = `scale(${scale.toFixed(3)})`;
    document.getElementById("breath-phase").textContent = step.label;
    document.getElementById("breath-countdown").textContent = `${Math.max(1, Math.ceil((PLAN_PREVIEW_DURATION - elapsed) / 1000))}s`;
    document.getElementById("breath-preview-description").textContent = step.detail;
  } else {
    const cycleSeconds = breathing.inhale + breathing.exhale;
    const cyclePosition = (elapsed / 1000) % cycleSeconds;
    const isInhale = cyclePosition < breathing.inhale;
    const phaseElapsed = isInhale ? cyclePosition : cyclePosition - breathing.inhale;
    const phaseDuration = isInhale ? breathing.inhale : breathing.exhale;
    const phaseProgress = phaseElapsed / phaseDuration;
    const scale = isInhale ? 0.72 + phaseProgress * 0.28 : 1 - phaseProgress * 0.28;
    const phase = isInhale ? "吸气" : "呼气";
    preview.classList.toggle("is-inhale", isInhale);
    preview.classList.toggle("is-exhale", !isInhale);
    preview.classList.remove("is-meditating");
    document.getElementById("breath-orb").style.transform = `scale(${scale.toFixed(3)})`;
    document.getElementById("breath-phase").textContent = phase;
    document.getElementById("breath-countdown").textContent = `${Math.max(1, Math.ceil(phaseDuration - phaseElapsed))}s`;
    document.getElementById("breath-preview-description").textContent = `${phase} · 保持肩膀放松，不需要刻意吸得很深。`;
  }

  if (elapsed >= PLAN_PREVIEW_DURATION) {
    stopPlanPreview(false);
    preview.classList.add("is-complete");
    document.getElementById("breath-phase").textContent = "完成";
    document.getElementById("breath-countdown").textContent = "✓";
    document.getElementById("breath-preview-description").textContent = "预演完成。这个引导已加入今晚的助眠方案。";
    document.getElementById("start-plan-preview").textContent = "再次预演";
  }
}

function stopPlanPreview(resetVisual = true) {
  if (planPreview.timerId) clearInterval(planPreview.timerId);
  planPreview.timerId = null;
  planPreview.active = false;

  if (!resetVisual) return;
  const preview = document.getElementById("breathing-preview");
  if (!preview) return;
  const breathing = getSelectedBreathingMode();
  preview.classList.remove("is-active", "is-inhale", "is-exhale", "is-meditating", "is-complete");
  document.getElementById("breath-orb").style.transform = "scale(0.72)";
  document.getElementById("breath-phase").textContent = "准备";
  document.getElementById("breath-countdown").textContent = breathing.type === "meditation" ? "20s" : `${breathing.inhale}s`;
  document.getElementById("preview-progress-bar").style.width = "0%";
  document.getElementById("breath-preview-description").textContent = breathing.type === "meditation"
    ? "跟随文字把注意力从思绪带回身体，20 秒后自动结束。"
    : "跟随圆形的扩张和收缩呼吸，20 秒后自动结束。";
  document.getElementById("start-plan-preview").textContent = `开始 20 秒${breathing.type === "meditation" ? "冥想" : "呼吸"}`;
}

function startPlanPreview() {
  if (planPreview.active) {
    stopPlanPreview();
    return;
  }

  stopPlanPreview();
  planPreview.active = true;
  planPreview.startedAt = Date.now();
  document.getElementById("start-plan-preview").textContent = "停止预演";
  updatePlanPreview();
  planPreview.timerId = setInterval(updatePlanPreview, 100);
}

function getSleepStage(progress) {
  for (let index = sleepStages.length - 1; index >= 0; index -= 1) {
    if (progress >= sleepStages[index].at) return { ...sleepStages[index], index };
  }
  return { ...sleepStages[0], index: 0 };
}

function formatStopwatch(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function updateSleepTimer() {
  const clock = document.getElementById("sleep-clock");
  if (!clock || !sleepTimer.active) return;

  const elapsed = Date.now() - sleepTimer.startedAt;
  const progress = Math.min(1, elapsed / SLEEP_DEMO_DURATION);
  const demoSeconds = Math.floor(elapsed / 1000);
  const simulatedMinutes = Math.round(progress * SIMULATED_SLEEP_MINUTES);
  const stage = getSleepStage(progress);
  const handAngle = ((elapsed / 1000) * 36) % 360;

  document.getElementById("sleep-second-hand").style.transform = `rotate(${handAngle.toFixed(1)}deg)`;
  document.getElementById("sleep-stopwatch").textContent = formatStopwatch(demoSeconds);
  document.getElementById("sleep-simulated-time").textContent = `${Math.floor(simulatedMinutes / 60)}h ${String(simulatedMinutes % 60).padStart(2, "0")}m`;
  document.getElementById("sleep-progress-value").textContent = `${Math.round(progress * 100)}%`;
  document.getElementById("sleep-progress-bar").style.width = `${progress * 100}%`;
  document.getElementById("sleep-stage-name").textContent = stage.label;
  document.getElementById("sleep-stage-detail").textContent = stage.detail;
  clock.style.setProperty("--sleep-progress", progress.toFixed(3));
  clock.style.setProperty("--clock-glow", (0.12 + progress * 0.18).toFixed(3));

  document.querySelectorAll(".sleep-stage-step").forEach((step, index) => {
    step.classList.toggle("is-current", index === stage.index);
    step.classList.toggle("is-complete", index < stage.index || progress >= 1);
  });

  if (progress >= 1) {
    stopSleepTimer(false);
    clock.classList.add("is-complete");
    document.getElementById("sleep-stage-name").textContent = "整夜睡眠完成";
    document.getElementById("sleep-stage-detail").textContent = "8 小时压缩演示已完成，可以进入智能唤醒环节。";
    document.getElementById("sleep-timer-replay").textContent = "重新播放整晚";
  }
}

function stopSleepTimer(resetVisual = true) {
  if (sleepTimer.timerId) clearInterval(sleepTimer.timerId);
  sleepTimer.timerId = null;
  sleepTimer.active = false;

  if (!resetVisual) return;
  const clock = document.getElementById("sleep-clock");
  if (!clock) return;
  clock.classList.remove("is-complete");
  clock.style.setProperty("--sleep-progress", "0");
  document.getElementById("sleep-second-hand").style.transform = "rotate(0deg)";
  document.getElementById("sleep-stopwatch").textContent = "00:00:00";
  document.getElementById("sleep-simulated-time").textContent = "0h 00m";
  document.getElementById("sleep-progress-value").textContent = "0%";
  document.getElementById("sleep-progress-bar").style.width = "0%";
  document.getElementById("sleep-stage-name").textContent = sleepStages[0].label;
  document.getElementById("sleep-stage-detail").textContent = sleepStages[0].detail;
  document.getElementById("sleep-timer-replay").textContent = "暂停演示";
}

function startSleepTimer() {
  stopSleepTimer();
  sleepTimer.active = true;
  sleepTimer.startedAt = Date.now();
  document.getElementById("sleep-timer-replay").textContent = "重新开始计时";
  updateSleepTimer();
  sleepTimer.timerId = setInterval(updateSleepTimer, 100);
}

function renderProgress() {
  els.progressSteps.innerHTML = screens
    .map((screen, index) => {
      const className =
        index === state.screenIndex
          ? "is-active"
          : index < state.screenIndex
            ? "is-complete"
            : "";
      return `<li class="${className}"><span class="progress-index">${index + 1}</span><span>${screen.title}</span></li>`;
    })
    .join("");
}

function renderMetrics() {
  const frame = getCurrentFrame();
  els.metricsGrid.innerHTML = metrics
    .map((metric) => {
      const trend = getMetricTrend(metric.key);
      return `
        <div class="metric ${trend.className}">
          <div class="metric-heading">
            <p class="card-label">${metric.label}</p>
            <span class="metric-live-dot"></span>
          </div>
          <div class="metric-reading">
            <p class="metric-value">${frame[metric.key]} <span class="metric-unit">${metric.unit}</span></p>
            ${buildSparkline(metric.key)}
          </div>
          <p class="metric-trend">${trend.text}</p>
          <p class="metric-copy">${metricDescription(metric.key, frame[metric.key])}</p>
        </div>
      `;
    })
    .join("");
}

function renderTimeline() {
  const width = 560;
  const height = 178;
  const padding = 18;
  const heartPoints = buildTimelinePoints("heartRate", width, height, padding);
  const hrvPoints = buildTimelinePoints("hrv", width, height, padding);
  const lastHeart = heartPoints[heartPoints.length - 1];
  const lastHrv = hrvPoints[hrvPoints.length - 1];
  const firstSample = sensorState.samples[0];
  const middleSample = sensorState.samples[Math.floor(sensorState.samples.length / 2)];
  const lastSample = sensorState.samples[sensorState.samples.length - 1];

  els.timelineBars.innerHTML = `
    <div class="chart-legend">
      <span><i class="heart-line"></i>心率 ${getCurrentFrame().heartRate} bpm</span>
      <span><i class="hrv-line"></i>HRV ${getCurrentFrame().hrv} ms</span>
      <span class="simulation-rate">1.2 秒 = 1 分钟</span>
    </div>
    <svg class="sensor-chart" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img" aria-label="最近二十分钟心率和 HRV 模拟变化曲线">
      <defs>
        <linearGradient id="heart-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f5b971" stop-opacity="0.28"></stop>
          <stop offset="100%" stop-color="#f5b971" stop-opacity="0"></stop>
        </linearGradient>
      </defs>
      <g class="chart-grid">
        <line x1="${padding}" y1="35" x2="${width - padding}" y2="35"></line>
        <line x1="${padding}" y1="89" x2="${width - padding}" y2="89"></line>
        <line x1="${padding}" y1="143" x2="${width - padding}" y2="143"></line>
      </g>
      <polygon class="heart-area" points="${padding},${height - padding} ${pointsToString(heartPoints)} ${width - padding},${height - padding}"></polygon>
      <polyline class="chart-line chart-line-heart" pathLength="1" points="${pointsToString(heartPoints)}"></polyline>
      <polyline class="chart-line chart-line-hrv" pathLength="1" points="${pointsToString(hrvPoints)}"></polyline>
      <line class="chart-cursor" x1="${lastHeart.x}" y1="${padding}" x2="${lastHeart.x}" y2="${height - padding}"></line>
      <circle class="chart-point chart-point-heart" cx="${lastHeart.x}" cy="${lastHeart.y}" r="4"></circle>
      <circle class="chart-point chart-point-hrv" cx="${lastHrv.x}" cy="${lastHrv.y}" r="4"></circle>
    </svg>
    <div class="chart-time-axis">
      <span>${formatMinutes(firstSample.clockMinutes % (24 * 60))}</span>
      <span>${formatMinutes(middleSample.clockMinutes % (24 * 60))}</span>
      <span>${formatMinutes(lastSample.clockMinutes % (24 * 60))}</span>
    </div>
  `;

  const labels = [
    "高唤醒",
    "开始放松",
    "持续干预",
    "状态趋稳",
    "进入睡眠",
    "睡眠稳定",
    "深度恢复",
    "维持稳定",
    "接近唤醒窗口",
    "准备唤醒",
  ];

  els.timelineLabel.innerHTML = `<span class="live-indicator"></span>${labels[state.timelineIndex]} · 模拟流实时更新`;
}

function renderInsight() {
  const frame = getCurrentFrame();
  const assessment = assessSleepState(frame);
  const messages = {
    landing: "这是一个以床品接口为数据入口、以 AI 为决策中心的夜间睡眠闭环 Demo。",
    checkin: `当前判断为“${assessment.stateLabel}”。主要原因是 ${assessment.sleepResistanceReason}。`,
    plan: `基于当前状态，AI 选择了“${getInterventionPlan(assessment).title}”，目的是尽快降低生理与认知唤醒。`,
    sleeping: "你可以看到心率、体动和光噪刺激逐步下降，证明干预逻辑与状态变化形成闭环。",
    wake: `系统将在 ${getWakePlan(state.wakeTargetMinutes).windowStart} - ${getWakePlan(state.wakeTargetMinutes).latestWake} 内寻找浅睡窗口，减少粗暴叫醒。`,
    summary: "整晚体验不是只记录数据，而是解释问题、执行干预并给出下一次可落地的优化建议。",
  };

  els.insightText.textContent = messages[screens[state.screenIndex].id];
}

function renderScreenBody() {
  const screen = screens[state.screenIndex];
  const frame = getCurrentFrame();
  const assessment = assessSleepState(frame);
  const plan = getInterventionPlan(assessment);
  const wakePlan = getWakePlan(state.wakeTargetMinutes);
  const summary = buildSessionSummary(assessment, wakePlan);

  switch (screen.id) {
    case "landing":
      els.screenBody.innerHTML = `
        <div class="scenario-card">
          <p class="card-label">目标用户</p>
          <h4>高压年轻职场人的夜间睡眠系统</h4>
          <p class="scenario-copy">
            用户在深夜下班后上床，虽然身体很累，但大脑仍然处于工作状态。Somnus AI 通过床品接口判断用户为什么睡不着，并主动给出更合适的助眠策略。
          </p>
        </div>
        <div class="grid-two">
          <div class="sub-card">
            <p class="card-label">解决的问题</p>
            <ul class="stage-list">
              <li>睡前难以放松，无法快速进入睡眠</li>
              <li>传统闹钟粗暴叫醒，醒来仍然疲惫</li>
            </ul>
          </div>
          <div class="sub-card">
            <p class="card-label">Web Demo 展示重点</p>
            <ul class="stage-list">
              <li>睡前评估</li>
              <li>AI 助眠干预</li>
              <li>睡中感知</li>
              <li>智能唤醒与晨间反馈</li>
            </ul>
          </div>
        </div>
      `;
      break;
    case "checkin":
      els.screenBody.innerHTML = `
        <div class="sub-card">
          <p class="card-label">AI 判断结果</p>
          <h4>${assessment.stateLabel}</h4>
          <p class="scenario-copy">当前唤醒程度：${assessment.arousalLevel}，睡眠稳定性：${assessment.sleepStability}，判断置信度：${Math.round(
            assessment.confidence * 100
          )}%</p>
        </div>
        <div class="sub-card">
          <p class="card-label">关键阻力信号</p>
          <div class="signal-tags">
            <span class="signal-tag alert">自述：${state.reportedMood}</span>
            <span class="signal-tag alert">心率 ${frame.heartRate} bpm，提示交感偏高</span>
            <span class="signal-tag alert">体动 ${frame.movementLevel}/10，存在频繁翻身</span>
            <span class="signal-tag">呼吸 ${frame.breathRate}/min，节律仍偏快</span>
            <span class="signal-tag">环境噪音 ${frame.noiseLevel} dB，存在刺激</span>
          </div>
        </div>
        ${renderCompanionCard(frame, assessment)}
        ${renderSleepAnalysis()}
      `;
      break;
    case "plan":
      els.screenBody.innerHTML = `
        <div class="decision-evidence">
          <div>
            <p class="card-label">融合决策依据</p>
            <h4>床品数据 × AI 对话分析</h4>
          </div>
          <div class="evidence-flow">
            <span>心率 ${frame.heartRate} bpm · 体动 ${frame.movementLevel}/10</span>
            <i>+</i>
            <span>${escapeHtml(state.sleepAnalysis.stressSource)} · ${escapeHtml(state.sleepAnalysis.primaryNeed)}</span>
            <i>→</i>
            <strong>${plan.title}</strong>
          </div>
          <p class="scenario-copy">${escapeHtml(state.sleepAnalysis.summary)}</p>
        </div>
        <div class="sub-card">
            <p class="card-label">干预方案</p>
            <h4>${plan.title}</h4>
            <p class="scenario-copy">${plan.guidanceText}</p>
          </div>
          <div class="grid-two">
            <div class="sub-card">
              <p class="card-label">执行方式</p>
              <ul class="stage-list">
                <li>预计时长：<span id="plan-execution-duration">${state.planPreferences.duration + 2} 分钟</span></li>
                <li>声音模式：${getSelectedSoundscape().label} + 呼吸提示</li>
                <li>触发逻辑：针对高唤醒状态动态下发</li>
            </ul>
          </div>
          <div class="sub-card">
            <p class="card-label">环境建议</p>
            <ul class="stage-list">${plan.environmentTips.map((tip) => `<li>${tip}</li>`).join("")}</ul>
          </div>
        </div>
        <div class="plan-tags">
          ${plan.tags.map((tag) => `<span class="plan-tag">${tag}</span>`).join("")}
        </div>
        ${renderPlanComposer()}
      `;
      break;
    case "sleeping":
      els.screenBody.innerHTML = `
        <div id="sleep-clock" class="sleep-clock-card" style="--sleep-progress: 0; --clock-glow: 0.12;">
          <div class="sleep-clock-layout">
            <div class="analog-clock" aria-hidden="true">
              <div class="clock-face">
                <span class="clock-number n12">12</span>
                <span class="clock-number n3">3</span>
                <span class="clock-number n6">6</span>
                <span class="clock-number n9">9</span>
                <i class="clock-hand hour-hand"></i>
                <i class="clock-hand minute-hand"></i>
                <i id="sleep-second-hand" class="clock-hand second-hand"></i>
                <b class="clock-center"></b>
              </div>
            </div>
            <div class="sleep-clock-info">
              <p class="card-label">睡眠秒表 · 8 小时压缩演示</p>
              <div id="sleep-stopwatch" class="sleep-stopwatch">00:00:00</div>
              <div class="simulated-time-row">
                <span>模拟睡眠时长</span>
                <strong id="sleep-simulated-time">0h 00m</strong>
              </div>
              <h4 id="sleep-stage-name">${sleepStages[0].label}</h4>
              <p id="sleep-stage-detail" class="scenario-copy">${sleepStages[0].detail}</p>
              <button id="sleep-timer-replay" class="sleep-replay-button" type="button">重新开始计时</button>
            </div>
          </div>
          <div class="sleep-loading">
            <div class="sleep-loading-heading">
              <span>整夜睡眠进度</span>
              <strong id="sleep-progress-value">0%</strong>
            </div>
            <div class="sleep-progress-track"><span id="sleep-progress-bar"></span></div>
            <div class="sleep-stage-steps">
              ${sleepStages.map((stage, index) => `
                <div class="sleep-stage-step ${index === 0 ? "is-current" : ""}">
                  <i>${index + 1}</i><span>${stage.label}</span>
                </div>`).join("")}
            </div>
          </div>
        </div>
        <div class="grid-two">
          <div class="sub-card">
            <p class="card-label">状态切换</p>
            <h4>${assessment.stateLabel}</h4>
            <p class="scenario-copy">随着呼吸引导和环境降刺激的进行，用户的体动、心率和噪音暴露正在下降。</p>
          </div>
          <div class="sub-card">
            <p class="card-label">因果链条</p>
            <ul class="stage-list">
              <li>孤独与反刍 -> 夜间陪伴承接情绪</li>
              <li>高唤醒 -> 对话收束后用呼吸引导降低心率</li>
              <li>环境降刺激 -> 噪音与光线继续下降</li>
              <li>体动减少 -> 睡眠稳定性提升</li>
            </ul>
          </div>
        </div>
      `;
      break;
    case "wake":
      els.screenBody.innerHTML = `
        <div class="wake-window">
          <p class="card-label">最晚起床时间</p>
          <div class="wake-slider">
            <div class="time-row">
              <input id="wake-range" type="range" min="390" max="540" step="5" value="${state.wakeTargetMinutes}">
              <span>${wakePlan.latestWake}</span>
            </div>
          </div>
        </div>
        <div class="grid-two">
          <div class="sub-card">
            <p class="card-label">唤醒窗口</p>
            <h4>${wakePlan.windowStart} - ${wakePlan.latestWake}</h4>
            <p class="scenario-copy">系统将在这个时间段内寻找更轻、更自然的叫醒时机。</p>
          </div>
          <div class="sub-card">
            <p class="card-label">推荐触发</p>
            <h4>${wakePlan.triggerTime}</h4>
            <p class="scenario-copy">${wakePlan.reason}</p>
          </div>
        </div>
        <div id="wake-demo" class="wake-demo" style="--wake-progress: 0; --sun-y: 58px; --horizon-glow: 0;">
          <div class="wake-sky" aria-hidden="true">
            <div class="wake-stars"><i></i><i></i><i></i><i></i><i></i></div>
            <div class="wake-morning"></div>
            <div class="wake-sun"></div>
            <div class="wake-horizon"></div>
            <div class="wake-clock">
              <span id="wake-demo-time">${wakePlan.triggerTime}</span>
              <small>浅睡窗口已命中</small>
            </div>
          </div>
          <div class="wake-demo-content">
            <div class="wake-demo-heading">
              <div>
                <p class="card-label">渐进唤醒 Demo</p>
                <h4 id="wake-stage-label">浅睡确认</h4>
              </div>
              <span id="wake-progress-value">0%</span>
            </div>
            <p id="wake-stage-detail" class="scenario-copy">床品接口检测到体动增加，确认进入自然唤醒窗口。</p>
            <div class="wake-progress-track"><span id="wake-progress-bar"></span></div>
            <div class="wake-phases">
              ${wakeStages
                .map(
                  (stage, index) => `
                    <div class="wake-phase ${index === 0 ? "is-current" : ""}">
                      <i>${index + 1}</i>
                      <span>${stage.label}</span>
                    </div>
                  `
                )
                .join("")}
            </div>
            <div class="wake-demo-actions">
              <button id="wake-demo-button" class="wake-demo-button" type="button">体验 18 秒渐进唤醒</button>
              <span id="wake-demo-caption">18 秒演示约等于真实产品的 10–20 分钟唤醒过程</span>
            </div>
          </div>
        </div>
      `;
      break;
    case "summary":
      els.screenBody.innerHTML = renderLearningDashboard(summary);
      break;
    default:
      els.screenBody.innerHTML = "";
  }

  const range = document.getElementById("wake-range");
  if (range) {
    range.addEventListener("input", (event) => {
      stopWakeDemo(false);
      state.wakeTargetMinutes = Number(event.target.value);
      render();
    });
  }

  const wakeDemoButton = document.getElementById("wake-demo-button");
  if (wakeDemoButton) wakeDemoButton.addEventListener("click", startWakeDemo);

  const submitChat = async (message) => {
    const cleanMessage = message.trim();
    if (!cleanMessage) return;

    state.chatMessages.push({ role: "user", content: cleanMessage });
    state.chatMessages.push({ role: "assistant", content: "正在听你说……", pending: true });
    renderScreenBody();

    try {
      state.chatMessages = state.chatMessages.filter((item) => !item.pending);
      const result = await requestCompanionReply(cleanMessage, frame, assessment);
      state.sleepAnalysis = { ...state.sleepAnalysis, ...result.analysis };
      state.reportedMood = cleanMessage;
      state.chatMessages.push({ role: "assistant", content: result.reply });
    } catch (error) {
      state.chatMessages = state.chatMessages.filter((item) => !item.pending);
      state.sleepAnalysis = analyzeConversationLocally();
      state.chatMessages.push({ role: "assistant", content: `${error.message}，已先根据当前对话完成本地分析。` });
    }

    renderScreenBody();
    const messages = document.getElementById("chat-messages");
    if (messages) messages.scrollTop = messages.scrollHeight;
  };

  document.querySelectorAll("[data-chat-prompt]").forEach((button) => {
    button.addEventListener("click", () => submitChat(button.dataset.chatPrompt));
  });

  const chatForm = document.getElementById("chat-form");
  if (chatForm) {
    chatForm.addEventListener("submit", (event) => {
      event.preventDefault();
      submitChat(document.getElementById("chat-input").value);
    });
  }

  const durationRange = document.getElementById("plan-duration-range");
  if (durationRange) {
    durationRange.addEventListener("input", (event) => {
      const duration = clamp(Number(event.target.value), 5, 15);
      state.planPreferences.duration = duration;
      document.getElementById("plan-duration-value").textContent = `${duration} 分钟`;
      document.getElementById("plan-total-time").textContent = `共 ${duration + 2} 分钟`;
      document.getElementById("plan-execution-duration").textContent = `${duration + 2} 分钟`;
      document.getElementById("breathing-duration").textContent = `${duration} min`;
      document.getElementById("breathing-segment").style.flexGrow = duration;
    });
  }

  document.querySelectorAll("[data-breathing-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      stopPlanPreview(false);
      state.planPreferences.breathingMode = button.dataset.breathingMode;
      renderScreenBody();
    });
  });

  document.querySelectorAll("[data-soundscape]").forEach((button) => {
    button.addEventListener("click", () => {
      stopPlanPreview(false);
      state.planPreferences.soundscape = button.dataset.soundscape;
      renderScreenBody();
    });
  });

  document.querySelectorAll("[data-plan-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      stopPlanPreview(false);
      const key = button.dataset.planToggle;
      state.planPreferences[key] = !state.planPreferences[key];
      renderScreenBody();
    });
  });

  const planPreviewButton = document.getElementById("start-plan-preview");
  if (planPreviewButton) planPreviewButton.addEventListener("click", startPlanPreview);

  const sleepReplayButton = document.getElementById("sleep-timer-replay");
  if (sleepReplayButton) sleepReplayButton.addEventListener("click", startSleepTimer);
  if (screen.id === "sleeping" && !sleepTimer.active) startSleepTimer();

  document.querySelectorAll("[data-learning-metric]").forEach((button) => {
    button.addEventListener("click", () => {
      state.learningMetric = button.dataset.learningMetric;
      renderScreenBody();
    });
  });

  const replayLearningButton = document.getElementById("replay-learning");
  if (replayLearningButton) replayLearningButton.addEventListener("click", () => startLearningAnimation(true));
  if (screen.id === "summary") startLearningAnimation(false);
}

function renderScreen() {
  const screen = screens[state.screenIndex];
  els.screenTitle.textContent = screen.title;
  els.screenHeading.textContent = screen.heading;
  els.stageBadge.textContent = screen.badge;
  els.screenDescription.textContent = screen.description;
  els.primaryAction.textContent = screen.action;
  renderScreenBody();
}

function render() {
  renderProgress();
  renderMetrics();
  renderTimeline();
  renderInsight();
  renderScreen();
}

function advance() {
  stopWakeDemo(false);
  stopPlanPreview(false);
  stopSleepTimer(false);
  stopLearningAnimation(false);
  if (state.screenIndex < screens.length - 1) {
    state.screenIndex += 1;
  } else {
    reset();
    return;
  }

  if (state.screenIndex === 2) {
    state.timelineIndex = 2;
  } else if (state.screenIndex === 3) {
    state.timelineIndex = 6;
  } else if (state.screenIndex === 4) {
    state.timelineIndex = 8;
  } else if (state.screenIndex === 5) {
    state.timelineIndex = 9;
  }

  render();
}

function reset() {
  stopWakeDemo(false);
  stopPlanPreview(false);
  stopSleepTimer(false);
  stopLearningAnimation(false);
  learningAnimation.completed = false;
  state.screenIndex = 0;
  state.timelineIndex = 0;
  state.wakeTargetMinutes = 7 * 60 + 30;
  state.learningMetric = "recoveryScore";
  state.chatMessages = [
    {
      role: "assistant",
      content: "我在,枕头检测到你的心率和翻身次数都比平时高一点。今晚发生了什么，让你一直放不下来？",
    },
  ];
  state.reportedMood = "";
  state.sleepAnalysis = {
    lonelinessLevel: "中",
    stressSource: "工作思绪未卸载",
    cognitiveArousal: "高",
    primaryNeed: "倾听陪伴",
    summary: "用户在独处环境中仍持续处理工作信息，孤独感与认知反刍共同提高了入睡阻力。",
    confidence: 0.72,
  };
  state.planPreferences = {
    duration: 8,
    breathingMode: "body-scan",
    soundscape: "rain",
    autoDim: true,
    pillowPulse: true,
  };
  initializeSensorHistory();
  render();
}

els.primaryAction.addEventListener("click", advance);
els.resetButton.addEventListener("click", reset);

initializeSensorHistory();
render();
startSensorSimulation();
