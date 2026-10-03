const isProd = process.env.NODE_ENV === "prod";

function write(level, message, meta = {}) {
  const log = {
    level,
    time: new Date().toISOString(),
    pid: process.pid,
    workerId: process.env.NODE_APP_INSTANCE,
    message,
    ...meta,
  };

  const output = JSON.stringify(log);

  if (level === "ERROR" || level === "FATAL") {
    console.error(output);
  } else if (!isProd) {
    console.log(output);
  }
}

const logger = {
  log: (message, meta) => {
    if (!isProd) {
      write("DEBUG", message, meta);
    }
  },

  info: (message, meta) => {
    write("INFO", message, meta);
  },

  warn: (message, meta) => {
    write("WARN", message, meta);
  },

  error: (message, meta) => {
    write("ERROR", message, meta);
  },

  fatal: (message, meta) => {
    write("FATAL", message, meta);
    process.exit(1);
  },
};

module.exports = logger;
