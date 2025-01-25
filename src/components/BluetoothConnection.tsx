import { BluetoothConnected, BluetoothOff } from "lucide-react";
import { useBluetoothStore } from "../store/bluetoothStore";
import { Button } from "./ui/button";

export function BluetoothPill() {
  const { device, connectToDevice, disconnectDevice, error } =
    useBluetoothStore();
  return (
    <div className="fixed z-10  bg-popover/50 overflow-hidden backdrop-blur-md h-9 border-border border rounded-lg shadow-lg bottom-4 right-4 flex items-center space-x-2">
      <Button
        onClick={device ? disconnectDevice : connectToDevice}
        className=" px-4 py-2 m-0 p-2"
        size={"default"}
        variant="secondary"
      >
        {device ? (
          device.name || <BluetoothConnected className="size-5 text-blue-500" />
        ) : (
          <BluetoothOff className="size-5 text-red-500" />
        )}
      </Button>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
