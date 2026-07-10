import { MatchPrediction } from "../types";
import { Brain, Target, Info } from "lucide-react";

export function MatchPredictionCard({ prediction }: { prediction: MatchPrediction }) {
  if (!prediction) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Brain className="h-5 w-5 text-primary" /> Match Predictions
      </h3>
      <div className="rounded-xl border bg-card p-6 space-y-6">
        
        {/* Win Probability Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span>Home ({prediction.percent.home})</span>
            <span className="text-muted-foreground">Draw ({prediction.percent.draw})</span>
            <span>Away ({prediction.percent.away})</span>
          </div>
          <div className="flex h-3 w-full rounded-full overflow-hidden bg-muted">
            <div 
              className="bg-primary" 
              style={{ width: prediction.percent.home }} 
              title={`Home Win: ${prediction.percent.home}`}
            />
            <div 
              className="bg-muted-foreground/30" 
              style={{ width: prediction.percent.draw }} 
              title={`Draw: ${prediction.percent.draw}`}
            />
            <div 
              className="bg-destructive" 
              style={{ width: prediction.percent.away }} 
              title={`Away Win: ${prediction.percent.away}`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          {/* Advice */}
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider font-semibold">
              <Info className="h-3.5 w-3.5" /> AI Advice
            </div>
            <p className="font-medium text-sm text-card-foreground">
              {prediction.advice || "No specific advice available."}
            </p>
          </div>

          {/* Expected Goals */}
          {(prediction.goals.home || prediction.goals.away) && (
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider font-semibold">
                <Target className="h-3.5 w-3.5" /> Expected Goals
              </div>
              <p className="font-medium text-sm text-card-foreground">
                Home: {prediction.goals.home || "0"} - Away: {prediction.goals.away || "0"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
