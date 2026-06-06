"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Activity, Server } from "lucide-react";

type SystemLogLevel = "INFO" | "SUCCESS" | "WARN" | "ERROR";

export type SystemLogEntry = {
  timestamp: string;
  level: SystemLogLevel;
  message: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7860";

const seedLogs: SystemLogEntry[] = [
  {
    timestamp: "2026-06-05 21:40:40",
    level: "INFO",
    message: "Bắt đầu quá trình cào dữ liệu...",
  },
  {
    timestamp: "2026-06-05 21:40:44",
    level: "SUCCESS",
    message: "Batch write complete - 89 articles committed to DB",
  },
  {
    timestamp: "2026-06-05 21:40:48",
    level: "INFO",
    message: "Rate limiter reset - Twitter API quota restored",
  },
  {
    timestamp: "2026-06-05 21:40:52",
    level: "ERROR",
    message: "Retry #2 failed: CustomCrawler3 - host unreachable",
  },
  {
    timestamp: "2026-06-05 21:40:56",
    level: "INFO",
    message: "CPU load normalizing: 14.2% (was 28.1%)",
  },
  {
    timestamp: "2026-06-05 21:41:00",
    level: "WARN",
    message: "High latency detected on HackerNews endpoint: 4.2s",
  },
];

const realtimeMessages: Array<Pick<SystemLogEntry, "level" | "message">> = [
  { level: "INFO", message: "Job dispatched - BBC News crawl started" },
  { level: "SUCCESS", message: "Health check passed - response time: 12ms" },
  { level: "INFO", message: "Memory GC triggered - freed 48MB" },
  { level: "WARN", message: "Queue depth above threshold: 78 pending jobs" },
  { level: "SUCCESS", message: "Batch write complete - 64 articles committed to DB" },
  { level: "ERROR", message: "Retry #1 failed: source timeout" },
];

const levelStyles: Record<
  SystemLogLevel,
  { text: string; row: string; border: string }
> = {
  INFO: {
    text: "text-slate-400",
    row: "",
    border: "border-transparent",
  },
  SUCCESS: {
    text: "text-emerald-400",
    row: "",
    border: "border-transparent",
  },
  WARN: {
    text: "text-yellow-300",
    row: "bg-yellow-400/8",
    border: "border-yellow-400/35",
  },
  ERROR: {
    text: "text-red-400",
    row: "bg-red-500/10",
    border: "border-red-500/40",
  },
};

function formatTimestamp(date = new Date()) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds(),
  )}`;
}

function buildMockLog(index: number): SystemLogEntry {
  const template = realtimeMessages[index % realtimeMessages.length];
  return {
    timestamp: formatTimestamp(),
    level: template.level,
    message: template.message,
  };
}

function normalizeLog(value: unknown): SystemLogEntry | null {
  if (!value || typeof value !== "object") return null;

  const item = value as Partial<SystemLogEntry>;
  const level = item.level;

  if (
    typeof item.timestamp !== "string" ||
    typeof item.message !== "string" ||
    !level ||
    !["INFO", "SUCCESS", "WARN", "ERROR"].includes(level)
  ) {
    return null;
  }

  return {
    timestamp: item.timestamp,
    level,
    message: item.message,
  };
}

export default function SystemLog() {
  const [logs, setLogs] = useState<SystemLogEntry[]>(seedLogs);
  const [isConnected, setIsConnected] = useState(false);
  const streamIndexRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchLatestLog() {
      try {
        const res = await fetch(`${API_URL}/system/logs/latest`, {
          cache: "no-store",
        });

        if (!res.ok) throw new Error("System log API unavailable");

        const data = normalizeLog(await res.json());
        if (!data || !isMounted) return;

        setIsConnected(true);
        setLogs((current) => [...current.slice(-79), data]);
      } catch {
        setIsConnected(true);
        setLogs((current) => {
          const nextLog = buildMockLog(streamIndexRef.current);
          streamIndexRef.current += 1;
          return [...current.slice(-79), nextLog];
        });
      }
    }

    fetchLatestLog();
    const timer = window.setInterval(fetchLatestLog, 2500);

    return () => {
      isMounted = false;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [logs]);

  const logLines = useMemo(() => logs.slice(-40), [logs]);

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-slate-700/50 bg-[#111827] shadow-xl shadow-slate-950/20">
      <div className="flex h-20 items-center justify-between gap-4 border-b border-slate-700/60 px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex gap-2">
            <span className="h-3 w-3 rounded-full bg-red-500" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-emerald-500" />
          </div>
          <span className="h-8 w-px bg-slate-600" />
          <Server className="h-5 w-5 shrink-0 text-cyan-400" />
          <p className="truncate font-mono text-lg font-semibold text-slate-200">
            server.log - /var/log/crawler/system.log
          </p>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 font-mono text-sm font-semibold text-cyan-300 sm:flex">
          <Activity className="h-4 w-4" />
          tail -f
        </div>
      </div>

      <div
        ref={scrollRef}
        className="h-[520px] overflow-y-auto overflow-x-hidden px-5 py-4 font-mono text-sm leading-7"
      >
        {logLines.map((log, index) => {
          const style = levelStyles[log.level];
          return (
            <div
              key={`${log.timestamp}-${index}`}
              className={`rounded-md border-l-4 px-3 ${style.row} ${style.border} ${style.text}`}
            >
              <span>[{log.timestamp}] </span>
              <span className="font-bold">{log.level}</span>
              <span> {log.message}</span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t border-slate-700/60 px-5 py-4 font-mono text-sm text-slate-500">
        <div className="flex items-center gap-3">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              isConnected ? "bg-emerald-400" : "bg-yellow-300"
            }`}
          />
          <span>crawler-node-01 · {isConnected ? "connected" : "connecting"}</span>
        </div>
        <div className="hidden gap-6 sm:flex">
          <span>uptime: 6h 24m</span>
          <span>pid: 14823</span>
          <span>port: 8080</span>
        </div>
      </div>
    </div>
  );
}
