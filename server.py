import json
import os
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parent
HOST = "127.0.0.1"
PORT = int(os.environ.get("PORT", "4173"))
DEEPSEEK_URL = "https://api.deepseek.com/chat/completions"
DEEPSEEK_MODEL = "deepseek-v4-flash"
MAX_BODY_BYTES = 64 * 1024
MAX_HISTORY_MESSAGES = 12
MAX_MESSAGE_CHARS = 1000

SERVER_POLICY = """你是 Somnus 睡前评估与陪伴助手。你的任务是通过低刺激对话理解用户此刻的主观入睡阻力，并为后续助眠方案提供结构化依据。
保持温和、简短、低刺激，每次回复 1-3 个短句。先共情，不评判，不连续追问。
不要声称自己是人类，不鼓励情感依赖，不要求用户只和你交流。
经过几轮对话后，主动邀请用户转入呼吸、环境音或安静陪伴。
不得做医疗诊断。遇到自伤或紧急危险信号时，优先建议用户联系当地紧急服务、可信任的人或专业支持。

只输出合法 json，不要输出 Markdown 或额外解释。格式必须是：
{
  "reply": "给用户的简短回复",
  "analysis": {
    "lonelinessLevel": "低|中|高|待确认",
    "stressSource": "不超过30字的主要压力来源",
    "cognitiveArousal": "低|中|高|待确认",
    "primaryNeed": "倾听陪伴|认知卸载|呼吸放松|环境降刺激",
    "summary": "不超过80字的睡前状态总结",
    "confidence": 0.0
  }
}"""

CRISIS_TERMS = ("自杀", "不想活", "结束生命", "伤害自己", "自残", "活不下去")
CRISIS_REPLY = (
    "我很在意你刚才说的这些。现在请先不要独自承受，也不要伤害自己；"
    "立即联系身边可信任的人陪着你，并联系当地紧急服务或专业危机支持。"
)


class SomnusHandler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path != "/api/chat":
            self.send_error(404)
            return

        try:
            request_data = self._read_json_body()
            response_data = self._chat(request_data)
            self._send_json(200, response_data)
        except ValueError as error:
            self._send_json(400, {"error": str(error)})
        except RuntimeError as error:
            self._send_json(503, {"error": str(error)})

    def _read_json_body(self):
        try:
            content_length = int(self.headers.get("Content-Length", "0"))
        except ValueError as error:
            raise ValueError("无效的请求长度") from error

        if content_length <= 0 or content_length > MAX_BODY_BYTES:
            raise ValueError("请求内容为空或过大")

        try:
            return json.loads(self.rfile.read(content_length).decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError) as error:
            raise ValueError("请求必须是有效的 JSON") from error

    def _chat(self, request_data):
        api_key = os.environ.get("DEEPSEEK_API_KEY", "").strip()
        if not api_key:
            raise RuntimeError("服务端尚未配置 DEEPSEEK_API_KEY")

        system_context = request_data.get("systemPrompt", "")
        if not isinstance(system_context, str) or not system_context.strip():
            raise ValueError("缺少睡眠上下文")

        messages = self._validate_messages(request_data.get("messages"))
        latest_user_message = next(
            (message["content"] for message in reversed(messages) if message["role"] == "user"),
            "",
        )
        if any(term in latest_user_message for term in CRISIS_TERMS):
            return {
                "reply": CRISIS_REPLY,
                "analysis": {
                    "lonelinessLevel": "待确认",
                    "stressSource": "检测到紧急安全风险",
                    "cognitiveArousal": "高",
                    "primaryNeed": "倾听陪伴",
                    "summary": "当前优先级不是助眠，而是立即获得现实中的安全支持。",
                    "confidence": 1.0,
                },
                "model": "safety-guard",
            }

        payload = {
            "model": DEEPSEEK_MODEL,
            "messages": [
                {
                    "role": "system",
                    "content": f"{SERVER_POLICY}\n\n以下是床品与睡前评估提供的本轮上下文：\n{system_context[:4000]}",
                },
                *messages,
            ],
            "thinking": {"type": "disabled"},
            "response_format": {"type": "json_object"},
            "max_tokens": 480,
            "stream": False,
        }
        upstream_request = Request(
            DEEPSEEK_URL,
            data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )

        try:
            with urlopen(upstream_request, timeout=35) as response:
                upstream_data = json.loads(response.read().decode("utf-8"))
        except HTTPError as error:
            detail = error.read().decode("utf-8", errors="replace")[:300]
            raise RuntimeError(f"DeepSeek 请求失败（HTTP {error.code}）：{detail}") from error
        except (URLError, TimeoutError) as error:
            raise RuntimeError("无法连接 DeepSeek，请检查网络后重试") from error
        except json.JSONDecodeError as error:
            raise RuntimeError("DeepSeek 返回了无法解析的数据") from error

        try:
            model_content = upstream_data["choices"][0]["message"]["content"].strip()
        except (KeyError, IndexError, TypeError, AttributeError) as error:
            raise RuntimeError("DeepSeek 返回内容不完整") from error

        if not model_content:
            raise RuntimeError("DeepSeek 没有返回有效回复")

        try:
            model_result = json.loads(model_content)
        except json.JSONDecodeError as error:
            raise RuntimeError("DeepSeek 没有返回有效的结构化分析") from error

        reply = model_result.get("reply", "")
        if not isinstance(reply, str) or not reply.strip():
            raise RuntimeError("DeepSeek 返回的对话内容为空")

        return {
            "reply": reply.strip()[:600],
            "analysis": self._sanitize_analysis(model_result.get("analysis")),
            "model": DEEPSEEK_MODEL,
        }

    def _sanitize_analysis(self, raw_analysis):
        if not isinstance(raw_analysis, dict):
            raw_analysis = {}

        def enum_value(key, allowed, default):
            value = raw_analysis.get(key)
            return value if value in allowed else default

        def short_text(key, default, max_chars):
            value = raw_analysis.get(key)
            if not isinstance(value, str) or not value.strip():
                return default
            return value.strip()[:max_chars]

        confidence = raw_analysis.get("confidence", 0.6)
        if isinstance(confidence, bool) or not isinstance(confidence, (int, float)):
            confidence = 0.6

        return {
            "lonelinessLevel": enum_value("lonelinessLevel", ("低", "中", "高", "待确认"), "待确认"),
            "stressSource": short_text("stressSource", "仍在识别", 30),
            "cognitiveArousal": enum_value("cognitiveArousal", ("低", "中", "高", "待确认"), "待确认"),
            "primaryNeed": enum_value(
                "primaryNeed",
                ("倾听陪伴", "认知卸载", "呼吸放松", "环境降刺激"),
                "认知卸载",
            ),
            "summary": short_text("summary", "当前信息有限，建议继续确认主要入睡阻力。", 80),
            "confidence": max(0.0, min(1.0, float(confidence))),
        }

    def _validate_messages(self, raw_messages):
        if not isinstance(raw_messages, list) or not raw_messages:
            raise ValueError("对话记录不能为空")

        validated = []
        for item in raw_messages[-MAX_HISTORY_MESSAGES:]:
            if not isinstance(item, dict):
                continue
            role = item.get("role")
            content = item.get("content")
            if role not in ("user", "assistant") or not isinstance(content, str):
                continue
            content = content.strip()[:MAX_MESSAGE_CHARS]
            if content and not item.get("pending"):
                validated.append({"role": role, "content": content})

        if not validated or validated[-1]["role"] != "user":
            raise ValueError("最后一条消息必须来自用户")
        return validated

    def _send_json(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)


def main():
    handler = partial(SomnusHandler, directory=str(ROOT))
    server = ThreadingHTTPServer((HOST, PORT), handler)
    print(f"Somnus AI running at http://{HOST}:{PORT}")
    server.serve_forever()


if __name__ == "__main__":
    main()
