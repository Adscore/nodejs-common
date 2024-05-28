/**
 * Definitions for Judge
 */
export class Judge {
  public static OK = 0;
  public static PU = 3;
  public static PROXY = 6;
  public static BOT = 9;

  public static RESULTS = {
    [Judge.OK]: { verdict: "ok", name: "Clean" },
    [Judge.PU]: { verdict: "junk", name: "Potentially unwanted" },
    [Judge.PROXY]: { verdict: "proxy", name: "Proxy" },
    [Judge.BOT]: { verdict: "bot", name: "Bot" },
  };

  public static getResultMap(): string[] {
    throw new Error("Not implemented yet");
  }
}
