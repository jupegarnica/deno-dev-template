import {
  getLogger,
  handlers,
  LogLevels,
  setup,
} from "https://deno.land/std@0.92.0/log/mod.ts";

export type { LogRecord } from "https://deno.land/std@0.92.0/log/logger.ts";

import * as colors from "https://deno.land/std@0.92.0/fmt/colors.ts";
import { format } from "https://deno.land/std@0.92.0/datetime/mod.ts";

import { ensureDir } from "https://deno.land/std@0.92.0/fs/mod.ts";

function formatLogFileName(
  date: Date = new Date(),
): string {
  return format(date, "yyyy-MM-dd");
}

function formatDate(date: Date | string): string {
  date = new Date(date);
  return format(date, "yyyy-MM-dd HH:mm");
}
function formatLogLevel(str: string, length = 8): string {
  let response = "";
  for (let index = 0; index < length; index++) {
    response += str[index] ?? " ";
  }
  return response;
}

const stringify = (val: unknown): string => {
  if (typeof val === "string") return val;
  return Deno.inspect(val);
};

const stringifyConsole = (val: unknown): string => {
  if (typeof val === "string") return val;
  return Deno.inspect(val, {
    colors: true,
    depth: 10,
    compact: false,
  });
};

import { addLogToQueue, flushQueue } from "./mailer.ts";
import { LogRecord } from "https://deno.land/std@0.92.0/log/logger.ts";

const DEBUG = Deno.env.get("DEBUG");
const LOG_LEVEL = Deno.env.get("LOG_LEVEL") || "INFO";
const LOGS_DIR = Deno.env.get("LOGS_DIR") || "./";

const emailFormatter = ({
  datetime,
  levelName,
  args,
}: LogRecord) => {
  let text = `<div class="record ${levelName}"> <i>${
    formatDate(
      datetime,
    )
  }</i> <b>${formatLogLevel(levelName)}</b>`;

  text += '<div class="args">';
  args.forEach((arg, i) => {
    text += `<div class="arg${i}">${stringify(arg)}</div>`;
  });
  text += "</div>";

  return text + "</div><hr>";
};

class EmailHandler extends handlers.BaseHandler {
  format(logRecord: LogRecord): string {
    const msg = super.format(logRecord);

    return msg.replaceAll("\n", "<br>");
  }

  async log(msg: string): Promise<void> {
    await addLogToQueue({
      subject: `logs`,
      content: msg,
    });
  }
}

function colorize(level: number) {
  switch (level) {
    case LogLevels.DEBUG:
      return (arg: unknown) => colors.dim(stringify(arg));
    case LogLevels.INFO:
      return (arg: unknown) => colors.green(stringify(arg));
    case LogLevels.WARNING:
      return (arg: unknown) => colors.rgb24(stringify(arg), 0xffcc00);
    case LogLevels.ERROR:
      return (arg: unknown) => colors.red(stringify(arg));
    case LogLevels.CRITICAL:
      return (arg: unknown) => colors.bgBlack(colors.red(stringify(arg)));
  }
  return (a: unknown) => a;
}
export class ConsoleHandler extends handlers.BaseHandler {
  format(logRecord: LogRecord): string {
    const msg = `${
      colors.dim(
        formatDate(logRecord.datetime),
      )
    } ${colors.bold(formatLogLevel(logRecord.levelName))}`;

    const [firstArg, ...args] = [...logRecord.args];
    console.log({ firstArg, args });

    const newMsg = colorize(logRecord.level)(msg + " " + (firstArg));
    const newArgs = args
      ?.map((v: unknown, i) =>
        i === 0 ? colors.bold(stringifyConsole(v)) : stringifyConsole(v)
      )
      ?.map(colorize(LogLevels.DEBUG));

    console.log(newMsg);
    console.group();
    newArgs?.forEach((v: unknown) => {
      console.log(v);
    });
    console.groupEnd();
    console.log("\n");

    return `${msg} ${args.join("\n")}`;
  }

  log(msg: string): string {
    return msg;
  }
}
const fileFormatter = ({
  datetime,
  levelName,
  args,
  msg,
}: LogRecord) => {
  let text = `${formatDate(datetime)} ${
    formatLogLevel(
      levelName,
    )
  }`;
  args.forEach((arg) => {
    text += `\n${stringify(arg)}`;
  });
  return text + "\n";
};

const fileHandler = new handlers.FileHandler("WARNING", {
  filename: `${LOGS_DIR}/${formatLogFileName()}${DEBUG ? ".debug" : ""}.log`,
  mode: "a", // 'a', 'w', 'x'
  formatter: fileFormatter,
});

export const flushLogs = fileHandler.flush.bind(fileHandler);

await ensureDir(LOGS_DIR);
await setup({
  handlers: {
    console: new ConsoleHandler("DEBUG"),
    file: fileHandler,
    fileRotating: new handlers.RotatingFileHandler("WARNING", {
      maxBytes: 1024 * 10,
      maxBackupCount: 10,
      filename: `${LOGS_DIR}/${formatLogFileName()}${
        DEBUG ? ".debug" : ""
      }.log`,
      mode: "a", // 'a', 'w', 'x'
      formatter: fileFormatter,
    }),
    email: new EmailHandler("WARNING", {
      formatter: emailFormatter,
    }),
    email2: new EmailHandler("NOTSET"),
  },

  loggers: {
    default: {
      level: "DEBUG",
      handlers: ["file", "console", "email"],
    },
    debug: {
      level: "DEBUG",
      handlers: ["console", "file"],
    },
    email: {
      level: "ERROR",
      handlers: ["email", "console"],
    },
  },
});

const _logger = getLogger("default");

export const logger = {
  debug: (...args: unknown[]) => _logger.debug("", ...args),
  log: (...args: unknown[]) => _logger.debug("", ...args),
  info: (...args: unknown[]) => _logger.info("", ...args),
  warning: (...args: unknown[]) => _logger.warning("", ...args),
  error: (...args: unknown[]) => _logger.error("", ...args),
  critical: (...args: unknown[]) => _logger.critical("", ...args),
};

const data = [
  "string",
  100_000,
  { key: "value" },
  true,
  new Set([1, 2, 3]),
  new Map([["key", "value"]]),
];

logger.log(...data);
