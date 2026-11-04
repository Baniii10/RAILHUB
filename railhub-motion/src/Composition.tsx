import {AbsoluteFill, Composition, Easing, interpolate, useCurrentFrame, useVideoConfig} from "remotion";

type Props = {trainName: string};

export const MyComposition = () => {
  return (
    <Composition
      id="MyComp"
      component={JourneyTrain}
      durationInFrames={240}
      fps={30}
      width={1280}
      height={720}
      defaultProps={{trainName: "RAILHUB Express"}}
    />
  );
};

export const JourneyTrain: React.FC<Props> = ({trainName}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  return <AbsoluteFill style={{backgroundColor: "#dff2ff", overflow: "hidden", fontFamily: "Arial, sans-serif"}}>
    <div style={{position: "absolute", inset: "0 0 180px", background: "linear-gradient(180deg, #bfe6ff 0%, #eef9ff 70%, #cde8bf 70%)"}} />
    <div style={{position: "absolute", left: -80, right: -80, bottom: 118, height: 18, backgroundColor: "#475569"}} />
    <div style={{position: "absolute", left: -80, right: -80, bottom: 90, height: 10, backgroundColor: "#64748b"}} />
    <div style={{position: "absolute", left: 0, right: 0, bottom: 98, height: 40, background: "repeating-linear-gradient(90deg, transparent 0 58px, #94a3b8 58px 72px)"}} />
    <div style={{position: "absolute", left: 0, bottom: 130, width: 520, height: 175, borderRadius: "88px 30px 22px 20px", backgroundColor: "#ffffff", border: "8px solid #163d70", boxShadow: "0 18px 30px rgba(15,23,42,.22)", translate: interpolate(frame, [0, durationInFrames - 1], ["-560px 0px", "1360px 0px"], {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(.4, 0, .2, 1)})}}>
      <div style={{position: "absolute", left: 62, right: 34, top: 32, height: 54, display: "flex", gap: 18}}>
        {[0,1,2,3].map(window => <div key={window} style={{flex: 1, borderRadius: 10, backgroundColor: "#8fd1f4", border: "5px solid #163d70"}} />)}
      </div>
      <div style={{position: "absolute", left: 0, right: 0, bottom: 34, height: 18, backgroundColor: "#f28c18"}} />
      <strong style={{position: "absolute", left: 86, bottom: 58, color: "#163d70", fontSize: 28, letterSpacing: 1}}>{trainName}</strong>
      {[100, 410].map(wheel => <div key={wheel} style={{position: "absolute", left: wheel, bottom: -30, width: 62, height: 62, borderRadius: "50%", backgroundColor: "#1e293b", border: "10px solid #64748b", rotate: `${frame * 9}deg`}} />)}
    </div>
  </AbsoluteFill>;
};
