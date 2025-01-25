import { Canvas } from "@/components/Canvas";
import { Toolbar } from "@/components/Toolbar";
import { BottomPanel } from "@/components/BottomPanel";
import { GridOverlay } from "@/components/GridOverlay";
import { StyleMenu } from "@/components/StyleMenu.tsx";
import { BluetoothPill } from "./components/BluetoothConnection";
import ResetCanvas from "./components/ResetCanvas";

function App() {
  return (
    <div className="h-screen w-screen overflow-hidden relative">
      <StyleMenu />
      <GridOverlay />
      <Toolbar />
      <Canvas />
      <BluetoothPill />
      <ResetCanvas />
      <BottomPanel />
    </div>
  );
}

export default App;
