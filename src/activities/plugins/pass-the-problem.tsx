import { Button, Textarea } from "@/components/ui";
import { PlayfieldContext, PlayfieldDefinition } from "@/types/playbook";
import { CustomVideoEvent } from "@stream-io/video-react-sdk";
import { useState } from "react";

function PassTheProblemUI({ ctx }: { ctx: PlayfieldContext }) {
  const phase = ctx.state.phase || "setup";
  const [answer, setAnswer] = useState("");
  const step = ctx.state.currentStep;
  const total = ctx.state.problem?.totalSteps ?? 3;

  if (phase === "setup") {
    return <p>Waiting for the host to assign the first step...</p>;
  }

  if (phase === "step") {
    return (
      <div className="space-y-4 text-center">
        <h3 className="text-lg font-semibold">
          Step {step + 1} of {total}
        </h3>
        <p className="text-muted-foreground mb-2">
          {ctx.state.problem?.prompt}
        </p>
        <Textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Enter your solution step..."
          className="w-full max-w-md mx-auto"
        />
        <Button
          onClick={() => {
            ctx.call.sendCustomEvent({
              type: "problem:pass",
              roomId: ctx.state.roomId,
              userId: ctx.userId,
              answer,
              nextStep: step + 1,
            });
            setAnswer("");
          }}
          disabled={!answer.trim()}
        >
          Pass to Next Teammate →
        </Button>
      </div>
    );
  }

  if (phase === "review") {
    return (
      <div className="space-y-4 text-left">
        <h3 className="text-lg font-semibold">Team Review</h3>
        <p className="text-muted-foreground">
          Here’s what your team submitted:
        </p>
        <ul className="space-y-2">
          {Object.entries(ctx.state.steps).map(([, stepAnswer], i) => (
            <li key={i} className="rounded-lg bg-muted p-3">
              <strong>Step {i + 1}:</strong> {String(stepAnswer)}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return null;
}

function PassTheProblemHostControls({ ctx }: { ctx: PlayfieldContext }) {
  const phase = ctx.state.phase || "setup";

  const { currentStep, problem } = ctx.state;

  if (phase === "setup") {
    return (
      <Button
        onClick={() => {
          ctx.call.sendCustomEvent({
            type: "problem:assign",
            step: 0,
            problem: problem,
          });
          ctx.setState({ ...ctx.state, phase: "step", currentStep: 0 });
        }}
      >
        Start Step 1
      </Button>
    );
  }

  if (phase === "step" && currentStep + 1 >= problem.totalSteps) {
    return (
      <Button
        variant="secondary"
        onClick={() => {
          ctx.call.sendCustomEvent({ type: "problem:review" });
          ctx.setState({ ...ctx.state, phase: "review" });
        }}
      >
        Move to Review Phase
      </Button>
    );
  }

  return null;
}

export const PassTheProblemActivity: PlayfieldDefinition = {
  slug: "pass-the-problem",
  title: "Pass the Problem",
  phases: ["setup", "step", "review"],

  start(ctx) {
    ctx.call.sendCustomEvent({
      type: "pass-the-problem:start",
      phase: "setup",
    });
    ctx.setState({
      phase: "setup",
      roomId: ctx.call.id,
      currentStep: 0,
      steps: {},
    });
  },

  handleEvent(e: CustomVideoEvent, ctx: PlayfieldContext) {
    const data = e.custom;
    if (!data) return;

    switch (data.type) {
      case "problem:assign-step":
        ctx.setState({
          ...ctx.state,
          phase: "step",
          currentStep: data.step,
          problem: data.problem,
        });
        break;

      case "problem:pass":
        ctx.setState({
          ...ctx.state,
          currentStep: ctx.state.currentStep + 1,
          steps: { ...ctx.state.steps, [data.userId]: data.answer },
        });
        break;

      case "problem:review":
        ctx.setState({ ...ctx.state, phase: "review" });
        break;
    }
  },

  Component: PassTheProblemUI,
  HostControls: PassTheProblemHostControls,
};
