import { useBluetoothStore } from "../store/bluetoothStore";

export default function BluetoothLogger() {
  const { device } = useBluetoothStore();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Bluetooth Logger</h1>
      {device ? (
        <p className="text-green-500">
          Connected to {device.name || "Unnamed Device"}
        </p>
      ) : (
        <p className="text-gray-500">No device connected</p>
      )}
      <canvas className="border w-screen h-[600px] border-gray-300"></canvas>
    </div>
  );
}
