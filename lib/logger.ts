// A lightweight, structured JSON logger for observability.
// In a production environment, this stdout stream would be ingested by Datadog/ELK.

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogPayload {
  level: string;
  message: string;
  timestamp: string;
  context?: string;
  userId?: string;
  correlationId?: string;
  metadata?: Record<string, any>;
}

class Logger {
  private format(payload: LogPayload): string {
    return JSON.stringify(payload);
  }

  info(message: string, meta?: Omit<LogPayload, "level" | "message" | "timestamp">) {
    console.log(this.format({ level: "INFO", message, timestamp: new Date().toISOString(), ...meta }));
  }

  warn(message: string, meta?: Omit<LogPayload, "level" | "message" | "timestamp">) {
    console.warn(this.format({ level: "WARN", message, timestamp: new Date().toISOString(), ...meta }));
  }

  error(message: string, meta?: Omit<LogPayload, "level" | "message" | "timestamp">) {
    console.error(this.format({ 
      level: "ERROR", 
      message, 
      timestamp: new Date().toISOString(), 
      ...meta 
    }));
  }

  debug(message: string, meta?: Omit<LogPayload, "level" | "message" | "timestamp">) {
    if (process.env.NODE_ENV !== "production") {
      console.debug(this.format({ level: "DEBUG", message, timestamp: new Date().toISOString(), ...meta }));
    }
  }
}

export const logger = new Logger();
